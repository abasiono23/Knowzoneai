import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { FONT, W } from '@/components/games/ui';
import { Meter, worldStyles } from '@/components/world/world-ui';
import { Screen, ScreenHeader, Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import { formatDate } from '@/i18n';
import { getItem } from '@/lib/world/avatar';
import { ACHIEVEMENTS } from '@/lib/world/progress';
import { useWorld } from '@/lib/world/store';

/** Badges: what you've earned and how close you are to the rest. */
export default function AchievementsScreen() {
  const { t } = useTranslation('world');
  const { facts, achieved } = useWorld();
  const unlocked = ACHIEVEMENTS.filter((a) => achieved[a.id]);
  const sorted = [...ACHIEVEMENTS].sort(
    (a, b) => Number(!!achieved[b.id]) - Number(!!achieved[a.id]) || b.value(facts) / b.target - a.value(facts) / a.target,
  );

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} title={t('achievements.title')} />
      <View style={styles.summary} accessible accessibilityLabel={`${unlocked.length} ${t('achievements.ofTotal', { total: ACHIEVEMENTS.length })}`}>
        <Text style={styles.count}>
          {unlocked.length}
          <Text style={styles.total}>{t('achievements.ofTotal', { total: ACHIEVEMENTS.length })}</Text>
        </Text>
        <View style={{ flex: 1 }}>
          <Meter value={unlocked.length / ACHIEVEMENTS.length} height={6} />
        </View>
      </View>
      <View style={styles.list}>
        {sorted.map((a, k) => {
          const got = !!achieved[a.id];
          const v = Math.min(a.target, a.value(facts));
          const item = a.grants ? getItem(a.grants) : undefined;
          return (
            <Animated.View key={a.id} entering={FadeIn.delay(k * 25).duration(180)} style={[worldStyles.row, k > 0 && worldStyles.rowLine, { minHeight: 76 }]}>
              <View style={[styles.badge, got && styles.badgeOn]}>
                <Ionicons name={a.icon} size={22} color={got ? '#fff' : W.muted} />
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={[worldStyles.strong, !got && { color: W.inkSoft }]}>{a.name}</Text>
                <Text style={worldStyles.small}>{a.description}</Text>
                {got ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="checkmark-circle" size={13} color={W.correct} />
                    <Text style={[worldStyles.meta, { color: W.correct }]}>
                      {t('achievements.unlockedOn', { date: formatDate(achieved[a.id], { day: 'numeric', month: 'short', year: 'numeric' }) })}
                    </Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Meter value={v / a.target} />
                    </View>
                    <Text style={worldStyles.meta}>{t('achievements.progress', { value: v, target: a.target })}</Text>
                  </View>
                )}
                {item && <Text style={[worldStyles.meta, { color: W.rare }]}>{t('achievements.grants', { item: item.name })}</Text>}
              </View>
            </Animated.View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  count: { fontFamily: FONT, fontSize: 30, color: W.ink },
  total: { fontFamily: Fonts.bold, fontSize: 16, color: W.muted },
  list: { borderRadius: 16, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line, overflow: 'hidden' },
  badge: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: W.line, backgroundColor: W.page, alignItems: 'center', justifyContent: 'center' },
  badgeOn: { backgroundColor: W.ink, borderColor: W.ink },
});
