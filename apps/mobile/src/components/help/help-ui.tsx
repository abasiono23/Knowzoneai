import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Trans, useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Card, Text } from '@/components/ui';
import { Colors, Fonts, NoWebOutline, Radius, Spacing } from '@/constants/theme';
import type { HelpTicket } from '@/lib/api';
import { timeAgo } from '@/lib/help/use-tickets';
import { LEGAL_DRAFT } from '@/lib/legal/documents';

export function SearchField({ value, onChangeText, placeholder, ...rest }: TextInputProps) {
  const { t } = useTranslation('help');
  return (
    <View style={styles.search}>
      <Ionicons name="search" size={20} color={Colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? t('ui.searchPlaceholder')}
        placeholderTextColor={Colors.textMuted}
        accessibilityLabel={t('ui.searchLabel')}
        returnKeyType="search"
        style={styles.searchInput}
        {...rest}
      />
      {!!value && (
        <Pressable
          onPress={() => onChangeText?.('')}
          accessibilityRole="button"
          accessibilityLabel={t('ui.clearSearch')}
          hitSlop={8}>
          <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

/** Multi-line input with a label and a character count. */
export function TextArea({
  label,
  value,
  onChangeText,
  max = 1000,
  minHeight = 110,
  ...rest
}: TextInputProps & { label: string; max?: number; minHeight?: number }) {
  return (
    <View style={{ gap: 6 }}>
      <View style={styles.between}>
        <Text variant="bodyStrong" style={{ fontSize: 14 }}>
          {label}
        </Text>
        <Text variant="small" color={Colors.textMuted} style={{ fontSize: 11 }}>
          {value?.length ?? 0}/{max}
        </Text>
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline
        maxLength={max}
        placeholderTextColor={Colors.textMuted}
        accessibilityLabel={label}
        style={[styles.area, { minHeight }]}
        {...rest}
      />
    </View>
  );
}

export function Field({ label, ...rest }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text variant="bodyStrong" style={{ fontSize: 14 }}>
        {label}
      </Text>
      <TextInput placeholderTextColor={Colors.textMuted} accessibilityLabel={label} style={styles.field} {...rest} />
    </View>
  );
}

const STATUS_COLOR: Record<HelpTicket['status'], string> = {
  open: Colors.info,
  waiting: Colors.reward,
  resolved: Colors.success,
};

export function TicketStatus({ status }: { status: HelpTicket['status'] }) {
  const { t } = useTranslation('help');
  const c = STATUS_COLOR[status];
  return (
    <View style={[styles.pill, { backgroundColor: c + '22' }]}>
      <View style={[styles.dot, { backgroundColor: c }]} />
      <Text variant="label" color={c} style={{ fontSize: 10 }}>
        {t(`tickets.status.${status}`).toUpperCase()}
      </Text>
    </View>
  );
}

export function TicketRow({ ticket, now }: { ticket: HelpTicket; now: number }) {
  const { t } = useTranslation('help');
  const last = ticket.messages[ticket.messages.length - 1];
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/help/ticket/[id]', params: { id: ticket.id } })}
      accessibilityRole="button"
      accessibilityLabel={t('tickets.rowLabel', {
        subject: ticket.subject,
        status: t(`tickets.status.${ticket.status}`),
      })}>
      {({ pressed }) => (
        <Card style={[styles.ticket, pressed && { opacity: 0.85 }]}>
          <View style={{ flex: 1, gap: 4 }}>
            <View style={styles.between}>
              <Text variant="label" color={Colors.textMuted} style={{ fontSize: 10 }}>
                {t(`tickets.kind.${ticket.kind}`).toUpperCase()} · {ticket.id}
              </Text>
              <Text variant="small" color={Colors.textMuted} style={{ fontSize: 11 }}>
                {timeAgo(ticket.updatedAt, now)}
              </Text>
            </View>
            <Text variant="bodyStrong" numberOfLines={1}>
              {ticket.subject}
            </Text>
            <Text variant="small" color={Colors.textSecondary} numberOfLines={1}>
              {last.from === 'support'
                ? t('tickets.lastFromSupport', { text: last.text })
                : t('tickets.lastFromMe', { text: last.text })}
            </Text>
            <TicketStatus status={ticket.status} />
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </Card>
      )}
    </Pressable>
  );
}

/** Shown on legal texts until counsel has reviewed them. */
export function DraftBanner() {
  const { t } = useTranslation('help');
  if (!LEGAL_DRAFT) return null;
  return (
    <Card style={[styles.draft]}>
      <Ionicons name="construct" size={18} color={Colors.reward} />
      <Text variant="small" color={Colors.textSecondary} style={{ flex: 1, fontSize: 12 }}>
        {t('ui.draftBanner')}
      </Text>
    </Card>
  );
}

/** Emergency note for safety screens. */
export function DangerNote() {
  const { t } = useTranslation('help');
  return (
    <Card style={styles.danger}>
      <Ionicons name="call" size={20} color={Colors.danger} />
      <Text variant="small" style={{ flex: 1 }}>
        <Trans t={t} i18nKey="ui.danger" components={{ strong: <Text variant="bodyStrong" /> }} />
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    paddingHorizontal: Spacing.md,
    minHeight: 52,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontFamily: Fonts.regular,
    fontSize: 16,
    paddingVertical: Spacing.sm,
    ...NoWebOutline,
  },
  area: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    color: Colors.text,
    fontFamily: Fonts.regular,
    fontSize: 15,
    textAlignVertical: 'top',
    ...NoWebOutline,
  },
  field: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    minHeight: 50,
    color: Colors.text,
    fontFamily: Fonts.regular,
    fontSize: 15,
    ...NoWebOutline,
  },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  ticket: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  draft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderColor: Colors.reward + '55',
    paddingVertical: Spacing.sm,
  },
  danger: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderColor: Colors.danger + '66' },
});
