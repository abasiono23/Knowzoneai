import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth/auth-screen';
import { ReadyMaterial } from '@/components/materials/ready-material';
import { Button, Card, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { fromParams, pickQuestions, SECONDS_PER_QUESTION, toParams } from '@/lib/studio/quiz';

/** Screen 78: the generated quiz: what's in it before you start. */
export default function GeneratedQuizScreen() {
  const { t } = useTranslation('study');
  const params = useLocalSearchParams<Record<string, string>>();
  const { settings, seed } = fromParams(params);
  return (
    <ReadyMaterial>
      {(m) => {
        const qs = pickQuestions(m.content.quiz, settings, seed);
        const concepts = [...new Set(qs.map((q) => q.concept))];
        const minutes = Math.max(1, Math.round((qs.length * (settings.timed ? SECONDS_PER_QUESTION : 40)) / 60));
        return (
          <AuthScreen
            title={t('quiz.title')}
            subtitle={t(settings.timed ? 'quiz.subtitleTimed' : 'quiz.subtitle', { count: qs.length, minutes })}
            footer={
              <>
                <Button
                  title={t('quiz.start')}
                  icon="play"
                  onPress={() =>
                    router.replace({ pathname: '/study/[id]/play', params: { id: m.id, ...toParams(settings, seed) } })
                  }
                />
                <Button variant="ghost" title={t('quiz.changeSettings')} onPress={() => router.back()} />
              </>
            }>
            <View style={styles.stats}>
              <Stat icon="list" value={`${qs.filter((q) => q.type === 'mcq').length}`} label={t('quiz.statMcq')} />
              <Stat
                icon="swap-horizontal"
                value={`${qs.filter((q) => q.type === 'tf').length}`}
                label={t('quiz.statTf')}
              />
              <Stat
                icon={settings.timed ? 'timer' : 'infinite'}
                value={settings.timed ? t('quiz.seconds', { count: SECONDS_PER_QUESTION }) : t('quiz.off')}
                label={t('quiz.timer')}
              />
            </View>
            <Text variant="heading">{t('quiz.covers')}</Text>
            <View style={styles.chips}>
              {concepts.map((c) => (
                <View key={c} style={styles.chip}>
                  <Text variant="small">{c}</Text>
                </View>
              ))}
            </View>
            <Text variant="heading">{t('shared.questions')}</Text>
            {qs.map((q, i) => (
              <Animated.View key={q.id} entering={FadeInDown.delay(i * 40)}>
                <Card style={styles.row}>
                  <Text variant="label" color={Colors.textMuted}>
                    {i + 1}
                  </Text>
                  <Text variant="small" style={{ flex: 1 }} numberOfLines={2}>
                    {q.question}
                  </Text>
                </Card>
              </Animated.View>
            ))}
          </AuthScreen>
        );
      }}
    </ReadyMaterial>
  );
}

function Stat({ icon, value, label }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string }) {
  return (
    <Card style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <Ionicons name={icon} size={18} color={Colors.primary} />
      <Text variant="heading">{value}</Text>
      <Text variant="small" color={Colors.textSecondary} center style={{ fontSize: 11 }}>
        {label}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: Spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.pill, backgroundColor: Colors.primarySoft },
  row: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', paddingVertical: Spacing.sm },
});
