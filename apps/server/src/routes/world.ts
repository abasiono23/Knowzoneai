import { Router } from 'express';
import { z } from 'zod';

import { ACHIEVEMENT_ITEMS } from '../data/world-items.js';
import { prisma } from '../db.js';
import { acceptFriend, addFriend, friendsView, removeFriend } from '../services/friends.js';
import { leagueView, limited, schoolView } from '../services/leagues.js';
import { me, requireAuth } from '../services/sessions.js';
import { Avatar, earnItems, ownedItems, saveAvatar, worldProfile } from '../services/world.js';

/** Knowzone World on the server: your avatar and items, weekly leagues, school board and friends. */
export const worldRouter = Router();
worldRouter.use(['/me/world', '/me/world/*rest', '/me/leagues', '/me/leagues/*rest', '/me/friends', '/me/friends/*rest'], requireAuth);

async function profileView(userId: string) {
  const p = await worldProfile(userId);
  const owned = await ownedItems(userId, p);
  return { avatar: p.avatar, owned, onLeaderboards: p.onLeaderboards, anonymous: p.anonymous };
}

worldRouter.get('/me/world', async (req, res) => {
  res.json(await profileView(me(req).id));
});

worldRouter.put('/me/world/avatar', async (req, res) => {
  const { avatar } = z.object({ avatar: Avatar }).parse(req.body);
  await saveAvatar(me(req).id, avatar);
  res.json(await profileView(me(req).id));
});

/** Achievement items the app worked out (cosmetic only; only achievement items are accepted). */
worldRouter.post('/me/world/earned', async (req, res) => {
  const { items } = z.object({ items: z.array(z.enum(ACHIEVEMENT_ITEMS as [string, ...string[]])).max(10) }).parse(req.body);
  await earnItems(me(req).id, items);
  res.json(await profileView(me(req).id));
});

worldRouter.patch('/me/world/settings', async (req, res) => {
  const patch = z.object({ onLeaderboards: z.boolean().optional(), anonymous: z.boolean().optional() }).parse(req.body);
  await worldProfile(me(req).id);
  await prisma.worldProfile.update({ where: { userId: me(req).id }, data: patch });
  res.json(await profileView(me(req).id));
});

worldRouter.get('/me/leagues', async (req, res) => {
  const user = me(req);
  res.json({ ...(await leagueView(user)), restricted: limited(user, 'leaderboards') });
});

worldRouter.get('/me/leagues/school', async (req, res) => {
  res.json(await schoolView(me(req)));
});

worldRouter.get('/me/friends', async (req, res) => {
  res.json(await friendsView(me(req)));
});

worldRouter.post('/me/friends', async (req, res) => {
  const { code } = z.object({ code: z.string().trim().min(3).max(40) }).parse(req.body);
  const result = await addFriend(me(req), code);
  res.status(result.status === 'pending' ? 201 : 200).json({ ...result, ...(await friendsView(me(req))) });
});

worldRouter.post('/me/friends/:id/accept', async (req, res) => {
  await acceptFriend(me(req), String(req.params.id));
  res.json(await friendsView(me(req)));
});

worldRouter.delete('/me/friends/:id', async (req, res) => {
  await removeFriend(me(req), String(req.params.id));
  res.json(await friendsView(me(req)));
});
