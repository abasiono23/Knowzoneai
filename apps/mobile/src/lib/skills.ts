import type { Ionicons } from '@expo/vector-icons';

import { request } from '@/lib/api';

/**
 * Future skills (Explore): coding, UI/UX design, cybersecurity, AI prompting and data science, each a
 * set of YouTube lessons with a written summary. The lists come from the server, in the app's language.
 */
export type SkillCard = { id: string; name: string; tagline: string; lessons: number };
export type SkillVideo = { youtubeId: string; title: string; channel: string; seconds: number; summary: string };
export type Skill = { id: string; name: string; summary: string; videos: SkillVideo[] };

export const skillsApi = {
  list: () => request<{ skills: SkillCard[] }>('/skills'),
  get: (id: string) => request<{ skill: Skill }>(`/skills/${id}`),
};

/** Each subject's icon and colours on its card. */
export const SKILL_LOOK: Record<string, { icon: keyof typeof Ionicons.glyphMap; colors: readonly [string, string] }> = {
  coding: { icon: 'code-slash', colors: ['#4CC9FF', '#1663C7'] },
  'ui-ux': { icon: 'color-palette', colors: ['#E79BFF', '#B04CFF'] },
  cybersecurity: { icon: 'shield-checkmark', colors: ['#3DDCB0', '#0E8F6E'] },
  'ai-prompting': { icon: 'chatbubble-ellipses', colors: ['#9B6BFF', '#6A45FF'] },
  'data-science': { icon: 'bar-chart', colors: ['#FFB547', '#FF8A1F'] },
};

/** A video's thumbnail, from YouTube. */
export const skillThumb = (youtubeId: string) => `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;

/** Whole minutes, for a video's length. */
export const skillMinutes = (seconds: number) => Math.max(1, Math.round(seconds / 60));
