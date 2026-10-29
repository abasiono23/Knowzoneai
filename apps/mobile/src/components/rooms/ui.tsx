import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/world/avatar';
import { Card, Text } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import type { RoomMember, RoomSummary } from '@/lib/rooms';
import type { AvatarConfig } from '@/lib/world/types';

/** A member's face: their World avatar, or their initial. */
export function MemberFace({ m, size = 40 }: { m: Pick<RoomMember, 'avatar' | 'name' | 'online'>; size?: number }) {
  return (
    <View style={{ width: size, height: size }}>
      {m.avatar ? (
        <Avatar config={m.avatar as unknown as AvatarConfig} size={size} />
      ) : (
        <View style={[styles.initial, { width: size, height: size, borderRadius: size / 2 }]}>
          <Text style={{ fontFamily: Fonts.bold, fontSize: size * 0.4 }} color={Colors.primary}>
            {(m.name ?? '?').charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      {m.online && <View style={[styles.dot, { width: size * 0.3, height: size * 0.3, borderRadius: size * 0.15 }]} />}
    </View>
  );
}

/** A room in a list. */
export function RoomRow({ room, onPress }: { room: RoomSummary; onPress: () => void }) {
  const { t } = useTranslation('rooms');
  const live = room.phase === 'focus' ? t('focusing') : room.phase === 'break' ? t('onBreak') : null;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
      <Card style={styles.row}>
        <View style={styles.icon}>
          <Ionicons name={room.visibility === 'school' ? 'school' : 'people'} size={22} color={Colors.primary} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text variant="bodyStrong" numberOfLines={1} style={{ flexShrink: 1 }}>
              {room.name}
            </Text>
            {room.host && (
              <View style={styles.badge}>
                <Text style={{ fontFamily: Fonts.extrabold, fontSize: 9 }} color={Colors.onBright}>
                  {t('hostBadge')}
                </Text>
              </View>
            )}
          </View>
          <Text variant="small" color={Colors.textSecondary}>
            {[room.subject, t('members', { count: room.members })].filter(Boolean).join(' · ')}
          </Text>
          {live && (
            <Text variant="small" color={room.phase === 'focus' ? Colors.success : Colors.reward}>
              ● {live}
            </Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  initial: { alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primarySoft },
  dot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: '#fff',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  icon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primarySoft,
  },
  badge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: Radius.pill, backgroundColor: Colors.reward },
});
