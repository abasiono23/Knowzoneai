import i18n from '@/i18n';
import { currentRegion, DEFAULT_REGION, examNames } from '@/lib/region';

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
export function inviteMessage(id: TemplateId, code: string, link: string, credits: number) {
  // The exam-prep invite names the sender's own exams: WAEC/JAMB in Nigeria, SAT in the US…
  const region = currentRegion();
  if (id === 'exams' && region !== DEFAULT_REGION) {
    const names = examNames(region);
    return names.length
      ? i18n.t('referrals:templates.exams.textFor', { exams: names.join('/'), code, link, credits })
      : i18n.t('referrals:templates.exams.textAny', { code, link, credits });
  }
  return i18n.t(`referrals:templates.${id}.text`, { code, link, credits });
}

/** Title and reward text are `referrals:milestones.<id>.title|reward`. */
export const MILESTONES = [
  { id: 'firstFriend', friends: 1, icon: 'person-add' as const },
  { id: 'studyCircle', friends: 3, icon: 'people' as const },
  { id: 'classCaptain', friends: 5, icon: 'ribbon' as const },
  { id: 'ambassador', friends: 10, icon: 'trophy' as const },
] as const;
