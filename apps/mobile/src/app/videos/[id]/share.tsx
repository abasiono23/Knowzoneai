import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Share, StyleSheet, View } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { ToggleRow } from '@/components/personalize/toggle-row';
import { VideoThumb } from '@/components/videos/video-thumb';
import { VideoRoute } from '@/components/videos/video-route';
import { Card, Text } from '@/components/ui';
import { Colors, Palette, Radius, Spacing } from '@/constants/theme';
import { useFlipStyle } from '@/i18n/provider';
import { subjectLabel } from '@/lib/videos/options';
import { useVideos } from '@/lib/videos/store';
import { clock } from '@/lib/videos/types';

/** Screen 96: share a video by link, message or clipboard, optionally from where you paused. */
export default function ShareVideoScreen() {
  const { progress } = useVideos();
  const [fromHere, setFromHere] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const { t } = useTranslation('videos');
  const { t: tHome } = useTranslation('home');
  const flip = useFlipStyle();

  return (
    <VideoRoute>
      {(v) => {
        const at = Math.floor(progress[v.id] ?? 0);
        const link = `https://knowzone.ai/v/${v.id}${fromHere && at > 0 ? `?t=${at}` : ''}`;
        const message = t('share.message', { title: v.title, subject: subjectLabel(v.subject, t, tHome), link });
        const flash = (m: string) => {
          setDone(m);
          setTimeout(() => setDone(null), 1800);
        };
        const options = [
          {
            icon: 'logo-whatsapp' as const,
            color: '#25D366',
            label: t('share.whatsapp'),
            onPress: () => Share.share({ message }),
          },
          {
            icon: 'link' as const,
            color: Palette.purple300,
            label: t('share.copyLink'),
            onPress: async () => {
              await Clipboard.setStringAsync(link);
              flash(t('share.linkCopied'));
            },
          },
          {
            icon: 'document-text' as const,
            color: Palette.teal400,
            label: t('share.copySummary'),
            onPress: async () => {
              await Clipboard.setStringAsync(`${v.title}\n${v.description}\n\n${link}`);
              flash(t('share.summaryCopied'));
            },
          },
        ];
        return (
          <AuthScreen title={t('share.title')} subtitle={t('share.subtitle')}>
            <View style={styles.preview}>
              <View style={{ width: 96 }}>
                <VideoThumb video={v} height={128} />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text variant="bodyStrong" numberOfLines={2}>
                  {v.title}
                </Text>
                <Text variant="small" color={Colors.textSecondary} numberOfLines={1}>
                  {link.replace('https://', '')}
                </Text>
              </View>
            </View>
            {at > 0 && (
              <Card>
                <ToggleRow
                  icon="time"
                  label={t('share.startAt', { time: clock(at) })}
                  description={t('share.startAtHint')}
                  value={fromHere}
                  onChange={setFromHere}
                />
              </Card>
            )}
            {options.map((o) => (
              <Pressable
                key={o.label}
                onPress={o.onPress}
                accessibilityRole="button"
                accessibilityLabel={o.label}
                style={({ pressed }) => [styles.option, pressed && { opacity: 0.8 }]}>
                <View style={[styles.icon, { backgroundColor: o.color + '22' }]}>
                  <Ionicons name={o.icon} size={22} color={o.color} />
                </View>
                <Text variant="bodyStrong" style={{ flex: 1 }}>
                  {o.label}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} style={flip} />
              </Pressable>
            ))}
            {done && (
              <Card style={styles.toast}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                <Text variant="small">{done}</Text>
              </Card>
            )}
          </AuthScreen>
        );
      }}
    </VideoRoute>
  );
}

const styles = StyleSheet.create({
  preview: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderColor: Colors.success,
    backgroundColor: Colors.successSoft,
  },
});
