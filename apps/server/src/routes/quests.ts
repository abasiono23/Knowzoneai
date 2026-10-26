import { Router } from 'express';
import { z } from 'zod';

import { requestTimeZone } from '../services/progress.js';
import { claimQuest, openChest, questBoards } from '../services/quests.js';
import { me, requireAuth } from '../services/sessions.js';
import { toPublicUser } from '../services/users.js';

/** World Quests: the learner's daily and weekly boards, claiming quests and opening chests. */
export const questsRouter = Router();
questsRouter.use(['/me/quests', '/me/quests/*rest'], requireAuth);

questsRouter.get('/me/quests', async (req, res) => {
  res.json(await questBoards(me(req).id, requestTimeZone(req)));
});

questsRouter.post('/me/quests/claim', async (req, res) => {
  const { board, id } = z.object({ board: z.enum(['daily', 'weekly']), id: z.string().max(40) }).parse(req.body);
  const tz = requestTimeZone(req);
  const { reward, user } = await claimQuest(me(req).id, board, id, tz);
  res.json({ reward, user: toPublicUser(user), quests: await questBoards(user.id, tz) });
});

questsRouter.post('/me/quests/chest', async (req, res) => {
  const { chest, index } = z.object({ chest: z.enum(['daily', 'journey']), index: z.number().int().min(0).max(5).default(0) }).parse(req.body);
  const tz = requestTimeZone(req);
  const { reward, user } = await openChest(me(req).id, chest, index, tz);
  res.json({ reward, user: toPublicUser(user), quests: await questBoards(user.id, tz) });
});
