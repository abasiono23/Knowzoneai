import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';
import * as Speech from 'expo-speech';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Text } from '@/components/ui';
import { LinearGradient } from '@/components/ui/gradient';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { useLanguage } from '@/i18n/provider';
import { getLesson } from '@/lib/catalog';
import { cardMs, lessonCardsApi, lessonMedia, SPEECH_LANGUAGE, type LessonDeck } from '@/lib/lesson-cards';
import { useLibrary } from '@/lib/library-store';

/** When a tap happened, read outside render (the React Compiler keeps components pure). */
const now = () => Date.now();

/**
 * A flashcard lesson: the cards one after another (a photo or illustration and the text, read aloud by
 * the phone where it has a voice for the language), moving on by themselves, then a 5-question quiz.
 * Tap the right side for the next card, the left to go back.
 */
export default function LearnScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('home');
  const lesson = getLesson(id);
  const [deck, setDeck] = useState<LessonDeck | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<'cards' | 'quiz'>('cards');

  const load = useCallback(() => {
    lessonCardsApi
      .get(id)
      .then((r) => setDeck(r.lesson))
      .catch((e) => setError(errorText(e, t('learn.loadFailed'))));
  }, [id, t]);
  useEffect(load, [load]);

  if (error)
    return (
      <View style={[styles.dark, styles.center]}>
        <Ionicons name="cloud-offline" size={36} color="#fff" />
        <Text color="#fff" center style={{ maxWidth: 300 }}>
          {error}
        </Text>
        <Button
          title={t('learn.retry')}
          onPress={() => {
            setError(null);
            load();
          }}
        />
        <Button title={t('learn.close')} variant="ghost" onPress={() => router.back()} />
      </View>
    );
  if (!deck)
    return (
      <View style={[styles.dark, styles.center]}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  return stage === 'cards' ? (
    <Cards deck={deck} title={lesson?.title ?? ''} onDone={() => setStage('quiz')} />
  ) : (
    <Quiz deck={deck} lessonId={id} onReview={() => setStage('cards')} />
  );
}

function Cards({ deck, title, onDone }: { deck: LessonDeck; title: string; onDone: () => void }) {
  const { t } = useTranslation('home');
  const { language } = useLanguage();
  const insets = useSafeAreaInsets();
  const [k, setK] = useState(0);
  const [paused, setPaused] = useState(false);
  const [sound, setSound] = useState(true);
  const [focused, setFocused] = useState(true);
  const card = deck.cards[k]!;
  const voice = SPEECH_LANGUAGE[language];
  const speaking = sound && !!voice;
  const total = cardMs(card, false);
  // How long this card has played, so pausing and playing again carries on where it stopped.
  const played = useRef(0);
  const started = useRef(0);
  const zoom = useSharedValue(1);
  const fill = useSharedValue(0);

  // Leaving the screen stops the card; coming back carries on.
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );

  // A new card starts from the beginning.
  useEffect(() => {
    played.current = 0;
    zoom.set(1);
    fill.set(0);
  }, [k, zoom, fill]);

  useEffect(() => {
    if (paused || !focused) return;
    const left = Math.max(0, total - played.current);
    started.current = now();
    zoom.set(withTiming(1.1, { duration: left, easing: Easing.linear }));
    fill.set(withTiming(1, { duration: left, easing: Easing.linear }));
    let moved = false;
    const next = () => {
      if (moved) return;
      moved = true;
      if (k + 1 < deck.cards.length) setK(k + 1);
      else onDone();
    };
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (speaking) {
      // Move on once the card has had its reading time and the voice has finished, whichever is later.
      let readDone = false;
      let spoken = false;
      const finish = () => {
        spoken = true;
        if (readDone) next();
      };
      try {
        Speech.speak(card.text, { language: voice, onDone: finish, onError: finish });
      } catch {
        spoken = true;
      }
      timers.push(
        setTimeout(() => {
          readDone = true;
          if (spoken) next();
        }, left),
      );
      // Some devices never report the end of speech: don't get stuck.
      timers.push(setTimeout(next, left + 20000));
    } else timers.push(setTimeout(next, left));
    return () => {
      timers.forEach(clearTimeout);
      played.current += now() - started.current;
      Speech.stop();
    };
  }, [k, paused, focused, speaking, voice, total, card, deck.cards.length, onDone, zoom, fill]);

  const zoomStyle = useAnimatedStyle(() => ({ transform: [{ scale: zoom.get() }] }));
  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.get() * 100}%` }));
  const go = (n: number) => {
    if (n >= deck.cards.length) return onDone();
    setK(Math.max(0, n));
  };

  return (
    <View style={styles.dark}>
      <Animated.View key={k} entering={FadeIn.duration(350)} style={StyleSheet.absoluteFill}>
        {card.credit ? (
          // A photo fills the screen.
          <Animated.View style={[StyleSheet.absoluteFill, zoomStyle]}>
            <Image
              source={{ uri: lessonMedia(card.image) }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              accessible={false}
            />
          </Animated.View>
        ) : (
          // A drawn illustration (a diagram or a worked example) is shown whole, below the header.
          <Image
            source={{ uri: lessonMedia(card.image) }}
            style={[styles.illustration, { top: insets.top + 78 }]}
            contentFit="contain"
            contentPosition="top"
            accessible={false}
          />
        )}
        <LinearGradient
          colors={
            card.credit
              ? ['rgba(8,10,30,0.55)', 'rgba(8,10,30,0)', 'rgba(8,10,30,0.92)']
              : ['rgba(8,10,30,0)', 'rgba(8,10,30,0)', 'rgba(8,10,30,0.96)']
          }
          locations={card.credit ? [0, 0.35, 0.68] : [0, 0.55, 0.72]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Left third goes back, the rest goes forward. */}
      <View style={[StyleSheet.absoluteFill, { flexDirection: 'row' }]}>
        <Pressable style={{ flex: 1 }} onPress={() => go(k - 1)} accessibilityLabel={t('learn.previous')} />
        <Pressable style={{ flex: 2 }} onPress={() => go(k + 1)} accessibilityLabel={t('learn.next')} />
      </View>

      <View style={[styles.top, { paddingTop: insets.top + Spacing.xs }]} pointerEvents="box-none">
        <View style={styles.bars}>
          {deck.cards.map((_, i) => (
            <View key={i} style={styles.bar}>
              {i < k ? (
                <View style={[styles.barFill, { width: '100%' }]} />
              ) : i === k ? (
                <Animated.View style={[styles.barFill, fillStyle]} />
              ) : null}
            </View>
          ))}
        </View>
        <View style={styles.topRow}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t('learn.close')}
            hitSlop={10}
            style={styles.round}>
            <Ionicons name="close" size={22} color="#fff" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text color="#fff" style={{ fontFamily: Fonts.bold, fontSize: 14 }} numberOfLines={1}>
              {title}
            </Text>
            <Text color="rgba(255,255,255,0.75)" style={{ fontSize: 12 }}>
              {t('learn.cardOf', { n: k + 1, total: deck.cards.length })}
            </Text>
          </View>
          {!!voice && (
            <Pressable
              onPress={() => setSound((s) => !s)}
              accessibilityRole="button"
              accessibilityLabel={sound ? t('learn.soundOff') : t('learn.soundOn')}
              hitSlop={10}
              style={styles.round}>
              <Ionicons name={sound ? 'volume-high' : 'volume-mute'} size={20} color="#fff" />
            </Pressable>
          )}
          <Pressable
            onPress={() => setPaused((p) => !p)}
            accessibilityRole="button"
            accessibilityLabel={paused ? t('learn.play') : t('learn.pause')}
            hitSlop={10}
            style={styles.round}>
            <Ionicons name={paused ? 'play' : 'pause'} size={20} color="#fff" />
          </Pressable>
        </View>
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + Spacing.lg }]} pointerEvents="box-none">
        <Animated.View key={`t${k}`} entering={FadeInDown.duration(400)} pointerEvents="none">
          <Text color="#fff" style={styles.cardText}>
            {card.text}
          </Text>
        </Animated.View>
        {k === 0 && (
          <Text color="rgba(255,255,255,0.7)" style={{ fontSize: 12 }} pointerEvents="none">
            {t('learn.tapHint')}
          </Text>
        )}
        {k === deck.cards.length - 1 && <Button title={t('learn.startQuiz')} icon="help-circle" onPress={onDone} />}
        {card.credit && (
          <Text color="rgba(255,255,255,0.55)" style={{ fontSize: 10 }} numberOfLines={1} pointerEvents="none">
            {t('learn.photoCredit', { author: card.credit.author, license: card.credit.license })}
          </Text>
        )}
      </View>
    </View>
  );
}

function Quiz({ deck, lessonId, onReview }: { deck: LessonDeck; lessonId: string; onReview: () => void }) {
  const { t } = useTranslation('home');
  const insets = useSafeAreaInsets();
  const { setProgress } = useLibrary();
  const [n, setN] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const q = deck.quiz[n]!;

  // Finishing the quiz completes the lesson.
  useEffect(() => {
    if (finished) setProgress(lessonId, 1);
  }, [finished, lessonId, setProgress]);

  if (finished) {
    const total = deck.quiz.length;
    const ratio = score / total;
    return (
      <View style={[styles.light, { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.lg }]}>
        <Animated.View entering={FadeInDown} style={styles.result}>
          <LinearGradient
            colors={ratio >= 0.6 ? ['#2DD4BF', '#0E8F6E'] : ['#FF9F43', '#FF5A7A']}
            style={styles.resultBadge}>
            <Ionicons name={ratio >= 0.6 ? 'trophy' : 'refresh'} size={40} color="#fff" />
          </LinearGradient>
          <Text variant="title" center>
            {t('learn.resultTitle')}
          </Text>
          <Text variant="heading" center color={Colors.primary}>
            {t('learn.score', { score, total })}
          </Text>
          <Text color={Colors.textSecondary} center>
            {ratio === 1 ? t('learn.perfect') : ratio >= 0.6 ? t('learn.good') : t('learn.keepGoing')}
          </Text>
        </Animated.View>
        <View style={{ gap: Spacing.sm, paddingHorizontal: Spacing.md }}>
          <Button title={t('learn.done')} icon="checkmark" onPress={() => router.back()} />
          <Button
            title={t('learn.retryQuiz')}
            variant="secondary"
            icon="refresh"
            onPress={() => {
              setN(0);
              setPicked(null);
              setScore(0);
              setFinished(false);
            }}
          />
          <Button title={t('learn.review')} variant="ghost" icon="albums" onPress={onReview} />
        </View>
      </View>
    );
  }

  const answered = picked !== null;
  return (
    <View style={[styles.light, { paddingTop: insets.top + Spacing.sm }]}>
      <View style={styles.quizTop}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('learn.close')}
          hitSlop={10}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </Pressable>
        <View style={{ flex: 1, gap: 6 }}>
          <Text variant="label" color={Colors.primary}>
            {t('learn.quizTitle').toUpperCase()} · {t('learn.questionOf', { n: n + 1, total: deck.quiz.length })}
          </Text>
          <View style={styles.quizBar}>
            <View style={[styles.quizFill, { width: `${((n + (answered ? 1 : 0)) / deck.quiz.length) * 100}%` }]} />
          </View>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={{ gap: Spacing.md, padding: Spacing.md, paddingBottom: insets.bottom + Spacing.xl }}>
        <Animated.View key={n} entering={FadeInDown.duration(300)} style={{ gap: Spacing.md }}>
          <Text variant="title">{q.question}</Text>
          {q.options.map((o, i) => {
            const right = answered && i === q.correctIndex;
            const wrong = answered && i === picked && i !== q.correctIndex;
            return (
              <Pressable
                key={i}
                disabled={answered}
                onPress={() => {
                  setPicked(i);
                  if (i === q.correctIndex) setScore((s) => s + 1);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: picked === i }}
                style={[styles.option, right && styles.optionRight, wrong && styles.optionWrong]}>
                <Text style={styles.letter} color={right ? Colors.success : wrong ? Colors.danger : Colors.primary}>
                  {String.fromCharCode(65 + i)}
                </Text>
                <Text style={{ flex: 1 }}>{o}</Text>
                {right && <Ionicons name="checkmark-circle" size={22} color={Colors.success} />}
                {wrong && <Ionicons name="close-circle" size={22} color={Colors.danger} />}
              </Pressable>
            );
          })}
          {answered && (
            <Animated.View entering={FadeInDown} style={styles.explain}>
              <Text variant="bodyStrong" color={picked === q.correctIndex ? Colors.success : Colors.danger}>
                {picked === q.correctIndex ? t('learn.correct') : t('learn.wrong')}
              </Text>
              <Text color={Colors.textSecondary}>{q.explanation}</Text>
            </Animated.View>
          )}
          {answered && (
            <Button
              title={n + 1 < deck.quiz.length ? t('learn.nextQuestion') : t('learn.seeResult')}
              onPress={() => {
                if (n + 1 < deck.quiz.length) {
                  setN(n + 1);
                  setPicked(null);
                } else setFinished(true);
              }}
            />
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  dark: { flex: 1, backgroundColor: '#080A1E' },
  illustration: { position: 'absolute', left: 0, right: 0, aspectRatio: 2 / 3 },
  light: { flex: 1, backgroundColor: Colors.background, justifyContent: 'space-between', paddingHorizontal: 0 },
  center: { alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.lg },
  top: { position: 'absolute', left: 0, right: 0, top: 0, paddingHorizontal: Spacing.md, gap: Spacing.sm },
  bars: { flexDirection: 'row', gap: 3 },
  bar: { flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)', overflow: 'hidden' },
  barFill: { height: 3, backgroundColor: '#fff' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  round: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: Spacing.lg, gap: Spacing.md },
  cardText: { fontFamily: Fonts.bold, fontSize: 22, lineHeight: 31 },
  quizTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.md },
  quizBar: { height: 6, borderRadius: 3, backgroundColor: Colors.surfaceRaised, overflow: 'hidden' },
  quizFill: { height: 6, backgroundColor: Colors.primary },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  optionRight: { borderColor: Colors.success, backgroundColor: Colors.success + '14' },
  optionWrong: { borderColor: Colors.danger, backgroundColor: Colors.danger + '14' },
  letter: { width: 26, fontFamily: Fonts.extrabold, fontSize: 16 },
  explain: { gap: 4, padding: Spacing.md, borderRadius: Radius.lg, backgroundColor: Colors.surfaceRaised },
  result: { alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.lg, marginTop: Spacing.xl },
  resultBadge: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
});
