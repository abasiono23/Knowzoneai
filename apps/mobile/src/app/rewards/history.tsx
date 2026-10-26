import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/content/empty-state';
import { ChoiceChip } from '@/components/personalize/choice-chip';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { formatDate, formatTime } from '@/i18n';
import { CATEGORY_META, describeReason } from '@/lib/rewards/describe';
import { useRewards } from '@/lib/rewards/store';
import { dayKey } from '@/lib/world/levels';

const FILTERS = ['all', 'earned', 'spent'] as const;
type Filter = (typeof FILTERS)[number];

/** Screen 157: every coin and XP movement, grouped by day. */
export default function TransactionHistoryScreen() {
  const { wallet, loading, error, refresh } = useRewards();
  const [filter, setFilter] = useState<Filter>('all');
  const { t } = useTranslation('rewards');
  const [now] = useState(() => Date.now());
  const list = (wallet?.transactions ?? []).filter((x) =>
    filter === 'all' ? true : filter === 'earned' ? x.coins > 0 || (x.coins === 0 && x.xp > 0) : x.coins < 0,
  );
  const groups = list.reduce<{ key: string; items: typeof list }[]>((acc, x) => {
    const key = dayKey(x.at);
    const g = acc.find((y) => y.key === key);
    if (g) g.items.push(x);
    else acc.push({ key, items: [x] });
    return acc;
  }, []);
  const heading = (key: string) =>
    key === dayKey(now)
      ? t('time.today', { ns: 'common' })
      : key === dayKey(now - 86400000)
        ? t('time.yesterday', { ns: 'common' })
        : formatDate(new Date(key + 'T12:00:00'), {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
          });

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('walletEyebrow')} title={t('history.title')} />
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <ChoiceChip key={f} label={t(`history.filters.${f}`)} selected={filter === f} onPress={() => setFilter(f)} />
        ))}
      </View>
      {error ? (
        <Card style={{ gap: Spacing.xs }}>
          <Text variant="small" color={Colors.danger}>
            {error}
          </Text>
          <Button
            variant="secondary"
            title={t('actions.retry', { ns: 'common' })}
            loading={loading}
            onPress={refresh}
          />
        </Card>
      ) : groups.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title={wallet ? t('history.empty') : t('status.loading', { ns: 'common' })}
          body={t('history.emptyBody')}
        />
      ) : (
        groups.map((g) => (
          <View key={g.key} style={{ gap: Spacing.xs }}>
            <Text variant="label" color={Colors.textMuted}>
              {heading(g.key).toUpperCase()}
            </Text>
            <Card style={{ gap: Spacing.md }}>
              {g.items.map((x) => {
                const d = describeReason(x.reason);
                const m = CATEGORY_META[d.category];
                return (
                  <View
                    key={x.id}
                    style={styles.row}
                    accessible
                    accessibilityLabel={t('history.rowA11y', { label: d.label, coins: x.coins, xp: x.xp })}>
                    <View style={[styles.icon, { backgroundColor: m.color + '22' }]}>
                      <Ionicons name={m.icon} size={18} color={m.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="small" style={{ fontFamily: 'Manrope_600SemiBold' }} numberOfLines={2}>
                        {d.label}
                      </Text>
                      <Text variant="small" color={Colors.textMuted} style={{ fontSize: 11 }}>
                        {x.xp
                          ? t('history.metaXp', {
                              time: formatTime(x.at),
                              category: t(`categories.${d.category}`),
                              xp: x.xp,
                            })
                          : t('history.meta', { time: formatTime(x.at), category: t(`categories.${d.category}`) })}
                      </Text>
                    </View>
                    <Text
                      variant="bodyStrong"
                      color={x.coins < 0 ? Colors.danger : x.coins > 0 ? Colors.success : Colors.textMuted}>
                      {x.coins === 0 ? '—' : `${x.coins > 0 ? '+' : '−'}${Math.abs(x.coins)}`}
                    </Text>
                  </View>
                );
              })}
            </Card>
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', gap: Spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  icon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
