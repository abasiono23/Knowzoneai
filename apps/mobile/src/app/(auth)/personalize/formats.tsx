import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { StepScreen } from '@/components/personalize/step-screen';
import { Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { FORMATS, toggleIn } from '@/lib/personalization';
import { usePersonalization } from '@/lib/personalization-store';

export default function FormatsScreen() {
  const { profile, update } = usePersonalization();
  const { t } = useTranslation('personalize');

  return (
    <StepScreen
      step="formats"
      title={t('formats.title')}
      subtitle={t('formats.subtitle')}
      canContinue={profile.formats.length > 0}
      helper={profile.formats.length ? t('selected', { count: profile.formats.length }) : t('pickAtLeastOne')}>
      <View style={styles.grid}>
        {FORMATS.map((f) => {
          const selected = profile.formats.includes(f.id);
          return (
            <Pressable
              key={f.id}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                update({ formats: toggleIn(profile.formats, f.id) });
              }}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={t('optionA11y', { label: f.label, description: f.description })}
              style={({ pressed }) => [
                styles.tile,
                selected && styles.selected,
                { transform: [{ scale: pressed ? 0.97 : 1 }] },
              ]}>
              <View style={[styles.icon, { backgroundColor: f.color + '22' }]}>
                <Ionicons name={f.icon} size={24} color={f.color} />
              </View>
              <Text variant="bodyStrong">{f.label}</Text>
              <Text variant="small" color={Colors.textSecondary}>
                {f.description}
              </Text>
              {selected && (
                <View style={styles.tick}>
                  <Ionicons name="checkmark" size={14} color={Colors.textOnAccent} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </StepScreen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  tile: {
    width: '47%',
    flexGrow: 1,
    gap: 4,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  selected: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
  icon: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  tick: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
