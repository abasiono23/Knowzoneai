import { Ionicons } from '@expo/vector-icons';
import type { TFunction } from 'i18next';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeOut, Layout } from 'react-native-reanimated';

import { ConfirmDialog } from '@/components/world/overlays';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import i18n from '@/i18n';
import { errorText } from '@/i18n/errors';
import { api, type DeviceSession } from '@/lib/api';

const ICON = { ios: 'phone-portrait', android: 'phone-portrait-outline', web: 'desktop-outline' } as const;

function ago(t: TFunction<'settings'>, at: number, now: number) {
  const m = Math.round((now - at) / 60000);
  if (m < 2) return t('devices.activeNow');
  if (m < 60) return t('time.minutesAgo', { ns: 'common', count: m });
  const h = Math.round(m / 60);
  if (h < 24) return t('time.hoursAgo', { ns: 'common', count: h });
  return t('time.daysAgo', { ns: 'common', count: Math.round(h / 24) });
}

/** Screen 189: devices and sessions signed in to this account. */
export default function DevicesScreen() {
  const { t } = useTranslation('settings');
  const [sessions, setSessions] = useState<DeviceSession[] | null>(null);
  const [confirm, setConfirm] = useState<DeviceSession | 'others' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now] = useState(() => Date.now());
  useEffect(() => {
    api
      .getSessions()
      .then(({ sessions: s }) => setSessions(s))
      .catch((e) => setError(errorText(e, i18n.t('settings:devices.loadError'))));
  }, []);

  const revoke = async (id: string | 'others') => {
    setConfirm(null);
    try {
      const { sessions: s } = await api.revokeSession(id);
      setSessions(s);
    } catch (e) {
      setError(errorText(e, t('devices.revokeError')));
    }
  };
  const others = sessions?.filter((s) => !s.current) ?? [];

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} title={t('devices.title')} />
      <Text color={Colors.textSecondary}>{t('devices.intro')}</Text>
      {error && (
        <Text variant="small" color={Colors.danger}>
          {error}
        </Text>
      )}
      {!sessions ? (
        <Text variant="small" color={Colors.textMuted}>
          {t('status.loading', { ns: 'common' })}
        </Text>
      ) : (
        sessions.map((s) => (
          <Animated.View key={s.id} exiting={FadeOut} layout={Layout}>
            <Card style={[styles.row, s.current && { borderColor: Colors.success + '66' }]}>
              <View style={styles.icon}>
                <Ionicons name={ICON[s.platform]} size={22} color={s.current ? Colors.success : Colors.textSecondary} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="bodyStrong">{s.device}</Text>
                <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
                  {t('devices.meta', {
                    location: s.location,
                    status: s.current ? t('devices.thisDevice') : ago(t, s.lastActive, now),
                  })}
                </Text>
              </View>
              {s.current ? (
                <Text variant="label" color={Colors.success} style={{ fontSize: 10 }}>
                  {t('devices.current')}
                </Text>
              ) : (
                <Button
                  variant="ghost"
                  title={t('devices.signOut')}
                  style={{ minWidth: 92 }}
                  onPress={() => setConfirm(s)}
                />
              )}
            </Card>
          </Animated.View>
        ))
      )}
      {others.length > 0 && (
        <Button
          variant="secondary"
          icon="log-out-outline"
          title={t('devices.signOutOthers')}
          onPress={() => setConfirm('others')}
        />
      )}
      <ConfirmDialog
        visible={!!confirm}
        icon="log-out-outline"
        destructive
        title={
          confirm === 'others'
            ? t('devices.confirmOthers')
            : confirm
              ? t('devices.confirmOne', { device: confirm.device })
              : t('devices.confirmThis')
        }
        body={t('devices.confirmBody')}
        confirmLabel={t('devices.signOut')}
        cancelLabel={t('actions.cancel', { ns: 'common' })}
        onConfirm={() => confirm && revoke(confirm === 'others' ? 'others' : confirm.id)}
        onCancel={() => setConfirm(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
