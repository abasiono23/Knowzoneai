import i18n from '@/i18n';

/**
 * Ready-made invite messages. Students can pick a tone; the code and link are always included.
 * Labels and text are `referrals:templates.<id>.label|text`, translated when shown or sent.
 */
export const TEMPLATES = [
  { id: 'buddy', emoji: '📚' },
  { id: 'exams', emoji: '🎯' },
  { id: 'game', emoji: '🪐' },
] as const;

export type TemplateId = (typeof TEMPLATES)[number]['id'];

/** The invite message for a template, in the current language. */
export const inviteMessage = (id: TemplateId, code: string, link: string, credits: number) =>
  i18n.t(`referrals:templates.${id}.text`, { code, link, credits });

/** Title and reward text are `referrals:milestones.<id>.title|reward`. */
export const MILESTONES = [
  { id: 'firstFriend', friends: 1, icon: 'person-add' as const },
  { id: 'studyCircle', friends: 3, icon: 'people' as const },
  { id: 'classCaptain', friends: 5, icon: 'ribbon' as const },
  { id: 'ambassador', friends: 10, icon: 'trophy' as const },
] as const;
