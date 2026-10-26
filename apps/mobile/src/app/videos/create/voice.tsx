import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ToggleRow } from '@/components/personalize/toggle-row';
import { WizardStep } from '@/components/videos/wizard-step';
import { Card, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useVideoDraft } from '@/lib/videos/draft';
import { narrator } from '@/lib/videos/narrator';
import { VOICES, voiceDescription, voiceLabel } from '@/lib/videos/options';

/** Screen 101: choose a narration voice, with a spoken preview of each. */
export default function VoiceScreen() {
  const { settings, setSettings } = useVideoDraft();
  const { t } = useTranslation('videos');
  const [playing, setPlaying] = useState<string | null>(null);
  const [narrated, setNarrated] = useState(settings.voiceId !== 'none');

  useEffect(() => () => narrator.stop(), []);

  const preview = (id: string, sample: string) => {
    if (playing === id) {
      narrator.stop();
      setPlaying(null);
      return;
    }
    narrator.speak(sample, id);
    setPlaying(id);
    setTimeout(() => setPlaying((p) => (p === id ? null : p)), 3500);
  };

  return (
    <WizardStep
      step={3}
      title={t('voice.title')}
      subtitle={t('voice.subtitle')}
      next="/videos/create/style"
      onContinue={() => narrator.stop()}>
      <Card>
        <ToggleRow
          icon="mic"
          label={t('voice.narration')}
          description={t('voice.narrationHint')}
          value={narrated}
          onChange={(on) => {
            setNarrated(on);
            if (!on) setSettings({ voiceId: 'none', captions: true });
            else setSettings({ voiceId: VOICES[0].id });
          }}
        />
      </Card>
      {narrated &&
        VOICES.map((v) => {
          const selected = settings.voiceId === v.id;
          const name = voiceLabel(v.id, t);
          const description = voiceDescription(v.id, t);
          return (
            <View key={v.id} style={[styles.row, selected && styles.selected]}>
              <Pressable
                onPress={() => setSettings({ voiceId: v.id })}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={`${name}. ${description}`}
                style={styles.main}>
                <View style={[styles.avatar, selected && { backgroundColor: Colors.primary }]}>
                  <Text variant="bodyStrong">{name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyStrong">{name}</Text>
                  <Text variant="small" color={Colors.textSecondary}>
                    {description}
                  </Text>
                </View>
              </Pressable>
              <Pressable
                onPress={() => preview(v.id, v.sample)}
                accessibilityRole="button"
                accessibilityLabel={t('voice.preview', { name })}
                style={styles.play}>
                <Ionicons name={playing === v.id ? 'stop' : 'play'} size={18} color={Colors.text} />
              </Pressable>
            </View>
          );
        })}
      <Text variant="small" color={Colors.textMuted}>
        {t('voice.note')}
      </Text>
    </WizardStep>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    paddingLeft: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  selected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  play: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
