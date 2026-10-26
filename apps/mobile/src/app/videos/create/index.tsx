import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { SoftGlow } from '@/components/brand/soft-glow';
import { VideoThumb } from '@/components/videos/video-thumb';
import { AskCard } from '@/components/tutor/messages';
import { Card, Screen, ScreenHeader, SectionHeader, Text } from '@/components/ui';
import { Colors, Palette, Radius, Spacing } from '@/constants/theme';
import { useVideoDraft } from '@/lib/videos/draft';
import { useVideos } from '@/lib/videos/store';

const STEPS: {
  id: 'source' | 'length' | 'voice' | 'make';
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: 'source', icon: 'bulb' },
  { id: 'length', icon: 'timer' },
  { id: 'voice', icon: 'mic' },
  { id: 'make', icon: 'sparkles' },
];

/** Screen 98: generate a new video. */
export default function GenerateVideoHome() {
  const { generated } = useVideos();
  const { reset } = useVideoDraft();
  const { t } = useTranslation('videos');
  const recent = generated.filter((g) => g.status === 'ready').slice(0, 2);

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('create.eyebrow')} />
      <View style={styles.hero}>
        <SoftGlow color={Palette.coral400} size={260} />
        <View style={styles.heroIcon}>
          <Ionicons name="film" size={40} color="#fff" />
        </View>
        <Text variant="display" center>
          {t('create.title')}
        </Text>
        <Text color={Colors.textSecondary} center>
          {t('create.body')}
        </Text>
      </View>
      <AskCard
        title={t('create.generate')}
        subtitle={t('create.generateHint')}
        onPress={() => {
          reset();
          router.push('/videos/create/source');
        }}
      />
      <Card style={{ gap: Spacing.md }}>
        {STEPS.map((s, i) => (
          <Animated.View key={s.id} entering={FadeInDown.delay(i * 60)} style={styles.step}>
            <View style={styles.stepIcon}>
              <Ionicons name={s.icon} size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">{t(`create.steps.${s.id}.title`)}</Text>
              <Text variant="small" color={Colors.textSecondary}>
                {t(`create.steps.${s.id}.body`)}
              </Text>
            </View>
          </Animated.View>
        ))}
      </Card>
      {recent.length > 0 && (
        <View style={{ gap: Spacing.sm }}>
          <SectionHeader
            title={t('create.yourVideos')}
            action={t('actions.seeAll', { ns: 'common' })}
            onAction={() => router.push('/videos/mine')}
          />
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            {recent.map((v) => (
              <Pressable
                key={v.id}
                onPress={() => router.push(`/videos/mine/${v.id}`)}
                accessibilityRole="button"
                accessibilityLabel={v.title}
                style={{ flex: 1, gap: 6 }}>
                <VideoThumb video={v} height={200} />
                <Text variant="small" numberOfLines={2}>
                  {v.title}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: Spacing.xs, paddingVertical: Spacing.sm },
  heroIcon: {
    width: 84,
    height: 84,
    borderRadius: Radius.lg,
    backgroundColor: Palette.coral500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  step: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
