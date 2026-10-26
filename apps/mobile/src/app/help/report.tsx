import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Switch, View } from 'react-native';

import { ChoiceRow, ResultHero } from '@/components/billing/billing-ui';
import { DangerNote, Field, TextArea } from '@/components/help/help-ui';
import { Button, Card, Chip, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Gradients, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import type en from '@/i18n/locales/en/help';
import type { HelpTicket, ReportableType } from '@/lib/api';
import { goBack } from '@/lib/navigation';
import { useSafety } from '@/lib/safety/store';

type Icon = keyof typeof Ionicons.glyphMap;
type ReasonId = keyof typeof en.report.reasons;
/** `label` is what moderators receive, so it stays in English; the screen shows t(`report.reasons.${id}`). */
type Reason = { id: ReasonId; label: string; icon: Icon };
type HideableType = Exclude<ReportableType, 'player'>;

const PLAYER_REASONS: Reason[] = [
  { id: 'bullying', label: 'Bullying or harassment', icon: 'sad' },
  { id: 'name', label: 'Inappropriate name or avatar', icon: 'person-circle' },
  { id: 'cheating', label: 'Cheating in battles or leaderboards', icon: 'game-controller' },
  { id: 'impersonation', label: 'Pretending to be someone else', icon: 'people' },
  { id: 'underage-risk', label: 'Asking for personal details or to meet', icon: 'warning' },
  { id: 'other', label: 'Something else', icon: 'ellipsis-horizontal-circle' },
];
const CONTENT_REASONS: Reason[] = [
  { id: 'inappropriate', label: 'Sexual, violent or not suitable for students', icon: 'eye-off' },
  { id: 'harmful', label: 'Harmful or dangerous', icon: 'warning' },
  { id: 'hate', label: 'Hateful or discriminatory', icon: 'hand-left' },
  { id: 'incorrect', label: 'Wrong or misleading information', icon: 'alert-circle' },
  { id: 'spam', label: 'Spam or scam', icon: 'mail-unread' },
  { id: 'copyright', label: 'Copies someone’s work', icon: 'copy' },
  { id: 'other', label: 'Something else', icon: 'ellipsis-horizontal-circle' },
];
/** What can be picked when nothing was passed in (labels: report.types.<id>). */
const TYPES = ['player', 'video', 'tutor-answer', 'course', 'other'] as const;

/** Screen 225: report inappropriate content or a player. Optionally hides it or blocks them. */
export default function ReportContentScreen() {
  const params = useLocalSearchParams<{ type?: ReportableType; id?: string; title?: string }>();
  const { t } = useTranslation('help');
  const { report } = useSafety();
  const [type, setType] = useState<ReportableType | null>(params.type ?? null);
  const [what, setWhat] = useState(params.title ?? '');
  const [reason, setReason] = useState<ReasonId | null>(null);
  const [details, setDetails] = useState('');
  const [protect, setProtect] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<HelpTicket | null>(null);
  const known = !!params.type && !!params.id;
  const reasons = type === 'player' ? PLAYER_REASONS : CONTENT_REASONS;
  // Hiding only makes sense for an item we can find again; a typed description can't be filtered.
  const canHide = known && type !== 'player' && type !== 'other';

  const send = async () => {
    if (!type || !reason) return;
    setBusy(true);
    setError(null);
    try {
      const sent = await report({
        type,
        id: params.id ?? `manual-${Date.now()}`,
        title: what.trim(),
        reason: reasons.find((r) => r.id === reason)?.label ?? reason,
        details: details.trim(),
        hide: canHide && protect,
        block: known && type === 'player' && protect,
      });
      setTicket(sent);
    } catch (e) {
      setError(errorText(e, t('report.sendError')));
    } finally {
      setBusy(false);
    }
  };

  if (ticket)
    return (
      <Screen withTabBar={false}>
        <ResultHero
          icon="shield-checkmark"
          colors={Gradients.mastery}
          title={t('report.thanksTitle')}
          body={type === 'player' ? t('report.thanksBodyPlayer') : t('report.thanksBodyContent')}>
          <Text variant="label" color={Colors.textMuted}>
            {t('report.reference', { id: ticket.id })}
          </Text>
        </ResultHero>
        <Card style={{ gap: Spacing.xs }}>
          <Text variant="bodyStrong">{t('report.nextTitle')}</Text>
          {[
            t('report.next.review'),
            t('report.next.action'),
            t('report.next.follow'),
            ...(canHide && protect ? [t(`report.hiddenNow.${type as HideableType}`)] : []),
            ...(known && type === 'player' && protect ? [t('report.next.blocked', { name: what })] : []),
          ].map((line) => (
            <View key={line} style={styles.step}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
              <Text variant="small" color={Colors.textSecondary} style={{ flex: 1 }}>
                {line}
              </Text>
            </View>
          ))}
        </Card>
        <DangerNote />
        <Button title={t('actions.done', { ns: 'common' })} onPress={() => goBack('/help')} />
        <Button
          variant="ghost"
          title={t('report.viewReport')}
          onPress={() => router.replace({ pathname: '/help/ticket/[id]', params: { id: ticket.id } })}
        />
      </Screen>
    );

  return (
    <Screen withTabBar={false}>
      <ScreenHeader
        eyebrow={t('ui.safetyEyebrow')}
        title={known && type ? t(`report.titleFor.${type}`) : t('ui.reportContent')}
      />
      {known ? (
        <Card style={styles.item}>
          <Ionicons name={type === 'player' ? 'person' : 'document-text'} size={20} color={Colors.textSecondary} />
          <Text variant="bodyStrong" style={{ flex: 1 }} numberOfLines={2}>
            {what}
          </Text>
        </Card>
      ) : (
        <>
          <View style={{ gap: Spacing.xs }}>
            <Text variant="bodyStrong" style={{ fontSize: 14 }}>
              {t('report.whatQuestion')}
            </Text>
            <View style={styles.chips}>
              {TYPES.map((id) => (
                <Chip
                  key={id}
                  label={t(`report.types.${id}`)}
                  selected={type === id}
                  onPress={() => {
                    setType(id);
                    setReason(null);
                  }}
                />
              ))}
            </View>
          </View>
          {type && (
            <Field
              label={type === 'player' ? t('report.playerName') : t('report.whichOne')}
              value={what}
              onChangeText={setWhat}
              placeholder={type === 'player' ? t('report.playerPlaceholder') : t('report.itemPlaceholder')}
              maxLength={100}
            />
          )}
        </>
      )}

      {type && (
        <>
          <Text variant="heading">{t('report.wrongQuestion')}</Text>
          {reasons.map((r) => (
            <ChoiceRow
              key={r.id}
              icon={r.icon}
              title={t(`report.reasons.${r.id}`)}
              selected={reason === r.id}
              onPress={() => setReason(r.id)}
              color={Colors.danger}
            />
          ))}
          {reason === 'copyright' && (
            <Text variant="small" color={Colors.primary} onPress={() => router.push('/legal/copyright')}>
              {t('report.copyrightLink')}
            </Text>
          )}
          <TextArea
            label={t('report.detailsLabel')}
            value={details}
            onChangeText={setDetails}
            placeholder={t('report.detailsPlaceholder')}
            minHeight={90}
            max={800}
          />
          {(canHide || (known && type === 'player')) && (
            <Card style={styles.toggle}>
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong" style={{ fontSize: 14 }}>
                  {type === 'player' ? t('report.alsoBlock', { name: what }) : t(`report.hideToggle.${type}`)}
                </Text>
                <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
                  {type === 'player' ? t('report.alsoBlockHint') : t('report.hideHint')}
                </Text>
              </View>
              <Switch
                value={protect}
                onValueChange={setProtect}
                accessibilityLabel={type === 'player' ? t('report.alsoBlockLabel') : t('report.hideLabel')}
                trackColor={{ true: Colors.primary, false: Colors.surfaceRaised }}
              />
            </Card>
          )}
        </>
      )}

      <DangerNote />
      {error && (
        <Text variant="small" color={Colors.danger}>
          {error}
        </Text>
      )}
      <Button
        variant="danger"
        title={t('report.send')}
        icon="flag"
        loading={busy}
        disabled={!type || !reason || what.trim().length < 2 || (reason === 'other' && details.trim().length < 5)}
        onPress={send}
      />
      <Text variant="small" color={Colors.primary} center onPress={() => router.push('/legal/guidelines')}>
        {t('ui.readGuidelines')}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  item: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  step: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
});
