/**
 * Makes the Knowzone Originals: one short narrated explainer per video lesson, in every app language.
 * Each lesson is scripted and illustrated once (English); other languages get a translated script
 * and their own narration, reusing the pictures. Safe to run again: finished videos are skipped.
 *
 *   npm run videos:originals                       # every video lesson, every language
 *   npm run videos:originals -- --langs=en,fr      # some languages
 *   npm run videos:originals -- --lessons=l1,l4    # some lessons
 *   npm run videos:originals -- --force            # remake even finished ones
 */
import 'dotenv/config';

import { prisma } from '../src/db.js';
import { drawScenes, recordScenes } from '../src/routes/videos.js';
import { catalogFor } from '../src/services/catalog.js';
import { LANGUAGES, type LanguageId } from '../src/services/personalization.js';
import { translateScript, writeScript, type Scene, type VideoSettings } from '../src/services/video-ai.js';

const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1]?.split(',');
const force = process.argv.includes('--force');
const langs = (arg('langs') ?? Object.keys(LANGUAGES)) as LanguageId[];
const only = arg('lessons');

/** AI usage is logged against this account (it can't sign in; it only owns the cost records). */
const SYSTEM = { id: 'knowzone-system', email: 'system@knowzone.ai', name: 'Knowzone', referralCode: 'KZSYSTEM' };
const STYLES = ['galaxy', 'blueprint', 'chalk', 'sunset', 'paper'];
const EN_VOICES = ['ada', 'tunde', 'grace', 'sam'];

const voiceFor = (lang: LanguageId, i: number) => (lang === 'pcm' ? 'kemi' : lang === 'en' ? EN_VOICES[i % 4] : ['ada', 'tunde'][i % 2]);
const idFor = (lessonId: string, lang: LanguageId) => `o-${lessonId}-${lang}`;

async function main() {
  await prisma.user.upsert({ where: { id: SYSTEM.id }, create: SYSTEM, update: {} });
  const lessons = (await catalogFor('en')).lessons.filter((l) => l.format === 'video' && (!only || only.includes(l.id)));
  console.log(`${lessons.length} lessons × ${langs.length} languages`);

  for (const [i, lesson] of lessons.entries()) {
    const base: Omit<VideoSettings, 'language' | 'voiceId'> = {
      length: '1m',
      styleId: STYLES[i % STYLES.length],
      captions: true,
      captionStyle: 'karaoke',
    };
    // English first: it carries the pictures the other languages reuse. If it fails, the lesson is
    // skipped this run (a network blip shouldn't stop the others); run the script again to finish it.
    let en = await prisma.video.findUnique({ where: { id: idFor(lesson.id, 'en') } }).catch(() => null);
    if (!en || en.status !== 'ready' || force) {
      try {
      const t0 = Date.now();
      const settings: VideoSettings = { ...base, language: 'en', voiceId: voiceFor('en', i) };
      const row = {
        origin: 'catalog',
        lessonId: lesson.id,
        language: 'en',
        title: lesson.title,
        settings,
        source: { kind: 'lesson', lessonId: lesson.id, label: lesson.title },
        status: 'generating',
        views: lesson.views,
        baseLikes: Math.round(lesson.views * 0.08),
      };
      en = await prisma.video.upsert({ where: { id: idFor(lesson.id, 'en') }, create: { id: idFor(lesson.id, 'en'), ...row }, update: row });
      const script = await writeScript(
        SYSTEM.id,
        { title: lesson.title, text: `${lesson.title}\n${lesson.summary}\n${lesson.keyPoints.map((k) => `- ${k}`).join('\n')}` },
        settings,
      );
      let scenes = await drawScenes(en.id, SYSTEM.id, script.scenes, settings);
      scenes = await recordScenes(en.id, SYSTEM.id, scenes, settings);
      en = await prisma.video.update({
        where: { id: en.id },
        data: { scenes, subject: script.subject, level: lesson.level, description: script.description, status: 'ready', stage: 4 },
      });
      console.log(`✓ ${lesson.id} en  "${lesson.title}" ${scenes.length} scenes, ${scenes.filter((s) => s.image).length} pictures (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
      } catch (e) {
        console.error(`✗ ${lesson.id} en (skipping this lesson):`, (e as Error).message);
        continue;
      }
    }

    for (const lang of langs.filter((l) => l !== 'en')) {
      const id = idFor(lesson.id, lang);
      const existing = await prisma.video.findUnique({ where: { id } });
      if (existing?.status === 'ready' && !force) continue;
      const t0 = Date.now();
      try {
        const settings: VideoSettings = { ...base, language: lang, voiceId: voiceFor(lang, i) };
        const localized = (await catalogFor(lang)).lessons.find((l) => l.id === lesson.id);
        const tr = await translateScript(SYSTEM.id, { title: en.title, description: en.description, scenes: en.scenes as Scene[] }, lang);
        const row = {
          origin: 'catalog',
          lessonId: lesson.id,
          language: lang,
          title: localized?.title ?? tr.title,
          description: tr.description,
          subject: en.subject,
          level: en.level,
          settings,
          source: en.source ?? undefined,
          status: 'generating',
          views: en.views,
          baseLikes: en.baseLikes,
        };
        await prisma.video.upsert({ where: { id }, create: { id, ...row }, update: row });
        const scenes = await recordScenes(id, SYSTEM.id, tr.scenes, settings);
        await prisma.video.update({ where: { id }, data: { scenes, status: 'ready', stage: 4 } });
        console.log(`✓ ${lesson.id} ${lang} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
      } catch (e) {
        console.error(`✗ ${lesson.id} ${lang}:`, (e as Error).message);
        await prisma.video.updateMany({ where: { id }, data: { status: 'failed' } }).catch(() => {});
      }
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
