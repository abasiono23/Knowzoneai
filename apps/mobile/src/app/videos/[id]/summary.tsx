import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { VideoRoute } from '@/components/videos/video-route';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { useMaterials } from '@/lib/studio/store';
import { DEFAULT_OPTIONS } from '@/lib/studio/types';
import { durationOf } from '@/lib/videos/types';

/** Screen 92: the video's summary and key takeaways, with a one-tap study pack. */
export default function VideoSummaryScreen() {
  const { create } = useMaterials();
  const { t } = useTranslation('videos');
  return (
    <VideoRoute>
      {(v) => {
        const takeaways = v.scenes
          .flatMap((s) => (s.bullets?.length ? s.bullets : s.kind === 'concept' && s.body ? [s.body] : []))
          .slice(0, 6);
        const check = v.scenes.find((s) => s.kind === 'check')?.check;
        return (
          <Screen withTabBar={false}>
            <ScreenHeader eyebrow={t('summary.eyebrow')} title={v.title} />
            <LinearGradient
              colors={Gradients.ai}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: Radius.lg,
                padding: Spacing.lg,
                gap: Spacing.xs,
              }}>
              <Text variant="label" color="rgba(255,255,255,0.85)">
                {t('summary.inMinutes', { count: Math.max(1, Math.round(durationOf(v.scenes) / 60)) })}
              </Text>
              <Text variant="heading" style={{ lineHeight: 26 }}>
                {v.description}
              </Text>
            </LinearGradient>
            <Text variant="heading">{t('summary.takeaways')}</Text>
            {takeaways.map((item, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  gap: Spacing.sm,
                  alignItems: 'flex-start',
                }}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                <Text style={{ flex: 1 }}>{item}</Text>
              </View>
            ))}
            {check && (
              <Card style={{ gap: 4 }}>
                <Text variant="label" color={Colors.reward}>
                  {t('summary.testYourself')}
                </Text>
                <Text variant="bodyStrong">{check.question}</Text>
                <Text variant="small" color={Colors.textSecondary}>
                  {t('summary.answer', { answer: check.options[check.correctIndex] })}
                </Text>
              </Card>
            )}
            <Button
              title={t('summary.makePack')}
              icon="layers"
              onPress={() => {
                const id = create({
                  type: 'video',
                  label: v.title,
                  topic: v.title,
                  title: v.title,
                  options: DEFAULT_OPTIONS,
                });
                router.push(`/study/status/${id}`);
              }}
            />
            <Button
              variant="secondary"
              title={t('summary.watchAgain')}
              icon="play"
              onPress={() =>
                router.push({
                  pathname: '/videos/[id]',
                  params: { id: v.id, t: '0' },
                })
              }
            />
          </Screen>
        );
      }}
    </VideoRoute>
  );
}
