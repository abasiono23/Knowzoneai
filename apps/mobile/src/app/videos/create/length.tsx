import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { OptionCard } from '@/components/personalize/option-card';
import { WizardStep } from '@/components/videos/wizard-step';
import { Text } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useSession } from '@/lib/session';
import { useVideoDraft } from '@/lib/videos/draft';
import { LENGTHS, lengthDescription, lengthLabel } from '@/lib/videos/options';

/** Longer explainers are part of Knowzone Plus and Pro. */
const PREMIUM_LENGTHS = ['3m', '5m'];

/** Screen 100: select video length (sets scene count and credit cost). */
export default function VideoLengthScreen() {
  const { settings, setSettings } = useVideoDraft();
  const { user } = useSession();
  const { t } = useTranslation('videos');
  const free = (user?.plan ?? 'FREE') === 'FREE';
  return (
    <WizardStep step={2} title={t('length.title')} subtitle={t('length.subtitle')} next="/videos/create/voice">
      {LENGTHS.map((l) => {
        const locked = free && PREMIUM_LENGTHS.includes(l.id);
        return (
          <OptionCard
            key={l.id}
            label={lengthLabel(l.id, t)}
            description={t('length.description', { description: lengthDescription(l.id, t), count: l.scenes })}
            emoji={l.id === '30s' ? '⚡' : l.id === '1m' ? '🎯' : l.id === '3m' ? '📘' : '🎓'}
            badge={locked ? 'PLUS' : t('length.credits', { count: l.credits })}
            selected={settings.length === l.id}
            onPress={() =>
              locked
                ? router.push({ pathname: '/billing/upgrade', params: { reason: 'video-length' } })
                : setSettings({ length: l.id })
            }
          />
        );
      })}
      <Text variant="small" color={Colors.textMuted}>
        {t('length.note')}
      </Text>
    </WizardStep>
  );
}
