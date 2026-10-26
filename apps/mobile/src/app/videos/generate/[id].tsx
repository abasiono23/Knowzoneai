import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { AuthScreen } from '@/components/auth/auth-screen';
import { TutorErrorState } from '@/components/tutor/error-state';
import { Button, Card, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { generationError, stageLabel, styleName, voiceName } from '@/lib/videos/options';
import { useVideos } from '@/lib/videos/store';
import { GENERATION_STAGES, type GeneratedVideo } from '@/lib/videos/types';

/** Screens 104 (generation progress) and 109 (processing error) for one generated video. */
export default function GenerateProgressScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { generated, ready, retry, removeGenerated } = useVideos();
  const v = generated.find((x) => x.id === id);
  const { t } = useTranslation('videos');

  useEffect(() => {
    if (v?.status === 'ready') {
      const timer = setTimeout(() => router.replace(`/videos/mine/${v.id}/preview`), 700);
      return () => clearTimeout(timer);
    }
  }, [v?.status, v?.id]);

  if (!ready) return null;
  if (!v) {
    return (
      <AuthScreen>
        <TutorErrorState
          kind="missing"
          title={t('generate.cancelled')}
          onBack={() => router.replace('/videos/create')}
        />
      </AuthScreen>
    );
  }

  if (v.status === 'failed')
    return <Failed v={v} onRetry={() => retry(v.id)} onDiscard={() => removeGenerated(v.id)} />;

  const done = v.status === 'ready';
  const pct = done ? 1 : (v.stage + 0.5) / GENERATION_STAGES.length;
  const R = 70;
  const C = 2 * Math.PI * R;

  return (
    <AuthScreen
      center
      back={false}
      footer={
        !done ? (
          <Button variant="ghost" title={t('generate.keepStudying')} onPress={() => router.replace('/videos/mine')} />
        ) : undefined
      }>
      <View style={styles.ring}>
        <Svg width={180} height={180}>
          <Circle cx={90} cy={90} r={R} stroke={Colors.surfaceRaised} strokeWidth={10} fill="none" />
          <Circle
            cx={90}
            cy={90}
            r={R}
            stroke={Colors.primary}
            strokeWidth={10}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${C * pct} ${C}`}
            transform="rotate(-90 90 90)"
          />
        </Svg>
        <View style={styles.ringCenter}>
          <Ionicons name={done ? 'checkmark' : 'film'} size={36} color={done ? Colors.success : Colors.text} />
          <Text variant="heading">{Math.round(pct * 100)}%</Text>
        </View>
      </View>
      <Text variant="title" center>
        {done ? t('generate.ready') : t('generate.making')}
      </Text>
      <Text color={Colors.textSecondary} center numberOfLines={2}>
        {v.title} · {voiceName(v.settings.voiceId, t)} · {styleName(v.settings.styleId, t)}
      </Text>
      <Card style={{ gap: Spacing.sm }}>
        {GENERATION_STAGES.map((stage, i) => {
          const complete = done || i < v.stage;
          const active = !done && i === v.stage;
          return (
            <View key={stage} style={styles.stage}>
              {complete ? (
                <Animated.View entering={FadeIn}>
                  <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
                </Animated.View>
              ) : active ? (
                <ActivityIndicator size="small" color={Colors.primary} style={{ width: 22 }} />
              ) : (
                <Ionicons name="ellipse-outline" size={22} color={Colors.textMuted} />
              )}
              <Text color={complete || active ? Colors.text : Colors.textMuted}>{stageLabel(i, t)}</Text>
            </View>
          );
        })}
      </Card>
    </AuthScreen>
  );
}

/** Screen 109: video processing error, with reasons and ways forward. */
function Failed({ v, onRetry, onDiscard }: { v: GeneratedVideo; onRetry: () => void; onDiscard: () => void }) {
  const { t } = useTranslation('videos');
  const error = v.error && generationError(v.error, t);
  return (
    <AuthScreen
      center
      back={false}
      footer={
        <>
          <Button title={t('generate.retry')} icon="refresh" onPress={onRetry} />
          <Button
            variant="secondary"
            title={t('generate.adjust')}
            icon="options"
            onPress={() => router.push(`/videos/mine/${v.id}/adjust`)}
          />
          <Button
            variant="ghost"
            title={t('generate.discard')}
            onPress={() => {
              onDiscard();
              router.replace('/videos/create');
            }}
          />
        </>
      }>
      <TutorErrorState kind="server" title={error?.title} body={error?.message} />
      {error?.reasons.length ? (
        <Card style={{ gap: Spacing.xs }}>
          <Text variant="label" color={Colors.textMuted}>
            {t('generate.whatMightHelp')}
          </Text>
          {error.reasons.map((r) => (
            <View key={r} style={styles.stage}>
              <Ionicons name="bulb-outline" size={16} color={Colors.reward} />
              <Text variant="small" style={{ flex: 1 }}>
                {r}
              </Text>
            </View>
          ))}
        </Card>
      ) : null}
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  ring: { alignSelf: 'center', width: 180, height: 180 },
  ringCenter: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  stage: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});
