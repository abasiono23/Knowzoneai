import { Image } from 'expo-image';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { skillMinutes, skillsApi, skillThumb, type Skill } from '@/lib/skills';

/** A Future skills subject: what it is, then its YouTube lessons in order. */
export default function SkillScreen() {
  const { t } = useTranslation('home');
  const { id } = useLocalSearchParams<{ id: string }>();
  const [skill, setSkill] = useState<Skill | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    skillsApi
      .get(id)
      .then((r) => setSkill(r.skill))
      .catch((e) => setError(errorText(e, t('skills.loadFailed'))));
  }, [id, t]);
  useEffect(load, [load]);

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('explore.collections.future.title').toUpperCase()} title={skill?.name} />
      {error ? (
        <View style={{ gap: Spacing.sm, alignItems: 'center' }}>
          <Text variant="small" color={Colors.textSecondary} center>
            {error}
          </Text>
          <Button
            title={t('skills.retry')}
            variant="secondary"
            onPress={() => {
              setError(null);
              load();
            }}
          />
        </View>
      ) : !skill ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.lg }} />
      ) : (
        <>
          <Card style={{ gap: Spacing.xs }}>
            <Text variant="label" color={Colors.primary}>
              {t('skills.summary').toUpperCase()}
            </Text>
            <Text>{skill.summary}</Text>
          </Card>
          <Text variant="label" color={Colors.textSecondary}>
            {t('skills.lessons', { count: skill.videos.length }).toUpperCase()}
          </Text>
          <View style={{ gap: Spacing.sm }}>
            {skill.videos.map((v, i) => (
              <Animated.View key={v.youtubeId} entering={FadeInDown.delay(Math.min(i, 8) * 50).duration(350)}>
                <Pressable
                  onPress={() => router.push(`/skills/${skill.id}/${v.youtubeId}` as Href)}
                  accessibilityRole="button"
                  accessibilityLabel={v.title}
                  style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}>
                  <View>
                    <Image
                      source={{ uri: skillThumb(v.youtubeId) }}
                      style={styles.thumb}
                      contentFit="cover"
                      transition={150}
                      accessible={false}
                    />
                    <View style={styles.minutes}>
                      <Text color="#fff" style={{ fontSize: 11 }}>
                        {t('skills.minutes', { n: skillMinutes(v.seconds) })}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text variant="bodyStrong" numberOfLines={3} style={{ fontSize: 15, lineHeight: 20 }}>
                      {v.title}
                    </Text>
                    <Text variant="small" color={Colors.textSecondary} numberOfLines={1} style={{ fontSize: 12 }}>
                      {v.channel}
                    </Text>
                  </View>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  thumb: { width: 136, height: 77, borderRadius: Radius.md, backgroundColor: Colors.surfaceRaised },
  minutes: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
});
