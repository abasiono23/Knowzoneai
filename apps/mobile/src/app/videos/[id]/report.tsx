import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Switch, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth/auth-screen';
import { SuccessBadge } from '@/components/onboarding/success-badge';
import { OptionCard } from '@/components/personalize/option-card';
import { VideoRoute } from '@/components/videos/video-route';
import { Button, Text } from '@/components/ui';
import { Colors, Fonts, Gradients, NoWebOutline, Radius, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { useSafety } from '@/lib/safety/store';
import { useVideos } from '@/lib/videos/store';

/** Reason ids are stored with the report; labels live in the `videos` namespace (report.reasons). */
const REASONS = [
  { id: 'incorrect', icon: 'alert-circle' },
  { id: 'inappropriate', icon: 'eye-off' },
  { id: 'copyright', icon: 'document-lock' },
  { id: 'quality', icon: 'volume-mute' },
  { id: 'other', icon: 'ellipsis-horizontal-circle' },
] as const;
type ReasonId = (typeof REASONS)[number]['id'];

/** Screen 97: report a problem with a video. Reports go to the moderation queue. */
export default function ReportVideoScreen() {
  const { report } = useVideos();
  const safety = useSafety();
  const { t } = useTranslation('videos');
  const [reason, setReason] = useState<ReasonId | null>(null);
  const [details, setDetails] = useState('');
  const [hide, setHide] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);

  return (
    <VideoRoute>
      {(v) => {
        if (sent) {
          return (
            <AuthScreen
              center
              back={false}
              footer={
                hide ? (
                  <Button title={t('report.backToVideos')} onPress={() => router.dismissTo('/videos')} />
                ) : (
                  <Button title={t('report.backToVideo')} onPress={() => router.back()} />
                )
              }>
              <SuccessBadge icon="shield-checkmark" colors={Gradients.mastery} />
              <Animated.View entering={FadeInDown.delay(200)} style={{ gap: Spacing.xs }}>
                <Text variant="display" center>
                  {t('report.sentTitle')}
                </Text>
                <Text color={Colors.textSecondary} center>
                  {t(hide ? 'report.sentBodyHidden' : 'report.sentBody', { ticket: sent })}
                </Text>
              </Animated.View>
            </AuthScreen>
          );
        }
        return (
          <AuthScreen
            title={t('report.title')}
            subtitle={t('report.subtitle', { title: v.title })}
            footer={
              <Button
                title={t('report.send')}
                icon="flag"
                loading={busy}
                disabled={!reason || (reason === 'other' && details.trim().length < 5)}
                onPress={async () => {
                  setBusy(true);
                  setError(null);
                  try {
                    // The moderation queue gets the reason in English, whatever the app language.
                    const label = t(`report.reasons.${reason!}.label`, { lng: 'en' });
                    const ticket = await safety.report({
                      type: 'video',
                      id: v.id,
                      title: v.title,
                      reason: label,
                      details: details.trim(),
                      hide,
                    });
                    report(v.id, reason!, details.trim());
                    setSent(ticket.id);
                  } catch (e) {
                    setError(errorText(e, t('report.failed')));
                  } finally {
                    setBusy(false);
                  }
                }}
              />
            }>
            {REASONS.map((r) => (
              <OptionCard
                key={r.id}
                label={t(`report.reasons.${r.id}.label`)}
                description={t(`report.reasons.${r.id}.description`)}
                icon={r.icon}
                color={Colors.danger}
                selected={reason === r.id}
                onPress={() => setReason(r.id)}
              />
            ))}
            <TextInput
              value={details}
              onChangeText={setDetails}
              multiline
              placeholder={reason === 'incorrect' ? t('report.incorrectPlaceholder') : t('report.detailsPlaceholder')}
              placeholderTextColor={Colors.textMuted}
              style={styles.area}
              accessibilityLabel={t('report.detailsLabel')}
            />
            <View style={styles.toggle}>
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong" style={{ fontSize: 14 }}>
                  {t('report.hide')}
                </Text>
                <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
                  {t('report.hideHint')}
                </Text>
              </View>
              <Switch
                value={hide}
                onValueChange={setHide}
                accessibilityLabel={t('report.hide')}
                trackColor={{ true: Colors.primary, false: Colors.surfaceRaised }}
              />
            </View>
            {reason === 'copyright' && (
              <Text variant="small" color={Colors.primary} onPress={() => router.push('/legal/copyright')}>
                {t('report.copyright')}
              </Text>
            )}
            {error && (
              <Text variant="small" color={Colors.danger}>
                {error}
              </Text>
            )}
            <Text variant="small" color={Colors.textMuted}>
              {t('report.anonymous')}
            </Text>
          </AuthScreen>
        );
      }}
    </VideoRoute>
  );
}

const styles = StyleSheet.create({
  toggle: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  area: {
    ...NoWebOutline,
    minHeight: 100,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontFamily: Fonts.regular,
    fontSize: 15,
    padding: Spacing.md,
    textAlignVertical: 'top',
  },
});
