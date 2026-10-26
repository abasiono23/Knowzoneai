import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Checkbox } from '@/components/auth/checkbox';
import { ResultHero } from '@/components/billing/billing-ui';
import { DraftBanner, Field, TextArea } from '@/components/help/help-ui';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Gradients, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { api } from '@/lib/api';
import { goBack } from '@/lib/navigation';
import { useSession } from '@/lib/session';

/** Screen 230: copyright and content reporting. Open to rights holders whether or not they have an account. */
export default function CopyrightScreen() {
  const { user } = useSession();
  const { t } = useTranslation('help');
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [organisation, setOrganisation] = useState('');
  const [work, setWork] = useState('');
  const [location, setLocation] = useState('');
  const [statement, setStatement] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const valid =
    name.trim().length > 1 &&
    /\S+@\S+\.\S+/.test(email) &&
    work.trim().length >= 10 &&
    location.trim().length >= 3 &&
    statement;

  const send = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await api.copyrightNotice({
        name: name.trim(),
        email: email.trim(),
        organisation: organisation.trim(),
        work: work.trim(),
        location: location.trim(),
        statement: String(statement),
      });
      setReference(r.reference);
    } catch (e) {
      setError(errorText(e, t('copyright.sendError')));
    } finally {
      setBusy(false);
    }
  };

  if (reference)
    return (
      <Screen withTabBar={false}>
        <ResultHero
          icon="document-text"
          colors={Gradients.ai}
          title={t('copyright.receivedTitle')}
          body={t('copyright.receivedBody', { reference, email: email.trim() })}
        />
        <Button title={t('actions.done', { ns: 'common' })} onPress={() => goBack('/')} />
      </Screen>
    );

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('copyright.eyebrow')} title={t('copyright.title')} />
      <DraftBanner />
      <Text variant="body" color={Colors.textSecondary}>
        {t('copyright.intro')}
      </Text>
      <Card style={{ gap: Spacing.sm }}>
        <Text variant="heading">{t('copyright.howItWorks')}</Text>
        {(t('copyright.steps', { returnObjects: true }) as string[]).map((s, i) => (
          <View key={s} style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' }}>
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: Colors.primarySoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text variant="label" color={Colors.primary} style={{ fontSize: 11 }}>
                {i + 1}
              </Text>
            </View>
            <Text variant="small" color={Colors.textSecondary} style={{ flex: 1 }}>
              {s}
            </Text>
          </View>
        ))}
      </Card>
      <Card style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' }}>
        <Ionicons name="information-circle" size={20} color={Colors.info} />
        <Text variant="small" style={{ flex: 1 }}>
          {t('copyright.privateNote')}
        </Text>
      </Card>

      <Text variant="heading">{t('copyright.sendTitle')}</Text>
      <Field label={t('copyright.name')} value={name} onChangeText={setName} autoComplete="name" />
      <Field
        label={t('copyright.email')}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <Field
        label={t('copyright.organisation')}
        value={organisation}
        onChangeText={setOrganisation}
        placeholder={t('copyright.organisationPlaceholder')}
      />
      <TextArea
        label={t('copyright.work')}
        value={work}
        onChangeText={setWork}
        placeholder={t('copyright.workPlaceholder')}
        minHeight={90}
        max={1000}
      />
      <TextArea
        label={t('copyright.location')}
        value={location}
        onChangeText={setLocation}
        placeholder={t('copyright.locationPlaceholder')}
        minHeight={70}
        max={500}
      />
      <Checkbox label={t('copyright.statementLabel')} checked={statement} onChange={setStatement}>
        <Text variant="small">{t('copyright.statement')}</Text>
      </Checkbox>
      {error && (
        <Text variant="small" color={Colors.danger}>
          {error}
        </Text>
      )}
      <Button title={t('copyright.send')} icon="send" loading={busy} disabled={!valid} onPress={send} />
      <Text variant="small" color={Colors.textMuted} center style={{ fontSize: 12 }}>
        {t('copyright.footer')}
      </Text>
    </Screen>
  );
}
