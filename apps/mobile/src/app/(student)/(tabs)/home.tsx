import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from '@/components/ui/gradient';
import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { LessonCard } from '@/components/content/lesson-card';
import { MaterialCard } from '@/components/materials/material-card';
import { Rail } from '@/components/content/rail';
import { Card, IconButton, ProgressBar, Screen, SectionHeader, StatPill, Text } from '@/components/ui';
import { CoursesRail } from '@/components/courses/courses-rail';
import { VideosBanner } from '@/components/videos/videos-banner';
import { Colors, Gradients, Palette, Radius, Spacing } from '@/constants/theme';
import { getLesson, matchSubject, subjectName, trending, LESSONS } from '@/lib/catalog';
import { buildPlan } from '@/lib/learning-plan';
import { useLibrary } from '@/lib/library-store';
import { useMaterials } from '@/lib/studio/store';
import { reasonText, recommend } from '@/lib/recommend';
import { useActivity } from '@/lib/rewards/activity';
import { useSession } from '@/lib/session';

/** The dashboard's quick actions. */
const QUICK: {
  id: 'rooms' | 'flashcards' | 'videos' | 'challenges' | 'tutor';
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  colors: readonly [string, string];
  href: string;
}[] = [
  { id: 'rooms', icon: 'account-group', colors: ['#9B6BFF', '#6A45FF'], href: '/rooms' },
  { id: 'flashcards', icon: 'play-circle', colors: ['#FF6FB5', '#E0459A'], href: '/reels' },
  { id: 'videos', icon: 'video', colors: ['#3BA9FF', '#1F6FE5'], href: '/videos' },
  { id: 'challenges', icon: 'trophy', colors: ['#FFB547', '#FF8A1F'], href: '/world/daily' },
  { id: 'tutor', icon: 'robot-happy', colors: ['#3DDCB0', '#14A88E'], href: '/tutor' },
];

function greetingKey() {
  const h = new Date().getHours();
  if (h < 12) return 'greeting.morning' as const;
  if (h < 17) return 'greeting.afternoon' as const;
  return 'greeting.evening' as const;
}

export default function HomeScreen() {
  const { user, refresh } = useSession();
  const { t } = useTranslation('home');
  const { t: tPlan } = useTranslation('personalize');
  const { t: tExams } = useTranslation('exams');
  const [now] = useState(() => Date.now());
  const { current: streak } = useActivity(now);
  const lib = useLibrary();
  const { materials: packs } = useMaterials();

  const { refreshNotifications } = lib;
  useFocusEffect(
    useCallback(() => {
      refresh();
      refreshNotifications();
    }, [refresh, refreshNotifications]),
  );

  const unread = lib.unreadCount;
  const inProgress = lib.recent
    .map((r) => getLesson(r.id))
    .filter((l): l is NonNullable<typeof l> => !!l && (lib.progress[l.id] ?? 0) > 0 && (lib.progress[l.id] ?? 0) < 1);
  const recs = useMemo(() => recommend(lib.personalization, lib.progress, 8), [lib.personalization, lib.progress]);

  // Today's slot from the personal plan, matched to a catalogue lesson for that subject.
  const today = useMemo(() => {
    if (!lib.personalization) return null;
    const plan = buildPlan(lib.personalization, tPlan);
    const day = plan.days[(new Date().getDay() + 6) % 7];
    const subjectId = day.subject ? matchSubject(day.subject)?.id : undefined;
    const lesson = LESSONS.find((l) => l.subjectId === subjectId && (lib.progress[l.id] ?? 0) < 1);
    return { day, lesson };
  }, [lib.personalization, lib.progress, tPlan]);

  if (!user) return null;
  const todayLesson = today?.lesson;
  const focusSubject = today?.day.subject ? matchSubject(today.day.subject) : undefined;
  const focus = focusSubject ? subjectName(focusSubject, t) : (today?.day.focus ?? '');
  const goal = Math.min(1, user.todayMinutes / user.dailyGoalMinutes);

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.navigate('/profile')}
          accessibilityRole="button"
          accessibilityLabel={t('tabs.profile', { ns: 'common' })}>
          <LinearGradient colors={Gradients.aiGlow} style={styles.avatar}>
            <Text variant="heading">{user.name.charAt(0).toUpperCase()}</Text>
          </LinearGradient>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text variant="small" color={Colors.textSecondary}>
            {t(greetingKey())}
          </Text>
          <Text variant="title" numberOfLines={1}>
            {user.name}
          </Text>
        </View>
        <IconButton
          icon="search"
          label={t('actions.search', { ns: 'common' })}
          onPress={() => router.push('/search')}
        />
        <IconButton
          icon="notifications"
          label={t('home.notifications', { count: unread })}
          badge={unread}
          onPress={() => router.push('/notifications')}
        />
      </View>

      {user.restriction?.kind === 'restricted' && (
        <Pressable onPress={() => router.push('/account-status')} accessibilityRole="button">
          <Card style={styles.restricted}>
            <Ionicons name="alert-circle" size={22} color={Colors.reward} />
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">{t('home.restrictedTitle')}</Text>
              <Text variant="small" color={Colors.textSecondary}>
                {t('home.restrictedBody')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </Card>
        </Pressable>
      )}

      {/* Daily goal, streak and level */}
      <LinearGradient
        colors={['#F1ECFF', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.goalCard}>
        <View style={styles.rowBetween}>
          <View style={{ gap: 2 }}>
            <Text variant="label" color={Colors.textSecondary}>
              {t('home.todaysGoal')}
            </Text>
            <Text variant="title">
              <Trans
                t={t}
                i18nKey="home.goalProgress"
                values={{ done: user.todayMinutes, goal: user.dailyGoalMinutes }}
                components={{ muted: <Text variant="heading" color={Colors.textSecondary} /> }}
              />
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: Spacing.xs }}>
            <Pressable
              onPress={() => router.push('/rewards/streak')}
              accessibilityRole="button"
              accessibilityLabel={t('home.streakCalendar')}>
              <StatPill
                icon="flame"
                value={streak}
                color={Colors.danger}
                label={t('home.dayStreak', { count: streak })}
              />
            </Pressable>
            <Pressable
              onPress={() => router.push('/rewards')}
              accessibilityRole="button"
              accessibilityLabel={t('home.rewards')}>
              <StatPill
                icon="ellipse"
                value={user.coins}
                color={Colors.reward}
                label={t('home.coins', { count: user.coins })}
              />
            </Pressable>
          </View>
        </View>
        <ProgressBar progress={goal} height={10} />
        <View style={styles.rowBetween}>
          <Text variant="small" color={Colors.textSecondary}>
            {t('home.levelXp', { level: user.level, xp: user.xp })}
          </Text>
          <Text variant="small" color={goal >= 1 ? Colors.success : Colors.textSecondary}>
            {goal >= 1
              ? t('home.goalComplete')
              : t('home.minutesToGo', { count: Math.max(0, user.dailyGoalMinutes - user.todayMinutes) })}
          </Text>
        </View>
      </LinearGradient>

      {/* Quick actions */}
      <View style={styles.quick}>
        {QUICK.map((q) => (
          <Pressable
            key={q.id}
            onPress={() => router.push(q.href as Href)}
            accessibilityRole="button"
            accessibilityLabel={`${t(`home.quickActions.${q.id}.title`)}. ${t(`home.quickActions.${q.id}.body`)}`}
            style={({ pressed }) => [styles.quickItem, pressed && { transform: [{ scale: 0.96 }] }]}>
            <LinearGradient colors={q.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.quickIcon}>
              <MaterialCommunityIcons name={q.icon} size={28} color="#fff" />
            </LinearGradient>
            <Text variant="small" center numberOfLines={1} style={{ fontFamily: 'Manrope_700Bold', fontSize: 13 }}>
              {t(`home.quickActions.${q.id}.title`)}
            </Text>
            <Text
              variant="small"
              center
              numberOfLines={1}
              color={Colors.textMuted}
              style={{ fontSize: 11, lineHeight: 14 }}>
              {t(`home.quickActions.${q.id}.body`)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Past Questions: JAMB, WAEC and NECO */}
      <Pressable
        onPress={() => router.push('/exams' as Href)}
        accessibilityRole="button"
        accessibilityLabel={`${tExams('card.title')}. ${tExams('card.body')}`}>
        {({ pressed }) => (
          <LinearGradient
            colors={['#0E7C66', '#0B4F6C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.exams, { transform: [{ scale: pressed ? 0.98 : 1 }] }]}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text variant="label" color="#9FF5D9">
                {tExams('card.eyebrow')}
              </Text>
              <Text variant="heading">{tExams('card.title')}</Text>
              <Text variant="small" color="rgba(255,255,255,0.85)">
                {tExams('card.body')}
              </Text>
              <View style={styles.examChips}>
                {(['JAMB', 'WAEC', 'NECO'] as const).map((name) => (
                  <View key={name} style={styles.examChip}>
                    <Text variant="small" style={{ fontFamily: 'Manrope_800ExtraBold' }} color="#fff">
                      {name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.examIcon}>
              <Ionicons name="school" size={30} color="#0E7C66" />
            </View>
          </LinearGradient>
        )}
      </Pressable>

      {/* Today in your plan */}
      {today && todayLesson && (
        <Pressable onPress={() => router.push(`/lesson/${todayLesson.id}`)} accessibilityRole="button">
          {({ pressed }) => (
            <LinearGradient
              colors={Gradients.ai}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.today, { transform: [{ scale: pressed ? 0.98 : 1 }] }]}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text variant="label" color="rgba(255,255,255,0.85)">
                  {t('home.todayInPlan', { focus: focus.toUpperCase() })}
                </Text>
                <Text variant="heading">{todayLesson.title}</Text>
                <Text variant="small" color="rgba(255,255,255,0.85)">
                  {t('home.todayActivity', { activity: today.day.activity, minutes: todayLesson.minutes })}
                </Text>
              </View>
              <View style={styles.play}>
                <Ionicons name="play" size={22} color={Palette.purple600} style={{ marginLeft: 3 }} />
              </View>
            </LinearGradient>
          )}
        </Pressable>
      )}

      {/* AI tutor entry */}
      <Pressable
        onPress={() => router.push('/tutor')}
        accessibilityRole="button"
        accessibilityLabel={t('home.askTutor')}>
        <Card style={styles.tutor}>
          <View style={styles.tutorIcon}>
            <Ionicons name="chatbubble-ellipses" size={22} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="bodyStrong">{t('home.stuckTitle')}</Text>
            <Text variant="small" color={Colors.textSecondary}>
              {t('home.stuckBody')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </Card>
      </Pressable>

      <VideosBanner />

      {/* Library shortcuts */}
      <View style={styles.shortcuts}>
        <Shortcut
          icon="bookmark"
          color={Palette.gold400}
          label={t('home.saved')}
          count={lib.saved.length}
          onPress={() => router.push('/saved')}
        />
        <Shortcut
          icon="time"
          color={Palette.sky400}
          label={t('home.recent')}
          count={lib.recent.length}
          onPress={() => router.push('/recent')}
        />
        <Shortcut
          icon="layers"
          color={Palette.teal400}
          label={t('home.studyPacks')}
          count={packs.length}
          onPress={() => router.push('/study/library')}
        />
      </View>

      {inProgress.length > 0 && (
        <Rail title={t('home.continueLearning')} onSeeAll={() => router.push('/continue')}>
          {inProgress.map((l) => (
            <LessonCard key={l.id} lesson={l} variant="tile" progress={lib.progress[l.id]} />
          ))}
        </Rail>
      )}

      <CoursesRail />

      <Rail title={t('home.recommended')} onSeeAll={() => router.push('/recommended')}>
        {recs.map((r) => (
          <LessonCard key={r.lesson.id} lesson={r.lesson} variant="tile" reason={reasonText(r.reason, t)} />
        ))}
      </Rail>

      <View style={{ gap: Spacing.xs }}>
        <SectionHeader
          title={t('home.trending')}
          action={t('actions.seeAll', { ns: 'common' })}
          onAction={() => router.push('/trending')}
        />
        {trending(undefined, 3).map((l, i) => (
          <LessonCard key={l.id} lesson={l} rank={i + 1} />
        ))}
      </View>

      {packs.length > 0 && (
        <View style={{ gap: Spacing.sm }}>
          <SectionHeader
            title={t('home.yourPacks')}
            action={t('actions.seeAll', { ns: 'common' })}
            onAction={() => router.push('/study/library')}
          />
          {packs.slice(0, 3).map((m) => (
            <MaterialCard key={m.id} m={m} />
          ))}
        </View>
      )}
    </Screen>
  );
}

function Shortcut({
  icon,
  color,
  label,
  count,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  label: string;
  count: number;
  onPress: () => void;
}) {
  const { t } = useTranslation('home');
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('home.shortcutLabel', { label, count })}
      style={({ pressed }) => [styles.shortcut, { transform: [{ scale: pressed ? 0.96 : 1 }] }]}>
      <Ionicons name={icon} size={20} color={color} />
      <Text variant="small" style={{ fontFamily: 'Manrope_600SemiBold' }}>
        {label}
      </Text>
      <Text variant="small" color={Colors.textMuted}>
        {count}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  quick: { flexDirection: 'row', justifyContent: 'space-between', gap: 4 },
  quickItem: { flex: 1, alignItems: 'center', gap: 2 },
  quickIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    boxShadow: '0 6px 14px rgba(124, 92, 255, 0.22)',
  },
  exams: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg, borderRadius: Radius.lg },
  examChips: { flexDirection: 'row', gap: 6, marginTop: 4 },
  examChip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  examIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  restricted: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderColor: Colors.reward + '88' },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  goalCard: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  today: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    shadowColor: Colors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  play: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcuts: { flexDirection: 'row', gap: Spacing.sm },
  tutor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderColor: Colors.primary + '55',
  },
  tutorIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcut: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pack: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  packIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
