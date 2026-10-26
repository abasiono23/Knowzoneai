import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, Share, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ChoiceChip } from '@/components/personalize/choice-chip';
import { Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import i18n from '@/i18n';
import { inviteMessage, TEMPLATES, type TemplateId } from '@/lib/referrals/messages';
import { invitesSent, recordInviteSent, useReferrals } from '@/lib/referrals/use-referrals';

type ChannelId = 'whatsapp' | 'sms' | 'email' | 'copy' | 'more';

/** Share channels; labels are `referrals:invite.channels.<id>`. */
const CHANNELS: {
  id: ChannelId;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  url?: (m: string) => string;
}[] = [
  {
    id: 'whatsapp',
    icon: 'logo-whatsapp',
    color: '#25D366',
    url: (m) => `https://wa.me/?text=${encodeURIComponent(m)}`,
  },
  {
    id: 'sms',
    icon: 'chatbubble-ellipses',
    color: '#4CC9FF',
    url: (m) => `sms:?&body=${encodeURIComponent(m)}`,
  },
  {
    id: 'email',
    icon: 'mail',
    color: '#FF7A93',
    url: (m) => `mailto:?subject=${encodeURIComponent(i18n.t('referrals:emailSubject'))}&body=${encodeURIComponent(m)}`,
  },
  { id: 'copy', icon: 'copy', color: '#FFC857' },
  { id: 'more', icon: 'share-social', color: '#9B82FF' },
];

/** Screen 171: invite friends, with ready-made messages for each channel. */
export default function InviteFriendsScreen() {
  const { data } = useReferrals();
  const [tpl, setTpl] = useState<TemplateId>('buddy');
  const [sent, setSent] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<string | null>(null);
  const { t } = useTranslation('referrals');
  useEffect(() => {
    invitesSent().then(setSent);
  }, []);
  if (!data)
    return (
      <Screen withTabBar={false}>
        <ScreenHeader eyebrow={t('eyebrow')} title={t('invite.title')} />
      </Screen>
    );
  const message = inviteMessage(tpl, data.code, data.link, data.rewardCredits);
  const total = Object.values(sent).reduce((n, v) => n + v, 0);

  const send = async (c: (typeof CHANNELS)[number]) => {
    try {
      if (c.id === 'copy') {
        await Clipboard.setStringAsync(message);
        setToast(t('invite.copied'));
      } else if (c.id === 'more') {
        await Share.share({ message });
      } else if (c.url) {
        await Linking.openURL(c.url(message));
      }
      setSent(await recordInviteSent(c.id));
    } catch {
      setToast(t('invite.cantOpen', { channel: t(`invite.channels.${c.id}`) }));
    }
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} title={t('invite.title')} />
      <Text color={Colors.textSecondary}>{t('invite.intro')}</Text>
      <View style={styles.chips}>
        {TEMPLATES.map((x) => (
          <ChoiceChip
            key={x.id}
            label={t(`templates.${x.id}.label`)}
            emoji={x.emoji}
            selected={tpl === x.id}
            onPress={() => setTpl(x.id)}
          />
        ))}
      </View>
      <Animated.View key={tpl} entering={FadeIn.duration(200)}>
        <Card style={styles.bubble}>
          <Text variant="label" color={Colors.textMuted}>
            {t('invite.preview')}
          </Text>
          <Text>{message}</Text>
        </Card>
      </Animated.View>

      <View style={styles.grid}>
        {CHANNELS.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => send(c)}
            accessibilityRole="button"
            accessibilityLabel={t('invite.sendWith', { channel: t(`invite.channels.${c.id}`) })}
            style={({ pressed }) => [styles.channel, pressed && { opacity: 0.8 }]}>
            <View style={[styles.icon, { backgroundColor: c.color + '22' }]}>
              <Ionicons name={c.icon} size={24} color={c.color} />
            </View>
            <Text variant="small" center style={{ fontSize: 12 }}>
              {t(`invite.channels.${c.id}`)}
            </Text>
          </Pressable>
        ))}
      </View>
      {toast && (
        <Animated.View entering={FadeIn} style={styles.toast}>
          <Text variant="small">{toast}</Text>
        </Animated.View>
      )}
      <Card style={styles.tally}>
        <Ionicons name="paper-plane" size={20} color={Colors.primary} />
        <Text variant="small" style={{ flex: 1 }}>
          {total ? t('invite.sent', { count: total }) : t('invite.noneSent')}
        </Text>
      </Card>
      <View style={styles.note}>
        <Ionicons name="shield-checkmark-outline" size={16} color={Colors.textMuted} />
        <Text variant="small" color={Colors.textMuted} style={{ flex: 1 }}>
          {t('invite.privacy')}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  bubble: { gap: Spacing.xs, borderTopLeftRadius: 4, backgroundColor: Colors.surfaceRaised },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  channel: {
    width: '31.5%',
    flexGrow: 1,
    alignItems: 'center',
    gap: 6,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  icon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  toast: {
    alignSelf: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceRaised,
  },
  tally: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  note: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'flex-start' },
});
