import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ChoiceChip, ChipWrap } from '@/components/personalize/choice-chip';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { api } from '@/lib/api';
import {
  DAILY_TARGETS,
  EMPTY_PROFILE,
  EXAMS,
  GOALS,
  learnerKey,
  NO_EXAM,
  subjectCatalog,
  subjectLabel,
  upcomingMonths,
  type Personalization,
} from '@/lib/personalization';
import { useSession } from '@/lib/session';

/** Screen 185: learning goals: daily target, exams, subjects and what you want from Knowzone. */
export default function LearningGoalsScreen() {
  const { setUser } = useSession();
  const { t } = useTranslation('settings');
  const [saved, setSaved] = useState<Personalization | null>(null);
  const [draft, setDraft] = useState<Personalization | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    api
      .getPersonalization()
      .then(({ personalization }) => {
        const p = { ...EMPTY_PROFILE, dailyMinutes: 15, ...(personalization ?? {}) };
        setSaved(p);
        setDraft(p);
      })
      .catch(() => {
        const p = { ...EMPTY_PROFILE, dailyMinutes: 15 };
        setSaved(p);
        setDraft(p);
      });
  }, []);

  if (!draft || !saved)
    return (
      <Screen withTabBar={false}>
        <ScreenHeader eyebrow={t('me.eyebrow')} title={t('goals.title')} />
      </Screen>
    );
  const set = (patch: Partial<Personalization>) => {
    setMsg(null);
    setDraft({ ...draft, ...patch });
  };
  const toggle = (key: 'examGoals' | 'subjects' | 'goals', id: string) =>
    set({
      [key]: draft[key].includes(id) ? draft[key].filter((x) => x !== id) : [...draft[key], id],
    } as Partial<Personalization>);
  const exams = EXAMS[learnerKey(draft.learnerType)];
  const { suggested } = subjectCatalog(draft.track);
  const subjects = [...new Set([...draft.subjects, ...suggested])];
  const changed = JSON.stringify(draft) !== JSON.stringify(saved);
  const examMonth = draft.examMonth ? new Date(draft.examMonth + '-01T12:00:00') : null;
  const weeksLeft = examMonth ? Math.max(0, Math.round((examMonth.getTime() - now) / (7 * 86400000))) : null;
  const hasExam = draft.examGoals.some((e) => e !== NO_EXAM);

  const save = async () => {
    setBusy(true);
    try {
      const { user } = await api.savePersonalization(draft);
      setUser(user);
      setSaved(draft);
      setMsg({ ok: true, text: t('goals.saved') });
    } catch (e) {
      setMsg({ ok: false, text: errorText(e, t('goals.saveError')) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('me.eyebrow')} title={t('goals.title')} />
      <View style={{ gap: Spacing.sm }}>
        <Text variant="heading">{t('goals.dailyTarget')}</Text>
        <View style={styles.targets}>
          {DAILY_TARGETS.map((d) => (
            <Pressable
              key={d.minutes}
              onPress={() => set({ dailyMinutes: d.minutes })}
              accessibilityRole="radio"
              accessibilityState={{ selected: draft.dailyMinutes === d.minutes }}
              accessibilityLabel={t('goals.targetA11y', { count: d.minutes, label: d.label })}
              style={[styles.target, draft.dailyMinutes === d.minutes && styles.targetOn]}>
              <Text style={{ fontSize: 22 }}>{d.emoji}</Text>
              <Text variant="bodyStrong">{d.minutes}</Text>
              <Text variant="small" color={Colors.textMuted} style={{ fontSize: 11 }}>
                {t('goals.min')}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text variant="small" color={Colors.textSecondary}>
          {DAILY_TARGETS.find((d) => d.minutes === draft.dailyMinutes)?.description}
        </Text>
      </View>

      <View style={{ gap: Spacing.sm }}>
        <Text variant="heading">{t('goals.exams')}</Text>
        <ChipWrap>
          {exams.map((e) => (
            <ChoiceChip
              key={e.id}
              label={e.label}
              selected={draft.examGoals.includes(e.id)}
              onPress={() => toggle('examGoals', e.id)}
            />
          ))}
        </ChipWrap>
        {hasExam && (
          <>
            <Text variant="small" color={Colors.textSecondary}>
              {t('goals.whenExam')}
            </Text>
            <ChipWrap>
              {upcomingMonths(12).map((m) => (
                <ChoiceChip
                  key={m.id}
                  label={m.label}
                  selected={draft.examMonth === m.id}
                  onPress={() => set({ examMonth: m.id })}
                />
              ))}
            </ChipWrap>
            {weeksLeft !== null && (
              <Card style={styles.countdown}>
                <Text style={{ fontSize: 28 }}>⏳</Text>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyStrong">{t('goals.weeksToGo', { count: weeksLeft })}</Text>
                  <Text variant="small" color={Colors.textSecondary}>
                    {t('goals.addsUp', {
                      minutes: draft.dailyMinutes,
                      count: Math.round((weeksLeft * 7 * draft.dailyMinutes) / 60),
                    })}
                  </Text>
                </View>
              </Card>
            )}
          </>
        )}
      </View>

      <View style={{ gap: Spacing.sm }}>
        <Text variant="heading">{t('goals.subjects')}</Text>
        <ChipWrap>
          {subjects.map((s) => (
            <ChoiceChip
              key={s}
              label={subjectLabel(s)}
              selected={draft.subjects.includes(s)}
              onPress={() => toggle('subjects', s)}
            />
          ))}
        </ChipWrap>
      </View>

      <View style={{ gap: Spacing.sm }}>
        <Text variant="heading">{t('goals.wants')}</Text>
        <ChipWrap>
          {GOALS.map((g) => (
            <ChoiceChip
              key={g.id}
              label={g.label}
              selected={draft.goals.includes(g.id)}
              onPress={() => toggle('goals', g.id)}
            />
          ))}
        </ChipWrap>
      </View>

      {msg && (
        <Text variant="small" color={msg.ok ? Colors.success : Colors.danger} center>
          {msg.text}
        </Text>
      )}
      <Button title={t('goals.save')} icon="checkmark" loading={busy} disabled={!changed} onPress={save} />
      <Button
        variant="ghost"
        icon="alarm-outline"
        title={t('home.reminders')}
        onPress={() => router.push('/settings/reminders')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  targets: { flexDirection: 'row', gap: Spacing.xs },
  target: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  targetOn: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
  countdown: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderColor: Colors.reward + '55' },
});
