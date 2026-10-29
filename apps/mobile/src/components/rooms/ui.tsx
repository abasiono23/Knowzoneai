import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/world/avatar';
import { Card, Text } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { when, type RoomMember, type RoomSummary } from '@/lib/rooms';
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
          {(room.streak > 0 || room.next) && (
            <Text variant="small" color={Colors.textSecondary}>
              {[
                room.streak > 0 && `🔥 ${t('streak', { count: room.streak })}`,
                room.next && `📅 ${when(room.next, { today: t('today'), tomorrow: t('tomorrow') })}`,
              ]
                .filter(Boolean)
                .join('  ·  ')}
            </Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
      </Card>
    </Pressable>
  );
}

/** A bottom sheet with a title and a close button. */
export function Sheet({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityRole="button" accessibilityLabel={title} />
        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          <View style={styles.sheetHead}>
            <Text variant="heading" style={{ flex: 1 }}>
              {title}
            </Text>
            <Pressable onPress={onClose} accessibilityRole="button" hitSlop={10}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </Pressable>
          </View>
          {children}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

/** A choice chip (exam, subject, day, time…). */
export function Chip({
  label,
  on,
  disabled,
  onPress,
}: {
  label: string;
  on: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ checked: on, disabled }}
      style={[styles.chip, on && styles.chipOn, disabled && { opacity: 0.35 }]}>
      <Text variant="small" style={{ fontFamily: Fonts.semibold }} color={on ? Colors.primary : Colors.text}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    gap: Spacing.sm,
    padding: Spacing.md,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    backgroundColor: Colors.surface,
  },
  sheetHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipOn: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
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
