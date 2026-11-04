import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

import { CourseShelf } from '@/components/books/course-shelf';
import { SubjectShelves } from '@/components/books/shelves';
import { Button, Card, ProgressBar, Screen, ScreenHeader, Text } from '@/components/ui';
import { LinearGradient } from '@/components/ui/gradient';
import { Colors, Fonts, Gradients, Radius, Spacing, WorldGradients } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { useFlipStyle } from '@/i18n/provider';
import {
  booksApi,
  booksSummary,
  catalogueFor,
  COUNTRIES,
  COUNTRY_FLAG,
  coursesFor,
  hasLevels,
  levelName,
  LEVELS,
  OTHER_COURSE,
  STAGES,
  streamName,
  useBooksProfile,
  type BooksProfile,
  type Country,
  type SchoolLevel,
  type Stage,
} from '@/lib/books';

type Step = 'country' | 'stage' | 'level' | 'stream' | 'course' | 'done';
type Draft = { country?: Country; stage?: Stage; level?: string };
/** A country's secondary classes, from the server. */
type Classes = { catalogue: string; levels: SchoolLevel[] };

const STAGE_LOOK: Record<Stage, { icon: keyof typeof Ionicons.glyphMap; colors: readonly [string, string] }> = {
  secondary: { icon: 'school', colors: Gradients.reward },
  undergraduate: { icon: 'library', colors: Gradients.ai },
  polytechnic: { icon: 'construct', colors: Gradients.streak },
  college: { icon: 'easel', colors: WorldGradients.code },
  masters: { icon: 'ribbon', colors: Gradients.mastery },
  independent: { icon: 'compass', colors: WorldGradients.art },
};
const STREAM_LOOK: Record<string, { icon: keyof typeof Ionicons.glyphMap; colors: readonly [string, string] }> = {
  science: { icon: 'flask', colors: Gradients.mastery },
  arts: { icon: 'color-palette', colors: Gradients.streak },
  commercial: { icon: 'briefcase', colors: Gradients.reward },
};
const STREAM_COLORS = [Gradients.mastery, Gradients.streak, Gradients.reward, Gradients.ai, WorldGradients.code, WorldGradients.art];

/** The questions each kind of student answers, in order. */
function stepsFor(d: Draft, classes: Classes | null): Step[] {
  const start: Step[] = ['country', 'stage'];
  if (d.stage === 'secondary') {
    const level = classes?.levels.find((l) => l.id === d.level);
    return [...start, 'level', ...(level && level.streams.length < 2 ? [] : ['stream' as const])];
  }
  if (d.stage === 'masters' || d.stage === 'independent') return [...start, 'course'];
  return [...start, 'level', 'course'];
}

/**
 * "Check out your books": where the learner studies, then what. Secondary students give their class
 * and (where there's a choice) their stream; university, polytechnic and college students their level
 * and course; master's students and independent learners their course.
 */
export default function Books() {
  const { t } = useTranslation('books');
  const tx = t as unknown as (key: string, options?: Record<string, unknown>) => string;
  const { profile, save } = useBooksProfile();
  const [chosen, setChosen] = useState<Step | null>(null);
  const [history, setHistory] = useState<Step[]>([]);
  const [draft, setDraft] = useState<Draft>({});
  const [classes, setClasses] = useState<Classes | null>(null);
  const [classesError, setClassesError] = useState<string | null>(null);

  if (profile === undefined)
    return (
      <Screen withTabBar={false}>
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 80 }} />
      </Screen>
    );

  // People who've answered before see their books; everyone else starts with the first question.
  const step: Step = chosen ?? (profile ? 'done' : 'country');
  const steps = stepsFor(draft, classes);
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
    save({ ...p, country: draft.country });
    setHistory([]);
    setChosen('done');
  };
  const loadClasses = (country: Country) => {
    setClasses(null);
    setClassesError(null);
    booksApi
      .classes(catalogueFor(country))
      .then((r) => setClasses({ catalogue: r.country, levels: r.levels }))
      .catch((e) => setClassesError(errorText(e, t('shelf.loadFailed'))));
  };
  const level = classes?.levels.find((l) => l.id === draft.level);
  const finishSecondary = (l: SchoolLevel, stream?: { id: string; name: string }) =>
    finish({
      stage: 'secondary',
      catalogue: classes!.catalogue,
      level: l.id,
      ...(l.name && { levelName: l.name }),
      ...(stream && { stream: stream.id, streamName: stream.name }),
    });

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
        {step === 'country' && (
          <>
            <Text variant="title">{t('country.question')}</Text>
            {COUNTRIES.map((c, i) => (
              <Option
                key={c}
                i={i}
                emoji={COUNTRY_FLAG[c]}
                title={t(`country.${c}.title`)}
                body={t(`country.${c}.body`)}
                on={draft.country === c}
                onPress={() => {
                  setDraft({ country: c });
                  setClasses(null);
                  go('stage');
                }}
              />
            ))}
          </>
        )}

        {step === 'stage' && (
          <>
            <Text variant="title">{t('stage.question')}</Text>
            {STAGES.map((s, i) => (
              <Option
                key={s}
                i={i}
                icon={STAGE_LOOK[s].icon}
                colors={STAGE_LOOK[s].colors}
                title={t(`stage.${s}.title`)}
                body={t(`stage.${s}.body`)}
                on={draft.stage === s}
                onPress={() => {
                  setDraft((d) => ({ country: d.country, stage: s }));
                  if (s === 'secondary' && classes?.catalogue !== catalogueFor(draft.country!)) loadClasses(draft.country!);
                  go(s === 'masters' || s === 'independent' ? 'course' : 'level');
                }}
              />
            ))}
          </>
        )}

        {step === 'level' && draft.stage === 'secondary' && (
          <>
            <Text variant="title">{t('schoolClass.question')}</Text>
            {classesError ? (
              <View style={{ gap: Spacing.sm, alignItems: 'center' }}>
                <Text variant="small" color={Colors.textSecondary} center>
                  {classesError}
                </Text>
                <Button title={t('shelf.retry')} variant="secondary" onPress={() => loadClasses(draft.country!)} />
              </View>
            ) : !classes ? (
              <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.lg }} />
            ) : (
              <>
                {classes.catalogue === 'world' && draft.country !== 'other' && (
                  <Card style={styles.note}>
                    <Ionicons name="earth" size={20} color={Colors.primary} />
                    <Text variant="small" color={Colors.textSecondary} style={{ flex: 1 }}>
                      {t('country.notYet')}
                    </Text>
                  </Card>
                )}
                {(['lower', 'upper'] as const).map((group) => (
                  <View key={group} style={{ gap: Spacing.sm }}>
                    <Text variant="label" color={Colors.textSecondary}>
                      {t(group === 'lower' ? 'schoolClass.junior' : 'schoolClass.senior')}
                    </Text>
                    <View style={styles.grid}>
                      {classes.levels
                        .filter((l) => l.stage === group)
                        .map((l, i) => (
                          <Tile
                            key={l.id}
                            i={i}
                            label={levelName(l.id, tx, l.name)}
                            on={draft.level === l.id}
                            onPress={() => {
                              setDraft((d) => ({ ...d, level: l.id }));
                              if (l.streams.length > 1) go('stream');
                              else finishSecondary(l, l.streams[0]);
                            }}
                          />
                        ))}
                    </View>
                  </View>
                ))}
              </>
            )}
          </>
        )}

        {step === 'level' && hasLevels(draft.stage) && (
          <>
            <Text variant="title">{t('level.question')}</Text>
            <View style={styles.grid}>
              {LEVELS[draft.stage].map((l, i) => (
                <Tile
                  key={l}
                  i={i}
                  label={levelName(l, tx)}
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

        {step === 'stream' && level && (
          <>
            <Text variant="title">{t(classes?.catalogue === 'ng' ? 'stream.question' : 'stream.questionOther')}</Text>
            {level.streams.map((s, i) => (
              <Option
                key={s.id}
                i={i}
                icon={STREAM_LOOK[s.id]?.icon ?? 'git-branch'}
                colors={STREAM_LOOK[s.id]?.colors ?? STREAM_COLORS[i % STREAM_COLORS.length]!}
                title={streamName(s.id, tx, s.name)}
                body={tx(`stream.${s.id}.body`, { defaultValue: '' })}
                onPress={() => finishSecondary(level, s)}
              />
            ))}
          </>
        )}

        {step === 'course' && draft.stage && (
          <CoursePicker
            stage={draft.stage}
            onPick={(course, otherCourse) => {
              const picked = { course, ...(otherCourse && { otherCourse }) };
              const stage = draft.stage!;
              if (stage === 'masters' || stage === 'independent') finish({ stage, ...picked });
              else if (stage !== 'secondary') finish({ stage, level: draft.level!, ...picked });
            }}
          />
        )}

        {step === 'done' && profile && (
          <>
            <LinearGradient colors={Gradients.ai} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.summary}>
              <Ionicons name="checkmark-circle" size={30} color="#fff" />
              <Text variant="label" color="rgba(255,255,255,0.85)">
                {profile.country ? `${COUNTRY_FLAG[profile.country]}  ${t('done.title')}` : t('done.title')}
              </Text>
              <Text variant="title" color="#fff">
                {booksSummary(profile, tx)}
              </Text>
            </LinearGradient>
            {profile.stage === 'secondary' ? (
              <SubjectShelves catalogue={profile.catalogue} level={profile.level} stream={profile.stream} />
            ) : (
              <CourseShelf course={profile.course} stage={profile.stage} />
            )}
            <Button
              title={t('done.change')}
              variant="secondary"
              icon="create"
              onPress={() => {
                setDraft({});
                setHistory([]);
                setChosen('country');
              }}
            />
          </>
        )}
      </Animated.View>
    </Screen>
  );
}

/** A big answer: icon (or flag), title and a short line. */
function Option({
  i,
  icon,
  emoji,
  colors,
  title,
  body,
  on,
  onPress,
}: {
  i: number;
  icon?: keyof typeof Ionicons.glyphMap;
  emoji?: string;
  colors?: readonly [string, string];
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
        accessibilityLabel={body ? `${title}. ${body}` : title}
        style={({ pressed }) => [styles.option, on && styles.optionOn, pressed && { transform: [{ scale: 0.98 }] }]}>
        {emoji ? (
          <View style={[styles.optionIcon, styles.flag]}>
            <Text style={{ fontSize: 30, lineHeight: 36 }}>{emoji}</Text>
          </View>
        ) : (
          <LinearGradient colors={colors!} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.optionIcon}>
            <Ionicons name={icon!} size={24} color="#fff" />
          </LinearGradient>
        )}
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodyStrong">{title}</Text>
          {!!body && (
            <Text variant="small" color={Colors.textSecondary}>
              {body}
            </Text>
          )}
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
  stage: Stage;
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
  flag: { backgroundColor: Colors.surfaceRaised },
  note: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
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
});
