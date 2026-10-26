import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { StyleSheet, TextInput, View } from 'react-native';

import { TicketStatus } from '@/components/help/help-ui';
import { Button, Card, IconButton, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Fonts, NoWebOutline, Radius, Spacing } from '@/constants/theme';
import { formatDate } from '@/i18n';
import { errorText } from '@/i18n/errors';
import type en from '@/i18n/locales/en/help';
import { api } from '@/lib/api';
import { timeAgo, useTickets } from '@/lib/help/use-tickets';

type MetaKey = keyof typeof en.ticket.meta;
const META_KEYS: Record<MetaKey, true> = {
  app: true,
  platform: true,
  screen: true,
  area: true,
  frequency: true,
  type: true,
  title: true,
  reason: true,
  rating: true,
  reference: true,
  screenshot: true,
};
const isMetaKey = (k: string): k is MetaKey => Object.prototype.hasOwnProperty.call(META_KEYS, k);
const HIDDEN_META = ['itemId', 'screenshot'];

/** Screen 222: support ticket detail. The conversation, what was sent, replies and resolving. */
export default function TicketDetailScreen() {
  const { id, created } = useLocalSearchParams<{ id: string; created?: string }>();
  const { t } = useTranslation('help');
  const { tickets, put } = useTickets();
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now] = useState(() => Date.now());
  const ticket = tickets?.find((x) => x.id === id);

  if (!ticket)
    return (
      <Screen withTabBar={false}>
        <ScreenHeader eyebrow={t('ticket.eyebrow')} />
        {tickets && <Text color={Colors.textSecondary}>{t('ticket.notFound')}</Text>}
      </Screen>
    );

  const send = async () => {
    setBusy(true);
    setError(null);
    try {
      put((await api.replyToTicket(ticket.id, reply)).ticket);
      setReply('');
    } catch (e) {
      setError(errorText(e, t('ticket.sendError')));
    } finally {
      setBusy(false);
    }
  };
  const resolve = async () => {
    try {
      put((await api.closeTicket(ticket.id)).ticket);
    } catch (e) {
      setError(errorText(e, t('ticket.updateError')));
    }
  };

  const meta = Object.entries(ticket.meta ?? {}).filter(([k, v]) => v && !HIDDEN_META.includes(k));
  const canReply = ticket.kind !== 'feedback';

  return (
    <Screen withTabBar={false}>
      <ScreenHeader
        eyebrow={t('ticket.eyebrowWithId', { kind: t(`tickets.kind.${ticket.kind}`).toUpperCase(), id: ticket.id })}
        title={ticket.subject}
      />
      {created && (
        <Card style={styles.created}>
          <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
          <Text variant="small" style={{ flex: 1 }}>
            <Trans
              t={t}
              i18nKey="ticket.created"
              values={{ id: ticket.id }}
              components={{ strong: <Text variant="bodyStrong" /> }}
            />
          </Text>
        </Card>
      )}
      <View style={styles.statusRow}>
        <TicketStatus status={ticket.status} />
        <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
          {t('ticket.opened', { date: formatDate(ticket.createdAt, { day: 'numeric', month: 'long' }) })}
        </Text>
      </View>

      <View style={{ gap: Spacing.sm }}>
        {ticket.messages.map((m) => {
          const mine = m.from === 'me';
          return (
            <View key={m.id} style={[styles.msgRow, mine && { justifyContent: 'flex-end' }]}>
              {!mine && (
                <View style={styles.agent}>
                  <Ionicons name="sparkles" size={14} color={Colors.text} />
                </View>
              )}
              <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                {!mine && (
                  <Text variant="label" color={Colors.primary} style={{ fontSize: 10 }}>
                    {t('ticket.support')}
                  </Text>
                )}
                <Text variant="small">{m.template === 'ack' ? t(`ticket.acks.${ticket.kind}`) : m.text}</Text>
                <Text variant="small" color={Colors.textMuted} style={{ fontSize: 10, alignSelf: 'flex-end' }}>
                  {timeAgo(m.at, now)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {meta.length > 0 && (
        <Card style={{ gap: 6 }}>
          <Text variant="label" color={Colors.textMuted}>
            {t('ticket.detailsSent')}
          </Text>
          {meta.map(([k, v]) => (
            <View key={k} style={styles.meta}>
              <Text variant="small" color={Colors.textMuted} style={{ width: 90, fontSize: 12 }}>
                {isMetaKey(k) ? t(`ticket.meta.${k}`) : k}
              </Text>
              <Text variant="small" style={{ flex: 1, fontSize: 12 }}>
                {v}
              </Text>
            </View>
          ))}
          {ticket.meta?.screenshot && (
            <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
              {t('ticket.screenshotAttached')}
            </Text>
          )}
        </Card>
      )}

      {canReply && (
        <View style={{ gap: Spacing.sm }}>
          <View style={styles.compose}>
            <TextInput
              value={reply}
              onChangeText={setReply}
              placeholder={ticket.status === 'resolved' ? t('ticket.replyToReopen') : t('ticket.addDetails')}
              placeholderTextColor={Colors.textMuted}
              multiline
              maxLength={1000}
              accessibilityLabel={t('ticket.reply')}
              style={styles.input}
            />
            <IconButton icon="send" label={t('ticket.sendReply')} onPress={() => reply.trim() && !busy && send()} />
          </View>
          {error && (
            <Text variant="small" color={Colors.danger}>
              {error}
            </Text>
          )}
          {ticket.status !== 'resolved' && (
            <Button variant="secondary" title={t('ticket.solved')} icon="checkmark-done" onPress={resolve} />
          )}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  created: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderColor: Colors.success + '66' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.xs },
  agent: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: { maxWidth: '82%', borderRadius: Radius.md, padding: Spacing.sm, gap: 4 },
  mine: {
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: Colors.primary + '55',
    borderBottomRightRadius: 4,
  },
  theirs: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderBottomLeftRadius: 4 },
  meta: { flexDirection: 'row', gap: Spacing.xs },
  compose: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.xs },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 140,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.text,
    fontFamily: Fonts.regular,
    fontSize: 15,
    ...NoWebOutline,
  },
});
