import type { Ionicons } from '@expo/vector-icons';

import i18n from '@/i18n';

import { getCourse } from '../courses/catalog';
import { getItem } from '../world/avatar';
import { getLevel } from '../world/levels';
import { DAILY_QUESTS, WEEKLY_QUESTS } from '../world/progress';
import { getReward, rewardName } from './catalog';

export type TxnCategory = 'game' | 'quest' | 'daily' | 'learning' | 'spend' | 'other';

/** Icon and colour per category; the label is `rewards:categories.<category>`. */
export const CATEGORY_META: Record<TxnCategory, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  game: { icon: 'planet', color: '#7C5CFF' },
  quest: { icon: 'flag', color: '#2DD4BF' },
  daily: { icon: 'gift', color: '#FFC857' },
  learning: { icon: 'school', color: '#4CC9FF' },
  spend: { icon: 'bag-handle', color: '#FF7A93' },
  other: { icon: 'ellipse', color: '#A6ADD6' },
};

/**
 * Human label for a stored ledger reason, e.g. "game:space-1" → "Space Lab · level 1", in the
 * current language. The stored reason itself never changes. Call it while rendering.
 */
export function describeReason(reason: string): { label: string; category: TxnCategory } {
  const t = i18n.t;
  const [kind, rest = ''] = reason.split(/:(.*)/s);
  switch (kind) {
    case 'opening':
      return { label: t('rewards:reasons.opening'), category: 'other' };
    case 'daily-reward':
      return { label: t('rewards:reasons.daily', { day: rest }), category: 'daily' };
    case 'game': {
      const l = getLevel(rest);
      if (!l) return { label: t('rewards:reasons.world'), category: 'game' };
      return {
        label:
          l.id === 'daily'
            ? t('rewards:reasons.dailyChallenge')
            : t('rewards:reasons.level', { world: l.world.name, number: l.number }),
        category: 'game',
      };
    }
    case 'quest': {
      const q = [...DAILY_QUESTS, ...WEEKLY_QUESTS].find((x) => x.id === rest);
      return {
        label: q ? t('rewards:reasons.quest', { title: q.title }) : t('rewards:reasons.questDone'),
        category: 'quest',
      };
    }
    case 'quest-chest':
      return { label: t('quests:reward.chest'), category: 'quest' };
    case 'course': {
      const c = getCourse(rest);
      return {
        label: c ? t('rewards:reasons.course', { title: c.title }) : t('rewards:reasons.courseUnknown'),
        category: 'learning',
      };
    }
    case 'course-lesson': {
      const [courseId] = rest.split('/');
      const c = getCourse(courseId);
      return {
        label: c ? t('rewards:reasons.lesson', { title: c.title }) : t('rewards:reasons.lessonUnknown'),
        category: 'learning',
      };
    }
    case 'redeem': {
      const r = getReward(rest);
      return {
        label: r ? t('rewards:reasons.redeem', { name: rewardName(r) }) : t('rewards:reasons.redeemUnknown'),
        category: 'spend',
      };
    }
    case 'shop': {
      const item = getItem(rest);
      return {
        label: item ? t('rewards:reasons.shop', { name: rewardName(item) }) : t('rewards:reasons.shopUnknown'),
        category: 'spend',
      };
    }
    default:
      return { label: t('rewards:reasons.other'), category: 'other' };
  }
}

export type EarnWayId = 'daily' | 'challenge' | 'levels' | 'quests' | 'course' | 'lessons';

/** Every way to earn, for screen 158. Title and detail are `rewards:earn.ways.<id>.title|detail`. */
export const WAYS_TO_EARN: {
  id: EarnWayId;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  coins: string;
  xp: string;
  href: string;
}[] = [
  {
    id: 'daily',
    icon: 'gift',
    color: '#FFC857',
    coins: '5–30',
    xp: '10–40',
    href: '/rewards/daily',
  },
  {
    id: 'challenge',
    icon: 'calendar',
    color: '#FF9F43',
    coins: '15',
    xp: '30',
    href: '/world/daily',
  },
  {
    id: 'levels',
    icon: 'planet',
    color: '#7C5CFF',
    coins: '8–30',
    xp: '30–85',
    href: '/play',
  },
  {
    id: 'quests',
    icon: 'flag',
    color: '#2DD4BF',
    coins: '10–40',
    xp: '15–80',
    href: '/world/quests',
  },
  {
    id: 'course',
    icon: 'school',
    color: '#4CC9FF',
    coins: '50',
    xp: '100',
    href: '/courses',
  },
  {
    id: 'lessons',
    icon: 'book',
    color: '#9B82FF',
    coins: '—',
    xp: '10',
    href: '/courses',
  },
];
