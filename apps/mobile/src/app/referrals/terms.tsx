import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { REFERRAL_CREDITS } from '@/lib/config';

/** Sections and their points, in order; text is `referrals:terms.sections.<section>.title|points.<point>`. */
const SECTIONS = [
  { id: 'reward', points: ['credits', 'automatic', 'noCash'] },
  { id: 'qualifies', points: ['new', 'verify', 'activity', 'oneCode'] },
  { id: 'limits', points: ['monthly', 'campaign'] },
  { id: 'fairUse', points: ['self', 'device', 'reverse'] },
  { id: 'privacy', points: ['names', 'contacts'] },
] as const;

/** Screen 174: referral terms, in plain language. */
export default function ReferralTermsScreen() {
  const { t } = useTranslation('referrals');
  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} title={t('terms.title')} />
      <Text color={Colors.textSecondary}>{t('terms.intro')}</Text>
      {SECTIONS.map((s, k) => (
        <View key={s.id} style={{ gap: Spacing.xs }}>
          <Text variant="heading">
            {t('terms.heading', { number: k + 1, title: t(`terms.sections.${s.id}.title`) })}
          </Text>
          {s.points.map((p) => (
            <View key={p} style={styles.point}>
              <View style={styles.dot} />
              <Text style={{ flex: 1 }} color={Colors.textSecondary}>
                {t(`terms.sections.${s.id}.points.${p}` as 'terms.sections.reward.points.credits', {
                  credits: REFERRAL_CREDITS,
                })}
              </Text>
            </View>
          ))}
        </View>
      ))}
      <Text variant="small" color={Colors.textMuted}>
        {t('terms.updated')}
      </Text>
      <Button
        variant="secondary"
        title={t('terms.fullTerms')}
        icon="document-text-outline"
        onPress={() => router.push('/legal/terms')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  point: { flexDirection: 'row', gap: Spacing.sm },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary, marginTop: 9 },
});
