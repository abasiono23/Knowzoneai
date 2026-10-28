import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from '@/components/ui/gradient';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/content/empty-state';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useLibrary } from '@/lib/library-store';
import { minutesSince, notificationText, timeAgo, TYPE_META } from '@/lib/notifications';

/** Screen 45: one notification, with its full message and next step. */
export default function NotificationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notifications, markRead } = useLibrary();
  const { t } = useTranslation('home');
  const n = notifications.find((x) => x.id === id);

  useEffect(() => {
    if (n && !n.read) markRead(n.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n?.id]);

  if (!n) {
    return (
      <Screen withTabBar={false}>
        <ScreenHeader />
        <EmptyState
          icon="notifications-off"
          title={t('notifications.notFoundTitle')}
          body={t('notifications.notFoundBody')}
        />
      </Screen>
    );
  }

  const meta = TYPE_META[n.type];
  const text = notificationText(n, t);

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t(`notifications.types.${n.type}`).toUpperCase()} eyebrowColor={meta.color} />
      <LinearGradient
        colors={[meta.color + '55', meta.color + '11']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}>
        <View style={[styles.icon, { backgroundColor: meta.color }]}>
          <Ionicons name={meta.icon} size={32} color={Colors.onBright} />
        </View>
        <Text variant="title" center>
          {text.title}
        </Text>
        <Text variant="small" color={Colors.textSecondary}>
          {timeAgo(minutesSince(n.createdAt), t)}
        </Text>
      </LinearGradient>
      <Card>
        <Text style={{ lineHeight: 26 }}>{text.detail}</Text>
      </Card>
      {n.href && <Button title={text.cta} icon="arrow-forward" onPress={() => router.push(n.href as Href)} />}
      <Button variant="ghost" title={t('notifications.back')} onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: Spacing.sm, padding: Spacing.lg, borderRadius: Radius.xl },
  icon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
});
