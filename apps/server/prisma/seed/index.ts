/**
 * Loads the learning catalogue (English + translations) into the database. Safe to run again:
 * existing rows are updated, nothing is deleted, and lesson popularity counters are kept.
 *
 *   npm run db:seed
 */
import 'dotenv/config';

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../../src/generated/prisma/client.js';
import { CATEGORIES, LESSONS, SUBJECTS } from './catalog.js';

type Text = Record<string, string | string[]>;
type Translations = {
  categories?: Record<string, Text>;
  subjects?: Record<string, Text>;
  lessons?: Record<string, Text>;
};

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
const dir = resolve(import.meta.dirname, 'catalog-i18n');

/** { yo: {...}, fr: {...} } for one item, from every translation file that has it. */
const languages = existsSync(dir)
  ? readdirSync(dir)
      .filter((f) => f.endsWith('.json') && f !== 'en.json')
      .map((f) => [f.replace('.json', ''), JSON.parse(readFileSync(resolve(dir, f), 'utf8')) as Translations] as const)
  : [];
const i18nFor = (kind: keyof Translations, id: string) =>
  Object.fromEntries(languages.map(([lang, t]) => [lang, t[kind]?.[id]]).filter(([, v]) => v));

async function main() {
  for (const [position, c] of CATEGORIES.entries()) {
    const data = { name: c.name, icon: c.icon, color: c.color, position, i18n: i18nFor('categories', c.id) };
    await prisma.category.upsert({ where: { id: c.id }, create: { id: c.id, ...data }, update: data });
  }
  for (const [position, s] of SUBJECTS.entries()) {
    const data = {
      categoryId: s.category,
      name: s.name,
      emoji: s.emoji,
      colors: [...s.colors],
      description: s.description,
      topics: s.topics,
      position,
      i18n: i18nFor('subjects', s.id),
    };
    await prisma.subject.upsert({ where: { id: s.id }, create: { id: s.id, ...data }, update: data });
  }
  for (const l of LESSONS) {
    const content = {
      subjectId: l.subjectId,
      title: l.title,
      topic: l.topic,
      format: l.format,
      minutes: l.minutes,
      level: l.level,
      summary: l.summary,
      keyPoints: l.keyPoints,
      exams: l.exams ?? [],
      i18n: i18nFor('lessons', l.id),
    };
    // Starting popularity only on first insert; real views take over after that.
    await prisma.lesson.upsert({
      where: { id: l.id },
      create: { id: l.id, ...content, views: l.views, rating: l.rating, trend: l.trend },
      update: content,
    });
  }
  console.log(
    `Seeded ${CATEGORIES.length} categories, ${SUBJECTS.length} subjects, ${LESSONS.length} lessons` +
      ` with ${languages.length} translation(s): ${languages.map(([l]) => l).join(', ') || 'none'}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
