import 'dotenv/config';
import { z } from 'zod';

const Env = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),

  // Supabase Auth issues the access tokens the app sends; we verify them with the project's public keys.
  SUPABASE_URL: z.url('SUPABASE_URL must be your project URL, e.g. https://abc.supabase.co'),
  /** Optional server-only key. Needed to delete Supabase sign-in records when an account is purged. */
  SUPABASE_SECRET_KEY: z.string().optional(),
  CORS_ORIGIN: z.string().default('*'),
  /** Public web address, used in invite links and emails. */
  APP_URL: z.string().default('https://knowzone.ai'),

  // AI. Without a key the server still runs; AI endpoints answer 503 "not configured".
  OPENAI_API_KEY: z.string().optional(),
  // Cheap, fast model for bulk generation; stronger model for tutoring.
  OPENAI_MODEL_GENERATE: z.string().default('gpt-5-mini'),
  OPENAI_MODEL_TUTOR: z.string().default('gpt-5-mini'),
  // Diagrams the tutor draws for an answer. Each one costs the learner 1 AI credit.
  OPENAI_MODEL_IMAGE: z.string().default('gpt-image-1-mini'),
  // Finds and rechecks course videos (YouTube Data API v3). Without it, courses have no video lessons.
  YOUTUBE_API_KEY: z.string().optional(),
  // Narration for videos (voices and accents are set per narrator).
  OPENAI_MODEL_TTS: z.string().default('gpt-4o-mini-tts'),

  // Payments (Flutterwave). Without a secret key the server runs, and checkout answers 503 "not configured".
  /** FLWSECK_TEST-… for testing, FLWSECK-… for real payments. */
  FLW_SECRET_KEY: z.string().optional(),
  /** The webhook "secret hash" set in the Flutterwave dashboard; webhooks without it are ignored. */
  FLW_SECRET_HASH: z.string().optional(),
  FLW_BASE_URL: z.string().default('https://api.flutterwave.com'),

  // Emails the API sends itself (data exports, deletion notices). Sign-up and reset codes are sent by Supabase.
  // Sent through Resend (needs your own domain) or SMTP, e.g. Gmail with an app password. Without either,
  // emails are printed to the server log (development only).
  RESEND_API_KEY: z.string().optional(),
  /** SMTP server. smtp.gmail.com with SMTP_USER = your Gmail address and SMTP_PASS = a Gmail app password. */
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().default(465),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  /** With Gmail this must be your Gmail address, e.g. "Knowzone <you@gmail.com>". */
  EMAIL_FROM: z.string().default('Knowzone <hello@knowzone.ai>'),
  /** Where new help requests, reports and copyright notices are emailed for the team. Optional. */
  SUPPORT_EMAIL: z.union([z.literal(''), z.email()]).optional(),
});

export const config = Env.parse(process.env);

if (config.NODE_ENV === 'production' && !config.RESEND_API_KEY && !(config.SMTP_USER && config.SMTP_PASS))
  throw new Error('Set RESEND_API_KEY or SMTP_USER and SMTP_PASS in production so data exports and notices can be emailed');
