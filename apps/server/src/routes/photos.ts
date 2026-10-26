import { randomBytes } from 'node:crypto';

import { Router } from 'express';
import multer from 'multer';

import { prisma } from '../db.js';
import { AppError, notFound } from '../lib/errors.js';
import { me, requireAuth } from '../services/sessions.js';
import { toPublicUser } from '../services/users.js';

export const photosRouter = Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

/**
 * Uploads a profile picture (179). It's stored in the database, and the profile points to its public
 * link, so it shows on every device and to classmates; a new upload replaces it (with a new link).
 */
photosRouter.post('/me/photo', requireAuth, upload.single('file'), async (req, res) => {
  const user = me(req);
  const file = req.file;
  if (!file) throw new AppError(400, 'Choose a photo', 'invalid');
  if (!TYPES.includes(file.mimetype)) throw new AppError(415, 'Use a JPG, PNG or WebP photo', 'unsupported-file');
  const token = randomBytes(24).toString('base64url');
  await prisma.profilePhoto.upsert({
    where: { userId: user.id },
    create: { userId: user.id, token, mimeType: file.mimetype, data: new Uint8Array(file.buffer) },
    update: { token, mimeType: file.mimetype, data: new Uint8Array(file.buffer) },
  });
  // A full address (behind the host's proxy too), so every screen can show it as is.
  const uri = `${req.protocol}://${req.get('host')}/users/photos/${token}`;
  const updated = await prisma.user.update({ where: { id: user.id }, data: { photo: { kind: 'photo', uri } } });
  res.json({ user: toPublicUser(updated) });
});

photosRouter.get('/users/photos/:token', async (req, res) => {
  const photo = await prisma.profilePhoto.findUnique({ where: { token: String(req.params.token) } });
  if (!photo) throw notFound('Photo not found');
  res
    .set({ 'Content-Type': photo.mimeType, 'Cache-Control': 'public, max-age=31536000, immutable', 'Cross-Origin-Resource-Policy': 'cross-origin' })
    .send(Buffer.from(photo.data));
});
