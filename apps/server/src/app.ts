import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';
import { ZodError } from 'zod';

import { config } from './config.js';
import { AppError } from './lib/errors.js';
import { accountRouter } from './routes/account.js';
import { billingRouter } from './routes/billing.js';
import { catalogRouter } from './routes/catalog.js';
import { coursesRouter } from './routes/courses.js';
import { gamesRouter } from './routes/games.js';
import { questsRouter } from './routes/quests.js';
import { worldRouter } from './routes/world.js';
import { helpRouter } from './routes/help.js';
import { libraryRouter } from './routes/library.js';
import { materialsRouter } from './routes/materials.js';
import { notificationsRouter } from './routes/notifications.js';
import { photosRouter } from './routes/photos.js';
import { referralsRouter } from './routes/referrals.js';
import { rewardsRouter } from './routes/rewards.js';
import { tutorRouter } from './routes/tutor.js';
import { videosRouter } from './routes/videos.js';

/** Builds the HTTP app without listening, so tests can drive it directly. */
export function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: config.CORS_ORIGIN === '*' ? true : config.CORS_ORIGIN.split(',') }));
  // The raw bytes are kept for webhooks, whose signatures are computed over them.
  app.use(
    express.json({
      limit: '2mb',
      verify: (req, _res, buf) => {
        (req as unknown as { rawBody?: Buffer }).rawBody = buf;
      },
    }),
  );

  app.get('/', (_req, res) => {
    res.json({ name: 'Knowzone API', ok: true });
  });
  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });
  app.use(photosRouter);
  app.use(accountRouter);
  app.use(referralsRouter);
  app.use(rewardsRouter);
  app.use(billingRouter);
  app.use(helpRouter);
  app.use(gamesRouter);
  app.use(questsRouter);
  app.use(worldRouter);
  app.use(catalogRouter);
  app.use(libraryRouter);
  app.use(notificationsRouter);
  app.use(tutorRouter);
  app.use(videosRouter);
  app.use(coursesRouter);
  app.use(materialsRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Every error becomes { error, reason? }, the shape the app's ApiError reads.
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ZodError) {
      res.status(400).json({ error: err.issues[0]?.message ?? 'Invalid request', reason: 'invalid' });
      return;
    }
    if (err instanceof AppError) {
      res.status(err.status).json({ error: err.message, ...(err.reason && { reason: err.reason }) });
      return;
    }
    if ((err as { type?: string }).type === 'entity.parse.failed') {
      res.status(400).json({ error: 'Invalid JSON', reason: 'invalid' });
      return;
    }
    const status = (err as { status?: number }).status ?? 500;
    if (status >= 500) console.error(err);
    res.status(status).json({
      error: status >= 500 ? 'Something went wrong on our side. Please try again.' : (err as Error).message,
    });
  });

  return app;
}
