import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

import { SubjectShelves } from '@/components/books/shelves';
import { Button, Card, ProgressBar, Screen, ScreenHeader, Text } from '@/components/ui';
import { LinearGradient } from '@/components/ui/gradient';
import { Colors, Fonts, Gradients, Radius, Spacing } from '@/constants/theme';
import { useFlipStyle } from '@/i18n/provider';
import {
  booksSummary,
  CLASSES,
  coursesFor,
  hasStream,
  LEVELS,
  OTHER_COURSE,
  STREAMS,
  useBooksProfile,
  type BooksProfile,
  type Level,
  type SchoolClass,
  type Stage,
  type Stream,
} from '@/lib/books';

type Step = 'stage' | 'schoolClass' | 'stream' | 'level' | 'course' | 'done';
type Draft = { stage?: Stage; schoolClass?: SchoolClass; level?: Level };

/** The questions each kind of student answers, in order. */
function stepsFor(d: Draft): Step[] {
  if (d.stage === 'secondary')
    return ['stage', 'schoolClass', ...(d.schoolClass && !hasStream(d.schoolClass) ? [] : ['stream' as const])];
  if (d.stage === 'undergraduate') return ['stage', 'level', 'course'];
  if (d.stage === 'masters') return ['stage', 'course'];
  return ['stage', 'schoolClass', 'stream'];
}

/**
 * "Check out your books": secondary students give their class and (from SS 1) science, art or
 * commercial; undergraduates their level and course; master's students their course.
 */
export default function Books() {
  const { t } = useTranslation('books');
  const tx = t as unknown as (key: string, options?: Record<string, unknown>) => string;
  const { profile, save } = useBooksProfile();
  const [chosen, setChosen] = useState<Step | null>(null);
  const [history, setHistory] = useState<Step[]>([]);
  const [draft, setDraft] = useState<Draft>({});

  if (profile === undefined)
    return (
      <Screen withTabBar={false}>
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 80 }} />
      </Screen>
    );

  // People who've answered before see their books; everyone else starts with the first question.
  const step: Step = chosen ?? (profile ? 'done' : 'stage');
  const steps = stepsFor(draft);
  const go = (next: Step) => {
    setHistory((h) => [...h, step]);
    setChosen(next);
  };
  const back = () => {
    if (!history.length || step === 'done') return router.back();
    setChosen(history.at(-1)!);
    setHistory((h) => h.slice(0, -1));
  };
  const finish = (p: BooksProfile) => {
    save(p);
    setHistory([]);
    setChosen('done');
  };

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('title').toUpperCase()} onBack={back} />

      {step !== 'done' && (
        <View style={{ gap: 8 }}>
          <Text variant="small" color={Colors.textSecondary}>
            {t('step', { n: steps.indexOf(step) + 1, total: steps.length })}
          </Text>
          <ProgressBar progress={(steps.indexOf(step) + 1) / steps.length} height={6} />
        </View>
      )}

      <Animated.View key={step} entering={FadeInRight.duration(300)} style={{ gap: Spacing.md }}>
        {step === 'stage' && (
          <>
            <Text variant="title">{t('stage.question')}</Text>
            {(['secondary', 'undergraduate', 'masters'] as const).map((s, i) => (
              <Option
                key={s}
                i={i}
                icon={s === 'secondary' ? 'school' : s === 'undergraduate' ? 'library' : 'ribbon'}
                colors={s === 'secondary' ? Gradients.reward : s === 'undergraduate' ? Gradients.ai : Gradients.mastery}
                title={t(`stage.${s}.title`)}
                body={t(`stage.${s}.body`)}
                on={draft.stage === s}
                onPress={() => {
                  setDraft({ stage: s });
                  go(s === 'secondary' ? 'schoolClass' : s === 'undergraduate' ? 'level' : 'course');
                }}
              />
            ))}
          </>
        )}

        {step === 'schoolClass' && (
          <>
            <Text variant="title">{t('schoolClass.question')}</Text>
            {(['junior', 'senior'] as const).map((group) => (
              <View key={group} style={{ gap: Spacing.sm }}>
                <Text variant="label" color={Colors.textSecondary}>
                  {t(`schoolClass.${group}`)}
                </Text>
                <View style={styles.grid}>
                  {CLASSES.filter((c) => c.startsWith(group === 'junior' ? 'jss' : 'ss')).map((c, i) => (
                    <Tile
                      key={c}
                      i={i}
                      label={t(`schoolClass.${c}`)}
                      on={draft.schoolClass === c}
                      onPress={() => {
                        setDraft((d) => ({ ...d, schoolClass: c }));
                        if (hasStream(c)) go('stream');
                        else finish({ stage: 'secondary', schoolClass: c });
                      }}
                    />
                  ))}
                </View>
              </View>
            ))}
          </>
        )}

        {step === 'stream' && (
          <>
            <Text variant="title">{t('stream.question')}</Text>
            {STREAMS.map((s, i) => (
              <Option
                key={s}
                i={i}
                icon={s === 'science' ? 'flask' : s === 'arts' ? 'color-palette' : 'briefcase'}
                colors={s === 'science' ? Gradients.mastery : s === 'arts' ? Gradients.streak : Gradients.reward}
                title={t(`stream.${s}.title`)}
                body={t(`stream.${s}.body`)}
                onPress={() => finish({ stage: 'secondary', schoolClass: draft.schoolClass!, stream: s as Stream })}
              />
            ))}
          </>
        )}

        {step === 'level' && (
          <>
            <Text variant="title">{t('level.question')}</Text>
            <View style={styles.grid}>
              {LEVELS.map((l, i) => (
                <Tile
                  key={l}
                  i={i}
                  label={t('level.option', { level: l })}
                  on={draft.level === l}
                  onPress={() => {
                    setDraft((d) => ({ ...d, level: l }));
                    go('course');
                  }}
                />
              ))}
            </View>
          </>
        )}

        {step === 'course' && (
          <CoursePicker
            stage={draft.stage === 'masters' ? 'masters' : 'undergraduate'}
            onPick={(course, otherCourse) =>
              finish(
                draft.stage === 'masters'
                  ? { stage: 'masters', course, ...(otherCourse && { otherCourse }) }
                  : { stage: 'undergraduate', level: draft.level!, course, ...(otherCourse && { otherCourse }) },
              )
            }
          />
        )}

        {step === 'done' && profile && (
          <>
            <LinearGradient colors={Gradients.ai} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.summary}>
              <Ionicons name="checkmark-circle" size={30} color="#fff" />
              <Text variant="label" color="rgba(255,255,255,0.85)">
                {t('done.title')}
              </Text>
              <Text variant="title" color="#fff">
                {booksSummary(profile, tx)}
              </Text>
            </LinearGradient>
            {profile.stage === 'secondary' ? (
              <SubjectShelves schoolClass={profile.schoolClass} stream={profile.stream} />
            ) : (
              <Card style={{ alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl }}>
                <View style={styles.bookIcon}>
                  <Ionicons name="book" size={34} color={Colors.primary} />
                </View>
                <Text variant="heading" center>
                  {t('done.soon')}
                </Text>
                <Text variant="small" color={Colors.textSecondary} center>
                  {t('done.soonBody')}
                </Text>
              </Card>
            )}
            <Button
              title={t('done.change')}
              variant="secondary"
              icon="create"
              onPress={() => {
                setDraft({});
                setHistory([]);
                setChosen('stage');
              }}
            />
          </>
        )}
      </Animated.View>
    </Screen>
  );
}

/** A big answer: icon, title and a short line. */
function Option({
  i,
  icon,
  colors,
  title,
  body,
  on,
  onPress,
}: {
  i: number;
  icon: keyof typeof Ionicons.glyphMap;
  colors: readonly [string, string];
  title: string;
  body: string;
  on?: boolean;
  onPress: () => void;
}) {
  const flip = useFlipStyle();
  return (
    <Animated.View entering={FadeInDown.delay(80 + i * 70).duration(400)}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${body}`}
        style={({ pressed }) => [styles.option, on && styles.optionOn, pressed && { transform: [{ scale: 0.98 }] }]}>
        <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.optionIcon}>
          <Ionicons name={icon} size={24} color="#fff" />
        </LinearGradient>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodyStrong">{title}</Text>
          <Text variant="small" color={Colors.textSecondary}>
            {body}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} style={flip} />
      </Pressable>
    </Animated.View>
  );
}

/** A small answer in a grid: a class or a level. */
function Tile({ i, label, on, onPress }: { i: number; label: string; on?: boolean; onPress: () => void }) {
  return (
    <Animated.View entering={FadeInDown.delay(60 + i * 50).duration(350)} style={styles.tileWrap}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [styles.tile, on && styles.optionOn, pressed && { transform: [{ scale: 0.96 }] }]}>
        <Text variant="bodyStrong" center>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

/** Every course, by faculty, with search; or type your own. A plain text field (no autofocus). */
function CoursePicker({
  stage,
  onPick,
}: {
  stage: 'undergraduate' | 'masters';
  onPick: (course: string, other?: string) => void;
}) {
  const { t } = useTranslation('books');
  const tx = t as unknown as (key: string) => string;
  const flip = useFlipStyle();
  const [q, setQ] = useState('');
  const [other, setOther] = useState<string | null>(null);
  const words = q.trim().toLowerCase();
  const faculties = coursesFor(stage)
    .map((f) => ({
      ...f,
      courses: f.courses.filter((c) => !words || tx(`courses.${c}`).toLowerCase().includes(words)),
    }))
    .filter((f) => f.courses.length);

  return (
    <>
      <Text variant="title">{t('course.question')}</Text>
      <View style={styles.search}>
        <Ionicons name="search" size={18} color={Colors.textMuted} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder={t('course.search')}
          placeholderTextColor={Colors.textMuted}
          accessibilityLabel={t('course.search')}
          style={styles.searchInput}
        />
      </View>

      {other !== null ? (
        <Card style={{ gap: Spacing.sm }}>
          <TextInput
            value={other}
            onChangeText={setOther}
            placeholder={t('course.otherPlaceholder')}
            placeholderTextColor={Colors.textMuted}
            maxLength={80}
            accessibilityLabel={t('course.otherPlaceholder')}
            style={styles.otherInput}
          />
          <Button
            title={t('course.otherSave')}
            disabled={!other.trim()}
            onPress={() => onPick(OTHER_COURSE, other.trim())}
          />
        </Card>
      ) : (
        <Pressable onPress={() => setOther(q.trim())} accessibilityRole="button" style={styles.otherRow}>
          <Ionicons name="add-circle" size={20} color={Colors.primary} />
          <Text variant="bodyStrong" color={Colors.primary} style={{ flex: 1 }}>
            {t('course.other')}
          </Text>
        </Pressable>
      )}

      {faculties.length ? (
        faculties.map((f) => (
          <View key={f.id} style={{ gap: 6 }}>
            <Text variant="label" color={Colors.textSecondary}>
              {tx(`faculties.${f.id}`)}
            </Text>
            <Card style={{ paddingVertical: 4, paddingHorizontal: 0 }}>
              {f.courses.map((c, i) => (
                <Pressable
                  key={c}
                  onPress={() => onPick(c)}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.courseRow,
                    i > 0 && styles.divider,
                    pressed && { backgroundColor: Colors.primarySoft },
                  ]}>
                  <Text variant="body" style={{ flex: 1 }}>
                    {tx(`courses.${c}`)}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} style={flip} />
                </Pressable>
              ))}
            </Card>
          </View>
        ))
      ) : (
        <Text variant="small" color={Colors.textSecondary} center>
          {t('course.none', { q: q.trim() })}
        </Text>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  optionOn: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
  optionIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  tileWrap: { width: '31%', flexGrow: 1 },
  tile: {
    paddingVertical: 18,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  searchInput: { flex: 1, minHeight: 46, color: Colors.text, fontFamily: Fonts.regular, fontSize: 15 },
  otherRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 4 },
  otherInput: {
    minHeight: 48,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontFamily: Fonts.regular,
    fontSize: 15,
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
  },
  divider: { borderTopWidth: 1, borderTopColor: Colors.border },
  summary: { gap: 6, padding: Spacing.lg, borderRadius: Radius.lg },
  bookIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primarySoft,
  },
});
