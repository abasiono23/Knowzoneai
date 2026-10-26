import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Coin } from '@/components/rewards/reward-ui';
import { Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { WAYS_TO_EARN } from '@/lib/rewards/describe';

/** Screen 158: ways to earn coins (and XP). */
export default function WaysToEarnScreen() {
  const { t } = useTranslation('rewards');
  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} title={t('earn.title')} />
      <Text color={Colors.textSecondary}>{t('earn.intro')}</Text>
      {WAYS_TO_EARN.map((w, k) => (
        <Animated.View key={w.id} entering={FadeInDown.delay(k * 50)}>
          <Pressable
            onPress={() => router.push(w.href as Href)}
            accessibilityRole="button"
            accessibilityLabel={t('earn.rowA11y', { title: t(`earn.ways.${w.id}.title`), coins: w.coins, xp: w.xp })}>
            <Card style={styles.row}>
              <View style={[styles.icon, { backgroundColor: w.color + '22' }]}>
                <Ionicons name={w.icon} size={22} color={w.color} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="bodyStrong">{t(`earn.ways.${w.id}.title`)}</Text>
                <Text variant="small" color={Colors.textSecondary}>
                  {t(`earn.ways.${w.id}.detail`)}
                </Text>
                <View style={styles.pills}>
                  <View style={styles.pill}>
                    <Coin size={14} />
                    <Text variant="small" style={{ fontSize: 12 }}>
                      {w.coins}
                    </Text>
                  </View>
                  <View style={styles.pill}>
                    <Ionicons name="flash" size={12} color={Colors.primary} />
                    <Text variant="small" style={{ fontSize: 12 }}>
                      {t('earn.xp', { xp: w.xp })}
                    </Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </Card>
          </Pressable>
        </Animated.View>
      ))}
      <Card style={styles.note}>
        <Ionicons name="shield-checkmark" size={20} color={Colors.success} />
        <Text variant="small" style={{ flex: 1 }}>
          {t('earn.note')}
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  icon: { width: 48, height: 48, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  pills: { flexDirection: 'row', gap: Spacing.xs, marginTop: 4 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceRaised,
  },
  note: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', borderColor: Colors.success + '44' },
});
