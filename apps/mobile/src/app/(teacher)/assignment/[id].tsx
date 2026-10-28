import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from '@/components/ui/gradient';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { Card, ProgressBar, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { formatNumber } from '@/i18n';
import { relativeDue, teacherApi, type AssignmentReport } from '@/lib/teacher';

const pct = (n: number) => formatNumber(n, { style: 'percent', maximumFractionDigits: 0 });
const scoreColor = (s: number) => (s >= 0.75 ? Colors.success : s >= 0.5 ? Colors.reward : Colors.danger);

export default function AssignmentReportScreen() {
  const { t } = useTranslation('teacher');
  const { id } = useLocalSearchParams<{ id: string }>();
  const [a, setA] = useState<AssignmentReport | null>(null);

  useFocusEffect(
    useCallback(() => {
      teacherApi
        .assignment(id)
        .then((r) => setA(r.assignment))
        .catch(() => {});
    }, [id]),
  );

  if (!a) {
    return (
      <Screen withTabBar={false}>
        <ScreenHeader />
        <ActivityIndicator color={Colors.primary} />
      </Screen>
    );
  }

  const missing = a.results.filter((r) => r.score === null);

  return (
    <Screen withTabBar={false}>
      <ScreenHeader
        eyebrow={t('report.eyebrow', { className: a.className, due: relativeDue(a.dueAt) }).toUpperCase()}
        title={a.title}
      />

      <LinearGradient colors={Gradients.ai} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <Big
          value={t('dashboard.submittedCount', { submitted: formatNumber(a.submitted), total: formatNumber(a.total) })}
          label={t('report.submitted')}
        />
        <View style={styles.vr} />
        <Big value={a.avgScore === null ? '—' : pct(a.avgScore)} label={t('report.averageScore')} />
        <View style={styles.vr} />
        <Big value={formatNumber(a.questionCount)} label={t('report.questions')} />
      </LinearGradient>

      {a.submitted === 0 ? (
        <Card style={{ gap: Spacing.xs }}>
          <Text variant="bodyStrong">{t('report.waitingTitle')}</Text>
          <Text variant="small" color={Colors.textSecondary}>
            {t('report.waitingBody', { className: a.className })}
          </Text>
        </Card>
      ) : (
        <>
          <Card style={styles.reteach}>
            <View style={styles.reteachIcon}>
              <Ionicons name="sparkles" size={18} color={Colors.textOnAccent} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="label" color={Colors.primary}>
                {t('report.tip')}
              </Text>
              <Text variant="small">{a.reteach}</Text>
            </View>
          </Card>

          <Text variant="heading">{t('report.breakdown')}</Text>
          <Card style={{ gap: Spacing.md }}>
            {a.questions.map((q) => (
              <View key={q.question} style={{ gap: 6 }}>
                <View style={styles.rowBetween}>
                  <Text variant="small" style={{ flex: 1 }}>
                    {q.question}
                  </Text>
                  <Text variant="bodyStrong" color={scoreColor(q.correctRate)}>
                    {pct(q.correctRate)}
                  </Text>
                </View>
                <ProgressBar
                  progress={q.correctRate}
                  height={6}
                  colors={q.correctRate >= 0.6 ? Gradients.mastery : Gradients.streak}
                />
                {q.correctRate < 0.6 && (
                  <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
                    {t('report.commonMistake', { mistake: q.commonWrong })}
                  </Text>
                )}
              </View>
            ))}
          </Card>
        </>
      )}

      <View style={styles.rowBetween}>
        <Text variant="heading">{t('report.students')}</Text>
        {missing.length > 0 && (
          <Pressable
            onPress={() => Alert.alert(t('report.reminderTitle'), t('report.reminderBody', { count: missing.length }))}
            accessibilityRole="button"
            style={styles.nudge}>
            <Ionicons name="notifications" size={14} color={Colors.primary} />
            <Text variant="small" color={Colors.primary}>
              {t('report.remind', { n: formatNumber(missing.length) })}
            </Text>
          </Pressable>
        )}
      </View>
      <Card style={{ padding: 0 }}>
        {a.results.map((r, i) => (
          <View key={r.studentId} style={[styles.result, i > 0 && styles.divider]}>
            <Text style={{ flex: 1 }}>{r.name}</Text>
            {r.score === null ? (
              <Text variant="small" color={Colors.textMuted}>
                {t('report.notSubmitted')}
              </Text>
            ) : (
              <View style={[styles.score, { backgroundColor: scoreColor(r.score) + '22' }]}>
                <Text variant="bodyStrong" color={scoreColor(r.score)}>
                  {pct(r.score)}
                </Text>
              </View>
            )}
          </View>
        ))}
      </Card>
    </Screen>
  );
}

function Big({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text variant="title">{value}</Text>
      <Text variant="small" color="rgba(255,255,255,0.85)" style={{ fontSize: 12 }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', borderRadius: Radius.lg, paddingVertical: Spacing.md },
  vr: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.25)' },
  reteach: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start', borderColor: Colors.primary },
  reteachIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.sm },
  nudge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primarySoft,
  },
  result: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  divider: { borderTopWidth: 1, borderTopColor: Colors.border },
  score: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill },
});
