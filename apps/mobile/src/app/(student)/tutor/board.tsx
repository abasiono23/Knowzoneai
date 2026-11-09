import { PatrickHand_400Regular, useFonts } from '@expo-google-fonts/patrick-hand';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookBackground } from '@/components/brand/book-background';
import { ScreenHeader, Text } from '@/components/ui';
import { LinearGradient } from '@/components/ui/gradient';
import { MARKER_FONT, Whiteboard } from '@/components/whiteboard/board';
import { Colors, Fonts, Gradients, Radius, Spacing } from '@/constants/theme';
import { useLanguage } from '@/i18n/provider';
import { useTutor } from '@/lib/tutor/store';
import { boardScript, type BoardLine } from '@/lib/whiteboard/script';
import { afterWake, canListen, isOpenBoard, listen, type Listener } from '@/lib/whiteboard/voice';
import { useWake } from '@/lib/whiteboard/wake';

type Phase = 'idle' | 'thinking' | 'writing';

/**
 * Kora's whiteboard: ask out loud ("Hey Kora, …") or type, and Kora writes the tutor's step-by-step
 * answer on a whiteboard with a marker while saying it. Each question is a normal tutor question,
 * so it counts towards the day's allowance and is kept in the chat history.
 */
export default function KoraBoard() {
  const { t } = useTranslation('tutor');
  // `q`: a question said on the tutor page. `listen`: opened by "Hey Kora", so listen for the question.
  const { q, listen: listenNow } = useLocalSearchParams<{ q?: string; listen?: string }>();
  const { language } = useLanguage();
  const [fontsLoaded] = useFonts({ PatrickHand_400Regular });
  const tutor = useTutor();
  const voiceSupported = canListen();

  const [convId, setConvId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [script, setScript] = useState<{ n: number; lines: BoardLine[] }>({ n: 0, lines: [] });
  const [typed, setTyped] = useState('');
  const [voice, setVoice] = useState(true);
  // Listening from the start when opened by "Hey Kora", or while "Hey Kora" is on across the site.
  const wake = useWake();
  const [listening, setListening] = useState((listenNow === '1' || wake.on) && voiceSupported);
  const [heard, setHeard] = useState('');
  /** A problem (shown in red): a failed answer or a microphone that can't be used. */
  const [status, setStatus] = useState<string | null>(null);
  /** A prompt (shown plainly): "I'm listening" or "ask a follow-up". */
  const [prompt, setPrompt] = useState<string | null>(null);

  const listener = useRef<Listener | null>(null);
  /** After the mic is pressed, or after a bare "Hey Kora", the next sentence is the question. */
  const awaiting = useRef(listenNow === '1');
  /** Until this time (after an answer), anything said is taken as a follow-up, without "Hey Kora". */
  const followUntil = useRef(0);
  const asked = useRef<{ question: string; before: number } | null>(null);
  const autoAsked = useRef(false);

  const conv = tutor.conversations.find((c) => c.id === convId);
  const font = language === 'ar' ? Fonts.semibold : fontsLoaded ? MARKER_FONT : Fonts.semibold;

  const ask = async (raw: string) => {
    const question = raw.trim();
    if (!question || phase !== 'idle') return;
    if (tutor.remaining <= 0) return router.push('/tutor/limit');
    const id = convId ?? tutor.createConversation({ mode: 'steps', level: 'beginner' });
    setConvId(id);
    asked.current = { question, before: tutor.conversations.find((c) => c.id === id)?.messages.length ?? 0 };
    setTyped('');
    setHeard('');
    setStatus(null);
    setPrompt(null);
    followUntil.current = 0;
    setPhase('thinking');
    const result = await tutor.send(id, question);
    if (result === 'limit') {
      setPhase('idle');
      router.push('/tutor/limit');
    } else if (result === 'error') {
      setPhase('idle');
      setStatus(t('board.failed'));
    }
  };
  const askRef = useRef(ask);
  useEffect(() => {
    askRef.current = ask;
  });

  // Once the answer arrives, it becomes the board's script.
  const last = conv?.messages.at(-1);
  useEffect(() => {
    const pending = asked.current;
    if (phase !== 'thinking' || !pending || !conv || conv.messages.length < pending.before + 2) return;
    if (last?.role !== 'assistant' || last.status !== 'ok' || !last.answer) return;
    asked.current = null;
    const lines = boardScript(pending.question, last.answer, {
      step: (n) => t('board.step', { n }),
      answer: t('board.answer'),
    });
    setScript((s) => ({ n: s.n + 1, lines }));
    setPhase('writing');
  }, [phase, conv, last, t]);

  // Kora doesn't listen while she talks, so she never hears herself.
  const stopListening = () => {
    listener.current?.stop();
    listener.current = null;
  };
  const startListening = (expectQuestion: boolean) => {
    stopListening();
    awaiting.current = expectQuestion;
    listener.current = listen(language, {
      onPartial: setHeard,
      onFinal: (text) => {
        setHeard('');
        const rest = afterWake(text);
        const followUp = Date.now() < followUntil.current;
        if (rest === null && !awaiting.current && !followUp) return;
        const question = rest ?? text;
        if (!question || isOpenBoard(question)) {
          awaiting.current = true;
          setPrompt(t('board.askNow'));
          return;
        }
        awaiting.current = false;
        void askRef.current(question);
      },
      onError: (code) => {
        if (code !== 'network') setListening(false);
        setStatus(
          t(
            code === 'blocked'
              ? 'board.blocked'
              : code === 'noMic'
                ? 'board.noMic'
                : code === 'language'
                  ? 'board.language'
                  : 'board.network',
          ),
        );
      },
    });
  };
  useEffect(() => {
    if (listening && phase === 'idle') startListening(awaiting.current);
    else stopListening();
    return stopListening;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening, phase, language]);

  // A question said on the tutor page ("Hey Kora, …") arrives here and is asked once.
  useEffect(() => {
    if (q && !autoAsked.current && tutor.ready) {
      autoAsked.current = true;
      void askRef.current(q);
      router.setParams({ q: undefined });
    }
  }, [q, tutor.ready]);

  const toggleMic = () => {
    awaiting.current = !listening;
    setStatus(null);
    setPrompt(null);
    setListening((l) => !l);
  };
  // After an answer, the student can just ask the next thing, as in a lesson. The window closes after
  // a while, so later chatter isn't sent; "Hey Kora" always works.
  const FOLLOW_UP_MS = 45_000;
  const finished = () => {
    if (listening) {
      followUntil.current = Date.now() + FOLLOW_UP_MS;
      setPrompt(t('board.followUp'));
    }
    setPhase('idle');
  };
  useEffect(() => {
    if (prompt !== t('board.followUp')) return;
    const timer = setTimeout(() => setPrompt(null), FOLLOW_UP_MS);
    return () => clearTimeout(timer);
  }, [prompt, t]);

  const clear = () => {
    setScript((s) => ({ n: s.n + 1, lines: [] }));
    setPhase('idle');
  };

  const hint =
    phase === 'thinking'
      ? t('board.thinking')
      : heard
        ? `“${heard}”`
        : (status ??
          prompt ??
          (listening ? t('board.listening') : voiceSupported ? t('board.hint') : t('board.hintNoVoice')));

  return (
    <View style={{ flex: 1 }}>
      <BookBackground />
      <SafeAreaView style={styles.page} edges={['top', 'bottom']}>
        <ScreenHeader
          title={t('board.title')}
          right={
            <View style={styles.tools}>
              <Pressable
                onPress={() => setVoice((v) => !v)}
                accessibilityRole="switch"
                accessibilityState={{ checked: voice }}
                accessibilityLabel={voice ? t('board.voiceOn') : t('board.voiceOff')}
                style={styles.round}>
                <Ionicons name={voice ? 'volume-high' : 'volume-mute'} size={20} color={Colors.text} />
              </Pressable>
              <Pressable
                onPress={clear}
                accessibilityRole="button"
                accessibilityLabel={t('board.clear')}
                style={styles.round}>
                <Ionicons name="trash-outline" size={19} color={Colors.text} />
              </Pressable>
            </View>
          }
        />

        <Whiteboard
          key={script.n}
          lines={script.lines}
          voice={voice}
          language={language}
          font={font}
          onDone={finished}
          empty={
            <View style={styles.empty}>
              <Text style={{ fontFamily: font, fontSize: 30, color: '#1f5fd1' }}>{t('board.title')}</Text>
              <Text style={{ fontFamily: font, fontSize: 22, color: '#5b5876' }}>{t('board.cardBody')}</Text>
            </View>
          }
        />

        <Text variant="small" color={status && phase === 'idle' ? Colors.danger : Colors.textSecondary} center>
          {hint}
        </Text>

        <View style={styles.controls}>
          {voiceSupported && (
            <Pressable
              onPress={toggleMic}
              accessibilityRole="switch"
              accessibilityState={{ checked: listening }}
              accessibilityLabel={listening ? t('board.stop') : t('board.listen')}>
              <LinearGradient
                colors={listening ? ['#ff5f7e', '#d6293b'] : Gradients.ai}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.mic}>
                <Ionicons name={listening ? 'mic' : 'mic-outline'} size={26} color="#fff" />
              </LinearGradient>
            </Pressable>
          )}
          <View style={styles.inputWrap}>
            <TextInput
              value={typed}
              onChangeText={setTyped}
              onSubmitEditing={() => void ask(typed)}
              placeholder={t('board.placeholder')}
              placeholderTextColor={Colors.textMuted}
              accessibilityLabel={t('board.placeholder')}
              editable={phase === 'idle'}
              style={styles.input}
            />
            <Pressable
              onPress={() => void ask(typed)}
              disabled={!typed.trim() || phase !== 'idle'}
              accessibilityRole="button"
              accessibilityLabel={t('board.write')}
              style={[styles.send, (!typed.trim() || phase !== 'idle') && { opacity: 0.45 }]}>
              <Ionicons name="create" size={20} color="#fff" />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, width: '100%', maxWidth: 1100, alignSelf: 'center', padding: Spacing.md, gap: Spacing.sm },
  tools: { flexDirection: 'row', gap: Spacing.xs },
  round: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: 80 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  mic: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingStart: Spacing.md,
    paddingEnd: 6,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.surface,
  },
  input: { flex: 1, paddingVertical: 14, fontFamily: Fonts.regular, fontSize: 16, color: Colors.text },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
});
