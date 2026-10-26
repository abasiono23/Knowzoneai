import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AuthScreen } from '@/components/auth/auth-screen';
import { HeroIcon } from '@/components/auth/hero-icon';
import { TextField } from '@/components/auth/text-field';
import { OptionsPanel } from '@/components/materials/options-panel';
import { ChoiceChip, ChipWrap } from '@/components/personalize/choice-chip';
import { Button, Text } from '@/components/ui';
import { Colors, Gradients } from '@/constants/theme';
import { useCreditGate } from '@/lib/billing/credits';
import { useMaterials } from '@/lib/studio/store';
import { DEFAULT_OPTIONS } from '@/lib/studio/types';

/** Suggested topics; the text lives in the `study` namespace under topic.ideas.<id>. */
const IDEAS = ['photosynthesis', 'mole', 'quadratic', 'newton', 'demand'] as const;

/** Screen 66: enter a topic and let the AI write the material. */
export default function TopicScreen() {
  const { t } = useTranslation('study');
  const { create } = useMaterials();
  const canSpend = useCreditGate();
  const [topic, setTopic] = useState('');
  const [focus, setFocus] = useState('');
  const [options, setOptions] = useState(DEFAULT_OPTIONS);

  const start = () => {
    const label = focus.trim() ? `${topic.trim()} (${focus.trim()})` : topic.trim();
    if (!canSpend(1, 'study pack')) return;
    const id = create({ type: 'topic', label, topic: topic.trim(), options });
    router.replace(`/study/status/${id}`);
  };

  return (
    <AuthScreen
      hero={<HeroIcon icon="bulb" colors={Gradients.reward} />}
      title={t('topic.title')}
      subtitle={t('topic.subtitle')}
      footer={
        <Button title={t('shared.createPack')} icon="sparkles" onPress={start} disabled={topic.trim().length < 3} />
      }>
      <TextField
        label={t('topic.topicLabel')}
        icon="bulb-outline"
        placeholder={t('topic.topicPlaceholder')}
        value={topic}
        onChangeText={setTopic}
        autoFocus
      />
      <TextField
        label={t('topic.focusLabel')}
        icon="funnel-outline"
        placeholder={t('topic.focusPlaceholder')}
        value={focus}
        onChangeText={setFocus}
      />
      <Text variant="label" color={Colors.textMuted}>
        {t('topic.popular')}
      </Text>
      <ChipWrap>
        {IDEAS.map((i) => {
          const idea = t(`topic.ideas.${i}`);
          return <ChoiceChip key={i} label={idea} selected={topic === idea} onPress={() => setTopic(idea)} />;
        })}
      </ChipWrap>
      <OptionsPanel value={options} onChange={setOptions} />
      <Text variant="small" color={Colors.textMuted}>
        {t('topic.disclaimer')}
      </Text>
    </AuthScreen>
  );
}
