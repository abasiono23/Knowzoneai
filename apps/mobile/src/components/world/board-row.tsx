import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { FONT, W } from '@/components/games/ui';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import type { AvatarConfig } from '@/lib/world/types';

import { Avatar } from './avatar';

/** Gold, silver and bronze for the top three: a ribbon icon as well as the colour. */
const MEDAL = ['#C99A1E', '#8E96A8', '#A86A35'];

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
      <View style={styles.rank}>
        {rank <= 3 ? (
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="ribbon" size={16} color={MEDAL[rank - 1]} />
            <Text style={[styles.rankText, { fontSize: 11 }]}>{rank}</Text>
          </View>
        ) : (
          <Text style={styles.rankText}>{rank}</Text>
        )}
      </View>
      <Avatar config={avatar} size={40} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.name, me && { color: W.focus }]} numberOfLines={1}>
          {name}
        </Text>
        {sub && (
          <Text style={styles.sub} numberOfLines={1}>
            {sub}
          </Text>
        )}
      </View>
      {action ?? <Text style={styles.value}>{value}</Text>}
      {menu}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 12, minHeight: 60 },
  me: { backgroundColor: W.focusSoft },
  rank: { width: 28, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontFamily: FONT, fontSize: 14, color: W.inkSoft, fontVariant: ['tabular-nums'] },
  name: { fontFamily: Fonts.bold, fontSize: 15, color: W.ink },
  sub: { fontFamily: Fonts.regular, fontSize: 12, color: W.muted },
  value: { fontFamily: Fonts.bold, fontSize: 14, color: W.ink, fontVariant: ['tabular-nums'] },
});
