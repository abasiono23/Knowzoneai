import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ProgressBar, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { formatDate } from '@/i18n';
import { getItem } from '@/lib/world/avatar';
import { ACHIEVEMENTS } from '@/lib/world/progress';
import { useWorld } from '@/lib/world/store';

/** Screen 153: game achievements, with progress towards each. */
export default function AchievementsScreen() {
  const { t } = useTranslation('world');
  const { facts, achieved } = useWorld();
  const unlocked = ACHIEVEMENTS.filter((a) => achieved[a.id]);
  const sorted = [...ACHIEVEMENTS].sort(
    (a, b) =>
      Number(!!achieved[b.id]) - Number(!!achieved[a.id]) || a.value(facts) / a.target - b.value(facts) / b.target,
  );

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} title={t('achievements.title')} />
      <View style={styles.summary}>
        <Text variant="display">
          {unlocked.length}
          <Text variant="heading" color={Colors.textMuted}>
            {t('achievements.ofTotal', { total: ACHIEVEMENTS.length })}
          </Text>
        </Text>
        <View style={{ flex: 1 }}>
          <ProgressBar progress={unlocked.length / ACHIEVEMENTS.length} height={8} colors={Gradients.reward} />
        </View>
      </View>
      <View style={styles.grid}>
        {sorted.map((a, k) => {
          const got = !!achieved[a.id];
          const v = Math.min(a.target, a.value(facts));
          const item = a.grants ? getItem(a.grants) : undefined;
          return (
            <Animated.View key={a.id} entering={FadeInDown.delay(k * 30)} style={[styles.card, got && styles.got]}>
              <LinearGradient
                colors={got ? Gradients.reward : [Colors.surfaceRaised, Colors.surfaceRaised]}
                style={styles.badge}>
                <Ionicons name={a.icon} size={28} color={got ? Colors.backgroundDeep : Colors.textMuted} />
              </LinearGradient>
              <Text variant="bodyStrong" center numberOfLines={1}>
                {a.name}
              </Text>
              <Text variant="small" color={Colors.textSecondary} center numberOfLines={2} style={{ fontSize: 12 }}>
                {a.description}
              </Text>
              {got ? (
                <Text variant="label" color={Colors.success} style={{ fontSize: 10 }}>
                  {t('achievements.unlockedOn', {
                    date: formatDate(achieved[a.id], { day: 'numeric', month: 'numeric', year: 'numeric' }),
                  })}
                </Text>
              ) : (
                <View style={{ alignSelf: 'stretch', gap: 3 }}>
                  <ProgressBar progress={v / a.target} height={5} />
                  <Text variant="small" color={Colors.textMuted} center style={{ fontSize: 11 }}>
                    {t('achievements.progress', { value: v, target: a.target })}
                  </Text>
                </View>
              )}
              {item && (
                <Text variant="label" color={Colors.reward} style={{ fontSize: 9 }} center>
                  {t('achievements.grants', { item: item.name.toUpperCase() })}
                </Text>
              )}
            </Animated.View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  card: {
    width: '47%',
    flexGrow: 1,
    alignItems: 'center',
    gap: 6,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  got: { borderColor: Colors.reward + '88' },
  badge: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
});
