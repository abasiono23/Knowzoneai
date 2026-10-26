import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Share, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { LogoMark } from '@/components/brand/logo';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { inviteMessage, TEMPLATES } from '@/lib/referrals/messages';
import { recordInviteSent, useReferrals } from '@/lib/referrals/use-referrals';

/** Screen 170: your referral code and share link. */
export default function ReferralCodeScreen() {
  const { data } = useReferrals();
  const [toast, setToast] = useState<string | null>(null);
  const { t } = useTranslation('referrals');
  if (!data)
    return (
      <Screen withTabBar={false}>
        <ScreenHeader eyebrow={t('inviteEyebrow')} title={t('code.title')} />
      </Screen>
    );
  const flash = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(null), 1600);
  };
  const copy = async (text: string, what: 'code' | 'link') => {
    await Clipboard.setStringAsync(text);
    flash(what === 'link' ? t('code.linkCopied') : t('code.codeCopied'));
    recordInviteSent(what === 'link' ? 'copy-link' : 'copy-code');
  };

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('inviteEyebrow')} title={t('code.title')} />
      <LinearGradient
        colors={['#1B1150', '#3B2DBF', '#7C5CFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}>
        <View style={styles.brand}>
          <LogoMark size={28} />
          <Text variant="label" color="rgba(255,255,255,0.85)" style={{ letterSpacing: 3 }}>
            {t('code.brand')}
          </Text>
        </View>
        <Text style={styles.code} accessibilityLabel={t('code.codeA11y', { code: data.code.split('').join(' ') })}>
          {data.code}
        </Text>
        <Text color="rgba(255,255,255,0.85)" center>
          {t('code.credits', { credits: data.rewardCredits })}
        </Text>
        <View style={styles.perf} />
        <Pressable
          onPress={() => copy(data.link, 'link')}
          accessibilityRole="button"
          accessibilityLabel={t('code.copyLinkA11y', { link: data.link })}
          style={styles.link}>
          <Ionicons name="link" size={16} color="#fff" />
          <Text variant="small" color="#fff" numberOfLines={1} style={{ flex: 1 }}>
            {data.link.replace('https://', '')}
          </Text>
          <Ionicons name="copy-outline" size={16} color="#fff" />
        </Pressable>
      </LinearGradient>

      {toast && (
        <Animated.View entering={FadeIn} style={styles.toast}>
          <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
          <Text variant="small">{toast}</Text>
        </Animated.View>
      )}

      <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
        <Button
          variant="secondary"
          icon="copy-outline"
          title={t('code.copyCode')}
          style={{ flex: 1 }}
          onPress={() => copy(data.code, 'code')}
        />
        <Button
          variant="secondary"
          icon="link"
          title={t('code.copyLink')}
          style={{ flex: 1 }}
          onPress={() => copy(data.link, 'link')}
        />
      </View>
      <Button
        icon="share-social"
        title={t('actions.share', { ns: 'common' })}
        onPress={async () => {
          await Share.share({
            message: inviteMessage(TEMPLATES[0].id, data.code, data.link, data.rewardCredits),
            url: data.link,
          }).catch(() => {});
          recordInviteSent('share');
        }}
      />
      <Button
        variant="ghost"
        icon="paper-plane-outline"
        title={t('code.moreWays')}
        onPress={() => router.push('/referrals/invite')}
      />

      <Card style={{ gap: Spacing.sm }}>
        <Text variant="heading">{t('code.howTitle')}</Text>
        {[
          ['link', t('code.how.open')],
          ['create', t('code.how.enter')],
          ['school', t('code.how.finish')],
          ['gift', t('code.how.reward', { credits: data.rewardCredits })],
        ].map(([icon, text], k) => (
          <View key={text} style={styles.step}>
            <View style={styles.num}>
              <Text variant="label">{k + 1}</Text>
            </View>
            <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={18} color={Colors.primary} />
            <Text variant="small" style={{ flex: 1 }}>
              {text}
            </Text>
          </View>
        ))}
      </Card>
      <Text variant="small" color={Colors.textMuted} center>
        {t('code.neverExpires')}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: Spacing.sm, padding: Spacing.lg, borderRadius: Radius.xl, overflow: 'hidden' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  code: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 44,
    lineHeight: 52,
    letterSpacing: 6,
    color: '#FFC857',
    marginVertical: Spacing.xs,
  },
  perf: {
    alignSelf: 'stretch',
    height: 0,
    borderTopWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.35)',
    marginVertical: Spacing.xs,
  },
  link: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  toast: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceRaised,
  },
  step: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  num: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
