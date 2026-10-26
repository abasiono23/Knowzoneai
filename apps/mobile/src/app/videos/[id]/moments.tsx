import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { VideoRoute } from '@/components/videos/video-route';
import { Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useVideos } from '@/lib/videos/store';
import { clock } from '@/lib/videos/types';

const KIND_ICON = {
  title: 'flag',
  concept: 'bulb',
  list: 'list',
  formula: 'calculator',
  example: 'earth',
  check: 'help-circle',
  recap: 'trophy',
} as const;

/** Screen 93: key moments as chapters with timestamps; tap to jump there. */
export default function MomentsScreen() {
  const { progress } = useVideos();
  const { t } = useTranslation('videos');
  return (
    <VideoRoute>
      {(v) => {
        let at = 0;
        const moments = v.scenes.map((s) => {
          const m = { s, start: at };
          at += s.seconds;
          return m;
        });
        const watched = progress[v.id] ?? 0;
        return (
          <Screen withTabBar={false}>
            <ScreenHeader eyebrow={t('moments.eyebrow', { count: moments.length })} title={v.title} />
            {moments.map(({ s, start }, i) => {
              const done = watched >= start + s.seconds;
              const current = watched >= start && !done;
              return (
                <Pressable
                  key={s.id}
                  onPress={() =>
                    router.push({
                      pathname: '/videos/[id]',
                      params: { id: v.id, t: String(start) },
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`${clock(start)}, ${s.heading}`}
                  style={({ pressed }) => [styles.row, current && styles.current, pressed && { opacity: 0.8 }]}>
                  <View style={styles.rail}>
                    <View
                      style={[
                        styles.dot,
                        done && { backgroundColor: Colors.success },
                        current && { backgroundColor: Colors.primary },
                      ]}>
                      <Ionicons
                        name={done ? 'checkmark' : KIND_ICON[s.kind]}
                        size={14}
                        color={done || current ? '#fff' : Colors.textSecondary}
                      />
                    </View>
                    {i < moments.length - 1 && <View style={styles.line} />}
                  </View>
                  <View style={{ flex: 1, gap: 2, paddingBottom: Spacing.md }}>
                    <Text variant="label" color={Colors.primary}>
                      {t('moments.timing', { time: clock(start), seconds: s.seconds })}
                    </Text>
                    <Text variant="bodyStrong">{s.heading}</Text>
                    <Text variant="small" color={Colors.textSecondary} numberOfLines={2}>
                      {s.caption}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </Screen>
        );
      }}
    </VideoRoute>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radius.md,
  },
  current: { backgroundColor: Colors.primarySoft },
  rail: { alignItems: 'center', width: 28, paddingTop: 4 },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: { flex: 1, width: 2, backgroundColor: Colors.border, marginTop: 4 },
});
