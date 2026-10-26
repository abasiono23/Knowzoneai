import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import i18n from '@/i18n';
import { errorText } from '@/i18n/errors';
import { api, type Connections } from '@/lib/api';
import { auth } from '@/lib/auth';

/** Screen 188: connected accounts: email, Google and Apple sign-in. */
export default function ConnectedAccountsScreen() {
  const { t } = useTranslation('settings');
  const [c, setC] = useState<Connections | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    api
      .getConnections()
      .then(({ connections }) => setC(connections))
      .catch((e) => setError(errorText(e, i18n.t('settings:connected.loadError'))));
  }, []);

  const toggle = async (provider: 'google' | 'apple', linked: boolean) => {
    setBusy(provider);
    setError(null);
    try {
      const { connections } = await auth.setConnection(provider, linked ? 'unlink' : 'link');
      setC(connections);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(null);
    }
  };

  const methods = c ? Number(c.email.hasPassword) + Number(!!c.google) + Number(!!c.apple) : 0;

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} title={t('connected.title')} />
      <Text color={Colors.textSecondary}>{t('connected.intro')}</Text>
      {!c ? (
        <Text variant="small" color={error ? Colors.danger : Colors.textMuted}>
          {error ?? t('status.loading', { ns: 'common' })}
        </Text>
      ) : (
        <>
          <Card style={styles.row}>
            <View style={[styles.logo, { backgroundColor: Colors.primarySoft }]}>
              <Ionicons name="mail" size={22} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">{t('connected.emailPassword')}</Text>
              <Text variant="small" color={Colors.textSecondary} numberOfLines={1}>
                {c.email.address}
              </Text>
              <View style={styles.tags}>
                <Tag
                  ok={c.email.verified}
                  text={c.email.verified ? t('connected.verified') : t('connected.notVerified')}
                />
                <Tag
                  ok={c.email.hasPassword}
                  text={c.email.hasPassword ? t('connected.passwordSet') : t('connected.noPassword')}
                />
              </View>
            </View>
            <Button
              variant="secondary"
              title={c.email.hasPassword ? t('connected.change') : t('connected.add')}
              style={{ minWidth: 90 }}
              onPress={() => router.push('/settings/password')}
            />
          </Card>
          {(
            [
              { id: 'google', name: 'Google', icon: 'logo-google', color: '#EA4335', linked: c.google },
              { id: 'apple', name: 'Apple', icon: 'logo-apple', color: '#FFFFFF', linked: c.apple },
            ] as const
          ).map((p) => (
            <Card key={p.id} style={styles.row}>
              <View style={[styles.logo, { backgroundColor: p.color + '22' }]}>
                <Ionicons name={p.icon} size={22} color={p.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong">{p.name}</Text>
                <Text variant="small" color={p.linked ? Colors.success : Colors.textMuted} numberOfLines={1}>
                  {p.linked ? t('connected.connectedAs', { email: p.linked.email }) : t('connected.notConnected')}
                </Text>
              </View>
              <Button
                variant={p.linked ? 'ghost' : 'secondary'}
                title={p.linked ? t('connected.disconnect') : t('connected.connect')}
                loading={busy === p.id}
                disabled={!!p.linked && methods <= 1}
                style={{ minWidth: 110 }}
                onPress={() => toggle(p.id, !!p.linked)}
              />
            </Card>
          ))}
          {error && (
            <Text variant="small" color={Colors.danger}>
              {error}
            </Text>
          )}
          {methods <= 1 && (
            <Card style={styles.note}>
              <Ionicons name="information-circle" size={18} color={Colors.reward} />
              <Text variant="small" style={{ flex: 1 }}>
                {t('connected.onlyMethod')}
              </Text>
            </Card>
          )}
          <Text variant="small" color={Colors.textMuted}>
            {t('connected.emailNote')}
          </Text>
        </>
      )}
    </Screen>
  );
}

function Tag({ ok, text }: { ok: boolean; text: string }) {
  return (
    <View style={styles.tag}>
      <Ionicons name={ok ? 'checkmark-circle' : 'alert-circle'} size={12} color={ok ? Colors.success : Colors.reward} />
      <Text variant="small" color={ok ? Colors.success : Colors.reward} style={{ fontSize: 11 }}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  logo: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tags: { flexDirection: 'row', gap: Spacing.sm, marginTop: 4 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  note: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', borderColor: Colors.reward + '55' },
});
