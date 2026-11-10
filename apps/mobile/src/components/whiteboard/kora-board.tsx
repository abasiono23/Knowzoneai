import { PatrickHand_400Regular, useFonts } from '@expo-google-fonts/patrick-hand';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ScreenHeader, Text } from '@/components/ui';
import { LinearGradient } from '@/components/ui/gradient';
import { MARKER_FONT, Whiteboard } from '@/components/whiteboard/board';
import { Colors, Fonts, Gradients, Radius, Spacing } from '@/constants/theme';
import { useLanguage } from '@/i18n/provider';
import { useTutor } from '@/lib/tutor/store';
import { boardScript, type BoardLine } from '@/lib/whiteboard/script';
import { afterWake, canListen, isEcho, isOpenBoard, isStopPhrase, listen, problemKey, type Listener } from '@/lib/whiteboard/voice';

type Phase = 'idle' | 'thinking' | 'writing';

type Props = {
  /** A question to ask straight away (said with "Hey Kora, …"). */
  question?: string;
  /** Opened by "Hey Kora" alone, so listen for the question. */
  listenNow?: boolean;
  /** Listening from the start (while "Hey Kora" is on across the site). */
  listenFromStart?: boolean;
  /** In a panel beside the page the student is on: smaller, with a close button instead of back. */
  onClose?: () => void;
  /** Called once a question given in `question` has been taken. */
  onAsked?: () => void;
};

/**
 * Kora's whiteboard: ask out loud ("Hey Kora, …") or type, and Kora writes the tutor's step-by-step
 * answer on a whiteboard with a marker while saying it. Each question is a normal tutor question,
 * so it counts towards the day's allowance and is kept in the chat history.
 */
export function KoraBoard({ question: q, listenNow = false, listenFromStart = false, onClose, onAsked }: Props) {
  const { t } = useTranslation('tutor');
  const { t: tc } = useTranslation();
  const { language } = useLanguage();
  const [fontsLoaded] = useFonts({ PatrickHand_400Regular });
  const tutor = useTutor();
  const voiceSupported = canListen();
  const panel = !!onClose;

  const [convId, setConvId] = useState<string | null>(null);
  const [phase, setPhaseState] = useState<Phase>('idle');
  /** Read by the microphone's callbacks, and set at once (the board's "done" can arrive in the same render). */
  const phaseRef = useRef<Phase>('idle');
  const setPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  };
  const [script, setScript] = useState<{ n: number; lines: BoardLine[] }>({ n: 0, lines: [] });
  const scriptN = useRef(0);
  useEffect(() => {
    scriptN.current = script.n;
  }, [script.n]);
  /** The script the student stopped: Kora goes quiet and the rest is written out at once. */
  const [stoppedN, setStoppedN] = useState(-1);
  /** What Kora said last, so her own voice coming back through the microphone isn't taken as the student. */
  const said = useRef('');
  /** Echo is checked while she talks and for a moment after (the last words can arrive late). */
  const echoUntil = useRef(0);
  /** The student started talking over Kora: what they finish saying is their next question. */
  const bargedIn = useRef(false);
  const [typed, setTyped] = useState('');
  const [voice, setVoice] = useState(true);
  const [listening, setListening] = useState((listenNow || listenFromStart) && voiceSupported);
  const [heard, setHeard] = useState('');
  /** A problem (shown in red): a failed answer or a microphone that can't be used. */
  const [status, setStatus] = useState<string | null>(null);
  /** A prompt (shown plainly): "I'm listening" or "ask a follow-up". */
  const [prompt, setPrompt] = useState<string | null>(null);

  const listener = useRef<Listener | null>(null);
  /** After the mic is pressed, or after a bare "Hey Kora", the next sentence is the question. */
  const awaiting = useRef(listenNow);
  /** Until this time (after an answer), anything said is taken as a follow-up, without "Hey Kora". */
  const followUntil = useRef(0);
  const asked = useRef<{ question: string; before: number } | null>(null);
  const autoAsked = useRef(false);

  const conv = tutor.conversations.find((c) => c.id === convId);
  const font = language === 'ar' ? Fonts.semibold : fontsLoaded ? MARKER_FONT : Fonts.semibold;

  /** Stops Kora mid-answer, like talking over someone: she goes quiet and the answer is written out. */
  const interrupt = () => {
    if (phaseRef.current === 'writing') setStoppedN(scriptN.current);
  };

  const ask = async (raw: string) => {
    const question = raw.trim();
    if (!question || phaseRef.current === 'thinking') return;
    // Asking while she's still answering cuts her off, as in a conversation.
    interrupt();
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

  // Kora keeps listening while she talks, so the student can stop her ("okay", "stop") or just talk over
  // her with a new question, as in a conversation. She pauses only while thinking.
  const stopListening = () => {
    listener.current?.stop();
    listener.current = null;
  };
  const echo = (text: string) => Date.now() < echoUntil.current && isEcho(text, said.current);
  const startListening = (expectQuestion: boolean) => {
    stopListening();
    awaiting.current = expectQuestion;
    listener.current = listen(language, {
      onPartial: (text) => {
        if (echo(text)) return;
        setHeard(text);
        // A few words of the student's own while Kora talks: she stops at once, without waiting for the end.
        if (phaseRef.current === 'writing' && text.split(/\s+/).length >= 3 && !isStopPhrase(text)) {
          bargedIn.current = true;
          interrupt();
        }
      },
      onFinal: (text) => {
        setHeard('');
        if (echo(text)) return;
        if (isStopPhrase(text)) {
          bargedIn.current = false;
          interrupt();
          return;
        }
        if (phaseRef.current === 'writing' || bargedIn.current) {
          bargedIn.current = false;
          interrupt();
          const question = afterWake(text) ?? text;
          if (question.split(/\s+/).length >= 2 && !isOpenBoard(question)) void askRef.current(question);
          else {
            awaiting.current = true;
            setPrompt(t('board.askNow'));
          }
          return;
        }
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
        setStatus(t(problemKey(code) as 'board.network'));
      },
    });
  };
  const thinking = phase === 'thinking';
  useEffect(() => {
    if (listening && !thinking) startListening(awaiting.current);
    else stopListening();
    return stopListening;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening, thinking, language]);

  // A question said elsewhere ("Hey Kora, …") arrives here and is asked once.
  useEffect(() => {
    if (q && !autoAsked.current && tutor.ready) {
      autoAsked.current = true;
      void askRef.current(q);
      onAsked?.();
    }
  }, [q, tutor.ready, onAsked]);

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
    echoUntil.current = Date.now() + 2500;
    // A board that was stopped because a new question was asked has nothing more to do.
    if (phaseRef.current !== 'writing') return;
    if (listening && !bargedIn.current) {
      followUntil.current = Date.now() + FOLLOW_UP_MS;
      setPrompt(t('board.followUp'));
    }
    setPhase('idle');
  };
  const saying = (text: string) => {
    // The last few sentences, as an echo can come back a little late.
    said.current = `${said.current.split(' ').slice(-40).join(' ')} ${text}`;
    echoUntil.current = Number.POSITIVE_INFINITY;
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
          (phase === 'writing' && listening ? t('board.talkOver') : null) ??
          (listening ? t('board.listening') : voiceSupported ? t('board.hint') : t('board.hintNoVoice')));

  const tools = (
    <View style={styles.tools}>
      <Pressable
        onPress={() => setVoice((v) => !v)}
        accessibilityRole="switch"
        accessibilityState={{ checked: voice }}
        accessibilityLabel={voice ? t('board.voiceOn') : t('board.voiceOff')}
        style={[styles.round, panel && styles.roundSmall]}>
        <Ionicons name={voice ? 'volume-high' : 'volume-mute'} size={panel ? 17 : 20} color={Colors.text} />
      </Pressable>
      <Pressable
        onPress={clear}
        accessibilityRole="button"
        accessibilityLabel={t('board.clear')}
        style={[styles.round, panel && styles.roundSmall]}>
        <Ionicons name="trash-outline" size={panel ? 16 : 19} color={Colors.text} />
      </Pressable>
      {panel && (
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={tc('actions.close')}
          style={[styles.round, styles.roundSmall]}>
          <Ionicons name="close" size={19} color={Colors.text} />
        </Pressable>
      )}
    </View>
  );

  return (
    <View style={[styles.page, panel && styles.pagePanel]}>
      {panel ? (
        <View style={styles.panelHead}>
          <Text variant="bodyStrong" style={{ flex: 1 }} numberOfLines={1}>
            {t('board.title')}
          </Text>
          {tools}
        </View>
      ) : (
        <ScreenHeader title={t('board.title')} right={tools} />
      )}

      <Whiteboard
        key={script.n}
        lines={script.lines}
        voice={voice}
        language={language}
        font={font}
        onDone={finished}
        onSay={saying}
        stopped={stoppedN === script.n}
        small={panel}
        empty={
          <View style={[styles.empty, panel && { paddingVertical: 24 }]}>
            <Text style={{ fontFamily: font, fontSize: panel ? 24 : 30, color: '#1f5fd1' }}>{t('board.title')}</Text>
            <Text style={{ fontFamily: font, fontSize: panel ? 18 : 22, color: '#5b5876' }}>{t('board.cardBody')}</Text>
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
              style={[styles.mic, panel && styles.micSmall]}>
              <Ionicons name={listening ? 'mic' : 'mic-outline'} size={panel ? 22 : 26} color="#fff" />
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
            style={[styles.input, panel && { paddingVertical: 10 }]}
          />
          {phase === 'writing' && !typed.trim() ? (
            // While Kora talks, the button stops her (as saying "okay" does).
            <Pressable
              onPress={interrupt}
              accessibilityRole="button"
              accessibilityLabel={t('board.quiet')}
              style={[styles.send, panel && styles.sendSmall, { backgroundColor: Colors.danger }]}>
              <Ionicons name="stop" size={panel ? 15 : 18} color="#fff" />
            </Pressable>
          ) : (
            <Pressable
              onPress={() => void ask(typed)}
              disabled={!typed.trim() || thinking}
              accessibilityRole="button"
              accessibilityLabel={t('board.write')}
              style={[styles.send, panel && styles.sendSmall, (!typed.trim() || thinking) && { opacity: 0.45 }]}>
              <Ionicons name="create" size={panel ? 17 : 20} color="#fff" />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, width: '100%', maxWidth: 1100, alignSelf: 'center', padding: Spacing.md, gap: Spacing.sm },
  pagePanel: { maxWidth: undefined, padding: Spacing.sm, gap: 6 },
  panelHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingStart: 4 },
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
  roundSmall: { width: 34, height: 34, borderRadius: 17 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: 80 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  mic: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  micSmall: { width: 46, height: 46, borderRadius: 23 },
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
  input: { flex: 1, minWidth: 0, paddingVertical: 14, fontFamily: Fonts.regular, fontSize: 16, color: Colors.text },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  sendSmall: { width: 38, height: 38, borderRadius: 19 },
});
