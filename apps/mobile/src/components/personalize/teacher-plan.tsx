import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from '@/components/ui/gradient';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth/auth-screen';
import { Button, Card, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { subjectLabel, TEACHER_GOALS, TEACH_LEVELS, type Personalization } from '@/lib/personalization';

type ToolId = 'assign' | 'gaps' | 'materials' | 'exam-ready' | 'grading' | 'parents';

const TOOL_ICONS: Record<ToolId, keyof typeof Ionicons.glyphMap> = {
  assign: 'paper-plane',
  gaps: 'analytics',
  materials: 'sparkles',
  'exam-ready': 'trophy',
  grading: 'time',
  parents: 'people',
};
const isTool = (id: string): id is ToolId => id in TOOL_ICONS;

const WEEK_ONE = ['share', 'assign', 'gaps', 'reteach'] as const;

/** Screen 31 for educators: their teaching workspace instead of a study plan. */
export function TeacherPlan({ profile }: { profile: Personalization }) {
  const { t } = useTranslation('personalize');
  const tools = (profile.teacherGoals.length ? profile.teacherGoals : ['assign', 'gaps', 'materials'])
    .filter(isTool)
    .map((g) => ({
      id: g,
      icon: TOOL_ICONS[g],
      title: t(`teacherPlan.tools.${g}.title`),
      body: t(`teacherPlan.tools.${g}.body`),
    }));
  const levels = TEACH_LEVELS.filter((l) => profile.teachLevels.includes(l.id)).map((l) => l.label);

  return (
    <AuthScreen
      back={false}
      backdrop="hero"
      hero={
        <Text variant="label" color={Colors.reward}>
          {t('teacherPlan.eyebrow')}
        </Text>
      }
      title={t('teacherPlan.title')}
      footer={
        <>
          <Button title={t('plan.letsGo')} icon="rocket" onPress={() => router.push('/personalize/start')} />
          <Button variant="ghost" title={t('plan.adjust')} onPress={() => router.back()} />
        </>
      }>
      <Animated.View entering={FadeInDown.duration(400)}>
        <LinearGradient
          colors={['#FF9F43', '#7C5CFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.classCard}>
          <Text variant="label" color="rgba(255,255,255,0.85)">
            {profile.firstClass ? t('teacherPlan.firstClass') : t('teacherPlan.classes')}
          </Text>
          <Text variant="title">{profile.firstClass?.name || t('teacherPlan.noClass')}</Text>
          <Text variant="small" color="rgba(255,255,255,0.9)">
            {[profile.firstClass?.subject && subjectLabel(profile.firstClass.subject), levels.join(', ')]
              .filter(Boolean)
              .join(' · ')}
          </Text>
          {profile.firstClass && (
            <View style={styles.codeHint}>
              <Ionicons name="key" size={14} color={Colors.text} />
              <Text variant="small">{t('teacherPlan.joinCodeNext')}</Text>
            </View>
          )}
        </LinearGradient>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).duration(400)} style={{ gap: Spacing.sm }}>
        <Text variant="heading">{t('teacherPlan.toolkit')}</Text>
        {tools.map((tool) => (
          <Card key={tool.id} style={styles.tool}>
            <View style={styles.toolIcon}>
              <Ionicons name={tool.icon} size={20} color="#FF9F43" />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">{tool.title}</Text>
              <Text variant="small" color={Colors.textSecondary}>
                {tool.body}
              </Text>
            </View>
          </Card>
        ))}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(240).duration(400)} style={{ gap: Spacing.sm }}>
        <Text variant="heading">{t('teacherPlan.firstWeek')}</Text>
        {WEEK_ONE.map((step, i) => (
          <View key={step} style={styles.step}>
            <View style={styles.stepDot}>
              <Text variant="label" color={Colors.onBright}>
                {i + 1}
              </Text>
            </View>
            <Text style={{ flex: 1 }}>{t(`teacherPlan.weekOne.${step}`)}</Text>
          </View>
        ))}
      </Animated.View>

      <Text variant="small" color={Colors.textMuted} center>
        {t('teacherPlan.priorities', {
          list:
            profile.teacherGoals.map((g) => TEACHER_GOALS.find((x) => x.id === g)?.label).join(' · ') || t('notSet'),
        })}
      </Text>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  classCard: { borderRadius: Radius.lg, padding: Spacing.md, gap: 4 },
  codeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.22)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  tool: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  toolIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: '#FF9F4322',
    alignItems: 'center',
    justifyContent: 'center',
  },
  step: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.reward,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
