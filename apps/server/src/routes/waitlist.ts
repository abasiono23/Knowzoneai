import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';

import { prisma } from '../db.js';
import { emails, sendEmail } from '../services/mailer.js';

/**
 * The website's waitlist: people leave their name and email to hear when the app opens. Signing up
 * twice keeps the first place in line. A confirmation email goes out (best effort).
 */
export const waitlistRouter = Router();

const limiter = rateLimit({
  windowMs: 60 * 60_000,
  limit: 10,
  skip: () => process.env.NODE_ENV === 'test',
  message: { error: 'Too many sign-ups from here. Please try again later.', reason: 'rate-limited' },
});

const Body = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().email().max(200),
  role: z.enum(['student', 'parent', 'teacher', 'school', 'other']),
  country: z.string().trim().max(60).optional(),
  interests: z
    .array(z.enum(['jamb', 'waec', 'neco', 'university', 'skills', 'languages']))
    .max(6)
    .default([]),
  source: z.string().trim().max(80).optional(),
  // A hidden field people can't see: bots that fill every field are quietly ignored.
  website: z.string().max(200).optional(),
});

waitlistRouter.post('/waitlist', limiter, async (req, res) => {
  const body = Body.parse(req.body);
  if (body.website) return res.status(201).json({ ok: true, position: 0, already: false });
  const existing = await prisma.waitlistEntry.findUnique({ where: { email: body.email } });
  let entry = existing;
  if (!entry) {
    const data = {
      email: body.email,
      name: body.name,
      role: body.role,
      interests: body.interests,
      ...(body.country && { country: body.country }),
      ...(body.source && { source: body.source }),
    };
    // Two sign-ups with the same email at once: the second one gets the first one's place.
    entry = await prisma.waitlistEntry
      .create({ data })
      .catch((e: { code?: string }) => (e.code === 'P2002' ? prisma.waitlistEntry.findUniqueOrThrow({ where: { email: body.email } }) : Promise.reject(e)));
  }
  if (!entry) throw new Error('Waitlist entry missing');
  const position = await prisma.waitlistEntry.count({ where: { createdAt: { lte: entry.createdAt } } });
  // The email goes out in the background: the person sees their place in line straight away, even when
  // the mail server is slow or can't be reached.
  if (!existing)
    void sendEmail({ to: entry.email, ...emails.waitlist(entry.name.split(/\s+/)[0]!, position) }).catch((e) =>
      console.warn('Waitlist email failed', (e as Error).message),
    );
  res.status(existing ? 200 : 201).json({ ok: true, position, already: !!existing });
});
