import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { SceneView } from '@/components/videos/scene-view';
import { WizardStep } from '@/components/videos/wizard-step';
import { Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useVideoDraft } from '@/lib/videos/draft';
import { STYLES, styleDescription, styleName } from '@/lib/videos/options';
import type { Scene } from '@/lib/videos/types';

/** Screen 102: visual style, previewed with a sample scene from this video. */
export default function StyleScreen() {
  const { settings, setSettings, title } = useVideoDraft();
  const { t } = useTranslation('videos');
  const sample: Scene = {
    id: 'preview',
    kind: 'concept',
    heading: title || t('style.sampleHeading'),
    body: t('style.sampleBody'),
    emoji: '💡',
    caption: '',
    seconds: 5,
  };
  return (
    <WizardStep step={4} title={t('style.title')} next="/videos/create/captions">
      <View style={styles.grid}>
        {STYLES.map((s) => {
          const selected = settings.styleId === s.id;
          const name = styleName(s.id, t);
          const description = styleDescription(s.id, t);
          return (
            <Pressable
              key={s.id}
              onPress={() => setSettings({ styleId: s.id })}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={`${name}. ${description}`}
              style={[styles.card, selected && styles.selected]}>
              <View style={styles.preview}>
                <SceneView scene={sample} style={s} compact />
                {selected && (
                  <View style={styles.tick}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                )}
              </View>
              <View style={{ padding: Spacing.sm, gap: 2 }}>
                <Text variant="bodyStrong" style={{ fontSize: 14 }}>
                  {name}
                </Text>
                <Text variant="small" color={Colors.textSecondary} style={{ fontSize: 12 }} numberOfLines={2}>
                  {description}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </WizardStep>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  card: {
    width: '47%',
    flexGrow: 1,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  selected: { borderColor: Colors.primary },
  preview: { height: 170 },
  tick: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
