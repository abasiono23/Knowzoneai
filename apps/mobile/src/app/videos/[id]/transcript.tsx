import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ChoiceChip, ChipWrap } from '@/components/personalize/choice-chip';
import { VideoRoute } from '@/components/videos/video-route';
import { IconButton, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Fonts, NoWebOutline, Radius, Spacing } from '@/constants/theme';
import { VIDEO_LANGUAGES } from '@/lib/videos/options';
import { clock } from '@/lib/videos/types';

const SIZES = { S: 14, M: 16, L: 19 } as const;

/** Screen 91: captions and the full transcript. Tap a line to play from there; search; text size. */
export default function TranscriptScreen() {
  const [q, setQ] = useState('');
  const [size, setSize] = useState<keyof typeof SIZES>('M');
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation('videos');

  return (
    <VideoRoute>
      {(v) => {
        let at = 0;
        const lines = v.scenes.map((s) => {
          const line = {
            id: s.id,
            start: at,
            heading: s.heading,
            text: s.caption,
          };
          at += s.seconds;
          return line;
        });
        const needle = q.trim().toLowerCase();
        const shown = needle ? lines.filter((l) => l.text.toLowerCase().includes(needle)) : lines;
        const lang = VIDEO_LANGUAGES.find((l) => l.id === v.settings.language)?.label ?? 'English';

        return (
          <Screen withTabBar={false}>
            <ScreenHeader
              eyebrow={t('transcript.eyebrow')}
              title={v.title}
              right={
                <IconButton
                  icon={copied ? 'checkmark' : 'copy-outline'}
                  label={t('transcript.copy')}
                  onPress={async () => {
                    await Clipboard.setStringAsync(lines.map((l) => `[${clock(l.start)}] ${l.text}`).join('\n'));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                />
              }
            />
            <View style={styles.search}>
              <Ionicons name="search" size={18} color={Colors.textMuted} />
              <TextInput
                value={q}
                onChangeText={setQ}
                placeholder={t('transcript.search')}
                placeholderTextColor={Colors.textMuted}
                style={styles.input}
                accessibilityLabel={t('transcript.search')}
              />
            </View>
            <View style={styles.settings}>
              <Text variant="small" color={Colors.textSecondary}>
                {t('transcript.settings', { language: lang })}
              </Text>
              <ChipWrap>
                {(Object.keys(SIZES) as (keyof typeof SIZES)[]).map((k) => (
                  <ChoiceChip
                    key={k}
                    label={t(`transcript.sizes.${k}`)}
                    selected={size === k}
                    onPress={() => setSize(k)}
                  />
                ))}
              </ChipWrap>
            </View>
            {shown.length === 0 && (
              <Text color={Colors.textSecondary} center>
                {t('transcript.notFound', { query: q })}
              </Text>
            )}
            {shown.map((l) => (
              <Pressable
                key={l.id}
                onPress={() =>
                  router.push({
                    pathname: '/videos/[id]',
                    params: { id: v.id, t: String(l.start) },
                  })
                }
                accessibilityRole="button"
                accessibilityLabel={t('transcript.playFrom', { time: clock(l.start), text: l.text })}
                style={({ pressed }) => [styles.line, pressed && { backgroundColor: Colors.surfaceRaised }]}>
                <View style={styles.time}>
                  <Text variant="label" color={Colors.primary}>
                    {clock(l.start)}
                  </Text>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="label" color={Colors.textMuted} style={{ fontSize: 10 }}>
                    {l.heading.toUpperCase()}
                  </Text>
                  <Text
                    style={{
                      fontSize: SIZES[size],
                      lineHeight: SIZES[size] * 1.5,
                    }}>
                    {l.text}
                  </Text>
                </View>
              </Pressable>
            ))}
          </Screen>
        );
      }}
    </VideoRoute>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 46,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    ...NoWebOutline,
    flex: 1,
    color: Colors.text,
    fontFamily: Fonts.regular,
    fontSize: 16,
    paddingVertical: 8,
  },
  settings: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  line: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.md,
  },
  time: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primarySoft,
    alignSelf: 'flex-start',
  },
});
