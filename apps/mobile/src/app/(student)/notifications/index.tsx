import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/content/empty-state';
import { ChoiceChip, ChipWrap } from '@/components/personalize/choice-chip';
import { Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useLibrary } from '@/lib/library-store';
import { minutesSince, notificationText, timeAgo, TYPE_META } from '@/lib/notifications';

/** Screen 44: notifications inbox, grouped by day with unread filter. */
export default function NotificationsScreen() {
  const { notifications, markAllRead, refreshNotifications } = useLibrary();
  const { t } = useTranslation('home');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [now] = useState(() => Date.now());
  useFocusEffect(
    useCallback(() => {
      refreshNotifications();
    }, [refreshNotifications]),
  );
  const unread = notifications.filter((n) => !n.read);
  const list = unreadOnly ? unread : notifications;
  const recent = (at: number) => minutesSince(at, now) < 24 * 60;
  const groups = [
    { id: 'today', label: t('time.today', { ns: 'common' }), items: list.filter((n) => recent(n.createdAt)) },
    { id: 'earlier', label: t('notifications.earlier'), items: list.filter((n) => !recent(n.createdAt)) },
  ].filter((g) => g.items.length);

  return (
    <Screen withTabBar={false}>
      <ScreenHeader
        eyebrow={unread.length ? t('notifications.unread', { count: unread.length }) : t('notifications.allCaughtUp')}
        title={t('notifications.title')}
        right={
          unread.length > 0 ? (
            <Pressable
              onPress={markAllRead}
              hitSlop={10}
              accessibilityRole="button">
              <Text variant="small" color={Colors.primary}>
                {t('notifications.markAllRead')}
              </Text>
            </Pressable>
          ) : undefined
        }
      />
      <ChipWrap>
        <ChoiceChip label={t('notifications.all')} selected={!unreadOnly} onPress={() => setUnreadOnly(false)} />
        <ChoiceChip
          label={t('notifications.unreadChip', { count: unread.length })}
          selected={unreadOnly}
          onPress={() => setUnreadOnly(true)}
        />
      </ChipWrap>

      {groups.length === 0 ? (
        <EmptyState icon="notifications" title={t('notifications.emptyTitle')} body={t('notifications.emptyBody')} />
      ) : (
        groups.map((g) => (
          <View key={g.id} style={{ gap: Spacing.xs }}>
            <Text variant="label" color={Colors.textMuted}>
              {g.label.toUpperCase()}
            </Text>
            {g.items.map((n) => {
              const meta = TYPE_META[n.type];
              const read = n.read;
              const text = notificationText(n, t);
              return (
                <Pressable
                  key={n.id}
                  onPress={() => router.push(`/notifications/${n.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={read ? text.title : t('notifications.unreadLabel', { title: text.title })}
                  style={({ pressed }) => [styles.item, !read && styles.unread, pressed && { opacity: 0.8 }]}>
                  <View style={[styles.icon, { backgroundColor: meta.color + '22' }]}>
                    <Ionicons name={meta.icon} size={20} color={meta.color} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={styles.rowBetween}>
                      <Text variant="label" color={meta.color} style={{ fontSize: 10 }}>
                        {t(`notifications.types.${n.type}`).toUpperCase()}
                      </Text>
                      <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
                        {timeAgo(minutesSince(n.createdAt, now), t)}
                      </Text>
                    </View>
                    <Text variant="bodyStrong" style={{ fontSize: 15, lineHeight: 20 }}>
                      {text.title}
                    </Text>
                    <Text variant="small" color={Colors.textSecondary} numberOfLines={2}>
                      {text.body}
                    </Text>
                  </View>
                  {!read && <View style={styles.dot} />}
                </Pressable>
              );
            })}
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  unread: { backgroundColor: Colors.surfaceRaised, borderColor: Colors.borderStrong },
  icon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary, marginTop: 4 },
});
