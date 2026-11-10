import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text as RNText,
  useWindowDimensions,
  View,
  type ScrollViewInstance,
} from 'react-native';

import { MARKERS, writeMs, type BoardLine } from '@/lib/whiteboard/script';
import { speechLocale } from '@/lib/whiteboard/voice';

export const MARKER_FONT = 'PatrickHand_400Regular';

/** Writing size for each kind of line, on a computer. */
const SIZES: Record<BoardLine['kind'], number> = {
  question: 32,
  heading: 28,
  text: 26,
  formula: 30,
  step: 28,
  answer: 32,
};

type Props = {
  lines: BoardLine[];
  /** Speak each line while writing it. */
  voice: boolean;
  language: string;
  /** The marker font, or the app font for scripts it can't show (Arabic). */
  font: string;
  onDone?: () => void;
  /** Shown on an empty board. */
  empty?: React.ReactNode;
  /** Smaller writing, for the board in a side panel. */
  small?: boolean;
};

/**
 * A classroom whiteboard: each line is written out letter by letter with a marker, in its own colour,
 * while Kora says it. The next line starts once both the writing and the voice have finished.
 * Give it a new `key` for a new script.
 */
export function Whiteboard({ lines, voice, language, font, onDone, empty, small }: Props) {
  const { width } = useWindowDimensions();
  const [line, setLine] = useState(0);
  const [chars, setChars] = useState(0);
  const scroll = useRef<ScrollViewInstance>(null);
  // A new script gets a new board (the parent changes its key), so this one only ever moves forward.
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });

  // Write the current line, and say it, then move on when both are finished.
  useEffect(() => {
    if (line >= lines.length) {
      if (lines.length) done.current?.();
      return;
    }
    const l = lines[line]!;
    const total = [...l.text].length;
    const ms = writeMs(l.text);
    const started = Date.now();
    let wrote = false;
    let spoke = !voice || !l.say;
    let alive = true;
    let moved = false;
    const next = () => {
      if (!alive || moved || !wrote || !spoke) return;
      moved = true;
      setLine((n) => n + 1);
    };
    const said = () => {
      spoke = true;
      next();
    };
    const timer = setInterval(() => {
      const n = Math.min(total, Math.ceil(((Date.now() - started) / ms) * total));
      setChars(n);
      if (n >= total) {
        clearInterval(timer);
        wrote = true;
        setTimeout(next, 220);
      }
    }, 30);
    // Some browsers never say when speech ends (or have no voice for the language), so the board
    // moves on after about as long as the sentence takes to say.
    let guard: ReturnType<typeof setTimeout> | undefined;
    if (!spoke) {
      Speech.speak(l.say, {
        language: speechLocale(language),
        rate: 0.98,
        onDone: said,
        onStopped: said,
        onError: said,
      });
      guard = setTimeout(said, 2500 + l.say.split(/\s+/).length * 450);
    }
    return () => {
      alive = false;
      clearInterval(timer);
      clearTimeout(guard);
    };
  }, [line, lines, voice, language]);

  // Stop talking when the board closes or the voice is switched off.
  useEffect(() => () => void Speech.stop(), []);
  useEffect(() => {
    if (!voice) void Speech.stop();
  }, [voice]);

  // Smaller writing on phones, so a line of working fits across the board.
  const zoom = small ? 0.68 : width < 700 ? 0.75 : 1;

  return (
    <View style={styles.frame}>
      <ScrollView
        ref={scroll}
        style={styles.board}
        contentContainerStyle={[styles.content, small && { padding: 16 }]}
        onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}>
        {!lines.length && empty}
        {lines.slice(0, line + 1).map((l, i) => {
          const shown = i < line ? l.text : [...l.text].slice(0, chars).join('');
          const writing = i === line && line < lines.length;
          return (
            <View
              key={i}
              style={[l.kind === 'answer' && styles.answerBox, l.kind === 'question' && styles.questionRow]}>
              <RNText
                style={[
                  styles.line,
                  { fontFamily: font, color: MARKERS[l.kind] },
                  l.kind === 'question' && styles.question,
                  l.kind === 'step' && styles.step,
                  l.kind === 'formula' && styles.formula,
                  l.kind === 'answer' && styles.answer,
                  { fontSize: SIZES[l.kind] * zoom, lineHeight: (SIZES[l.kind] + 9) * zoom },
                ]}>
                {shown}
                {writing && (
                  <MaterialCommunityIcons name="lead-pencil" size={22} color={MARKERS[l.kind]} style={styles.pen} />
                )}
              </RNText>
              {l.kind === 'question' && i < line && <View style={styles.underline} />}
            </View>
          );
        })}
      </ScrollView>
      {/* The marker tray along the bottom of the board. */}
      <View style={styles.tray}>
        {['#1f5fd1', '#1b1740', '#178a4c', '#d6293b'].map((c) => (
          <View key={c} style={[styles.marker, { backgroundColor: c }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    flex: 1,
    borderRadius: 18,
    padding: 10,
    backgroundColor: '#c9ccd6',
    shadowColor: '#0b0630',
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
  },
  board: { flex: 1, borderRadius: 10, backgroundColor: '#fdfdfb' },
  content: { padding: 28, gap: 10, minHeight: '100%' },
  line: { fontSize: 26, lineHeight: 34 },
  questionRow: { alignSelf: 'flex-start', marginBottom: 6 },
  question: { fontSize: 32, lineHeight: 40 },
  underline: { height: 3, borderRadius: 2, backgroundColor: MARKERS.question, opacity: 0.6, marginTop: 2 },
  step: { fontSize: 28, marginTop: 10, textDecorationLine: 'underline' },
  formula: { fontSize: 30, lineHeight: 40, paddingStart: 24 },
  answerBox: {
    alignSelf: 'flex-start',
    marginTop: 14,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 3,
    borderColor: MARKERS.answer,
    borderRadius: 12,
    transform: [{ rotate: '-1deg' }],
  },
  answer: { fontSize: 32, lineHeight: 40 },
  pen: { marginStart: 4 },
  tray: { flexDirection: 'row', gap: 10, justifyContent: 'center', paddingTop: 8 },
  marker: { width: 46, height: 10, borderRadius: 5 },
});
