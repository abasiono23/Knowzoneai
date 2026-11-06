import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { config } from '../src/config.js';
import { CONSENT, http, signIn } from './helpers.js';

const STAFF = 'writer@example.com';
const before = config.ADMIN_EMAILS;
let writer: Awaited<ReturnType<typeof signIn>>;

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEBgIApD5fRAAAAABJRU5ErkJggg==',
  'base64',
).toString('base64');
const post = (extra: object = {}) => ({
  title: 'How to Revise: A Guide!',
  excerpt: 'Short',
  body: 'Some text.',
  ...extra,
});

beforeEach(async () => {
  config.ADMIN_EMAILS = STAFF;
  writer = await signIn({ email: STAFF, metadata: { consent: CONSENT } });
});
afterAll(() => {
  config.ADMIN_EMAILS = before;
});

describe('the blog', () => {
  it('keeps drafts private until they’re published', async () => {
    const { body } = await writer.as.post('/admin/blog', post()).expect(201);
    expect(body.post).toMatchObject({ slug: 'how-to-revise-a-guide', status: 'draft', publishedAt: null });
    expect((await http().get('/blog').expect(200)).body.posts).toEqual([]);
    await http().get(`/blog/${body.post.slug}`).expect(404);

    await writer.as.put(`/admin/blog/${body.post.id}`, post({ status: 'published' })).expect(200);
    const list = await http().get('/blog').expect(200);
    expect(list.body.posts).toEqual([
      expect.objectContaining({ title: 'How to Revise: A Guide!', author: 'The Knowzone team' }),
    ]);
    expect(list.body.posts[0].body).toBeUndefined();
    expect((await http().get(`/blog/${body.post.slug}`).expect(200)).body.post.body).toBe('Some text.');

    await writer.as.put(`/admin/blog/${body.post.id}`, post({ status: 'draft' })).expect(200);
    await http().get(`/blog/${body.post.slug}`).expect(404);
  });

  it('won’t publish an empty post', async () => {
    await writer.as.post('/admin/blog', post({ body: ' ', status: 'published' })).expect(400);
    await writer.as.post('/admin/blog', { title: '' }).expect(400);
  });

  it('gives each post its own address, and keeps it once public', async () => {
    const a = await writer.as.post('/admin/blog', post({ status: 'published' })).expect(201);
    const b = await writer.as.post('/admin/blog', post()).expect(201);
    expect(b.body.post.slug).toBe('how-to-revise-a-guide-2');
    const renamed = await writer.as
      .put(`/admin/blog/${a.body.post.id}`, post({ title: 'New title', status: 'published' }))
      .expect(200);
    expect(renamed.body.post.slug).toBe('how-to-revise-a-guide');
    const draft = await writer.as.put(`/admin/blog/${b.body.post.id}`, post({ title: 'Other title' })).expect(200);
    expect(draft.body.post.slug).toBe('other-title');
  });

  it('is written by staff only', async () => {
    const learner = await signIn({ email: 'reader@example.com', metadata: { consent: CONSENT } });
    await http().post('/admin/blog').send(post()).expect(401);
    await learner.as.post('/admin/blog', post()).expect(403);
    await learner.as.get('/admin/blog').expect(403);
    await learner.as.post('/admin/blog/images', { data: PNG }).expect(403);
  });

  it('takes real pictures only, and serves them to other sites', async () => {
    const { body } = await writer.as.post('/admin/blog/images', { data: `data:image/png;base64,${PNG}` }).expect(201);
    const image = await http().get(body.coverImage).expect(200);
    expect(image.headers['content-type']).toBe('image/png');
    expect(image.headers['cross-origin-resource-policy']).toBe('cross-origin');
    const fake = Buffer.from('<svg onload="alert(1)"></svg>').toString('base64');
    await writer.as.post('/admin/blog/images', { data: `data:image/png;base64,${fake}` }).expect(400);
  });

  it('only uses a cover uploaded here', async () => {
    await writer.as.post('/admin/blog', post({ coverImage: 'https://evil.example/x.png' })).expect(400);
  });

  it('deletes a post with its cover, and records what staff did', async () => {
    const { body: up } = await writer.as.post('/admin/blog/images', { data: PNG }).expect(201);
    const { body } = await writer.as
      .post('/admin/blog', post({ status: 'published', coverImage: up.coverImage }))
      .expect(201);
    await writer.as.delete(`/admin/blog/${body.post.id}`).expect(200);
    await http().get(up.coverImage).expect(404);
    const { body: log } = await writer.as.get('/admin/settings/activity').expect(200);
    expect(log.items.map((a: { action: string }) => a.action)).toEqual(['deleted a post', 'published a post']);
  });
});
