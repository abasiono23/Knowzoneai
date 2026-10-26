import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { OptionCard } from '@/components/personalize/option-card';
import { ToggleRow } from '@/components/personalize/toggle-row';
import { SceneView } from '@/components/videos/scene-view';
import { WizardStep } from '@/components/videos/wizard-step';
import { Card, Text } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useVideoDraft } from '@/lib/videos/draft';
import { useCreditGate } from '@/lib/billing/credits';
import {
  CAPTION_STYLES,
  captionStyleDescription,
  captionStyleLabel,
  LENGTHS,
  styleOf,
  VIDEO_LANGUAGES,
} from '@/lib/videos/options';
import { useVideos } from '@/lib/videos/store';
import type { Scene } from '@/lib/videos/types';

/** Screen 103: captions and language, then generate. */
export default function CaptionsScreen() {
  const draft = useVideoDraft();
  const { t } = useTranslation('videos');
  const sample = t('captions.sample');
  const { generateVideo } = useVideos();
  const { settings, setSettings } = draft;
  const canSpend = useCreditGate();
  const credits = LENGTHS.find((l) => l.id === settings.length)?.credits ?? 1;
  const scene: Scene = {
    id: 'cap',
    kind: 'concept',
    heading: draft.title || t('captions.sampleHeading'),
    emoji: '🎬',
    caption: sample,
    seconds: 5,
  };
  const words = sample.split(' ');

  return (
    <WizardStep
      step={5}
      title={t('captions.title')}
      subtitle={t('captions.subtitle')}
      continueLabel={t('captions.generate', { count: credits })}
      canContinue={!!draft.source}
      onContinue={() => {
        if (!draft.source) return;
        if (!canSpend(credits, 'video')) return;
        const id = generateVideo({
          title: draft.title,
          source: draft.source,
          settings,
        });
        router.replace(`/videos/generate/${id}`);
      }}>
      <View style={styles.preview}>
        <SceneView scene={scene} style={styleOf(settings.styleId)} compact />
        {settings.captions && (
          <View style={[styles.caption, settings.captionStyle === 'bold' && { paddingVertical: 10 }]}>
            <Text
              center
              style={[
                styles.capText,
                settings.captionStyle === 'bold' && {
                  fontSize: 18,
                  lineHeight: 24,
                },
              ]}>
              {settings.captionStyle === 'karaoke'
                ? words.map((w, i) => (
                    <Text key={i} style={[styles.capText, { color: i < 5 ? '#FFE27A' : '#fff' }]}>
                      {w}{' '}
                    </Text>
                  ))
                : sample}
            </Text>
          </View>
        )}
      </View>
      <Card>
        <ToggleRow
          icon="chatbox-ellipses"
          label={t('captions.captions')}
          description={settings.voiceId === 'none' ? t('captions.required') : t('captions.shownByDefault')}
          value={settings.captions}
          disabled={settings.voiceId === 'none'}
          onChange={(captions) => setSettings({ captions })}
        />
      </Card>
      {settings.captions &&
        CAPTION_STYLES.map((c) => (
          <OptionCard
            key={c.id}
            label={captionStyleLabel(c.id, t)}
            description={captionStyleDescription(c.id, t)}
            selected={settings.captionStyle === c.id}
            onPress={() => setSettings({ captionStyle: c.id })}
          />
        ))}
      <Text variant="heading">{t('captions.language')}</Text>
      {VIDEO_LANGUAGES.map((l) => (
        <OptionCard
          key={l.id}
          label={l.label}
          badge={l.beta ? t('status.beta', { ns: 'common' }) : undefined}
          selected={settings.language === l.id}
          onPress={() => setSettings({ language: l.id })}
        />
      ))}
    </WizardStep>
  );
}

const styles = StyleSheet.create({
  preview: { height: 220, borderRadius: Radius.lg, overflow: 'hidden' },
  caption: {
    position: 'absolute',
    left: Spacing.sm,
    right: Spacing.sm,
    bottom: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.62)',
    borderRadius: Radius.sm,
    padding: 6,
  },
  capText: {
    color: '#fff',
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
  },
});
