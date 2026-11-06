import { randomUUID } from 'node:crypto';

import { Router } from 'express';
import { z } from 'zod';

import { prisma } from '../db.js';
import { AppError, notFound } from '../lib/errors.js';
import { recordAction } from '../services/staff.js';

/**
 * The website's blog. Staff write in the dashboard; only published posts are public, and drafts stay hidden.
 * Posts are plain text with a little formatting (## headings, - lists, **bold**, [links](https://…)) that the
 * pages turn into text elements, so a post can't carry HTML or scripts.
 */
export const blogRouter = Router();
export const adminBlogRouter = Router();

const PUBLIC_CARD = {
  slug: true,
  title: true,
  excerpt: true,
  coverImage: true,
  author: true,
  publishedAt: true,
} as const;

blogRouter.get('/blog', async (_req, res) => {
  const posts = await prisma.blogPost.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
    take: 100,
    select: PUBLIC_CARD,
  });
  res.set('Cache-Control', 'public, max-age=60').json({ posts });
});

/** Cover images load on another site's page, so they're allowed to cross origins. */
blogRouter.get('/blog/images/:id', async (req, res) => {
  const image = await prisma.blogImage.findUnique({ where: { id: String(req.params.id) } });
  if (!image) throw notFound('Image not found');
  res
    .set({
      'Content-Type': image.mimeType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'X-Content-Type-Options': 'nosniff',
    })
    .send(Buffer.from(image.data));
});

blogRouter.get('/blog/:slug', async (req, res) => {
  const post = await prisma.blogPost.findFirst({
    where: { slug: String(req.params.slug), status: 'published' },
    select: { ...PUBLIC_CARD, body: true, updatedAt: true },
  });
  if (!post) throw notFound('Post not found');
  res.set('Cache-Control', 'public, max-age=60').json({ post });
});

/* ---------- For staff (mounted inside the admin router, behind its check) ---------- */

const slugFrom = (title: string) =>
  title
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)
    .replace(/-+$/, '') || 'post';

async function freeSlug(title: string, ownId?: string) {
  const base = slugFrom(title);
  for (let n = 1; ; n++) {
    const slug = n === 1 ? base : `${base}-${n}`;
    const taken = await prisma.blogPost.findUnique({ where: { slug }, select: { id: true } });
    if (!taken || taken.id === ownId) return slug;
  }
}

const Post = z.object({
  title: z.string().trim().min(1, 'Give the post a title').max(160),
  excerpt: z.string().trim().max(300).default(''),
  body: z.string().max(60_000).default(''),
  author: z.string().trim().min(1).max(80).default('The Knowzone team'),
  // Only images uploaded here, so a post can't load something from elsewhere.
  coverImage: z
    .string()
    .regex(/^\/blog\/images\/[\w-]+$/)
    .nullable()
    .default(null),
  status: z.enum(['draft', 'published']).default('draft'),
});

const needsText = (p: z.infer<typeof Post>) => {
  if (p.status === 'published' && !p.body.trim())
    throw new AppError(400, 'Write the post before publishing it', 'invalid');
};

adminBlogRouter.get('/admin/blog', async (_req, res) => {
  const items = await prisma.blogPost.findMany({
    orderBy: { updatedAt: 'desc' },
    select: { id: true, slug: true, title: true, status: true, author: true, publishedAt: true, updatedAt: true },
  });
  res.json({ items });
});

adminBlogRouter.get('/admin/blog/:id', async (req, res) => {
  const post = await prisma.blogPost.findUnique({ where: { id: String(req.params.id) } });
  if (!post) throw notFound('Post not found');
  res.json({ post });
});

adminBlogRouter.post('/admin/blog', async (req, res) => {
  const data = Post.parse(req.body);
  needsText(data);
  const post = await prisma.blogPost.create({
    data: {
      ...data,
      slug: await freeSlug(data.title),
      publishedAt: data.status === 'published' ? new Date() : null,
    },
  });
  await recordAction(req.user!.email, data.status === 'published' ? 'published a post' : 'started a post', data.title);
  res.status(201).json({ post });
});

adminBlogRouter.put('/admin/blog/:id', async (req, res) => {
  const id = String(req.params.id);
  const data = Post.parse(req.body);
  needsText(data);
  const before = await prisma.blogPost.findUnique({ where: { id } });
  if (!before) throw notFound('Post not found');
  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      ...data,
      // Once it has been public, its address stays the same so links keep working.
      slug: before.publishedAt ? before.slug : await freeSlug(data.title, id),
      publishedAt: before.publishedAt ?? (data.status === 'published' ? new Date() : null),
    },
  });
  if (before.status !== data.status)
    await recordAction(
      req.user!.email,
      data.status === 'published' ? 'published a post' : 'took down a post',
      data.title,
    );
  else if (data.status === 'published') await recordAction(req.user!.email, 'edited a published post', data.title);
  res.json({ post });
});

adminBlogRouter.delete('/admin/blog/:id', async (req, res) => {
  const id = String(req.params.id);
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) throw notFound('Post not found');
  await prisma.blogPost.delete({ where: { id } });
  const image = post.coverImage?.split('/').pop();
  if (image) await prisma.blogImage.deleteMany({ where: { id: image } });
  await recordAction(req.user!.email, 'deleted a post', post.title);
  res.json({ ok: true });
});

/** Recognises the picture from its first bytes, not from what the browser says it is. */
function imageType(data: Buffer) {
  if (data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (data.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return 'image/jpeg';
  if (data.subarray(0, 4).toString('latin1') === 'RIFF' && data.subarray(8, 12).toString('latin1') === 'WEBP')
    return 'image/webp';
  return null;
}

const Upload = z.object({ data: z.string().min(1).max(2_000_000) });

adminBlogRouter.post('/admin/blog/images', async (req, res) => {
  const { data } = Upload.parse(req.body);
  const bytes = Buffer.from(data.replace(/^data:[^,]*,/, ''), 'base64');
  const mimeType = imageType(bytes);
  if (!mimeType) throw new AppError(400, 'Use a PNG, JPG or WebP picture', 'invalid');
  const image = await prisma.blogImage.create({ data: { id: randomUUID(), mimeType, data: bytes } });
  res.status(201).json({ coverImage: `/blog/images/${image.id}` });
});
