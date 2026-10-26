import type { NextFunction, Request, Response } from 'express';

import { prisma } from '../db.js';
import { Prisma, type User } from '../generated/prisma/client.js';
import { AppError, forbidden, unauthorized } from '../lib/errors.js';
import { allowedWhileSuspended, restrictionOf } from './help.js';
import { verifyAccessToken, type SupabaseClaims } from './supabase.js';
import { newReferralCode, WELCOME_CREDITS } from './users.js';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      sessionId?: string;
      user?: User;
    }
  }
}

/** Best-effort device description from headers. The app sends X-Platform (and may send X-Device-Name). */
export function describeDevice(req: Request) {
  const ua = req.get('user-agent') ?? '';
  const platformHeader = req.get('x-platform');
  const platform =
    platformHeader === 'ios' || platformHeader === 'android' || platformHeader === 'web'
      ? platformHeader
      : /android/i.test(ua)
        ? 'android'
        : /iphone|ipad|ios/i.test(ua)
          ? 'ios'
          : 'web';
  const browser = /edg\//i.test(ua) ? 'Edge' : /chrome\//i.test(ua) ? 'Chrome' : /firefox\//i.test(ua) ? 'Firefox' : /safari\//i.test(ua) ? 'Safari' : null;
  const os = /windows/i.test(ua) ? 'Windows' : /mac os/i.test(ua) ? 'Mac' : /linux/i.test(ua) ? 'Linux' : null;
  const device =
    req.get('x-device-name')?.slice(0, 60) ||
    (platform === 'web' ? [browser ?? 'Browser', os && `on ${os}`].filter(Boolean).join(' ') : platform === 'ios' ? 'iPhone or iPad' : 'Android phone');
  // Hosting providers add the visitor's city/country; without them we don't guess.
  const city = req.get('cf-ipcity') ?? req.get('x-vercel-ip-city');
  const country = req.get('cf-ipcountry') ?? req.get('x-vercel-ip-country');
  const location = [city && decodeURIComponent(city), country].filter(Boolean).join(', ') || 'Unknown location';
  return { device, platform, location, userAgent: ua.slice(0, 300) || null };
}

const providersOf = (c: SupabaseClaims) => [...new Set(c.app_metadata?.providers ?? (c.app_metadata?.provider ? [c.app_metadata.provider] : []))].sort();

/**
 * The app profile for a Supabase user, created the first time they reach the API. New accounts
 * get welcome credits, and consent given at sign-up (sent as user metadata) is recorded.
 */
async function profileFor(claims: SupabaseClaims): Promise<User> {
  const email = claims.email.toLowerCase();
  const providers = providersOf(claims);
  const existing = await prisma.user.findUnique({ where: { id: claims.sub } });
  if (existing) {
    // Keep what Supabase owns in sync (email changes, newly linked providers).
    const changed =
      existing.email !== email ||
      existing.providers.join() !== providers.join() ||
      !existing.emailVerified ||
      // A new sign-in during the 14-day grace period cancels a deletion request.
      !!existing.deleteAt;
    return changed
      ? prisma.user.update({
          where: { id: existing.id },
          data: { email, providers, emailVerified: true, deleteAt: null },
        })
      : existing;
  }
  const m = claims.user_metadata ?? {};
  const consent = m.consent;
  const accepted = !!consent?.terms && !!consent.privacy && !!consent.age;
  const provider = claims.app_metadata?.provider;
  const name = (m.name || m.full_name || email.split('@')[0]).trim().slice(0, 40);
  try {
    return await prisma.user.create({
      data: {
        id: claims.sub,
        email,
        name,
        authProvider: provider === 'google' || provider === 'apple' ? provider : 'email',
        providers,
        // Supabase only issues a session once the email is confirmed (or for Google / Apple).
        emailVerified: m.email_verified !== false,
        termsAccepted: accepted,
        marketingConsent: !!consent?.marketing,
        consentAt: accepted ? new Date() : null,
        referralCode: newReferralCode(),
        aiCredits: WELCOME_CREDITS,
        creditEntries: { create: { credits: WELCOME_CREDITS, reason: 'welcome' } },
        notifications: {
          create: {
            type: 'system',
            template: 'welcome',
            params: { name: name.split(/\s+/)[0] },
            href: '/recommended',
          },
        },
      },
    });
  } catch (e) {
    // Two first requests raced; the other one created the profile.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      const raced = await prisma.user.findUnique({ where: { id: claims.sub } });
      if (raced) return raced;
      throw forbidden('This email is already used by another Knowzone account', 'email-in-use');
    }
    throw e;
  }
}

const TOUCH_EVERY = 5 * 60_000;

/** Loads the signed-in user if there is a valid token; never rejects. */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.get('authorization');
  const claims = header?.startsWith('Bearer ') ? await verifyAccessToken(header.slice(7)) : null;
  if (claims) {
    const session = await prisma.session.findUnique({ where: { id: claims.session_id } });
    if (session?.revokedAt) {
      next();
      return;
    }
    const user = await profileFor(claims);
    if (!session) {
      await prisma.session
        .upsert({
          where: { id: claims.session_id },
          create: { id: claims.session_id, userId: user.id, ...describeDevice(req) },
          update: {},
        })
        .catch((e) => {
          // Two first requests raced; the other one recorded this device.
          if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002')) throw e;
        });
    } else if (Date.now() - session.lastActiveAt.getTime() > TOUCH_EVERY) {
      await prisma.session.update({ where: { id: session.id }, data: { lastActiveAt: new Date() } });
    }
    req.userId = user.id;
    req.sessionId = claims.session_id;
    req.user = user;
  }
  next();
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const hadToken = !!req.get('authorization');
  await optionalAuth(req, res, () => {});
  if (!req.user) throw unauthorized(hadToken ? 'Your session expired. Please sign in again.' : 'Please sign in');
  const restriction = restrictionOf(req.user);
  if (restriction?.until && Date.now() > restriction.until) {
    // Temporary restrictions lift on their own.
    req.user = await prisma.user.update({ where: { id: req.user.id }, data: { restriction: Prisma.DbNull } });
  } else if (restriction?.kind === 'suspended' && !allowedWhileSuspended(req.originalUrl.split('?')[0]!)) {
    throw new AppError(403, 'Your account is suspended', 'suspended');
  }
  next();
}

/** The signed-in user; use inside routes guarded by requireAuth. */
export function me(req: Request): User {
  if (!req.user) throw new Error('requireAuth missing on route');
  return req.user;
}
