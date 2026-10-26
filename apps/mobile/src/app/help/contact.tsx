import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { Field, TextArea } from '@/components/help/help-ui';
import { Button, Card, Chip, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { api, type HelpTopic } from '@/lib/api';
import { localizeFaqs, searchFaqs } from '@/lib/help/articles';
import { deviceInfo } from '@/lib/help/device';
import { useSession } from '@/lib/session';

/** Topic ids are sent to the server; labels are translated at render time (contact.topics.<id>). */
const TOPICS: HelpTopic[] = ['account', 'learning', 'ai', 'payments', 'technical', 'safety', 'other'];

/** Screen 221: contact support. Creates a ticket you can follow in the app. */
export default function ContactSupportScreen() {
  const params = useLocalSearchParams<{ subject?: string; topic?: HelpTopic }>();
  const { user } = useSession();
  const { t } = useTranslation('help');
  const [topic, setTopic] = useState<HelpTopic | null>(params.topic ?? null);
  const [subject, setSubject] = useState(params.subject ?? '');
  const [message, setMessage] = useState('');
  const [includeDevice, setIncludeDevice] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [device] = useState(deviceInfo);
  // Only suggest articles whose question shares a word with the subject; answer-only matches are too loose.
  const suggestions =
    subject.trim().length > 3
      ? searchFaqs(subject, localizeFaqs(t))
          .filter((f) =>
            subject
              .toLowerCase()
              .split(/\s+/)
              .some((w) => w.length > 3 && f.q.toLowerCase().includes(w)),
          )
          .slice(0, 2)
      : [];
  const student = user?.role !== 'teacher' && user?.restriction?.kind !== 'suspended';
  const canSend = !!topic && subject.trim().length >= 3 && message.trim().length >= 10;

  const send = async () => {
    if (!topic) return;
    setBusy(true);
    setError(null);
    try {
      const { ticket } = await api.createTicket({
        kind: 'support',
        topic,
        subject: subject.trim(),
        message: message.trim(),
        meta: includeDevice ? device : undefined,
      });
      router.replace({ pathname: '/help/ticket/[id]', params: { id: ticket.id, created: '1' } });
    } catch (e) {
      setError(errorText(e, t('contact.sendError')));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('ui.eyebrow')} title={t('contact.title')} />
      <Text variant="body" color={Colors.textSecondary}>
        {t('contact.intro')}
      </Text>

      <View style={{ gap: Spacing.xs }}>
        <Text variant="bodyStrong" style={{ fontSize: 14 }}>
          {t('contact.topicQuestion')}
        </Text>
        <View style={styles.chips}>
          {TOPICS.map((id) => (
            <Chip key={id} label={t(`contact.topics.${id}`)} selected={topic === id} onPress={() => setTopic(id)} />
          ))}
        </View>
      </View>

      {topic === 'payments' && student && (
        <Pressable onPress={() => router.push('/billing/support')} accessibilityRole="button">
          <Card style={styles.tip}>
            <Ionicons name="card" size={20} color={Colors.reward} />
            <Text variant="small" style={{ flex: 1 }}>
              {t('contact.paymentsTip')}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </Card>
        </Pressable>
      )}
      {topic === 'safety' && user?.restriction?.kind !== 'suspended' && (
        <Pressable onPress={() => router.push('/help/report')} accessibilityRole="button">
          <Card style={[styles.tip, { borderColor: Colors.danger + '55' }]}>
            <Ionicons name="flag" size={20} color={Colors.danger} />
            <Text variant="small" style={{ flex: 1 }}>
              {t('contact.safetyTip')}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </Card>
        </Pressable>
      )}

      <Field
        label={t('contact.subject')}
        value={subject}
        onChangeText={setSubject}
        placeholder={t('contact.subjectPlaceholder')}
        maxLength={80}
      />

      {suggestions.length > 0 && (
        <Card style={{ gap: Spacing.xs }}>
          <Text variant="label" color={Colors.textMuted}>
            {t('contact.suggestions')}
          </Text>
          {suggestions.map((f) => (
            <Text
              key={f.id}
              variant="small"
              color={Colors.primary}
              onPress={() => router.push({ pathname: '/help/faq', params: { open: f.id } })}>
              {t('contact.suggestion', { question: f.q })}
            </Text>
          ))}
        </Card>
      )}

      <TextArea
        label={t('contact.message')}
        value={message}
        onChangeText={setMessage}
        placeholder={t('contact.messagePlaceholder')}
        minHeight={140}
      />

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
      <Button title={t('contact.send')} icon="send" loading={busy} disabled={!canSend} onPress={send} />
      <Text variant="small" color={Colors.textMuted} center style={{ fontSize: 12 }}>
        {t('contact.footer')}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  tip: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});
