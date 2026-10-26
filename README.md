# Knowzone AI

An AI learning platform that turns any lesson (a PDF, pasted notes or a photo of a page) into a summary,
flashcards, a quiz and a personal AI tutor, with XP, streaks and Knowzone World to keep students coming back.

```
apps/
  mobile/   React Native (Expo SDK 58, Expo Router, TypeScript): iOS, Android and web
  server/   Node.js (Express 5, TypeScript, Prisma 7, PostgreSQL, OpenAI)
docs/
  DESIGN_SYSTEM.md
docker-compose.yml   Postgres (with pgvector) + Redis for local dev
```

## Run it locally

Prerequisites: Node 22+ and the Expo Go app or an emulator. Docker and an OpenAI key are optional.

```bash
# 1. Database: either one
cd apps/server && npm install
npm run db:start              # local Postgres on port 5433 (knowzone_local + knowzone_testing, UTF-8), no Docker needed
# or: docker compose up -d    # from the repo root, Postgres on 5432 (change DATABASE_URL to match)

# 2. API (in a second terminal)
cd apps/server
cp .env.example .env          # set SUPABASE_URL; OPENAI_API_KEY and RESEND_API_KEY are optional locally
npm run db:migrate            # creates tables + generates the Prisma client
npm run dev                   # http://localhost:4000 (verification codes are printed in this terminal)
npm test                      # integration tests against the knowzone_testing database

# 3. App
cd ../mobile
cp .env.example .env          # on a physical phone, use your PC's LAN IP instead of localhost
npm install
npx expo start                # press a (Android), i (iOS) or w (web)
```

**Web: development vs a real build.** `npx expo start --web` is the development server. It builds code on demand
and shows a "Bundling…" label. The first build takes about a minute; after that, pages open in a few seconds,
and Metro keeps a cache, so avoid `--clear` unless something looks stale. To see the app the way users will
(minified, about 1.5 s per page, no developer overlay):

```bash
cd apps/mobile
npm run web:build             # production build into dist/ (uses the values in .env)
npm run web:preview           # serves it at http://localhost:8080
```

### Frontend-first (mock) mode

`apps/mobile/.env` sets `EXPO_PUBLIC_USE_MOCKS=true`, so the whole sign-up and onboarding flow runs with no backend.
`src/lib/mock-api.ts` answers the auth calls and keeps its data on the device. Demo values:
- verification and reset code: `123456`
- referral code: `ADA2026`
- existing demo login: `ada@example.com` / `password123`

Set it to `false` (and `EXPO_PUBLIC_API_URL` to the server) to use the real API. The server is being built in
phases; until it covers every endpoint, screens that depend on a missing one will show errors. See
[Backend progress](#backend-progress).

## Backend progress

The mock API (`apps/mobile/src/lib/mock-api.ts`) is the contract: each phase implements its endpoints for real, with
the same request and response shapes, errors as `{ error, reason? }` and times as epoch milliseconds.

| Phase | Scope | Status |
|---|---|---|
| 1 | Sign-in with Supabase Auth: create account, Google / Apple, log in, forgot / reset password, email verification, consent, referral code entry | ✅ Built and tested |
| 1b | Learner personalization (screens 18–32) and languages | ✅ Built and tested (see below) |
| 1c | Home and navigation (screens 33–46): catalogue, search, library, recommendations, notifications | ✅ Built and tested (see below) |
| 1d | AI tutor (screens 47–61) with OpenAI: answers, photo and PDF questions, flashcards, quizzes, diagrams, daily limits | ✅ Built and tested (see below) |
| 1e | AI study packs (screens 62–87) with OpenAI: PDFs, Word, photos, text, topics, YouTube; notes, flashcards, quizzes, mind maps, diagrams | ✅ Built and tested (see below) |
| 1f | Short videos (screens 88–109) with OpenAI: scripts, scene pictures, narration voices; Originals feed; likes, saves, progress, reports | ✅ Built and tested (see below) |
| 1g | Courses (screens 110–128): 8 full courses from open textbooks, YouTube videos, AI practice and quizzes, progress, certificates | ✅ Built and tested (see below) |
| 2 | Rewards, XP and coins (155–168) and the referral system (169–176) | ✅ Built and tested (see below) |
| 2b | Profile and settings (177–197); subscriptions and payments with Flutterwave in naira or dollars (198–218) | ✅ Built and tested (see below) |
| 2c | Help, safety and legal (219–232): support tickets, bug reports, feedback, reports, blocking, copyright notices, restrictions and appeals | ✅ Built and tested (see below) |
| 4a | Knowzone World word games (English): Hidden Letters, Word Clash, Word Hunter, Spellcaster, Sentence Master | ✅ Built and tested (see below) |
| 4b | Knowzone World chemistry lab (2.5D, walkable): Mixture Lab, Element Quest, Molecule Builder, Reaction Rush, Mystery Substance; Ask Kora for coins | ✅ Built and tested (see below) |
| 3 | App Store / Google Play billing | ⏳ |
| 4 | Teacher classes, World progress (now device-only), word games for other subjects | ⏳ |

### How sign-in works

- **Supabase Auth owns identity.** It handles passwords, the 6-digit sign-up and reset codes, and Google / Apple
  sign-in, and it sends those emails. The app talks to it through `src/lib/supabase.ts` and `src/lib/auth.ts`.
  In mock mode, `auth.ts` falls back to the in-app mock.
- **The Knowzone API owns the app profile** (consent, referral, credits, settings…).
  - It checks every Supabase access token against the project's published ES256 keys (issuer, audience, expiry).
  - On first contact it creates the profile under the Supabase user id, with welcome credits and the consent
    given at sign-up.
  - Each Supabase session becomes a device. Revoking one makes the API reject that session's tokens straight away.
- **Endpoints:** `/me`, `/me/consent`, `/referrals/validate` (works signed out), `/me/referral`, plus the account
  endpoints (`/me/profile`, `/me/settings`, `/me/sessions`, `/me/logout`, `/me/export`, `/me/delete`…).
- **Moved to Supabase:** password change, linking Google / Apple and the delete-account password check now happen
  in the app through Supabase.
- **Tests:** 18 integration tests (`apps/server/test/`) sign tokens with a local test key, so the real verification
  path runs against a real Postgres database.

### Supabase setup status

Done through the Management API and migrations (20 October 2026):
- ✅ **Tables created** in the Supabase database (`npm run db:deploy`).
- ✅ **Row Level Security on every table**, with no policies. The publishable key that ships in the app can't read
  or write them; only the API's direct database connection can.
- ✅ **Sign-in settings:** 6-digit email codes, minimum password length 8 (matches the app), manual linking on,
  site URL `http://localhost:8081`.
- ✅ **Redirect URLs:** `http://localhost:8081/**`, `knowzone://**`, `exp://**`.
- ✅ **Google sign-in** turned on (client set up in Google Cloud).
- ✅ **Email:** custom SMTP through Gmail (`knowzoneai@gmail.com`, app password), with 6-digit code templates for
  sign-up and password reset. Limit 100 emails an hour; Gmail caps sending at about 500 a day, and some mail may
  land in spam. Move to a domain with Resend (or similar) before launch.

Still to do:
1. **Apple:** needs a Service ID and key from an Apple Developer account.
2. **Production URLs:** add the real web address to the site URL and redirect list at launch.
3. **Server secret (optional):** `SUPABASE_SECRET_KEY` lets the API delete the Supabase sign-in when an account is
   purged.

**Known gaps:**
- On iOS, Apple requires the native Sign in with Apple sheet. The app uses Supabase's web OAuth for now; switch to
  `expo-apple-authentication` + `signInWithIdToken` before App Store review.
- Device location shows "Unknown location" unless the host adds location headers (e.g. Cloudflare).
- A teacher's first class isn't created until phase 4.

### Personalization (screens 18–32)

- **Server checks the answers.** `POST /me/personalization` validates learner type, ids, exam month (YYYY-MM),
  subjects (max 30), language, daily minutes (5–240) and reminder time and days. Unknown fields are dropped and
  bad values get a 400. Saving the answers also keeps settings in step: the daily goal, the first reminder's time
  and days, which reminder notifications are on, and, until someone changes it themselves, the app language.
- **The AI uses the learner's language.** Study packs and tutor replies are written in the chosen language.
  Quiz questions stay in English to match WAEC/JAMB papers.
- **Reminders (29) are real on phones.** The app schedules weekly local notifications for each enabled reminder
  and day (`src/lib/reminders.ts`). It skips quiet hours, follows the notification switches, writes the text in
  the current language, and asks for permission when reminders are first turned on. On the web, reminders are
  saved but not shown.
- **The plan (31)** is still built on the device from the saved answers (`src/lib/learning-plan.ts`), in the
  current language. An AI-written plan is a later step.
- **Tests:** 24 server tests in total, 6 of them for personalization and the AI language instruction.

### Home and navigation (screens 33–46)

- **Lesson catalogue in the database** (`Category`, `Subject`, `Lesson`), with every title, summary, topic and key
  point in all 10 languages. `npm run db:seed` (in `apps/server`) loads it from `prisma/seed/` and can be re-run:
  it updates content and keeps real view counts. Supabase is migrated and seeded.
- **Endpoints** (each answers in `?lang=`, the `X-Language` header the app sends, or the account's language):
  - `GET /catalog` (whole catalogue, with a version so the app can skip unchanged downloads), `/subjects/:id`,
    `/lessons/:id`, `/trending` (34, 37, 38, 39).
  - `GET /search?q=` (35, 36): matches the reader's language and English, ignoring accents and tone marks.
  - `GET /me/library`, `POST /me/lessons/:id/view`, `PUT /me/lessons/:id/progress`, `PUT|DELETE /me/saved/:id`,
    `POST|DELETE /me/searches` (41, 42, 43, recent searches). Progress never goes backwards; a learner's first
    view counts towards a lesson's popularity; finishing a first lesson confirms a pending invite.
  - `GET /me/recommendations` (40): scored from the learner's subjects, exams, interests and formats, with the reason.
  - `GET /me/home` (33): continue learning, recommendations, trending, saved count and unread notifications at once.
  - `GET /me/notifications`, `GET /me/notifications/:id` (marks it read), `POST …/:id/read`, `POST …/read-all`,
    `DELETE …/:id` (44, 45).
- **Notifications are sent** on sign-up (welcome), when a friend uses your invite code, and when that invite is
  confirmed. They're stored as a template and values, so the app shows them in whatever language is chosen now.
- **In the app:** the catalogue switches language instantly from a copy bundled with the app (works offline and in
  mock mode), then uses the server's copy. In real mode, saved / recent / progress / searches sync to the account
  and the inbox comes from the server; mock mode keeps the demo data. Quick actions (46) need no backend.
- **Translations live in one place:** `apps/server/prisma/seed/catalog-i18n/`. After editing, run
  `npm run i18n:catalog` in `apps/mobile` to refresh the app's copy (`-- --check` fails if it's out of date).
- **Tests:** 38 server tests in total, 14 of them for this phase.
- **Not real yet:**
  - The app still ranks Recommended and runs search on the device (same rules as the server, so it works offline);
    the server endpoints are ready for when the catalogue outgrows the app.
  - Streak, reminder, achievement, class and new-lesson notifications have templates but nothing sends them yet;
    push delivery (Expo push tokens) is a later step.
  - Lesson players are still the demo screens; ratings and trend numbers are seeded starting values.

### AI tutor (screens 47–61)

- **OpenAI on the server only.** The key lives in `apps/server/.env` (`OPENAI_API_KEY`); the app never sees it.
  Models: `OPENAI_MODEL_TUTOR` for answers, `OPENAI_MODEL_GENERATE` for flashcards and quizzes,
  `OPENAI_MODEL_IMAGE` (default `gpt-image-1-mini`) for diagrams.
- **Structured answers** (48, 51, 52, 55, 56): summary, explanation, key terms, numbered steps with a final answer,
  2–3 worked examples, common mistakes and follow-up questions, in the learner's language. The four tutor styles
  (explain, step by step, exam practice, teach me back) and two levels change the instructions. Chats started from
  a lesson are grounded in that lesson. About 10–15 s per answer.
- **Photos and PDFs** (53, 54): uploaded with the question (max 10 MB); OpenAI reads the photo or PDF and answers
  the question it finds. Photos, PDFs and diagrams are stored in the database (`TutorFile`) with their
  conversation, deleted with it (or with the account), and served by an unguessable link.
- **Flashcards and quizzes** (58, 59): made with OpenAI the first time a learner opens them, then kept with the
  answer. **Notes and decks** (57) are saved to the account.
- **Diagrams** (on the answer page): drawn by OpenAI on request for **1 AI credit**, refunded if drawing fails.
  Labels are in English and can contain spelling mistakes; the app says so under each diagram.
- **Daily allowance** (60): Free 10, Plus 100, Pro 300 questions a day, reset at midnight Lagos time, counted
  by the server. Failed answers don't count. Flashcards and quizzes don't count; diagrams use credits instead.
- **Errors and retry** (61): if OpenAI fails or times out, the chat shows the error with Retry; a successful retry
  replaces it.
- **Endpoints:** `GET /tutor/usage`, `GET /tutor/conversations`, `GET|PATCH|DELETE /tutor/conversations/:id`,
  `POST /tutor/conversations/:id/messages` (JSON, or multipart with `file`), `POST …/messages/:id/retry`,
  `POST /tutor/messages/:id/flashcards|quiz|diagram`, `GET /tutor/files/:token`, `GET|POST /tutor/notes`,
  `DELETE /tutor/notes/:id`, `POST /tutor/decks`.
- **Tests:** 47 server tests in total, 9 for the tutor (OpenAI replaced by fakes). Also run once against real
  OpenAI: French maths step by step, a follow-up, flashcards, a quiz, a diagram, and a Yoruba answer from a photo.
- **Not real yet:**
  - Mock mode still uses the built-in demo answers (no OpenAI, no diagrams).
  - Answers arrive all at once; streaming word by word is a later improvement.
  - Saved tutor decks aren't yet part of the study packs' spaced-repetition reviews.

### AI study packs (screens 62–87)

- **Sources** (63–67): PDF (text extracted; scanned PDFs are read by OpenAI directly), Word `.docx`, `.txt`,
  photos of notes (OpenAI vision), pasted text, a topic (taught from textbook knowledge), and YouTube links
  (from the video's captions, up to 2 hours). Files up to 20 MB are stored in the database (`MaterialFile`)
  with the pack and deleted with it. Old `.doc` files aren't accepted; the app asks for `.docx` or PDF.
- **Generation** (68–70): the app uploads with real progress, the server answers at once and makes the pack in
  the background (about 20–40 s), updating the processing step the app shows. Notes and practice are written
  in parallel. 1 AI credit per pack, held while it's made and returned if it fails; a failure shows a
  translated reason and Retry when retrying can help. A pack interrupted by a server restart shows as failed
  (credit returned) after 10 minutes.
- **What OpenAI writes** (71–82), in the learner's language: summary, detailed notes, key concepts with
  examples, important points, flashcards, a bank of multiple-choice and true/false questions (easy, medium,
  hard) and a mind map. Depth (Quick / Standard / Deep) sets how much; unticked outputs are skipped.
  The mind map is drawn by the app from OpenAI's structure (exact, translatable text); a **diagram** of the
  pack can be drawn by OpenAI's image model for 1 AI credit.
- **Practice** (76–81): quizzes are marked by the server (XP and coins can't be faked); flashcard reviews use
  spaced repetition and sync across devices.
- **Library** (83–87): title, subject, folder, tags, saved and offline flags sync to the account; the app only
  downloads packs that changed since its last sync. Export and share happen on the device.
- **"Ask the tutor"** from a study pack opens a chat that answers from that pack.
- **Endpoints:** `POST /materials/:id` (JSON or multipart `file`), `POST /materials/:id/retry`,
  `GET /materials?since=`, `GET|PATCH|DELETE /materials/:id`, `POST /materials/:id/attempts`,
  `POST /materials/:id/cards/:cardId/review`, `POST /materials/:id/diagram`, `GET /materials/files/:token`.
- **Tests:** 58 server tests in total, 10 for study packs (OpenAI and YouTube replaced by fakes). Also run end to
  end against real OpenAI and YouTube: English notes, an Arabic topic, a Pidgin pack from a YouTube video, a
  Yoruba pack from a PDF, a diagram, and over HTTP a video pack → quiz → flashcard review → tutor → delete.
- **Not real yet:**
  - Generation runs inside the API process. On a host that sleeps or restarts often, use one that stays on
    (or add a job queue) so packs aren't interrupted.
  - Videos without captions can't be used (no audio transcription yet). Only YouTube links are supported.
  - The quiz bank is fixed per pack; "more questions" would need another generation.

### Short videos (screens 88–109)

- **What a video is:** a narrated explainer the app plays scene by scene (heading, text or bullets, an AI
  picture, narration with highlighted captions, a quick-check question). Text stays exact and translatable;
  each scene lasts exactly as long as its recorded narration, so captions stay in sync.
- **Made with OpenAI** (98–105): the script (`OPENAI_MODEL_GENERATE`, in the chosen video language, sized to
  the chosen length), a picture for the main scenes (`OPENAI_MODEL_IMAGE`, no text in pictures so nothing is
  misspelt), and narration per scene (`OPENAI_MODEL_TTS`, default `gpt-4o-mini-tts`; Ada, Tunde, Grace, Sam
  and Kemi are OpenAI voices with accent instructions). From a topic, a study pack, a lesson or pasted notes.
  Pictures and MP3s are stored in the database (`VideoFile`) and deleted with the video.
- **Credits:** 30 s and 1 min = 1, 3 min = 2, 5 min = 3; held while it's made, returned if it fails.
  Regenerating (106) costs 1: a new voice re-records only the narration; a new length or language rewrites.
  Instant edits (style, captions, script text) are free, and edited lines are re-recorded.
- **Knowzone Originals** (88–94): one video per video lesson in all 10 languages, made by
  `npm run videos:originals` (pictures made once per lesson and shared; script and narration per language).
  Shown by lesson (`v-<lessonId>`) in the reader's language, falling back to English; lessons without a
  server video fall back to the version built on the device (device voice).
- **Likes, saves, collections, offline picks, watch progress and reports** (95–97) sync to the account.
  Reports are stored for moderation (`VideoReport`).
- **Endpoints:** `GET /videos/originals`, `GET /videos/:id`, `GET /videos/mine?since=`, `POST /videos/mine/:id`,
  `POST /videos/mine/:id/retry|regenerate`, `PATCH|DELETE /videos/mine/:id`, `GET /me/videos`,
  `POST /me/videos/:id/like`, `PUT|DELETE /me/videos/:id/save`, `PUT /me/videos/:id/progress`,
  `POST /me/videos/:id/report`, `POST /me/video-collections`, `GET /videos/files/:token` (supports byte ranges).
- **Tests:** 68 server tests in total, 10 for videos (OpenAI replaced by fakes). Also run for real: an Original
  in English and Yoruba, and over HTTP a French video → voice change → script edit → delete.
- **Not real yet:**
  - Sharing: there's no public web page for videos yet, so a shared link only works for people with the app.
    The share screen's "watch without an account" line needs that page first.
  - "Download for offline" is saved as a choice, but narration isn't downloaded yet (pictures are cached by
    the image library); offline playback falls back to the device voice.
  - Narration quality in Yoruba, Igbo and Hausa depends on OpenAI's voices; review with native speakers.
  - Videos are explainers with pictures, not filmed or animated footage; there's no MP4 export.

### Courses (screens 110–128)

- **8 full courses from open textbooks** (OpenStax, Rice University): Biology, Chemistry, Physics, Algebra,
  Statistics, Economics, Python Programming and Entrepreneurship. One module per chapter, one reading lesson
  per section with the book's figures, worked examples, notes and code, plus per chapter a YouTube video,
  an interactive practice and a quiz.
- **Licensing:** only CC BY 4.0 versions are used. Several of these books' newer editions moved to
  CC BY-NC-SA (no commercial use), so each book is pinned to the last commit published under CC BY
  (`prisma/seed/courses/books.ts`); a licence granted for a published version still applies to it. Every
  course and reading credits the book, authors and licence, as CC BY requires. Accounting was left out: it
  was never CC BY. Nigerian/WAEC textbooks are copyrighted and are not used.
- **Figures** load from jsDelivr (a free CDN for GitHub) at the pinned version; storing ~3,000 figures in the
  database would exceed Supabase's free 500 MB.
- **YouTube:** videos are found with the YouTube Data API (`YOUTUBE_API_KEY` in `apps/server/.env`), checked
  to be public and embeddable, and played in YouTube's own player (never downloaded). The free quota allows
  about 100 searches a day, so the 177 chapters take two runs.
- **AI practice and quizzes:** one interactive lesson (5 activities) and one quiz (8 questions) per chapter,
  written by OpenAI once and reused by everyone. About $0.004 a chapter.
- **Importer:** `npm run courses:import` (`--courses=physics`, `--no-ai`, `--no-videos`, `--budget=1.5`).
  Everything AI or YouTube produced is saved in `prisma/seed/courses/generated/` the moment it's made, with a
  running spend total; re-runs (and other databases) reuse it for free, and the budget covers all runs.
- **Progress** (114–126): enrolment, finished lessons, quiz attempts (marked by the server; 60% to pass),
  notes, ratings and study time sync to the account. XP is awarded by the server. The **certificate** (125)
  is issued by the server only when every lesson is done; anyone can verify it at `GET /certificates/:id`.
- **Instructor profile** (128): the course provider (OpenStax) and the book's authors.
- **Endpoints:** `GET /courses`, `GET /courses/:id/lessons/:lessonId`, `GET /certificates/:id`, `GET /me/courses`,
  `POST /me/courses/:id/enroll|open`, `PUT /me/courses/:id/save|rating`,
  `POST /me/courses/:id/lessons/:lessonId/complete|attempts|notes`, `PATCH|DELETE /me/courses/:id/notes/:noteId`.
- **Tests:** 3 new server tests for courses. Checked in the app in real mode: catalogue, course details with
  the source credit, curriculum, readings with figures, the Python and Chemistry readings, quiz, practice and
  the provider profile.
- **Not real yet / limits:**
  - Course content is in English only (the screens around it are translated).
  - The books are written for US high school and first-year university; they overlap WAEC/JAMB topics but
    don't follow the Nigerian syllabus exactly.
  - Some textbook features don't come through: interactive simulations, links to outside videos, and
    end-of-section exercise banks (replaced by the chapter practice and quiz).
  - Ratings and learner counts start at zero and grow with real use.

### Rewards, XP, coins and referrals (screens 155–176)

- **The server decides every reward.** XP and coins come from real learning that the server sees: course
  lessons and quizzes (marked by the server), study packs, flashcard reviews and the daily reward. Every award
  is written to the coin history with its reason (`CoinTransaction`), which feeds the wallet, history,
  "where your coins come from" and the streak calendar.
- **Knowzone World** levels and quests are still checked on the device until its own backend phase, so the app
  may report them through `POST /me/rewards`, but only as `game:<id>` / `quest:<id>`, **once each**, and capped
  (120 XP, 60 coins). Anything else is refused.
- **Daily reward** (162): once per local day, in the learner's own time zone (the app sends `X-Timezone`);
  missing a day pauses the 7-day cycle. Two taps can't claim twice.
- **Catalogue and redemption** (163–168): cosmetic only (avatar items, profile frames, titles, streak freezes);
  no cash-outs. The server holds the prices and rules (`src/data/rewards.ts`) and the app uses them over its
  built-in copy. Redemptions check level, season, ownership and balance on the server; coins are taken
  atomically, so two taps can't spend the same coins. Boosts can be redeemed again.
- **Streaks** now roll over at the learner's local midnight (they used UTC).
- **Referrals** (169–176): `GET /me/referrals` gives the code and share link, invited friends and their status,
  confirmed this month against the cap of 10, the AI-credit history and, for invitees, their pending reward.
  Invites not completed in 30 days expire (checked hourly). A first finished lesson, quiz or World level
  confirms an invite. Invalid and expired codes were already handled at sign-up.
- **Endpoints:** `GET /rewards/rules`, `GET /me/wallet`, `POST /me/redeem`, `POST /me/daily-reward`,
  `POST /me/rewards` (World only), `GET /me/referrals`.
- **Tests:** 79 server tests in total, 8 for this phase (including double-tap spending). Checked in the app in
  real mode: every rewards and referral screen, claiming the daily reward and the wallet updating.
- **Not real yet:**
  - Badges and part of the streak calendar come from Knowzone World, which still runs on the device.
  - The frame and title you equip are remembered per device, not per account.
  - The invite link (`knowzone.ai/invite/CODE`) needs a web page on your domain; until then friends type the code.

### Profile, settings and payments (screens 177–218)

- **Profile and settings** (177–197) are saved to the account: profile details, a profile photo (stored in the
  database, up to 5 MB), learning goals, notifications, reminders, language, privacy, devices, data download
  and account deletion.
- **Payments go through Flutterwave.** Card details are typed on Flutterwave's page, never in Knowzone.
  - **Two currencies.** Naira: Plus ₦3,500 a month, ₦9,000 a term or ₦30,000 a year; Pro ₦7,500, ₦19,500 or
    ₦66,000. Dollars: Plus $4.99, $12.99 or $44.99; Pro $9.99, $26.99 or $89.99. Learners in Nigeria see naira
    first and everyone else sees dollars; either can switch, and the choice is remembered on the device.
  - **Methods.** Card in either currency. Bank transfer (a one-time account number) and USSD are naira only, and
    fall back to Flutterwave's page if their details can't be made in the app.
  - **The server sets the price.** It works out the amount and any promo code itself, and a plan only unlocks
    once Flutterwave confirms a successful payment of the full amount in the right currency. That check runs
    from the webhook, when the learner comes back, and hourly for anything left pending. Amounts are stored in
    kobo and cents, so dollar prices stay exact.
  - **Plans are prepaid.** Each payment adds a month, term or year; paying early adds the time on top. Nothing
    renews by itself: reminders go out 7 days and 1 day before the end, then the account goes back to Free.
    A paid plan adds its AI credits month by month.
  - **Refunds.** A first payment is refunded in full within 7 days, through Flutterwave. Other requests become
    support tickets.
- **Setting up Flutterwave:**
  1. In the Flutterwave dashboard, open Settings → API keys and copy the secret key (`FLWSECK_TEST-…` while
     testing) into `apps/server/.env` as `FLW_SECRET_KEY`.
  2. Under Settings → Webhooks, set the URL to `https://<your API>/webhooks/flutterwave`, choose a secret hash,
     and put the same hash in `.env` as `FLW_SECRET_HASH`.
  3. To take dollars, a USD collection balance must be enabled on the Flutterwave account.
  4. Without keys the server still runs, and checkout replies that payments aren't set up yet.
- **Endpoints:** `GET /me/billing`, `POST /me/billing/promo`, `POST /me/billing/checkout`,
  `POST /me/billing/confirm`, `POST /me/billing/cancel`, `POST /me/billing/resume`, `POST /me/billing/restore`,
  `POST /me/billing/support`, `POST /webhooks/flutterwave`, `POST /me/photo`.
- **Tests:** 91 server tests in total, 11 for billing (Flutterwave is faked in tests). Checked in the app in real
  mode: every profile, settings and billing screen and the currency switch.
- **Not real yet:**
  - Payments haven't been tried against Flutterwave itself (no keys yet). Start with test keys.
  - In the iOS and Android apps, Apple and Google require their own in-app billing for subscriptions. The app
    offers the store there, but that isn't connected yet; it must be done before release to the stores. Until
    then, paying works on the web.

### Help, safety and legal (screens 219–232)

- **Requests** (contact support, bug reports, feedback) are saved as tickets (`KZ-123456`) with a conversation.
  Each gets an automatic first reply, which the app shows in the learner's language. Bug screenshots are
  stored in the database. Feedback is filed as solved straight away.
- **Reports** (225) go into the same queue as `report` tickets. "Hide" removes the item from the learner's
  feeds and "block" blocks the person. Both follow the account to other devices (231). The reported person is
  never told who reported them.
- **Copyright notices** (230) can come from anyone, signed in or not, and get a `CR-123456` reference. They are
  limited to 5 an hour per connection.
- **Restrictions and suspensions** (232) are set by staff. A suspended account can only see its status, get
  help, change settings, see devices, download or delete its data, sign out and appeal. Everything else
  answers `403 suspended`. Restrictions with an end date lift on their own. A learner can have one appeal in
  review at a time.
- **Limits:** 10 requests an hour per learner (reports and appeals included).
- **The help centre, FAQ, community guidelines, terms, privacy policy and AI disclaimer** (219, 220, 226–229)
  are written in the app, in all 10 languages.
- **For the team:** new requests are emailed to `SUPPORT_EMAIL` (set it in `.env`) when Resend is set up.
  Staff answer from `apps/server`:
  ```
  npm run support -- list                       # open requests (also: waiting, resolved, all; and a kind)
  npm run support -- show KZ-123456             # the thread, details and the learner's account
  npm run support -- reply KZ-123456 "…"        # add --resolve to close it; the learner is notified
  npm run support -- suspend ada@example.com "Reason" --days 7
  npm run support -- restrict ada@example.com "Reason" --limits invites,sharing
  npm run support -- lift ada@example.com
  npm run support -- appeal KZ-123456 accept "…"   # or reject
  npm run support -- copyright                  # notices; `copyright CR-123456 actioned`
  ```
- **The data download** now also includes payments, help requests, blocked players and hidden content.
- **Endpoints:** `GET/POST /me/help/tickets`, `POST /me/help/tickets/reply`, `POST /me/help/tickets/close`,
  `POST /me/help/attachments`, `GET /me/safety`, `POST /me/report`, `POST /me/safety/block`,
  `POST /me/safety/unblock`, `POST /me/safety/unhide`, `POST /legal/copyright`, `POST /me/appeal`.
- **Not real yet:**
  - There's no web dashboard for staff; the `support` command is the tool for now.
  - A restricted account's limits (leaderboards, battles, invites, sharing) are shown in the app, but those
    features belong to Knowzone World, which still runs on the device, so the server doesn't enforce them yet.

### Word games: English (Knowzone World, Language Island)

Five games, each with five levels (from everyday JSS words to WAEC-level vocabulary), reached from the Play
tab ("Word games") and from Language Island. Designs: `docs/design/english-games/` (the mock-ups, the
screens as built, and `02-design-vs-app.png` side by side).

- **Hidden Letters:** fill the missing letters of a word from its clue against a timer ring; streaks score
  more; a hint reveals a letter for 15 coins.
- **Word Clash:** five rounds of making the best word from seven letter tiles. Rare gold letters (J, K, Q, X,
  Z) count double and long words earn bonuses (QUIZ = 42). You play the same tiles another learner played in
  the last two weeks and see their score round by round; if nobody has, you face a practice rival, and the
  app says so. Words are checked against a 79,725-word dictionary (the public-domain ENABLE list without
  offensive words, in `apps/server/data/english-words.txt`).
- **Word Hunter:** drag across a letter grid to find a theme's words (16 themes with everyday Nigerian
  words). Bigger levels hide words diagonally and backwards.
- **Spellcaster:** spell the word a clue describes with letter stones to cast spells at the guardian of each
  level's magical world (Moonlit Isles → Shadow Castle). Wrong spells cost hearts.
- **Sentence Master:** tap word chips into a correct sentence; each set hides one trap word. One grammar
  point per level (present tense, past tense, questions, prepositions, passive and conditionals).

How it's kept fair and safe:
- **The server builds every puzzle and keeps the answers.** The app only gets the questions, and every
  answer is checked on the server (`POST /me/games/runs/:id/answer`). Double taps can't count twice.
- **Rewards come from the server at the end.** Stars unlock the next level. Beating your best pays in full
  and replays pay 30%. Word games give at most 400 XP and 150 coins in 24 hours.
- **Other players:** a learner who keeps their profile private is shown as "A Knowzone learner". Restricted
  accounts (no battles) only meet the practice rival.
- **Content** is hand-written in British English (`apps/server/src/data/english/`), with tests that clues
  never give the word away and traps are really wrong.
- **Art** (Kora, the wizard, five guardians, arenas and game covers) was made with OpenAI
  (`apps/server/scripts/world-art.ts`); concept mock-ups with `scripts/ui-concepts.ts`.
- **Endpoints:** `GET /me/games/english`, `POST /me/games/english/:game/runs`, `POST /me/games/runs/:id/answer`,
  `POST /me/games/runs/:id/hint`, `POST /me/games/runs/:id/finish`, `POST /me/games/runs/:id/quit`.
- **Tests:** 109 server tests in total, 9 for the word games. Checked in the app in real mode: every game
  played, the hub, a level page and the results screen.
- **Not real yet:**
  - Word games don't count towards the World's own quests, achievements and leagues, which still run on
    the device (they will once the World backend is built).
  - Word games need the internet (answers are checked on the server), so they aren't in the offline demo
    mode.
  - The Pidgin, Yoruba, Igbo, Hausa, Arabic and Swahili text of the games should be checked by native
    speakers before launch.

### Chemistry lab (Knowzone World)

A realistic school chemistry lab the student walks around as a real-looking student in a lab coat
(2.5D: realistic pictures, the student drawn on top, the view following them). Reached from the Play tab.
Designs and screenshots: `docs/design/chemistry-lab/` (`01-app-overview.png`).

- **Walking:** a joystick, or tap a station's name to walk there. Stations: reagent shelves, glassware bench,
  workbench, element cabinet, model kit desk and whiteboard. "Go here next" shows where the current task needs you.
- **Chemical Mixture Lab:** fetch the chemicals on your list from the shelves (real labelled bottles) and the
  glassware, pour them together at the workbench and watch the real reaction (colour change, precipitate,
  bubbles, coating), then say what formed. 20 real WAEC/NECO practical experiments across 5 levels.
- **Element Quest:** inspect samples in the element cabinet and collect the set each mission asks for (32 elements;
  harder levels show fewer clues, e.g. only electron shells).
- **Molecule Builder:** build molecules from model-kit atoms with single, double and triple bonds. The server checks
  atoms, valency and that everything is joined (any correct isomer counts).
- **Reaction Rush:** balance equations on the whiteboard (with a live atom count) and complete reactions against the
  clock; the server accepts only the simplest balanced numbers, and combos add points.
- **Mystery Substance:** run tests (litmus, pH meter, magnesium, flame test, silver nitrate, sodium hydroxide, barium
  chloride) on an unknown liquid and identify it; fewer tests score more. Every case has exactly one right answer
  (checked in the tests).
- **Ask Kora (AI help):** 10 coins a question, up to 5 per game. Kora is given the answer so the help is correct, but
  is told to guide rather than give it away, in the learner's language. Coins are only taken if the learner has
  them, and are given back if the AI fails.
- **Same rules as the word games:** answers and puzzles stay on the server, stars unlock levels, rewards are paid by the
  server at the end (shared daily cap).
- **Art:** made with OpenAI (`apps/server/scripts/lab-art.ts`): 7 empty scenes, the student (one picture edited into
  walking poses so it stays the same person) and 11 pieces of equipment. Labels on bottles and jars are real text.
- **Endpoints:** the word-game endpoints now take a subject: `GET /me/games/chemistry`,
  `POST /me/games/chemistry/:game/runs`, plus `POST /me/games/runs/:id/ask`.
- **Tests:** 120 server tests in total, 11 for the lab (equations balance, experiments, unique mystery answers, every
  game played, Ask Kora's coins). Checked in the app in real mode: walking, picking up, a full experiment, and every game.
- **Not real yet:**
  - Chemistry content (experiment names, observations, element facts) is in English; the lab's buttons and help are
    in all 10 languages.
  - The lab doesn't count towards the World's quests and leagues yet (same as the word games).

### Space Academy: Space & Physics (Knowzone World)

A space station the student walks around in a space suit (2.5D, stylised 3D art: real lighting, slightly cartoon
proportions). Reached from the Play tab. Designs and screenshots: `docs/design/space-games/` (`00-overview.png` is the
approved concept, `01-app-overview.png` the built app). It runs on the same lab engine as chemistry: the walkable
hall now takes a "place" (picture, stations, floor), so planet surfaces reuse it too.

- **Stations:** hangar (Galaxy Defender, Asteroid Survival), rocket workshop, gravity lab, observatory.
- **Galaxy Defender:** steer a ship by dragging, dodge asteroids and drones; every few seconds a science question
  (8 per level, JSS basic science up to SS physics). Right answers fire the big beam at the boss and build a combo;
  wrong answers and time-outs cost a heart.
- **Rocket Builder:** choose an engine (including an ion drive that can't lift off from Earth) and up to 5 fuel tanks
  within a budget. Live readouts: mass, weight (m × 9.8), thrust, Δv from the rocket equation, cost. The server
  checks lift-off (thrust > weight), Δv and budget; a failed launch costs a heart and can be fixed. Each flight is
  followed by a question about your own rocket (weight, resultant force, acceleration). Δv targets are scaled down
  for the game (real rockets use stages); every mission has 2–19 working designs, and the biggest parts never work.
  The rocket is drawn from realistic sections (fairing or crew capsule, body sections, and a different engine section
  for each engine) stacked at one diameter, as tall as the screen allows, with an exhaust plume and smoke at launch.
  Readouts are on the left and parts on the right, as in the approved design.
- **Gravity Master:** drag planets onto the board (and choose their mass from level 2) so gravity bends a comet into
  the portal. Puzzles are generated backwards from a hidden solution, so each one is solvable and needs your planet.
  The app and the server run the same simulation (`services/games/gravity.ts` and `lib/games/gravity.ts`, keep them
  identical); the server decides. Misses can be retried for fewer points; after 3 tries you can skip and see a solution.
- **Solar System Explorer:** pick the next stop on the observatory's map, fly there, walk on the surface (Moon,
  Mercury, Venus, Mars, and the moons Europa, Titan, Miranda and Triton for the giant planets), scan three spots for
  discoveries, then answer mission control's questions.
- **Asteroid Survival:** survive waves of asteroids (hull of 3 hits); between waves a physics calculation made fresh
  from the seed (speed, weight, acceleration, density, F = ma, momentum, work, pressure, energy, power, impulse,
  Ohm's law, waves). A right answer earns an upgrade (shield, thrusters, laser); fewer hits score a little more.
- **Fair play:** the flying and dodging happen in the app; points and stars come only from what the server checks.
  Ask Kora (10 coins, up to 5 a game) works here too, with physics-aware guidance.
- **Art:** `apps/server/scripts/space-art.ts` (OpenAI, about $0.40): 6 scenes, 8 planet surfaces, the student (one
  picture edited into walking poses), ships, asteroids, rocket parts and 10 planets (1.3 MB as WebP).
- **Endpoints:** `GET /me/games/space`, `POST /me/games/space/:game/runs`, and the shared answer, finish, ask and quit.
- **Tests:** 131 server tests in total, 11 for space (content, every rocket mission flyable, gravity puzzles solvable,
  every game played, rewards). Checked in the app in real mode: every game played to its results screen, and Ask Kora.
- **Not real yet:**
  - Questions, facts and mission names are in English; the academy's buttons and help are in all 10 languages.
  - Not counted towards the World's quests and leagues yet.

### Museum of Time: History & Geography (Knowzone World)

A sunlit history museum the student walks around as a young explorer (2.5D, the same stylised 3D look as the Space
Academy). Reached from the Play tab. Designs and screenshots: `docs/design/history-games/` (`00-overview.png` is the
approved concept, `app/` the built app). Stations: the time machine, the lost civilizations gallery and the Africa map.

- **History Time Machine:** travel through a glowing portal to three moments in history (in time order): from Nok
  and the pyramids of Giza through Ife, Benin, Mali, Oyo and Sokoto to the amalgamation, independence and Abuja.
  Walk around each era's scene to the two marked spots; each has a challenge. From level 2 one challenge is "put
  these real events in order" (two from level 4), checked on the server.
- **Lost Civilization:** at a dig site, walk to three dig spots and brush away the soil to uncover artifacts with clues
  (Nok terracotta, an Ife bronze head, a Benin plaque, Igbo-Ukwu bronzes, Great Zimbabwe's soapstone bird, a
  Timbuktu manuscript, an Aksumite coin and more; 9 civilizations). Name the civilization to unlock its city, then
  answer a question about it. Clues never name the civilization (checked in the tests).
- **Africa Explorer:** find each country on a map of Africa (real coastline coordinates, with the Nile, Niger, Congo,
  Zambezi and Lake Victoria to help). The server checks how close the tap is; levels 1–2 give the region as a hint
  and allow more room. Then visit its landmark (16 countries, from Zuma Rock to Victoria Falls), read two facts,
  answer a question and collect a passport stamp.
- **Same rules as the other labs:** answers stay on the server, stars unlock levels, Ask Kora at 10 coins.
- **Art:** `apps/server/scripts/history-art.ts` (OpenAI, about $0.50): the museum and stations, 10 eras, 3 dig sites,
  12 artifacts, 16 landmarks and the explorer in four poses (2.6 MB as WebP). `scripts/art-runner.ts` is the shared
  picture runner for new art scripts.
- **Endpoints:** `GET /me/games/history`, `POST /me/games/history/:game/runs`, and the shared answer, finish, ask and quit.
- **Tests:** 139 server tests in total, 8 for history (content, time order, map distances, every game played).
- **Not real yet:**
  - Eras, artifacts, countries and questions are in English; the museum's buttons and help are in all 10 languages.
  - The content is a first set (10 eras, 9 civilizations, 16 countries); more can be added in `src/data/history/`.
  - Not counted towards the World's quests and leagues yet.

### World Quests (Knowzone World)

Daily and weekly quests across every place in Knowzone World, kept on the server (they used to be device-only).
Designs and screenshots: `docs/design/world-quests/` (`00-overview.png` approved concept, `01-app-overview.png` built).

- **Daily board:** 4 quests, one per place (Language Island, Chemistry lab, Space Academy, Museum of Time), picked
  fresh each local day from a seed, plus 3 chests that open after 1, 2 and 4 claimed quests.
- **Weekly board:** "play in all 4 places", one anywhere quest and two bigger place quests (three times the daily size).
- **Journey:** a 6-step weekly path through every place (then two more stops) on an illustrated map; only the current
  step moves; the weekly chest opens at the end.
- **Progress:** finishing a game (`POST /me/games/runs/:id/finish`) feeds the quests from the run's server-checked
  results (experiments mixed, rockets launched, eras visited, countries found…). Quest templates: `src/data/quests.ts`;
  titles are translated in the app (`quests` namespace) by template id.
- **Rewards:** claiming pays XP and coins once (version-checked, so double taps can't pay twice), logged as
  `quest:<id>` and `quest-chest:<daily|journey>`.
- **Endpoints:** `GET /me/quests`, `POST /me/quests/claim` `{ board, id }`, `POST /me/quests/chest` `{ chest, index }`.
- **Database:** `QuestBoard` (one per learner per day/week), migration `20261026090000_world_quests`.
- **App:** the Quests screen (board, tabs, parchment cards, chests, details with "Go to …", the reward chest, the
  journey map) and the Play tab's quest card and badge. Art: `apps/server/scripts/quest-art.ts` (9 pictures).
- **Tests:** 145 server tests in total, 6 for quests.
- **Not yet:** the old device-only island levels and battles no longer feed quests; avatar items as chest rewards
  will come with the World backend (avatar and inventory are still on the device).

### Knowzone World backend: avatar, leagues and friends

The parts of Knowzone World that were only on the phone (made-up players) now live on the server.

- **World profile** (`WorldProfile`): the learner's avatar (what others see), cosmetics they've won (achievement items
  the app reports, and quest-only items from the weekly journey chest: explorer hat, explorer outfit, Nebula and
  Savanna backdrops), and two choices: show me on leaderboards, appear anonymously. Bought items stay Redemptions.
  The server refuses an avatar wearing items you don't own. The phone sends its avatar up on first sync; after that
  the server's copy wins.
- **Weekly leagues** (`LeagueMember`): earning XP puts you in this week's league (Lagos week, Monday to Sunday): a
  group of up to 30 in your tier (Bronze, Silver, Gold, Diamond), ranked by XP from the reward ledger. Next week the
  top 5 move up, the bottom 5 (or anyone who earned nothing) move down. A school board ranks classmates this week.
- **Friends** (`Friendship`): added only with a Knowzone code (the referral code) or username — no search — then
  accepted or declined. Friend requests and acceptances are notifications. Friend battles stay practice.
- **Privacy everywhere:** names ("Tobi A.") and avatars show only when the learner's profile visibility allows it
  (everyone, their school, or friends) and they aren't anonymous; otherwise "A learner". Blocking hides both ways and
  ends any friendship. Moderation limits (`leaderboards`, `invites`, `battles`) are respected.
- **Endpoints:** `GET /me/world`, `PUT /me/world/avatar`, `POST /me/world/earned`, `PATCH /me/world/settings`,
  `GET /me/leagues`, `GET /me/leagues/school`, `GET/POST /me/friends`, `POST /me/friends/:id/accept`,
  `DELETE /me/friends/:id`.
- **Migrations:** `20261026120000_world_social`, `20261026130000_world_anonymous`.
- **App:** Leaderboards (league with promotion and demotion zones, My school tab) and Friends (your code, add by
  code, requests, remove from the ⋯ menu, battles) use the server; the mock players are gone.

### Tech Hub: Technology & Computer Science (Knowzone World)

A neon innovation hub the student walks around in a Knowzone hoodie (the logo is fed to the image model as a
reference). Designs and screenshots: `docs/design/tech-games/`. Art: `apps/server/scripts/tech-art.ts`.

- **Code Runner:** build a program from blocks (move, jump, turn left/right, repeat N) to walk a runner along a
  glowing path to the flag within a block limit; gems add points. Paths are generated from a program, so each is
  solvable; from level 3 the limit only fits if you use a repeat. The server runs the program.
- **Cyber Defender:** judge phishing emails and texts, password strength and everyday situations against the clock;
  wrong answers drain the network shield; each answer shows why (36 items, made-up brands only).
- **Robot Rescue:** program a robot with arrow cards to reach a kitten, pick it up and (from level 3) bring it home;
  boards are checked solvable, and the shortest programme earns a bonus.
- **Binary Breaker:** set switches to a number, read binary, decode ASCII letters and add in binary.
- **Circuit Master:** drop AND, OR, NOT (and NAND, NOR, XOR later) gates into a circuit so the bulb matches a truth
  table; flip switches to test; the server checks every input combination.
- **Quests:** Tech games count towards "anywhere" quests (stars, games, 3-star levels); Tech-specific quests and a
  journey stop can come later.
- **Tests:** 162 server tests in total, 8 for Tech and 9 for the World backend.

### Languages

Choosing a language switches **everything the person sees**, plus the AI's explanations. There are 10 languages:
English, Nigerian Pidgin, Yoruba, Igbo, Hausa, French, Arabic (right to left, with the Cairo font), Swahili,
Portuguese and Spanish. Conventions are in [docs/I18N.md](docs/I18N.md).

- **Coverage:** about 5,100 interface strings across 15 areas in `src/i18n/locales/<lang>/`, with 100% of keys
  translated in every language and no placeholder mismatches.
- **Where people choose:**
  - a globe button on the welcome screen, before sign-up;
  - the language step in personalization (27);
  - Settings → Language: one setting covering the interface, the learning language and the AI.
- **How the choice is kept:**
  - It's remembered on the device and saved to the account.
  - A choice made on a device is the latest choice and wins.
  - On a new device with no choice yet, the account's language applies.
- **What changes on switch:**
  - Every open screen redraws in the new language without losing navigation.
  - Arabic mirrors the layout (on iOS/Android after an app restart, which the app asks for).
  - Dates, numbers and ₦ amounts follow the language.
  - API errors with a known reason are shown translated.
- **Tools** (in `apps/mobile`):
  - `npm run i18n:check`: missing keys and placeholder mismatches per language.
  - `npm run i18n:scan`: English left directly in screens.
  - `npm run i18n:index`: regenerates the language index files.
- **Not translated yet:** the remaining demo content built into the app (course titles, World quiz questions,
  demo videos, sample tutor answers). The lesson catalogue is now translated (see Home and navigation). It will come from the backend in the chosen language when
  those features get their backend. Server error messages without a reason code, and Supabase's emails, are
  also still in English.
- **Native review needed:** Nigerian Pidgin, Yoruba, Igbo, Hausa, Arabic and Swahili are marked beta. Have native
  speakers review them before launch, especially the legal texts, coined terms and the word typed to confirm
  account deletion.

## What's built (Release 1 core loop)

| Area | Status |
|---|---|
| Sign up / log in, email codes, password reset, Google / Apple (Supabase Auth + API profiles), device sessions | ✅ |
| AI Studio: paste text, upload PDF, snap notes (OpenAI vision) | ✅ |
| Study pack generation: summary, key concepts, flagged uncertain claims, flashcards, quiz (OpenAI structured outputs) | ✅ |
| Quiz with instant feedback, explanations, weak-concept detection | ✅ |
| Flashcards with spaced repetition (simplified SM-2) | ✅ |
| AI Tutor grounded in the student's material (beginner/advanced, hints first, Teach Me Back) | ✅ |
| XP, levels, coins, forgiving streaks, daily goal | ✅ |
| Credits shown before generation, refunded on failure, per-user rate limits, AI usage logged per user and feature | ✅ |
| Referrals confirmed only after the invitee finishes a quiz, capped per month | ✅ |
| Knowzone World (7 worlds × 6 levels, 5 game types, avatars, quests, leagues) | 🟢 Playable with mock content and players |
| Discover feed | 🟡 static starter catalogue |
| Payments, explainer videos, offline, study groups, teacher dashboards | ⏳ Releases 2–3 |

## Tools and services you need

### Core stack (in use now)
| Purpose | Tool |
|---|---|
| Mobile app (iOS, Android, web) | **React Native + Expo** (SDK 58), **Expo Router**, TypeScript |
| Backend API | **Node.js 22+**, **Express 5**, TypeScript, **Zod** validation |
| AI | **OpenAI API**: Responses API with structured outputs (study packs), vision (Snap-to-Study), chat (tutor) |
| Database | **PostgreSQL** + **Prisma ORM**. Add **pgvector** for semantic search over long documents |
| PDF text extraction | **pdf-parse** |
| Auth | JWT + bcrypt now. Add Google and Apple sign-in through **Clerk** or **Supabase Auth** |
| Security | Helmet, express-rate-limit, Expo SecureStore |
| UI | expo-linear-gradient, @expo/vector-icons, Manrope (Google Fonts), expo-haptics |

### Add next (Release 1 → 2)
| Purpose | Recommended tool |
|---|---|
| Background jobs (long PDFs, video rendering) | **BullMQ + Redis** (Redis is already in docker-compose) |
| File storage | **AWS S3** or **Cloudflare R2** (cheaper data transfer) |
| Explainer videos | **FFmpeg** with **Remotion** templates; narration from **OpenAI TTS** |
| Voice tutor | **OpenAI Realtime / speech-to-text** |
| Payments (Nigeria + global) | **Flutterwave** (in use) for naira and dollars on the web. **RevenueCat** to manage App Store and Google Play subscriptions |
| Push notifications and reminders | **Expo Notifications** |
| Product analytics | **PostHog** (funnels, retention cohorts, feature flags, A/B tests) |
| Crash and error monitoring | **Sentry** (works with both Expo and Node) |
| Animations | **Reanimated** (installed) + **Lottie** for celebrations |
| Offline data | **expo-sqlite** or **WatermelonDB**, with sync |
| Email | **Resend** (verification, weekly progress reports) |
| Web app / teacher dashboard | **Next.js** (PRD §5), reusing the same API |
| Admin console | **Retool** or a Next.js admin built on the same API |

### Build, ship and run
| Purpose | Tool |
|---|---|
| App builds and store submission | **EAS Build + EAS Submit** |
| Over-the-air updates | **EAS Update** |
| API hosting | **Railway**, **Render** or **Fly.io** to start, then AWS when you need to scale |
| Managed Postgres | **Neon** or **Supabase** (both support pgvector) |
| CI | **GitHub Actions** (typecheck, lint, tests on every PR) |
| Testing | **Vitest** + **Supertest** (API), **Jest + React Native Testing Library** (app), **Maestro** (end-to-end mobile flows) |
| Design | **Figma** |
| Accounts | Apple Developer ($99/yr), Google Play Console ($25 one-time), OpenAI, domain + email |

### Compliance (before public launch)
- **NDPA 2023** (Nigeria Data Protection Act): privacy policy, consent, and data export and deletion.
- Parental consent flow for under-age users. Content moderation before any open social features.
- Have qualified legal counsel review the product (PRD §8).

## Cost control (protects margins)
- Every AI call is logged in `UsageEvent` (user, feature, model, tokens). Use it to compute cost per summary, quiz and chat.
- Models are set by environment variable (`OPENAI_MODEL_GENERATE`, `OPENAI_MODEL_TUTOR`), so you can route cheap tasks to small models.
- Sources are capped at about 60k characters until retrieval with pgvector is added.

See [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) for colours, type and UI rules.
