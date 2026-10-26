import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet, Switch, View } from 'react-native';

import { Field, TextArea } from '@/components/help/help-ui';
import { Button, Card, Chip, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { api, uploadForm } from '@/lib/api';
import { USE_MOCKS } from '@/lib/config';
import { deviceInfo } from '@/lib/help/device';

// `value` is what the support team receives, so it stays in English; labels are translated (bug.areas / bug.frequency).
const AREAS = [
  { id: 'signIn', value: 'Sign-in' },
  { id: 'home', value: 'Home' },
  { id: 'tutor', value: 'AI tutor' },
  { id: 'packs', value: 'Study packs' },
  { id: 'videos', value: 'Videos' },
  { id: 'courses', value: 'Courses' },
  { id: 'world', value: 'Knowzone World' },
  { id: 'payments', value: 'Payments' },
  { id: 'other', value: 'Other' },
] as const;
const FREQUENCY = [
  { id: 'always', value: 'Every time' },
  { id: 'sometimes', value: 'Sometimes' },
  { id: 'once', value: 'Only once' },
] as const;

/** Uploads a screenshot (stored on the server) and returns its link for the ticket. */
async function uploadScreenshot(uri: string) {
  const form = new FormData();
  const name = 'screenshot.jpg';
  // A Blob on the web; a { uri, name, type } descriptor on phones.
  const part =
    Platform.OS === 'web' ? await (await fetch(uri)).blob() : ({ uri, name, type: 'image/jpeg' } as unknown as Blob);
  form.append('file', part, name);
  return (await uploadForm<{ url: string }>('/me/help/attachments', form, () => {})).url;
}

/** Screen 224: report a bug, with steps, device details and an optional screenshot. */
export default function BugReportScreen() {
  const { t } = useTranslation('help');
  const [title, setTitle] = useState('');
  const [area, setArea] = useState<string | null>(null);
  const [steps, setSteps] = useState('');
  const [expected, setExpected] = useState('');
  const [frequency, setFrequency] = useState<string>(FREQUENCY[0].value);
  const [shot, setShot] = useState<string | null>(null);
  const [includeDevice, setIncludeDevice] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [device] = useState(deviceInfo);

  const pick = async () => {
    try {
      const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
      if (!r.canceled && r.assets[0]) setShot(r.assets[0].uri);
    } catch {
      setError(t('bug.photosError'));
    }
  };

  const send = async () => {
    setBusy(true);
    setError(null);
    try {
      const screenshot = shot && !USE_MOCKS && !/^https?:/.test(shot) ? await uploadScreenshot(shot) : shot;
      const { ticket } = await api.createTicket({
        kind: 'bug',
        topic: 'technical',
        subject: title.trim(),
        message: `What happened:\n${steps.trim()}${expected.trim() ? `\n\nExpected:\n${expected.trim()}` : ''}`,
        meta: {
          area: area ?? 'Other',
          frequency,
          ...(includeDevice ? device : {}),
          ...(screenshot ? { screenshot } : {}),
        },
      });
      router.replace({ pathname: '/help/ticket/[id]', params: { id: ticket.id, created: '1' } });
    } catch (e) {
      setError(errorText(e, t('bug.sendError')));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('ui.eyebrow')} title={t('bug.title')} />
      <Text variant="body" color={Colors.textSecondary}>
        {t('bug.intro')}
      </Text>
      <Field
        label={t('bug.whatLabel')}
        value={title}
        onChangeText={setTitle}
        placeholder={t('bug.whatPlaceholder')}
        maxLength={80}
      />

      <View style={{ gap: Spacing.xs }}>
        <Text variant="bodyStrong" style={{ fontSize: 14 }}>
          {t('bug.whereQuestion')}
        </Text>
        <View style={styles.chips}>
          {AREAS.map((a) => (
            <Chip
              key={a.id}
              label={t(`bug.areas.${a.id}`)}
              selected={area === a.value}
              onPress={() => setArea(a.value)}
            />
          ))}
        </View>
      </View>

      <TextArea
        label={t('bug.stepsLabel')}
        value={steps}
        onChangeText={setSteps}
        placeholder={t('bug.stepsPlaceholder')}
        minHeight={120}
      />
      <TextArea
        label={t('bug.expectedLabel')}
        value={expected}
        onChangeText={setExpected}
        placeholder={t('bug.expectedPlaceholder')}
        minHeight={70}
        max={400}
      />

      <View style={{ gap: Spacing.xs }}>
        <Text variant="bodyStrong" style={{ fontSize: 14 }}>
          {t('bug.frequencyQuestion')}
        </Text>
        <View style={styles.chips}>
          {FREQUENCY.map((f) => (
            <Chip
              key={f.id}
              label={t(`bug.frequency.${f.id}`)}
              selected={frequency === f.value}
              onPress={() => setFrequency(f.value)}
            />
          ))}
        </View>
      </View>

      {shot ? (
        <View style={styles.shotWrap}>
          <Image source={{ uri: shot }} style={styles.shot} contentFit="cover" />
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="bodyStrong">{t('bug.screenshotAdded')}</Text>
            <Text variant="small" color={Colors.danger} onPress={() => setShot(null)}>
              {t('actions.remove', { ns: 'common' })}
            </Text>
          </View>
        </View>
      ) : (
        <Pressable onPress={pick} accessibilityRole="button" accessibilityLabel={t('bug.addScreenshot')}>
          <Card style={styles.add}>
            <Ionicons name="image-outline" size={22} color={Colors.primary} />
            <Text variant="bodyStrong" style={{ flex: 1 }}>
              {t('bug.addScreenshotOptional')}
            </Text>
            <Ionicons name="add" size={20} color={Colors.textMuted} />
          </Card>
        </Pressable>
      )}

      <Card style={{ gap: Spacing.xs }}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text variant="bodyStrong" style={{ fontSize: 14 }}>
              {t('ui.includeDevice')}
            </Text>
            <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
              {Object.values(device).join(' · ')}
            </Text>
          </View>
          <Switch
            value={includeDevice}
            onValueChange={setIncludeDevice}
            accessibilityLabel={t('ui.includeDevice')}
            trackColor={{ true: Colors.primary, false: Colors.surfaceRaised }}
          />
        </View>
      </Card>
      {error && (
        <Text variant="small" color={Colors.danger}>
          {error}
        </Text>
      )}
      <Button
        title={t('bug.send')}
        icon="bug"
        loading={busy}
        disabled={title.trim().length < 3 || steps.trim().length < 10}
        onPress={send}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  add: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderStyle: 'dashed' },
  shotWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  shot: { width: 64, height: 110, borderRadius: Radius.sm, backgroundColor: Colors.surface },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});
