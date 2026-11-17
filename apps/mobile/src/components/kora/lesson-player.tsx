import { Ionicons } from '@expo/vector-icons';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet, Text as RNText, View, type LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LinearGradient } from '@/components/ui/gradient';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { formatNumber } from '@/i18n';
import { lessonAsset, lessonMinutes, markLessonWatched, type KoraLesson, type LessonLine } from '@/lib/kora/lessons';
import { clock } from '@/lib/videos/types';

import { KoraAvatar, type KoraPose } from './kora-avatar';
import { Board, LessonBoard } from './lesson-board';

const SPEEDS = [1, 1.25, 1.5, 0.75];
/** The lesson is in English, so the whole player reads left to right whatever the app's language. */
const LTR_PROPS = Platform.OS === 'web' ? ({ dir: 'ltr' } as object) : null;
const LTR_STYLE = Platform.OS === 'web' ? null : ({ direction: 'ltr' } as const);
const YELLOW = Board.yellow;

type Phase = 'ready' | 'playing' | 'paused' | 'check' | 'ended';
type Caption = { from: number; to: number; words: { text: string; at: number }[] };

/** A line broken into caption-sized groups at its commas and full stops. */
function captionsOf(lines: LessonLine[]): Caption[] {
  const out: Caption[] = [];
  for (const [n, l] of lines.entries()) {
    const words = l.text.split(/\s+/).filter(Boolean).map((text, i) => ({ text, at: l.w[i] ?? l.a }));
    const groups: (typeof words)[] = [];
    let cur: typeof words = [];
    let chars = 0;
    for (const w of words) {
      cur.push(w);
      chars += w.text.length + 1;
      const stop = /[.?!]$/.test(w.text);
      const comma = /[,;:]$/.test(w.text);
      if ((stop && chars > 14) || (comma && chars > 30) || chars > 56) {
        groups.push(cur);
        cur = [];
        chars = 0;
      }
    }
    if (cur.length) {
      if (groups.length && chars < 12) groups[groups.length - 1].push(...cur);
      else groups.push(cur);
    }
    const next = lines[n + 1];
    groups.forEach((g, i) =>
      out.push({
        from: i === 0 ? l.a - 0.12 : g[0].at - 0.05,
        // A line stays up until the next one starts, unless there's a long pause after it.
        to: i < groups.length - 1 ? groups[i + 1][0].at - 0.05 : Math.min(l.b + 1.2, next ? next.a - 0.12 : l.b + 1.2),
        words: g,
      }),
    );
  }
  return out;
}

/**
 * A Lesson with Kora, played live: her voice is one audio file, and everything else follows its clock.
 * Kora's mouth takes its shape from the lesson's frame-by-frame mouth track, the board shows each item
 * as she reaches it, the captions light up word by word, and at the quick check the lesson stops and
 * counts down while the student tries. Kora sits beside the board on a wide screen and under it on a phone.
 */
export function LessonPlayer({ lesson, onClose, onMore }: { lesson: KoraLesson; onClose: () => void; onMore: () => void }) {
  const { t } = useTranslation('videos');
  const player = useAudioPlayer(lessonAsset(lesson.id, lesson.audio), { updateInterval: 100 });
  const status = useAudioPlayerStatus(player);
  const [phase, setPhase] = useState<Phase>('ready');
  const phaseRef = useRef<Phase>('ready');
  const [time, setTime] = useState(0);
  const timeRef = useRef(0);
  const checkDone = useRef(false);
  const [left, setLeft] = useState(lesson.check.seconds);
  const [speed, setSpeed] = useState(1);
  const speedRef = useRef(1);
  const [cc, setCc] = useState(true);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const bar = useRef<ComponentRef<typeof View>>(null);
  const total = lesson.duration;

  const go = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  useEffect(() => {
    // Kora should be heard even with the phone's ring switch on silent.
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  // The lesson's clock is the audio's own position, read every frame. Between the positions the
  // player reports, the clock runs on from the last one, so the mouth never waits for a report.
  useEffect(() => {
    let raf = 0;
    let lastReported = -1;
    let anchor = 0;
    let anchorAt = 0;
    let shown = -1;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      let reported = 0;
      let running = false;
      try {
        reported = player.currentTime || 0;
        running = phaseRef.current === 'playing' && player.playing;
      } catch {
        return; // The player was released as the screen closed.
      }
      if (reported !== lastReported) {
        lastReported = reported;
        anchor = reported;
        anchorAt = now;
      }
      const at = running ? Math.min(anchor + ((now - anchorAt) / 1000) * speedRef.current, anchor + 0.35) : reported;
      timeRef.current = at;
      if (running && !checkDone.current && at >= lesson.check.at) {
        checkDone.current = true;
        player.pause();
        setLeft(lesson.check.seconds);
        go('check');
      }
      // The audio stopped at its end without saying so (some players don't): that is the end of the lesson too.
      if (phaseRef.current === 'playing' && !running && reported >= lesson.duration - 0.25) {
        go('ended');
        markLessonWatched(lesson.id);
      }
      if (Math.abs(at - shown) >= 0.09) {
        shown = at;
        setTime(at);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [player, lesson, go]);

  // The end of the audio is the end of the lesson.
  useEffect(() => {
    if (status.didJustFinish && phaseRef.current === 'playing') {
      go('ended');
      markLessonWatched(lesson.id);
    }
  }, [status.didJustFinish, lesson.id, go]);

  const play = useCallback(() => {
    player.play();
    go('playing');
  }, [player, go]);
  const pause = useCallback(() => {
    player.pause();
    go('paused');
  }, [player, go]);
  const seek = useCallback(
    (to: number) => {
      const at = Math.max(0, Math.min(total - 0.3, to));
      checkDone.current = at >= lesson.check.at - 0.05;
      timeRef.current = at;
      setTime(at);
      player.seekTo(at).catch(() => {});
      if (phaseRef.current === 'check' || phaseRef.current === 'ended') play();
    },
    [player, total, lesson.check.at, play],
  );
  const toggle = () => (phase === 'playing' ? pause() : phase === 'ended' ? seek(0) : play());

  // The quick check: the countdown runs, then the lesson carries on by itself.
  useEffect(() => {
    if (phase !== 'check') return;
    const h = setTimeout(() => (left <= 1 ? play() : setLeft(left - 1)), 1000);
    return () => clearTimeout(h);
  }, [phase, left, play]);

  const mouthNow = useCallback(() => {
    const f = Math.floor(timeRef.current * lesson.fps);
    return { viseme: lesson.mouth.charCodeAt(f) - 48 || 0, level: (lesson.level.charCodeAt(f) - 48 || 0) / 9 };
  }, [lesson]);

  const captions = useMemo(() => captionsOf(lesson.lines), [lesson.lines]);
  const caption = captions.find((c) => time >= c.from && time < c.to);
  const sceneIndex = Math.max(0, lesson.scenes.findLastIndex((s) => time >= s.at));
  const scene = lesson.scenes[sceneIndex];
  const sectionIndex = Math.max(0, lesson.sections.findLastIndex((s) => time >= s.start));
  const lineIndex = lesson.lines.findLastIndex((l) => time >= l.a - 0.15);

  // Her pose: hands together while she waits, a turn to the board when something new goes up, and an open hand as she explains.
  let pose: KoraPose = 'explain';
  if (phase !== 'playing') pose = 'rest';
  else if (scene.items.some((it) => time >= it.at - 0.2 && time < it.at + 2.4 && (it.kind === 'formula' || it.kind === 'image' || it.kind === 'tip')) || (time >= scene.at && time < scene.at + 2.2 && sceneIndex > 0)) pose = 'point';
  else if (lineIndex % 4 === 3) pose = 'rest';

  const partLabel = t('kora.part', { n: formatNumber(sectionIndex + 1), total: formatNumber(lesson.sections.length), title: lesson.sections[sectionIndex].title });
  const wide = size.w >= 720 && size.w > size.h * 1.05;
  const pad = wide ? Spacing.lg : Spacing.sm;
  const waiting = phase === 'check';

  const checkFooter = waiting ? (
    <View style={styles.checkRow}>
      <View style={styles.countdown}>
        <RNText style={styles.countdownText}>{formatNumber(left)}</RNText>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <RNText style={styles.checkTitle}>{t('kora.pauseAndTry')}</RNText>
        <RNText style={styles.checkBody}>{t('kora.continuesIn', { n: formatNumber(left) })}</RNText>
      </View>
      <Pressable onPress={play} accessibilityRole="button" style={styles.continue}>
        <RNText style={styles.continueText}>{t('kora.continue')}</RNText>
        <Ionicons name="play" size={14} color="#fff" />
      </Pressable>
    </View>
  ) : null;

  // Sizes: Kora's card takes the height it is given; she fills its width and is cut off at the waist if it's short.
  const mainH = Math.max(120, size.h - (wide ? 62 + 76 + 58 : 66 + 30 + 58) - pad * 2);
  const cardW = wide ? Math.min(size.w * 0.32, mainH * 0.8) : Math.min(size.w * 0.44, 200);
  const cardH = wide ? mainH : Math.min(cardW * 1.2, size.h * 0.3);
  // On a phone she is shown closer, head and shoulders, so her mouth is easy to see.
  const avatarW = wide ? Math.max(cardW, cardH * 0.75) : cardW * 1.3;
  const boardW = wide ? size.w - cardW - pad * 3 : size.w - pad * 2;

  const kora = (
    <View style={[styles.card, { width: cardW, height: cardH, borderRadius: wide ? Radius.lg : Radius.md }]}>
      <LinearGradient colors={['#EDE7FF', '#B7A4FF']} style={StyleSheet.absoluteFill} />
      <View style={{ position: 'absolute', left: (cardW - avatarW) / 2, top: wide ? Math.max(cardH - (avatarW * 4) / 3, 0) : -avatarW * 0.03 }}>
        <KoraAvatar pose={pose} mouth={mouthNow} speaking={phase === 'playing'} width={avatarW} />
      </View>
      <LinearGradient colors={['rgba(22,10,77,0)', 'rgba(22,10,77,0.78)']} style={styles.cardShade} />
      <View style={[styles.nameTag, !wide && { left: 8, bottom: 6, gap: 5 }]}>
        <View style={styles.live} />
        <RNText style={[styles.name, !wide && { fontSize: 13 }]}>{t('kora.name')}</RNText>
        {wide && <RNText style={styles.role}>{t('kora.role')}</RNText>}
      </View>
    </View>
  );

  const captionBox =
    cc && caption && phase !== 'ready' && phase !== 'ended' ? (
      <RNText style={[styles.caption, { fontSize: wide ? Math.min(26, Math.max(18, size.w / 50)) : 16, lineHeight: wide ? Math.min(36, Math.max(26, size.w / 36)) : 23 }, !wide && { textAlign: 'left' }]}>
        {caption.words.map((w, i) => {
          const said = time >= w.at - 0.04;
          const now = said && time < (caption.words[i + 1]?.at ?? caption.to) - 0.04;
          return (
            <RNText key={i} style={{ color: now ? YELLOW : said ? '#fff' : 'rgba(255,255,255,0.55)' }}>
              {w.text}{' '}
            </RNText>
          );
        })}
      </RNText>
    ) : null;

  const board = (
    <View style={{ flex: 1 }}>
      <LessonBoard lessonId={lesson.id} scene={scene} time={time} width={boardW} footer={checkFooter} />
      {phase === 'ready' && (
        <Pressable onPress={play} accessibilityRole="button" accessibilityLabel={t('kora.start')} style={[styles.cover, { borderRadius: Radius.md }]}>
          <RNText style={styles.coverLabel}>
            {lesson.label} · {t('kora.english')} · {t('kora.minutes', { n: formatNumber(lessonMinutes(lesson.seconds)) })}
          </RNText>
          <RNText style={[styles.coverTitle, { fontSize: wide ? 34 : 24, lineHeight: wide ? 42 : 31 }]}>{lesson.title}</RNText>
          <View style={styles.startBtn}>
            <Ionicons name="play" size={18} color={Board.ink} />
            <RNText style={styles.startText}>{status.isLoaded ? t('kora.start') : t('kora.loading')}</RNText>
          </View>
        </Pressable>
      )}
      {phase === 'ended' && (
        <View style={[styles.cover, { borderRadius: Radius.md }]}>
          <Ionicons name="checkmark-circle" size={44} color={YELLOW} />
          <RNText style={[styles.coverTitle, { fontSize: wide ? 30 : 22, lineHeight: wide ? 38 : 29 }]}>{t('kora.finishedTitle')}</RNText>
          <RNText style={styles.coverBody}>{t('kora.finishedBody')}</RNText>
          <View style={{ flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Pressable onPress={() => seek(0)} accessibilityRole="button" style={[styles.startBtn, styles.ghostBtn]}>
              <Ionicons name="refresh" size={16} color="#fff" />
              <RNText style={[styles.startText, { color: '#fff' }]}>{t('player.replay')}</RNText>
            </Pressable>
            <Pressable onPress={onMore} accessibilityRole="button" style={styles.startBtn}>
              <RNText style={styles.startText}>{t('kora.moreLessons')}</RNText>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <LinearGradient colors={['#5A2FE0', '#2A1290', '#160A4D']} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View {...LTR_PROPS} style={[{ flex: 1, padding: pad, gap: wide ? Spacing.sm : Spacing.xs }, LTR_STYLE]} onLayout={(e: LayoutChangeEvent) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
          {/* Title and the sections' progress */}
          <View style={styles.header}>
            <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel={t('actions.goBack', { ns: 'common' })} style={styles.round}>
              <Ionicons name="chevron-back" size={20} color="#fff" />
            </Pressable>
            <View style={wide ? { width: Math.min(400, size.w * 0.36) } : { flex: 1 }}>
              <RNText style={styles.title}>
                {lesson.title}
              </RNText>
              <RNText style={styles.sub}>
                {wide ? (lesson.subject === lesson.label ? lesson.label : `${lesson.subject} · ${lesson.label}`) : partLabel}
              </RNText>
            </View>
            {wide && <Sections lesson={lesson} time={time} label={partLabel} onSeek={seek} />}
          </View>
          {!wide && <Sections lesson={lesson} time={time} onSeek={seek} />}

          {size.w > 0 &&
            (wide ? (
              <>
                <View style={{ flex: 1, flexDirection: 'row', gap: pad}}>
                  {kora}
                  {board}
                </View>
                <View style={styles.captionWide}>{captionBox && <View style={styles.captionPill}>{captionBox}</View>}</View>
              </>
            ) : (
              <>
                {board}
                <View style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'stretch'}}>
                  {kora}
                  <View style={styles.bubble}>{captionBox}</View>
                </View>
              </>
            ))}

          {/* Controls */}
          <View style={styles.controls}>
            <Ctrl icon={phase === 'playing' ? 'pause' : phase === 'ended' ? 'refresh' : 'play'} label={phase === 'playing' ? t('player.pause') : phase === 'ended' ? t('player.replay') : t('player.play')} onPress={toggle} solid />
            <Ctrl icon="play-back" label={t('kora.back10')} onPress={() => seek(timeRef.current - 10)} />
            <Pressable
              ref={bar}
              onPress={(e) => {
                // Where on the bar the tap landed, measured on the screen: the same on a phone and in a browser.
                const { pageX } = e.nativeEvent;
                bar.current?.measureInWindow((x: number, _y: number, width: number) => {
                  if (width > 0 && Number.isFinite(pageX)) seek(((pageX - x) / width) * total);
                });
              }}
              accessibilityRole="adjustable"
              accessibilityLabel={t('player.seek', { current: clock(time), total: clock(total) })}
              style={styles.track}>
              <View style={styles.trackBg}>
                <View style={[styles.trackFill, { width: `${Math.min(100, (time / total) * 100)}%` }]} />
                <View style={[styles.checkMark, { left: `${(lesson.check.at / total) * 100}%` }]} />
              </View>
            </Pressable>
            <RNText style={styles.time}>
              {clock(time)} / {clock(total)}
            </RNText>
            <Pressable
              onPress={() => {
                const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
                speedRef.current = next;
                setSpeed(next);
                player.setPlaybackRate(next);
              }}
              accessibilityRole="button"
              accessibilityLabel={t('player.speed', { speed: formatNumber(speed) })}
              style={styles.pill}>
              <RNText style={styles.pillText}>{t('player.speedValue', { speed: formatNumber(speed) })}</RNText>
            </Pressable>
            <Ctrl icon={cc ? 'chatbox-ellipses' : 'chatbox-outline'} label={cc ? t('player.hideCaptions') : t('player.showCaptions')} onPress={() => setCc((v) => !v)} />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

/**
 * The lesson's sections as a row of bars: done, filling, or to come. Tap one to go to it. Only the section
 * being taught is named, in full ("Part 3 of 8: Warning signs"), so no name is ever cut short.
 */
function Sections({ lesson, time, label, onSeek }: { lesson: KoraLesson; time: number; label?: string; onSeek: (to: number) => void }) {
  return (
    <View style={{ flex: label ? 1 : undefined, gap: 6 }}>
      {!!label && <RNText style={styles.sectionLabel}>{label}</RNText>}
      <View style={{ flexDirection: 'row', gap: 5 }}>
        {lesson.sections.map((s) => {
          const p = Math.max(0, Math.min(1, (time - s.start) / (s.end - s.start)));
          const on = time >= s.start && time < s.end;
          return (
            <Pressable key={s.id} onPress={() => onSeek(s.start + 0.05)} accessibilityRole="button" accessibilityLabel={s.title} style={{ flex: Math.max(6, s.end - s.start), paddingVertical: label ? 3 : 6 }}>
              <View style={styles.sectionBar}>
                <View style={{ width: `${p * 100}%`, height: '100%', borderRadius: 4, backgroundColor: on ? YELLOW : 'rgba(255,255,255,0.88)' }} />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function Ctrl({ icon, label, onPress, solid }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; solid?: boolean }) {
  return (
    <Pressable onPress={onPress} hitSlop={6} accessibilityRole="button" accessibilityLabel={label} style={[styles.ctrl, solid && { backgroundColor: YELLOW }]}>
      <Ionicons name={icon} size={solid ? 20 : 18} color={solid ? Board.ink : '#fff'} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, minHeight: 44 },
  round: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontFamily: Fonts.extrabold, fontSize: 17, lineHeight: 22, letterSpacing: -0.3 },
  sub: { color: 'rgba(255,255,255,0.75)', fontFamily: Fonts.semibold, fontSize: 12.5, lineHeight: 17 },
  sectionLabel: { fontFamily: Fonts.extrabold, fontSize: 13, lineHeight: 17, color: YELLOW },
  sectionBar: { height: 6, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.22)', overflow: 'hidden' },
  card: { overflow: 'hidden', backgroundColor: '#B7A4FF' },
  cardShade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '26%' },
  nameTag: { position: 'absolute', left: 16, bottom: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  live: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#3DDC84' },
  name: { color: '#fff', fontFamily: Fonts.extrabold, fontSize: 20 },
  role: { color: 'rgba(255,255,255,0.85)', fontFamily: Fonts.bold, fontSize: 13, marginTop: 3 },
  captionWide: { height: 76, alignItems: 'center', justifyContent: 'center' },
  captionPill: { backgroundColor: 'rgba(15,8,50,0.62)', borderRadius: Radius.md, paddingVertical: 8, paddingHorizontal: 20, maxWidth: '92%' },
  caption: { fontFamily: Fonts.extrabold, textAlign: 'center', letterSpacing: -0.2, writingDirection: 'ltr' },
  bubble: { flex: 1, backgroundColor: 'rgba(15,8,50,0.5)', borderRadius: Radius.md, paddingVertical: 10, paddingHorizontal: 12, justifyContent: 'center' },
  cover: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(22,10,77,0.93)', alignItems: 'center', justifyContent: 'center', padding: Spacing.lg, gap: Spacing.sm },
  coverLabel: { color: YELLOW, fontFamily: Fonts.extrabold, fontSize: 13, letterSpacing: 0.3, textAlign: 'center' },
  coverTitle: { color: '#fff', fontFamily: Fonts.extrabold, letterSpacing: -0.5, textAlign: 'center' },
  coverBody: { color: 'rgba(255,255,255,0.85)', fontFamily: Fonts.semibold, fontSize: 15, lineHeight: 22, textAlign: 'center', maxWidth: 440 },
  startBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: YELLOW, borderRadius: Radius.pill, paddingVertical: 12, paddingHorizontal: 22, marginTop: Spacing.xs },
  ghostBtn: { backgroundColor: 'rgba(255,255,255,0.16)' },
  startText: { color: Board.ink, fontFamily: Fonts.extrabold, fontSize: 15 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 'auto', backgroundColor: Board.ink, borderRadius: Radius.md, padding: 12},
  countdown: { width: 46, height: 46, borderRadius: 23, borderWidth: 3, borderColor: YELLOW, alignItems: 'center', justifyContent: 'center' },
  countdownText: { color: '#fff', fontFamily: Fonts.extrabold, fontSize: 18 },
  checkTitle: { color: YELLOW, fontFamily: Fonts.extrabold, fontSize: 15 },
  checkBody: { color: 'rgba(255,255,255,0.85)', fontFamily: Fonts.semibold, fontSize: 13 },
  continue: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Board.purple, borderRadius: Radius.pill, paddingVertical: 10, paddingHorizontal: 16 },
  continueText: { color: '#fff', fontFamily: Fonts.extrabold, fontSize: 14 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, minHeight: 44},
  ctrl: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.14)' },
  track: { flex: 1, paddingVertical: 14 },
  trackBg: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.25)' },
  trackFill: { height: 6, borderRadius: 3, backgroundColor: YELLOW },
  checkMark: { position: 'absolute', top: -3, width: 4, height: 12, borderRadius: 2, backgroundColor: '#fff' },
  time: { color: '#fff', fontFamily: Fonts.semibold, fontSize: 12, minWidth: 74, textAlign: 'center' },
  pill: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: Radius.pill, backgroundColor: 'rgba(255,255,255,0.14)' },
  pillText: { color: '#fff', fontFamily: Fonts.bold, fontSize: 12 },
});
