import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TextInput, View } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { HeroIcon } from '@/components/auth/hero-icon';
import { TextField } from '@/components/auth/text-field';
import { ChoiceChip, ChipWrap } from '@/components/personalize/choice-chip';
import { Button, Card, Text } from '@/components/ui';
import { Colors, Fonts, NoWebOutline, Radius, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { goBack } from '@/lib/navigation';
import { auth } from '@/lib/auth';
import { useSession } from '@/lib/session';

/** `value` is what the server receives (kept in English); the label is translated: delete.reasons.<id>. */
const REASONS = [
  { id: 'notUsing', value: 'I don’t use it anymore' },
  { id: 'otherAccount', value: 'I have another account' },
  { id: 'privacy', value: 'Privacy concerns' },
  { id: 'notHelping', value: 'It’s not helping me learn' },
  { id: 'tooManyNotifications', value: 'Too many notifications' },
  { id: 'other', value: 'Something else' },
] as const;
/** Translated at render: delete.lose.<key>. */
const LOSE = ['profile', 'study', 'courses', 'world', 'classes'] as const;

/** Screen 196: delete account, with a 14-day grace period. */
export default function DeleteAccountScreen() {
  const { user, signOut } = useSession();
  const { t } = useTranslation('settings');
  const [step, setStep] = useState<1 | 2>(1);
  const [reason, setReason] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!user) return null;
  const needsPassword = user.authProvider === 'email';
  const ready =
    confirmText.trim().toUpperCase() === t('delete.confirmWord').toUpperCase() && (!needsPassword || !!password);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await auth.deleteAccount({ password: needsPassword ? password : undefined, reason: reason ?? 'not given' });
      await signOut();
      router.replace('/');
    } catch (e) {
      setError(errorText(e, t('delete.error')));
      setBusy(false);
    }
  };

  if (step === 1)
    return (
      <AuthScreen
        hero={<HeroIcon icon="trash" colors={[Colors.danger, '#FF9F43']} />}
        title={t('delete.title')}
        subtitle={t('delete.subtitle')}
        footer={
          <>
            <Button variant="danger" title={t('actions.continue', { ns: 'common' })} onPress={() => setStep(2)} />
            <Button variant="ghost" title={t('delete.keep')} onPress={() => goBack()} />
          </>
        }>
        <Card style={{ gap: Spacing.sm }}>
          <Text variant="bodyStrong">{t('delete.youllLose')}</Text>
          {LOSE.map((l) => (
            <View key={l} style={styles.row}>
              <Ionicons name="close-circle" size={16} color={Colors.danger} />
              <Text variant="small" style={{ flex: 1 }}>
                {t(`delete.lose.${l}`)}
              </Text>
            </View>
          ))}
        </Card>
        <Card style={styles.tip}>
          <Ionicons name="download-outline" size={20} color={Colors.success} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="small">{t('delete.keepCopy')}</Text>
            <Button variant="secondary" title={t('home.downloadData')} onPress={() => router.push('/settings/data')} />
          </View>
        </Card>
        <Text variant="bodyStrong">{t('delete.why')}</Text>
        <ChipWrap>
          {REASONS.map((r) => (
            <ChoiceChip
              key={r.id}
              label={t(`delete.reasons.${r.id}`)}
              selected={reason === r.value}
              onPress={() => setReason(reason === r.value ? null : r.value)}
            />
          ))}
        </ChipWrap>
        {reason === REASONS[4].value && (
          <Button
            variant="ghost"
            icon="notifications-off-outline"
            title={t('delete.turnDown')}
            onPress={() => router.replace('/settings/notifications')}
          />
        )}
      </AuthScreen>
    );

  return (
    <AuthScreen
      title={t('delete.confirmTitle')}
      subtitle={t('delete.confirmSubtitle')}
      footer={
        <>
          {error && (
            <Text variant="small" color={Colors.danger} center>
              {error}
            </Text>
          )}
          <Button
            variant="danger"
            title={t('delete.submit')}
            icon="trash"
            loading={busy}
            disabled={!ready}
            onPress={submit}
          />
          <Button
            variant="ghost"
            title={t('actions.cancel', { ns: 'common' })}
            disabled={busy}
            onPress={() => goBack()}
          />
        </>
      }>
      <View style={{ gap: 6 }}>
        <Text variant="small" color={Colors.textSecondary} style={{ fontFamily: Fonts.semibold }}>
          {t('delete.typeToConfirm', { word: t('delete.confirmWord') })}
        </Text>
        <TextInput
          value={confirmText}
          onChangeText={setConfirmText}
          autoCapitalize="characters"
          autoCorrect={false}
          placeholder={t('delete.confirmWord')}
          placeholderTextColor={Colors.textMuted}
          style={styles.confirm}
          accessibilityLabel={t('delete.typeToConfirm', { word: t('delete.confirmWord') })}
        />
      </View>
      {needsPassword && (
        <TextField
          label={t('delete.password')}
          icon="lock-closed-outline"
          password
          value={password}
          onChangeText={setPassword}
          autoComplete="current-password"
        />
      )}
      <Card style={styles.tip}>
        <Ionicons name="time-outline" size={20} color={Colors.reward} />
        <Text variant="small" style={{ flex: 1 }}>
          {t('delete.grace')}
        </Text>
      </Card>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  tip: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  confirm: {
    ...NoWebOutline,
    height: 52,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.danger + '88',
    backgroundColor: Colors.surface,
    color: Colors.text,
    fontFamily: Fonts.bold,
    fontSize: 18,
    letterSpacing: 3,
  },
});
