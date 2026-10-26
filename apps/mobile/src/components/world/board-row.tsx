import { StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { AvatarConfig } from '@/lib/world/types';

import { Avatar } from './avatar';

const MEDAL = ['#FFC857', '#C0C7D6', '#CD7F32'];

/** One leaderboard row: rank, avatar, name, value, and an optional action. */
export function BoardRow({
  rank,
  name,
  sub,
  avatar,
  value,
  me,
  action,
  menu,
}: {
  rank: number;
  name: string;
  sub?: string;
  avatar: AvatarConfig;
  value: string;
  me?: boolean;
  action?: ReactNode;
  /** Extra control after the value, e.g. the report / block menu. */
  menu?: ReactNode;
}) {
  const { t } = useTranslation('world');
  return (
    <View style={[styles.row, me && styles.me]} accessible accessibilityLabel={t('board.row', { rank, name, value })}>
      <View style={[styles.rank, rank <= 3 && { backgroundColor: MEDAL[rank - 1] }]}>
        <Text variant="label" color={rank <= 3 ? Colors.backgroundDeep : Colors.textSecondary}>
          {rank}
        </Text>
      </View>
      <Avatar config={avatar} size={40} ring={me ? Colors.primary : undefined} />
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong" numberOfLines={1} color={me ? Colors.primary : Colors.text}>
          {name}
        </Text>
        {sub && (
          <Text variant="small" color={Colors.textMuted} style={{ fontSize: 11 }} numberOfLines={1}>
            {sub}
          </Text>
        )}
      </View>
      {action ?? (
        <Text variant="bodyStrong" style={{ fontVariant: ['tabular-nums'] }}>
          {value}
        </Text>
      )}
      {menu}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
  },
  me: { backgroundColor: Colors.primarySoft, borderWidth: 1, borderColor: Colors.primary },
  rank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceRaised,
  },
});
