import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth/auth-screen';
import { ReadyMaterial } from '@/components/materials/ready-material';
import { Celebration } from '@/components/onboarding/celebration';
import { TutorErrorState } from '@/components/tutor/error-state';
import { Button, Card, ProgressBar, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { formatNumber } from '@/i18n';
import { percentLabel } from '@/lib/studio/labels';
import { toParams } from '@/lib/studio/quiz';

/** Screen 80: quiz results with per-concept breakdown and what to do next. */
export default function QuizResultsScreen() {
  const { t } = useTranslation('study');
  const { a } = useLocalSearchParams<{ a: string }>();
  return (
    <ReadyMaterial>
      {(m) => {
        const attempt = m.attempts.find((x) => x.id === a);
        if (!attempt)
          return (
            <AuthScreen>
              <TutorErrorState kind="missing" title={t('results.notFound')} onBack={() => router.back()} />
            </AuthScreen>
          );
        const pct = attempt.score / attempt.total;
        const wrong = attempt.total - attempt.score;
        const byId = new Map(m.content.quiz.map((q) => [q.id, q]));
        const concepts = new Map<string, { right: number; total: number }>();
        attempt.questionIds.forEach((qid, n) => {
          const q = byId.get(qid);
          if (!q) return;
          const c = concepts.get(q.concept) ?? { right: 0, total: 0 };
          concepts.set(q.concept, {
            right: c.right + (attempt.answers[n] === q.correctIndex ? 1 : 0),
            total: c.total + 1,
          });
        });
        const previous = m.attempts.filter((x) => x.id !== attempt.id && x.createdAt < attempt.createdAt)[0];
        const verdict =
          pct === 1
            ? t('results.perfect')
            : pct >= 0.8
              ? t('results.excellent')
              : pct >= 0.5
                ? t('results.good')
                : t('results.gaps');

        return (
          <View style={{ flex: 1 }}>
            <AuthScreen
              back={false}
              footer={
                <>
                  {wrong > 0 && (
                    <Button
                      title={t('results.review', { count: wrong })}
                      icon="search"
                      onPress={() =>
                        router.push({ pathname: '/study/[id]/review', params: { id: m.id, a: attempt.id } })
                      }
                    />
                  )}
                  <Button
                    variant="secondary"
                    title={t('results.retake')}
                    icon="refresh"
                    onPress={() =>
                      router.replace({
                        pathname: '/study/[id]/quiz',
                        params: { id: m.id, ...toParams(attempt.settings, Date.now() % 100_000) },
                      })
                    }
                  />
                  <Button
                    variant="ghost"
                    title={t('shared.backToPack')}
                    onPress={() => router.dismissTo(`/study/${m.id}`)}
                  />
                </>
              }>
              <Animated.View entering={FadeInDown}>
                <LinearGradient
                  colors={pct >= 0.7 ? Gradients.mastery : Gradients.ai}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.hero}>
                  <Text variant="label" color="rgba(255,255,255,0.85)">
                    {t('results.eyebrow')}
                  </Text>
                  <Text style={styles.big}>{percentLabel(pct, t)}</Text>
                  <Text variant="heading">{verdict}</Text>
                  <View style={styles.heroStats}>
                    <HeroStat
                      icon="checkmark-circle"
                      value={`${attempt.score}/${attempt.total}`}
                      label={t('results.correct')}
                    />
                    <HeroStat
                      icon="time"
                      value={`${Math.floor(attempt.seconds / 60)}:${String(attempt.seconds % 60).padStart(2, '0')}`}
                      label={t('results.time')}
                    />
                    <HeroStat
                      icon="flash"
                      value={t('results.xpValue', { value: formatNumber(10 + attempt.score * 10) })}
                      label={t('results.xp')}
                    />
                  </View>
                </LinearGradient>
              </Animated.View>

              {previous && (
                <Card style={styles.compare}>
                  <Ionicons
                    name={pct >= previous.score / previous.total ? 'trending-up' : 'trending-down'}
                    size={20}
                    color={pct >= previous.score / previous.total ? Colors.success : Colors.reward}
                  />
                  <Text variant="small" style={{ flex: 1 }}>
                    {t(
                      pct > previous.score / previous.total
                        ? 'results.lastImproving'
                        : pct === previous.score / previous.total
                          ? 'results.lastSame'
                          : 'results.lastWorse',
                      { percent: Math.round((previous.score / previous.total) * 100) },
                    )}
                  </Text>
                </Card>
              )}

              <Text variant="heading">{t('results.byConcept')}</Text>
              <Card style={{ gap: Spacing.md }}>
                {[...concepts.entries()].map(([c, v]) => (
                  <View key={c} style={{ gap: 6 }}>
                    <View style={styles.rowBetween}>
                      <Text variant="small" style={{ flex: 1 }} numberOfLines={1}>
                        {c}
                      </Text>
                      <Text variant="small" color={v.right === v.total ? Colors.success : Colors.reward}>
                        {v.right}/{v.total}
                      </Text>
                    </View>
                    <ProgressBar
                      progress={v.right / v.total}
                      height={6}
                      colors={v.right === v.total ? Gradients.mastery : Gradients.streak}
                    />
                  </View>
                ))}
              </Card>
            </AuthScreen>
            {pct >= 0.8 && <Celebration />}
          </View>
        );
      }}
    </ReadyMaterial>
  );
}

function HeroStat({ icon, value, label }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <Ionicons name={icon} size={16} color="rgba(255,255,255,0.9)" />
      <Text variant="bodyStrong">{value}</Text>
      <Text variant="small" color="rgba(255,255,255,0.8)" style={{ fontSize: 11 }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: Radius.xl, padding: Spacing.lg, alignItems: 'center', gap: Spacing.xs },
  big: { fontFamily: 'Manrope_800ExtraBold', fontSize: 64, lineHeight: 72, color: Colors.textOnAccent },
  heroStats: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    marginTop: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
  },
  compare: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.sm },
});
