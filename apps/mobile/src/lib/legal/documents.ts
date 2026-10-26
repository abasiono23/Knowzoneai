import type { Ionicons } from '@expo/vector-icons';
import type { TFunction } from 'i18next';

import { TUTOR_DAILY } from '../billing/plans';

type Icon = keyof typeof Ionicons.glyphMap;

export type LegalDocId = 'terms' | 'privacy' | 'guidelines' | 'ai';
/** A section's structure: does it open with paragraphs, and does it have a bullet list? */
export type LegalSectionDef = { id: string; body?: false; bullets?: true };
export type LegalDocDef = {
  id: LegalDocId;
  icon: Icon;
  /** When the text last changed (local date). */
  updated: Date;
  /** Icons for the plain-language summary lines, in order. */
  summaryIcons: Icon[];
  sections: LegalSectionDef[];
};

export type LegalSection = { id: string; title: string; body: string[]; bullets: string[] };
export type LegalDoc = Omit<LegalDocDef, 'sections'> & {
  title: string;
  eyebrow: string;
  /** A plain-language summary shown before the full text. */
  summary: { icon: Icon; text: string }[];
  sections: LegalSection[];
};

/**
 * These texts are drafts written for students and parents. They must be reviewed by
 * qualified legal counsel before public launch (PRD §8); the app shows a banner until then.
 */
export const LEGAL_DRAFT = true;

const UPDATED = new Date(2026, 9, 18);

/**
 * The structure of each legal text. The words live in the `help` namespace under
 * legal.docs.<doc>: title, eyebrow, summary[] and sections.<id>.{title, body[], bullets[]}.
 */
export const LEGAL_DOCS: Record<LegalDocId, LegalDocDef> = {
  terms: {
    id: 'terms',
    icon: 'document-text',
    updated: UPDATED,
    summaryIcons: ['person', 'document', 'sparkles', 'card', 'shield'],
    sections: [
      { id: 'who' },
      { id: 'account', bullets: true },
      { id: 'content' },
      { id: 'ai' },
      { id: 'rules', bullets: true },
      { id: 'paid' },
      { id: 'rewards' },
      { id: 'moderation' },
      { id: 'ending' },
      { id: 'liability' },
      { id: 'changes' },
    ],
  },
  privacy: {
    id: 'privacy',
    icon: 'lock-closed',
    // YouTube videos in courses (YouTube API Services) added.
    updated: new Date(2026, 9, 23),
    summaryIcons: ['eye-off', 'school', 'sparkles', 'download'],
    sections: [
      { id: 'scope' },
      { id: 'collect', bullets: true },
      { id: 'use', bullets: true },
      { id: 'ai' },
      { id: 'share' },
      { id: 'children' },
      { id: 'keep' },
      { id: 'rights', bullets: true },
      { id: 'security' },
      { id: 'contact' },
    ],
  },
  guidelines: {
    id: 'guidelines',
    icon: 'people',
    updated: UPDATED,
    summaryIcons: ['heart', 'checkmark-circle', 'lock-closed', 'flag'],
    sections: [
      { id: 'kind' },
      { id: 'safe', bullets: true },
      { id: 'private' },
      { id: 'honest' },
      { id: 'names' },
      { id: 'enforce' },
      { id: 'report' },
    ],
  },
  ai: {
    id: 'ai',
    icon: 'sparkles',
    updated: UPDATED,
    summaryIcons: ['alert-circle', 'book', 'flag'],
    sections: [
      { id: 'what' },
      { id: 'limits', bullets: true },
      { id: 'use', body: false, bullets: true },
      { id: 'exams' },
      { id: 'safety' },
      { id: 'improve' },
    ],
  },
};

/** Numbers the texts mention, so they stay in step with the plans. */
const VALUES = { tutorFree: TUTOR_DAILY.FREE };

// Keys are built from the ids above, so they're looked up untyped; English has every one of them.
type HelpT = TFunction<'help'>;
const text = (t: HelpT, key: string) => t(key as 'legal.contents', VALUES);
const list = (t: HelpT, key: string): string[] => {
  const v: unknown = t(key as 'legal.contents', { ...VALUES, returnObjects: true });
  return Array.isArray(v) ? (v as string[]) : [];
};

/** The title of a legal text in the current language. */
export const legalTitle = (t: HelpT, id: LegalDocId) => t(`legal.docs.${id}.title`);

/** A legal text with its words in the current language. Call at render time with the `help` t. */
export function legalDoc(t: HelpT, id: LegalDocId): LegalDoc {
  const def = LEGAL_DOCS[id];
  const base = `legal.docs.${id}`;
  const summary = list(t, `${base}.summary`);
  return {
    ...def,
    title: legalTitle(t, id),
    eyebrow: t(`legal.docs.${id}.eyebrow`),
    summary: def.summaryIcons.map((icon, i) => ({ icon, text: summary[i] ?? '' })).filter((s) => s.text),
    sections: def.sections.map((s) => {
      const key = `${base}.sections.${s.id}`;
      return {
        id: s.id,
        title: text(t, `${key}.title`),
        body: s.body === false ? [] : list(t, `${key}.body`),
        bullets: s.bullets ? list(t, `${key}.bullets`) : [],
      };
    }),
  };
}
