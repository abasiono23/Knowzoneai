import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Button, Screen, ScreenHeader, Text } from '@/components/ui';
import { LinearGradient } from '@/components/ui/gradient';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { useFlipStyle } from '@/i18n/provider';
import { SKILL_LOOK, skillsApi, type SkillCard } from '@/lib/skills';

/** Future skills: one card per subject; a card opens that subject's lessons. */
export default function FutureSkills() {
  const { t } = useTranslation('home');
  const flip = useFlipStyle();
  const [skills, setSkills] = useState<SkillCard[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    skillsApi
      .list()
      .then((r) => setSkills(r.skills))
      .catch((e) => setError(errorText(e, t('skills.loadFailed'))));
  }, [t]);
  useEffect(load, [load]);

  return (
    <Screen withTabBar={false}>
      <ScreenHeader title={t('explore.collections.future.title')} />
      <Text color={Colors.textSecondary}>{t('skills.intro')}</Text>
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
      ) : !skills ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.lg }} />
      ) : (
        <View style={{ gap: Spacing.sm }}>
          {skills.map((s, i) => {
            const look = SKILL_LOOK[s.id] ?? { icon: 'bulb' as const, colors: [Colors.primary, '#B04CFF'] as const };
            return (
              <Animated.View key={s.id} entering={FadeInDown.delay(i * 60).duration(350)}>
                <Pressable
                  onPress={() => router.push(`/skills/${s.id}` as Href)}
                  accessibilityRole="button"
                  accessibilityLabel={`${s.name}. ${s.tagline}`}
                  style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.98 }] }]}>
                  <LinearGradient colors={look.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.icon}>
                    <Ionicons name={look.icon} size={26} color="#fff" />
                  </LinearGradient>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text variant="bodyStrong">{s.name}</Text>
                    <Text variant="small" color={Colors.textSecondary}>
                      {s.tagline}
                    </Text>
                    <Text variant="small" color={Colors.primary} style={{ fontSize: 12 }}>
                      {t('skills.lessons', { count: s.lessons })}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} style={flip} />
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  icon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
