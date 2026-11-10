import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { config } from '../src/config.js';
import { prisma } from '../src/db.js';
import { openaiClient } from '../src/services/ai.js';
import { appSettings, refreshAppSettings, supportInbox } from '../src/services/app-settings.js';
import { CONSENT, signIn } from './helpers.js';

const OWNER = 'owner@example.com';
const before = { emails: config.ADMIN_EMAILS, key: config.OPENAI_API_KEY, inbox: config.SUPPORT_EMAIL };
let owner: Awaited<ReturnType<typeof signIn>>;
const person = (email: string) => signIn({ email, metadata: { consent: CONSENT } });

beforeEach(async () => {
  config.ADMIN_EMAILS = OWNER;
  config.OPENAI_API_KEY = 'sk-test';
  config.SUPPORT_EMAIL = 'server-inbox@example.com';
  await refreshAppSettings(); // The tables are emptied before each test.
  owner = await person(OWNER);
});
afterAll(async () => {
  config.ADMIN_EMAILS = before.emails;
  config.OPENAI_API_KEY = before.key;
  config.SUPPORT_EMAIL = before.inbox;
  await refreshAppSettings();
});

describe('roles', () => {
  it('makes an ADMIN_EMAILS account a superadmin', async () => {
    const { body } = await owner.as.get('/admin/me').expect(200);
    expect(body.role).toBe('superadmin');
  });

  it('lets a superadmin add an admin, who gets the dashboard but not Settings', async () => {
    const ada = await person('ada@example.com');
    await ada.as.get('/admin/me').expect(403);
    await owner.as.post('/admin/settings/team', { email: ' ADA@example.com ', role: 'admin' }).expect(200);
    expect((await ada.as.get('/admin/me').expect(200)).body.role).toBe('admin');
    await ada.as.get('/admin/overview').expect(200);
    for (const url of ['/admin/settings', '/admin/settings/team', '/admin/settings/activity'])
      await ada.as.get(url).expect(403);
    await ada.as.post('/admin/settings/team', { email: 'friend@example.com', role: 'superadmin' }).expect(403);
    await ada.as.put('/admin/settings', { aiEnabled: false }).expect(403);
    await ada.as.delete(`/admin/settings/team/${encodeURIComponent(OWNER)}`).expect(403);
    expect(await prisma.staffMember.count({ where: { email: 'friend@example.com' } })).toBe(0);
  });

  it('takes access away at once, and lets a new superadmin use Settings', async () => {
    const ada = await person('ada@example.com');
    await owner.as.post('/admin/settings/team', { email: 'ada@example.com', role: 'superadmin' }).expect(200);
    await ada.as.get('/admin/settings/team').expect(200);
    await owner.as.delete('/admin/settings/team/ada%40example.com').expect(200);
    await ada.as.get('/admin/me').expect(403);
  });

  it('protects the server’s superadmins, and nobody can change themselves', async () => {
    const other = await person('other@example.com');
    await owner.as.post('/admin/settings/team', { email: 'other@example.com', role: 'superadmin' }).expect(200);
    await other.as.delete(`/admin/settings/team/${encodeURIComponent(OWNER)}`).expect(400);
    await other.as.post('/admin/settings/team', { email: OWNER, role: 'admin' }).expect(400);
    await other.as.delete('/admin/settings/team/other%40example.com').expect(400);
    await other.as.post('/admin/settings/team', { email: 'other@example.com', role: 'admin' }).expect(400);
    await owner.as.delete(`/admin/settings/team/${encodeURIComponent(OWNER)}`).expect(400);
  });

  it('lists the team with who can’t be removed', async () => {
    await owner.as.post('/admin/settings/team', { email: 'ada@example.com', role: 'admin' }).expect(200);
    const { body } = await owner.as.get('/admin/settings/team').expect(200);
    expect(body.items).toEqual([
      expect.objectContaining({ email: OWNER, role: 'superadmin', owner: true }),
      expect.objectContaining({ email: 'ada@example.com', role: 'admin', owner: false, addedBy: OWNER }),
    ]);
  });

  it('refuses people who aren’t on the team, and a bad email', async () => {
    const learner = await person('learner@example.com');
    await learner.as.get('/admin/settings').expect(403);
    await owner.as.post('/admin/settings/team', { email: 'not-an-email', role: 'admin' }).expect(400);
    await owner.as.post('/admin/settings/team', { email: 'a@example.com', role: 'god' }).expect(400);
  });
});

describe('settings', () => {
  it('turns AI off and on, while safety checks keep working', async () => {
    expect(() => openaiClient()).not.toThrow();
    await owner.as.put('/admin/settings', { aiEnabled: false }).expect(200);
    expect(() => openaiClient()).toThrow(/paused/i);
    expect(() => openaiClient('safety')).not.toThrow();
    await refreshAppSettings();
    expect(() => openaiClient()).toThrow(/paused/i);
    await owner.as.put('/admin/settings', { aiEnabled: true }).expect(200);
    expect(() => openaiClient()).not.toThrow();
  });

  it('makes everything free before launch, and turns paid plans on', async () => {
    expect(appSettings().allFree).toBe(true);
    const off = await owner.as.put('/admin/settings', { allFree: false }).expect(200);
    expect(off.body.allFree).toBe(false);
    await refreshAppSettings();
    expect(appSettings().allFree).toBe(false);
    const actions = await prisma.adminAction.findMany({ where: { action: 'turned on paid plans' } });
    expect(actions).toHaveLength(1);
    await owner.as.put('/admin/settings', { allFree: true }).expect(200);
    expect(appSettings().allFree).toBe(true);
    await owner.as.put('/admin/settings', { allFree: 'yes' }).expect(400);
  });

  it('changes where help requests are emailed, and goes back to the server’s', async () => {
    expect(supportInbox()).toBe('server-inbox@example.com');
    const { body } = await owner.as.put('/admin/settings', { supportEmail: 'Help@Example.com' }).expect(200);
    expect(body.supportInbox).toBe('help@example.com');
    expect(supportInbox()).toBe('help@example.com');
    await owner.as.put('/admin/settings', { supportEmail: '' }).expect(200);
    expect(supportInbox()).toBe('server-inbox@example.com');
  });

  it('says which services are set up without showing their values', async () => {
    const { body, text } = await owner.as.get('/admin/settings').expect(200);
    expect(body.services.find((s: { name: string }) => s.name.startsWith('AI')).ready).toBe(true);
    expect(text).not.toContain('sk-test');
  });
});

describe('the record of what staff did', () => {
  it('keeps who did what', async () => {
    const ada = await person('ada@example.com');
    await owner.as.post('/admin/settings/team', { email: 'ada@example.com', role: 'admin' }).expect(200);
    await ada.as
      .post(`/admin/users/${owner.sub}/restriction`, { kind: 'suspended', reason: 'Not allowed' })
      .expect(403);
    const learner = await person('learner@example.com');
    await ada.as
      .post(`/admin/users/${learner.sub}/restriction`, { kind: 'suspended', reason: 'Testing it' })
      .expect(200);
    await owner.as.post('/admin/library/hide', { kind: 'book', id: 'x', title: 'X', reason: 'Testing' }).expect(200);
    const { body } = await owner.as.get('/admin/settings/activity').expect(200);
    expect(body.items.map((a: { actor: string; action: string }) => `${a.actor} ${a.action}`)).toEqual([
      `${OWNER} hid book`,
      'ada@example.com suspended',
      `${OWNER} made admin`,
    ]);
    await owner.as.post('/admin/library/unhide', { kind: 'book', id: 'x' }).expect(200);
  });
});

describe('admins can’t lock staff out', () => {
  it('won’t let an admin restrict a superadmin', async () => {
    const ada = await person('ada@example.com');
    await owner.as.post('/admin/settings/team', { email: 'ada@example.com', role: 'admin' }).expect(200);
    await ada.as.post(`/admin/users/${owner.sub}/restriction`, { kind: 'suspended', reason: 'Takeover' }).expect(403);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: owner.sub } })).restriction).toBeNull();
  });
});
