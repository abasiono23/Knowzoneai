import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Share, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { formatNumber } from '@/i18n';
import { errorText } from '@/i18n/errors';
import { api } from '@/lib/api';
import { useSession } from '@/lib/session';
import { storage } from '@/lib/storage';

/** Data kept on this device (it syncs to the account once the backend exists). Labels are JSON keys in the export file, not UI. */
const LOCAL: { key: string; label: string }[] = [
  { key: 'knowzone.materials', label: 'study packs' },
  { key: 'knowzone.tutor', label: 'tutor chats' },
  { key: 'knowzone.courses', label: 'course progress, notes and certificates' },
  { key: 'knowzone.videos', label: 'videos' },
  { key: 'knowzone.world', label: 'Knowzone World progress' },
  { key: 'knowzone.library', label: 'saved lessons' },
  { key: 'knowzone.rewards', label: 'equipped rewards' },
];

/** Text is translated at render: data.included.<key>. */
const INCLUDED: [keyof typeof Ionicons.glyphMap, 'profile' | 'study' | 'courses' | 'world' | 'wallet' | 'devices'][] = [
  ['person-outline', 'profile'],
  ['layers-outline', 'study'],
  ['school-outline', 'courses'],
  ['planet-outline', 'world'],
  ['wallet-outline', 'wallet'],
  ['phone-portrait-outline', 'devices'],
];

/** Screen 195: download my data. */
export default function DownloadDataScreen() {
  const { user } = useSession();
  const { t } = useTranslation('settings');
  const [busy, setBusy] = useState<'file' | 'email' | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const download = async () => {
    setBusy('file');
    setError(null);
    setDone(null);
    try {
      const { export: server } = await api.exportData();
      const device: Record<string, unknown> = {};
      for (const l of LOCAL) {
        const raw = await storage.get(l.key);
        if (raw) {
          try {
            device[l.label] = JSON.parse(raw);
          } catch {
            device[l.label] = raw;
          }
        }
      }
      const json = JSON.stringify({ ...server, device }, null, 2);
      const name = `knowzone-data-${new Date().toISOString().slice(0, 10)}.json`;
      if (Platform.OS === 'web') {
        const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      } else {
        await Share.share({ title: name, message: json });
      }
      setDone(t('data.ready', { name, size: formatNumber(Math.max(1, Math.round(json.length / 1024))) }));
    } catch (e) {
      setError(errorText(e, t('data.prepareError')));
    } finally {
      setBusy(null);
    }
  };

  const email = async () => {
    setBusy('email');
    setError(null);
    setDone(null);
    try {
      await api.emailDataExport();
      setDone(t('data.emailSent', { email: user?.email ?? '' }));
    } catch (e) {
      setError(errorText(e, t('data.requestError')));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('data.eyebrow')} title={t('data.title')} />
      <Text color={Colors.textSecondary}>{t('data.intro')}</Text>
      <Card style={{ gap: Spacing.sm }}>
        <Text variant="heading">{t('data.whatsIncluded')}</Text>
        {INCLUDED.map(([icon, key]) => (
          <View key={key} style={styles.row}>
            <Ionicons name={icon} size={18} color={Colors.success} />
            <Text variant="small" style={{ flex: 1 }}>
              {t(`data.included.${key}`)}
            </Text>
          </View>
        ))}
        <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
          {t('data.format')}
        </Text>
      </Card>
      {done && (
        <Animated.View entering={FadeIn}>
          <Card style={styles.done}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text variant="small" style={{ flex: 1 }}>
              {done}
            </Text>
          </Card>
        </Animated.View>
      )}
      {error && (
        <Text variant="small" color={Colors.danger}>
          {error}
        </Text>
      )}
      <Button
        title={t('data.download')}
        icon="download"
        loading={busy === 'file'}
        disabled={!!busy}
        onPress={download}
      />
      <Button
        variant="secondary"
        title={t('data.email')}
        icon="mail-outline"
        loading={busy === 'email'}
        disabled={!!busy}
        onPress={email}
      />
      <Text variant="small" color={Colors.textMuted}>
        {t('data.note')}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  done: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', borderColor: Colors.success + '66' },
});
