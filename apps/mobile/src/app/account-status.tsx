import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { ResultHero } from '@/components/billing/billing-ui';
import { TextArea } from '@/components/help/help-ui';
import { SettingsLink, SettingsSection } from '@/components/settings/rows';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Gradients, Spacing } from '@/constants/theme';
import { formatDate } from '@/i18n';
import { errorText } from '@/i18n/errors';
import { api } from '@/lib/api';
import { isKnownLimit } from '@/lib/safety/store';
import { useSession } from '@/lib/session';

const fmt = (at: number) => formatDate(at, { day: 'numeric', month: 'long', year: 'numeric' });

/** Screen 232: account restricted or suspended. Why, for how long, what still works, and how to appeal. */
export default function AccountStatusScreen() {
  const { user, setUser, signOut } = useSession();
  const { t } = useTranslation('help');
  const [appealing, setAppealing] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!user) return null;
  const r = user.restriction;
  const suspended = r?.kind === 'suspended';
  const home = user.role === 'teacher' ? '/dashboard' : '/home';

  const appeal = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await api.appealRestriction(message.trim());
      setUser(res.user);
      setAppealing(false);
    } catch (e) {
      setError(errorText(e, t('accountStatus.appealError')));
    } finally {
      setBusy(false);
    }
  };
  const logOut = async () => {
    await signOut();
    router.replace('/');
  };

  if (!r)
    return (
      <Screen withTabBar={false}>
        <ScreenHeader eyebrow={t('accountStatus.eyebrow')} title={t('accountStatus.title')} />
        <ResultHero
          icon="shield-checkmark"
          colors={Gradients.mastery}
          title={t('accountStatus.goodTitle')}
          body={t('accountStatus.goodBody')}
        />
        <Button title={t('accountStatus.backToLearning')} onPress={() => router.replace(home)} />
      </Screen>
    );

  return (
    <Screen withTabBar={false}>
      {!suspended && <ScreenHeader eyebrow={t('accountStatus.eyebrow')} title={t('accountStatus.title')} />}
      <ResultHero
        icon={suspended ? 'lock-closed' : 'alert'}
        colors={suspended ? Gradients.streak : Gradients.reward}
        title={suspended ? t('accountStatus.suspendedTitle') : t('accountStatus.limitedTitle')}
        body={
          r.until
            ? t(suspended ? 'accountStatus.suspendedUntil' : 'accountStatus.limitedUntil', { date: fmt(r.until) })
            : suspended
              ? t('accountStatus.suspendedReview')
              : t('accountStatus.limitedReview')
        }
      />

      <Card style={{ gap: Spacing.xs }}>
        <Text variant="label" color={Colors.textMuted}>
          {t('accountStatus.why')}
        </Text>
        <Text variant="body">{r.reason}</Text>
        <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
          {t('accountStatus.decision', { date: fmt(r.at) })}
        </Text>
        <Text variant="small" color={Colors.primary} onPress={() => router.push('/legal/guidelines')}>
          {t('ui.readGuidelines')}
        </Text>
      </Card>

      {!suspended && !!r.limits?.length && (
        <Card style={{ gap: Spacing.xs }}>
          <Text variant="label" color={Colors.textMuted}>
            {t('accountStatus.cantWhileLimited')}
          </Text>
          {r.limits.map((l) => (
            <View key={l} style={styles.line}>
              <Ionicons name="remove-circle" size={18} color={Colors.reward} />
              <Text variant="small" style={{ flex: 1 }}>
                {isKnownLimit(l) ? t(`accountStatus.limits.${l}`) : l}
              </Text>
            </View>
          ))}
          <View style={styles.line}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text variant="small" color={Colors.textSecondary} style={{ flex: 1 }}>
              {t('accountStatus.stillWorks')}
            </Text>
          </View>
        </Card>
      )}

      {suspended && (
        <Card style={{ gap: Spacing.xs }}>
          <Text variant="label" color={Colors.textMuted}>
            {t('accountStatus.canStillDo')}
          </Text>
          {(t('accountStatus.canDo', { returnObjects: true }) as string[]).map((line) => (
            <View key={line} style={styles.line}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
              <Text variant="small" style={{ flex: 1 }}>
                {line}
              </Text>
            </View>
          ))}
        </Card>
      )}

      {r.appeal ? (
        <Card
          style={[styles.line, { borderColor: (r.appeal.status === 'pending' ? Colors.info : Colors.danger) + '66' }]}>
          <Ionicons
            name={r.appeal.status === 'pending' ? 'hourglass' : 'close-circle'}
            size={22}
            color={r.appeal.status === 'pending' ? Colors.info : Colors.danger}
          />
          <View style={{ flex: 1 }}>
            <Text variant="bodyStrong">
              {r.appeal.status === 'pending' ? t('accountStatus.appealPending') : t('accountStatus.appealRejected')}
            </Text>
            <Text variant="small" color={Colors.textSecondary}>
              {r.appeal.status === 'pending'
                ? t('accountStatus.appealPendingBody', { date: fmt(r.appeal.at) })
                : t('accountStatus.appealRejectedBody')}
            </Text>
            <Text
              variant="small"
              color={Colors.primary}
              onPress={() => router.push({ pathname: '/help/ticket/[id]', params: { id: r.appeal!.ticketId } })}>
              {t('accountStatus.viewAppeal', { id: r.appeal.ticketId })}
            </Text>
          </View>
        </Card>
      ) : appealing ? (
        <Card style={{ gap: Spacing.sm }}>
          <Text variant="heading">{t('accountStatus.appealTitle')}</Text>
          <Text variant="small" color={Colors.textSecondary}>
            {t('accountStatus.appealIntro')}
          </Text>
          <TextArea
            label={t('accountStatus.appealLabel')}
            value={message}
            onChangeText={setMessage}
            minHeight={120}
            max={1500}
          />
          {error && (
            <Text variant="small" color={Colors.danger}>
              {error}
            </Text>
          )}
          <Button
            title={t('accountStatus.sendAppeal')}
            icon="send"
            loading={busy}
            disabled={message.trim().length < 20}
            onPress={appeal}
          />
          <Button variant="ghost" title={t('actions.cancel', { ns: 'common' })} onPress={() => setAppealing(false)} />
        </Card>
      ) : (
        <Button title={t('accountStatus.appealTitle')} icon="megaphone" onPress={() => setAppealing(true)} />
      )}

      {!suspended && (
        <Button variant="secondary" title={t('accountStatus.continue')} onPress={() => router.replace(home)} />
      )}

      <SettingsSection>
        <SettingsLink
          icon="chatbubbles-outline"
          label={t('ui.contactSupport')}
          onPress={() => router.push('/help/contact')}
        />
        <SettingsLink
          icon="help-circle-outline"
          label={t('accountStatus.helpCentre')}
          onPress={() => router.push('/help')}
          last={!suspended}
        />
        {suspended && (
          <SettingsLink
            icon="download-outline"
            label={t('accountStatus.downloadData')}
            onPress={() => router.push('/settings/data')}
          />
        )}
        {suspended && (
          <SettingsLink
            icon="log-out-outline"
            label={t('accountStatus.logOut')}
            onPress={logOut}
            color={Colors.textSecondary}
            last
          />
        )}
      </SettingsSection>
    </Screen>
  );
}

const styles = StyleSheet.create({
  line: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});
