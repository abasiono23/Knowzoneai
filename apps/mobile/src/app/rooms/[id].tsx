import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router, useFocusEffect, useLocalSearchParams, type Href } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Share, StyleSheet, TextInput, View, type ScrollViewInstance } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookBackground } from '@/components/brand/book-background';
import { LoadError, Loading } from '@/components/exams/ui';
import { HistorySheet } from '@/components/rooms/history';
import { QuizCard, QuizSheet } from '@/components/rooms/quiz';
import { ScheduleSheet } from '@/components/rooms/schedule';
import { MemberFace, Sheet } from '@/components/rooms/ui';
import { ConfirmDialog } from '@/components/world/overlays';
import { Button, Card, ProgressBar, Text } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { api, type FriendsView } from '@/lib/api';
import {
  clock,
  quizStage,
  roomsApi,
  shareHref,
  when,
  type RoomMessage,
  type RoomState,
  type ShareItem,
  type SystemData,
} from '@/lib/rooms';
import { useMaterials } from '@/lib/studio/store';

const POLL_MS = 3000;

/**
 * A study room: who's here, the shared focus timer, the room goal and the chat. The screen checks in
 * every few seconds for new messages and the timer; the countdown runs on the phone in between.
 */
export default function RoomScreen() {
  const { t } = useTranslation('rooms');
  const { id, invite } = useLocalSearchParams<{ id: string; invite?: string }>();
  const [state, setState] = useState<RoomState | null>(null);
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notMember, setNotMember] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [text, setText] = useState('');
  const [note, setNote] = useState<string | null>(null);
  const [sheet, setSheet] = useState<'invite' | 'people' | 'share' | 'quiz' | 'schedule' | 'history' | null>(
    invite === '1' ? 'invite' : null,
  );
  const [busy, setBusy] = useState(false);
  // Questions for Kora instead of the room (always, during focus time).
  const [koraMode, setKoraMode] = useState(false);
  const [asking, setAsking] = useState(false);
  // Quiz answers sent from this phone, until the server's state includes them.
  const [picked, setPicked] = useState<Record<string, Record<number, number>>>({});
  const [closedQuiz, setClosedQuiz] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<'leave' | 'close' | null>(null);
  const [goalDraft, setGoalDraft] = useState<string | null>(null);
  const [reported, setReported] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const last = useRef(0);
  // Server time minus phone time, so everyone's countdown matches.
  const [offset, setOffset] = useState(0);
  const scroll = useRef<ScrollViewInstance | null>(null);

  const apply = useCallback((s: RoomState, fresh: boolean) => {
    setOffset(s.now - Date.now());
    setState(s);
    setMessages((old) => {
      const merged = fresh ? s.messages : [...old, ...s.messages.filter((m) => !old.some((o) => o.id === m.id))];
      last.current = merged.at(-1)?.createdAt ?? last.current;
      return merged;
    });
  }, []);

  const poll = useCallback(
    async (fresh = false) => {
      try {
        apply(await roomsApi.state(id, fresh ? undefined : last.current || undefined), fresh);
        setError(null);
      } catch (e) {
        if ((e as { status?: number }).status === 404) setNotMember(true);
        else setError(errorText(e, t('loadFailed')));
      }
    },
    [id, apply, t],
  );

  // Check in while the screen is open; tick the countdown every second.
  useFocusEffect(
    useCallback(() => {
      void poll(true);
      const p = setInterval(() => void poll(), POLL_MS);
      const c = setInterval(() => setNow(Date.now()), 1000);
      return () => {
        clearInterval(p);
        clearInterval(c);
      };
    }, [poll]),
  );

  useEffect(() => {
    scroll.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  // Check in as soon as a quiz question closes, so the answer shows without waiting for the next poll.
  const quiz = state?.quiz ?? null;
  const stage = quiz ? quizStage(quiz, now + offset) : null;
  const stageKey = stage ? `${quiz!.id}:${stage.stage}:${stage.index}` : '';
  useEffect(() => {
    if (stageKey) void poll();
  }, [stageKey, poll]);

  const act = async (fn: () => Promise<RoomState | unknown>) => {
    setNote(null);
    try {
      const res = await fn();
      if (res && typeof res === 'object' && 'room' in res) apply(res as RoomState, false);
      else void poll();
    } catch (e) {
      setNote(errorText(e));
    }
  };

  if (notMember)
    return (
      <Shell>
        <Card style={{ gap: Spacing.sm }}>
          <Text variant="heading">{t('joinTitle')}</Text>
          <Text variant="small" color={Colors.textSecondary}>
            {t('joinBody')}
          </Text>
          <Button
            title={t('accept')}
            onPress={() =>
              void roomsApi
                .join({ roomId: id })
                .then(() => {
                  setNotMember(false);
                  void poll(true);
                })
                .catch((e) => setNote(errorText(e)))
            }
          />
          {!!note && (
            <Text variant="small" color={Colors.danger}>
              {note}
            </Text>
          )}
        </Card>
      </Shell>
    );
  if (!state)
    return (
      <Shell>
        {error ? (
          <LoadError
            text={error}
            onRetry={() => {
              setError(null);
              void poll(true);
            }}
          />
        ) : (
          <Loading />
        )}
      </Shell>
    );

  const { room, members } = state;
  const timer = room.timer;
  const left = timer.endsAt ? timer.endsAt - (now + offset) : 0;
  const total = (timer.phase === 'focus' ? timer.focusMinutes : timer.breakMinutes) * 60_000;
  const here = members.filter((m) => m.online).length;
  const done = members.filter((m) => m.goalDone).length;
  const meMember = members.find((m) => m.me);
  const quiet = timer.phase === 'focus';
  const toKora = koraMode || quiet;
  const serverNow = now + offset;
  const quizRunning = !!quiz && !quiz.finished && stage?.stage !== 'done';
  const labels = { today: t('today'), tomorrow: t('tomorrow') };
  // Someone asked Kora and the answer isn't in yet.
  const koraThinking =
    asking ||
    messages.some(
      (m) =>
        m.data &&
        'toKora' in m.data &&
        serverNow - m.createdAt < 60_000 &&
        !messages.some((r) => r.kind === 'kora' && r.data && 'replyTo' in r.data && r.data.replyTo === m.id),
    );

  const send = async () => {
    const body = text.trim();
    if (!body) return;
    setText('');
    if (!toKora) return act(() => roomsApi.say(room.id, body));
    setAsking(true);
    await act(() => roomsApi.kora(room.id, body));
    setAsking(false);
  };
  const busyAct = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    await act(fn);
    setBusy(false);
  };
  const answer = (index: number, choice: number) => {
    if (!quiz) return;
    setPicked((p) => ({ ...p, [quiz.id]: { ...p[quiz.id], [index]: choice } }));
    void roomsApi.answer(room.id, quiz.id, index, choice).catch((e) => setNote(errorText(e)));
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <BookBackground />
      <SafeAreaView edges={['top']} style={styles.top}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('title')}
          hitSlop={10}
          style={styles.round}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text variant="heading" numberOfLines={1}>
            {room.name}
          </Text>
          <Pressable
            onPress={() => {
              void Clipboard.setStringAsync(room.code);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            accessibilityRole="button"
            accessibilityLabel={t('copy')}>
            <Text variant="small" color={Colors.primary}>
              {copied ? t('copied') : t('code', { code: room.code })} <Ionicons name="copy-outline" size={12} />
            </Text>
          </Pressable>
        </View>
        <Pressable
          onPress={() => setSheet('invite')}
          accessibilityRole="button"
          accessibilityLabel={t('invite')}
          style={styles.round}>
          <Ionicons name="person-add" size={20} color={Colors.primary} />
        </Pressable>
        <Pressable
          onPress={() => setSheet('people')}
          accessibilityRole="button"
          accessibilityLabel={t('people')}
          style={styles.round}>
          <Ionicons name="ellipsis-horizontal" size={20} color={Colors.text} />
        </Pressable>
      </SafeAreaView>

      <ScrollView ref={scroll} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {/* Who's here */}
        <View style={styles.rowBetween}>
          <Pressable onPress={() => setSheet('people')} accessibilityRole="button" style={styles.people}>
            {members.slice(0, 8).map((m) => (
              <MemberFace key={m.id} m={m} size={36} />
            ))}
            <Text variant="small" color={Colors.textSecondary} style={{ marginLeft: 4 }}>
              {t('here', { count: here })}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setSheet('history')}
            accessibilityRole="button"
            accessibilityLabel={t('history.title')}
            style={[styles.streak, room.streak > 0 && styles.streakOn]}>
            {room.streak > 0 ? (
              <Text style={{ fontFamily: Fonts.extrabold, fontSize: 13 }} color={Colors.onBright}>
                🔥 {room.streak}
              </Text>
            ) : (
              <Ionicons name="stats-chart" size={16} color={Colors.primary} />
            )}
          </Pressable>
        </View>

        {/* Quiz battle */}
        {quiz && quiz.id !== closedQuiz && (
          <QuizCard
            quiz={quiz}
            now={serverNow}
            host={room.host}
            picked={picked[quiz.id] ?? {}}
            onAnswer={answer}
            onAgain={() => setSheet('quiz')}
            onClose={() => setClosedQuiz(quiz.id)}
          />
        )}

        {/* The shared timer */}
        <Card
          style={[
            styles.timer,
            timer.phase === 'focus' && styles.focusCard,
            timer.phase === 'break' && styles.breakCard,
          ]}>
          <Text
            variant="label"
            color={
              timer.phase === 'focus' ? Colors.success : timer.phase === 'break' ? Colors.reward : Colors.textSecondary
            }>
            {t(`timer.${timer.phase}`)}
          </Text>
          <Text style={styles.clock}>{timer.phase === 'idle' ? `${timer.focusMinutes}:00` : clock(left)}</Text>
          {timer.phase !== 'idle' && <ProgressBar progress={Math.min(1, 1 - left / total)} height={8} />}
          <Text variant="small" color={Colors.textSecondary} center>
            {t(`timer.${timer.phase}Hint`)}
          </Text>
          {room.host &&
            (timer.phase === 'idle' ? (
              <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                {[25, 50].map((m) => (
                  <View key={m} style={{ flex: 1 }}>
                    <Button
                      title={t('timer.start', { minutes: m })}
                      variant={m === 25 ? 'primary' : 'secondary'}
                      onPress={() => void act(() => roomsApi.timer(room.id, 'start', m))}
                    />
                  </View>
                ))}
              </View>
            ) : (
              <Button
                title={t('timer.stop')}
                variant="secondary"
                icon="stop"
                onPress={() => void act(() => roomsApi.timer(room.id, 'stop'))}
              />
            ))}
          {timer.sessions > 0 && (
            <Text variant="small" color={Colors.textMuted} center>
              {t('timer.sessions', { count: timer.sessions })}
            </Text>
          )}
          {room.next && (
            <Pressable
              onPress={() => room.host && setSheet('schedule')}
              disabled={!room.host}
              accessibilityRole="button"
              style={styles.next}>
              <Text variant="small" color={Colors.primary} center style={{ fontFamily: Fonts.semibold }}>
                📅 {t('schedule.next', { time: when(room.next.at, labels), minutes: room.next.minutes })}
              </Text>
            </Pressable>
          )}
          {room.host && (
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {!room.next && (
                <View style={{ flex: 1 }}>
                  <Button
                    title={t('schedule.button')}
                    variant="ghost"
                    icon="calendar"
                    onPress={() => setSheet('schedule')}
                  />
                </View>
              )}
              {timer.phase !== 'focus' && !quizRunning && (
                <View style={{ flex: 1 }}>
                  <Button title={t('quiz.button')} variant="ghost" icon="trophy" onPress={() => setSheet('quiz')} />
                </View>
              )}
            </View>
          )}
        </Card>

        {/* The room goal */}
        <Card style={{ gap: Spacing.sm }}>
          <View style={styles.rowBetween}>
            <Text variant="label" color={Colors.primary}>
              {t('goal')}
            </Text>
            {room.goal && (
              <Text variant="small" color={Colors.textSecondary}>
                {t('goalProgress', { done, total: members.length })}
              </Text>
            )}
          </View>
          {goalDraft !== null ? (
            <>
              <TextInput
                value={goalDraft}
                onChangeText={setGoalDraft}
                placeholder={t('goalPlaceholder')}
                placeholderTextColor={Colors.textMuted}
                maxLength={120}
                accessibilityLabel={t('goal')}
                style={styles.input}
              />
              <Button
                title={t('setGoal')}
                disabled={!goalDraft.trim()}
                onPress={() =>
                  void act(async () => {
                    const res = await roomsApi.setGoal(room.id, goalDraft.trim());
                    setGoalDraft(null);
                    return res;
                  })
                }
              />
            </>
          ) : room.goal ? (
            <>
              <Text variant="bodyStrong">{room.goal}</Text>
              <ProgressBar progress={members.length ? done / members.length : 0} height={6} />
              <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <Button
                    title={meMember?.goalDone ? t('goalUntick') : t('goalTick')}
                    variant={meMember?.goalDone ? 'secondary' : 'primary'}
                    icon={meMember?.goalDone ? 'refresh' : 'checkmark-done'}
                    onPress={() => void act(() => roomsApi.tick(room.id, !meMember?.goalDone))}
                  />
                </View>
                {room.host && (
                  <Button title={t('editGoal')} variant="ghost" onPress={() => setGoalDraft(room.goal ?? '')} />
                )}
              </View>
            </>
          ) : (
            <>
              <Text variant="small" color={Colors.textSecondary}>
                {t('goalEmpty')}
              </Text>
              {room.host && (
                <Button title={t('setGoal')} variant="secondary" icon="flag" onPress={() => setGoalDraft('')} />
              )}
            </>
          )}
        </Card>

        {/* Chat */}
        <Text variant="label" color={Colors.textSecondary}>
          {t('chat')}
        </Text>
        {messages.map((m) => (
          <Message
            key={m.id}
            m={m}
            reported={reported.includes(m.id)}
            onReport={() => void act(() => roomsApi.report(room.id, m.id)).then(() => setReported((r) => [...r, m.id]))}
          />
        ))}
        {koraThinking && (
          <View style={styles.thinking}>
            <Ionicons name="sparkles" size={14} color={Colors.primary} />
            <Text variant="small" color={Colors.primary}>
              {t('kora.thinking')}
            </Text>
          </View>
        )}
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.composer}>
        {!!note && (
          <Text variant="small" color={Colors.danger}>
            {note}
          </Text>
        )}
        {quiet && (
          <Text variant="small" color={Colors.textSecondary} center>
            {t('chatQuietKora')}
          </Text>
        )}
        <View style={styles.inputRow}>
          {!quiet && (
            <Pressable
              onPress={() => setSheet('share')}
              accessibilityRole="button"
              accessibilityLabel={t('shareItem')}
              style={styles.round}>
              <Ionicons name="attach" size={22} color={Colors.primary} />
            </Pressable>
          )}
          <Pressable
            onPress={() => setKoraMode((k) => !k)}
            disabled={quiet}
            accessibilityRole="switch"
            accessibilityState={{ checked: toKora }}
            accessibilityLabel={t('kora.toggle')}
            style={[styles.round, toKora && { backgroundColor: Colors.primary }]}>
            <Ionicons name="sparkles" size={20} color={toKora ? '#fff' : Colors.primary} />
          </Pressable>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={toKora ? t('kora.placeholder') : t('message')}
            placeholderTextColor={Colors.textMuted}
            maxLength={500}
            accessibilityLabel={toKora ? t('kora.placeholder') : t('message')}
            style={[styles.input, { flex: 1 }, toKora && { borderColor: Colors.primary }]}
            onSubmitEditing={() => void send()}
            returnKeyType="send"
          />
          <Pressable
            onPress={() => void send()}
            disabled={!text.trim() || asking}
            accessibilityRole="button"
            accessibilityLabel={t('send')}
            style={[styles.send, (!text.trim() || asking) && { opacity: 0.4 }]}>
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        </View>
        <Text variant="small" color={Colors.textMuted} style={{ fontSize: 11 }} center>
          {t('rules')}
        </Text>
      </SafeAreaView>

      <InviteSheet
        visible={sheet === 'invite'}
        roomId={room.id}
        code={room.code}
        name={room.name}
        memberIds={members.map((m) => m.id)}
        onClose={() => setSheet(null)}
      />
      <PeopleSheet
        visible={sheet === 'people'}
        state={state}
        onClose={() => setSheet(null)}
        onRemove={(userId) => void act(() => roomsApi.remove(room.id, userId))}
        onLeave={() => setConfirm('leave')}
        onCloseRoom={() => setConfirm('close')}
      />
      <ShareSheet
        visible={sheet === 'share'}
        onClose={() => setSheet(null)}
        onShare={(s) => void act(() => roomsApi.share(room.id, s)).then(() => setSheet(null))}
      />
      <QuizSheet
        visible={sheet === 'quiz'}
        roomSubject={room.subject}
        busy={busy}
        onClose={() => setSheet(null)}
        onStart={(exam, subject) =>
          void busyAct(async () => {
            const res = await roomsApi.startQuiz(room.id, exam, subject);
            setSheet(null);
            return res;
          })
        }
      />
      <ScheduleSheet
        visible={sheet === 'schedule'}
        now={serverNow}
        next={room.next}
        busy={busy}
        onClose={() => setSheet(null)}
        onSchedule={(at, minutes) =>
          void busyAct(async () => {
            const res = await roomsApi.schedule(room.id, at, minutes);
            setSheet(null);
            return res;
          })
        }
        onCancel={() => void act(() => roomsApi.schedule(room.id, null))}
      />
      <HistorySheet visible={sheet === 'history'} roomId={room.id} onClose={() => setSheet(null)} />
      <ConfirmDialog
        visible={!!confirm}
        icon="exit-outline"
        destructive
        title={confirm === 'close' ? t('closeTitle') : t('leaveTitle')}
        body={confirm === 'close' ? t('closeBody') : t('leaveBody')}
        confirmLabel={confirm === 'close' ? t('close') : t('leave')}
        cancelLabel={t('cancel')}
        onConfirm={() => {
          const closing = confirm === 'close';
          setConfirm(null);
          setSheet(null);
          void (closing ? roomsApi.close(room.id) : roomsApi.leave(room.id))
            .then(() => router.replace('/rooms' as Href))
            .catch((e) => setNote(errorText(e)));
        }}
        onCancel={() => setConfirm(null)}
      />
    </View>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <BookBackground />
      <SafeAreaView style={{ flex: 1, padding: Spacing.md, gap: Spacing.md }}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" style={styles.round}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>
        {children}
      </SafeAreaView>
    </View>
  );
}

function Message({ m, reported, onReport }: { m: RoomMessage; reported: boolean; onReport: () => void }) {
  const { t } = useTranslation('rooms');
  const tx = t as unknown as (key: string, options?: Record<string, unknown>) => string;
  const te = useTranslation('exams').t as unknown as (key: string) => string;
  if (m.kind === 'system') {
    const d = m.data as SystemData | undefined;
    return (
      <Text variant="small" color={Colors.textMuted} center style={{ fontSize: 12 }}>
        {tx(`system.${d?.event ?? m.text}`, {
          name: d?.name ?? t('someone'),
          count: d?.count,
          points: d?.points,
          minutes: d?.minutes,
          time: d?.at ? when(d.at, { today: t('today'), tomorrow: t('tomorrow') }) : '',
          quiz: d?.exam && d.subject ? `${te(`exams.${d.exam}.name`)} ${te(`subjects.${d.subject}`)}` : '',
        })}
      </Text>
    );
  }
  if (m.kind === 'kora') {
    const d = m.data as { askedBy?: string } | undefined;
    return (
      <View style={styles.bubbleRow}>
        <View style={styles.koraFace}>
          <Ionicons name="sparkles" size={16} color="#fff" />
        </View>
        <View style={[styles.bubble, styles.kora]}>
          <Text style={{ fontFamily: Fonts.bold, fontSize: 12 }} color={Colors.primary}>
            {t('kora.name')}
            {d?.askedBy ? ` · ${t('kora.answering', { name: d.askedBy })}` : ''}
          </Text>
          <Text variant="body">{m.text}</Text>
        </View>
      </View>
    );
  }
  const askedKora = !!m.data && 'toKora' in m.data;
  const who = m.mine ? t('you') : (m.name ?? t('learner'));
  const share = m.kind === 'share' ? (m.data as ShareItem) : null;
  return (
    <View style={[styles.bubbleRow, m.mine && { justifyContent: 'flex-end' }]}>
      <View style={[styles.bubble, m.mine ? styles.mine : styles.theirs]}>
        {!m.mine && (
          <Text style={{ fontFamily: Fonts.bold, fontSize: 12 }} color={Colors.primary}>
            {who}
          </Text>
        )}
        {askedKora && (
          <Text
            style={{ fontFamily: Fonts.semibold, fontSize: 11 }}
            color={m.mine ? 'rgba(255,255,255,0.85)' : Colors.textSecondary}>
            ✨ {t('kora.to')}
          </Text>
        )}
        {share ? (
          <Pressable
            onPress={() => router.push(shareHref(share) as Href)}
            accessibilityRole="button"
            style={styles.shareCard}>
            <Ionicons
              name={
                share.type === 'paper'
                  ? 'school'
                  : share.type === 'reel'
                    ? 'play-circle'
                    : share.type === 'pack'
                      ? 'layers'
                      : 'book'
              }
              size={20}
              color={Colors.primary}
            />
            <Text variant="small" style={{ flex: 1, fontFamily: Fonts.semibold }}>
              {share.title}
            </Text>
            <Text variant="small" color={Colors.primary}>
              {t('open')}
            </Text>
          </Pressable>
        ) : (
          <Text variant="body" color={m.mine ? '#fff' : Colors.text}>
            {m.text}
          </Text>
        )}
        {!m.mine && (
          <Pressable
            onPress={onReport}
            disabled={reported}
            accessibilityRole="button"
            accessibilityLabel={t('report')}
            hitSlop={8}
            style={{ alignSelf: 'flex-end' }}>
            {reported ? (
              <Text variant="small" color={Colors.textMuted} style={{ fontSize: 11 }}>
                {t('reported')}
              </Text>
            ) : (
              <Ionicons name="flag-outline" size={12} color={Colors.textMuted} />
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}

function InviteSheet({
  visible,
  roomId,
  code,
  name,
  memberIds,
  onClose,
}: {
  visible: boolean;
  roomId: string;
  code: string;
  name: string;
  memberIds: string[];
  onClose: () => void;
}) {
  const { t } = useTranslation('rooms');
  const [friends, setFriends] = useState<FriendsView['friends'] | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [sent, setSent] = useState(false);
  useEffect(() => {
    if (visible)
      api
        .getFriends()
        .then((f) => setFriends(f.friends))
        .catch(() => setFriends([]));
  }, [visible]);
  const list = (friends ?? []).filter((f) => !memberIds.includes(f.id));
  return (
    <Sheet visible={visible} title={t('inviteTitle')} onClose={onClose}>
      <Button
        title={t('shareCode')}
        variant="secondary"
        icon="share-social"
        onPress={() => void Share.share({ message: t('shareMessage', { name, code }) }).catch(() => {})}
      />
      <ScrollView style={{ maxHeight: 320 }}>
        {friends === null ? (
          <Loading />
        ) : list.length ? (
          list.map((f) => {
            const on = picked.includes(f.id);
            return (
              <Pressable
                key={f.id}
                onPress={() => setPicked((p) => (on ? p.filter((x) => x !== f.id) : [...p, f.id]))}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                style={styles.personRow}>
                <MemberFace m={{ avatar: f.avatar, name: f.name, online: false }} size={36} />
                <Text variant="bodyStrong" style={{ flex: 1 }}>
                  {f.name ?? t('learner')}
                </Text>
                <Ionicons
                  name={on ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={on ? Colors.primary : Colors.textMuted}
                />
              </Pressable>
            );
          })
        ) : (
          <Text variant="small" color={Colors.textSecondary}>
            {t('inviteNone')}
          </Text>
        )}
      </ScrollView>
      {sent ? (
        <Text variant="bodyStrong" color={Colors.success} center>
          {t('inviteSent')}
        </Text>
      ) : (
        <Button
          title={t('inviteSend', { count: picked.length })}
          disabled={!picked.length}
          icon="paper-plane"
          onPress={() =>
            void roomsApi.invite(roomId, picked).then(() => {
              setSent(true);
              setPicked([]);
              setTimeout(() => {
                setSent(false);
                onClose();
              }, 1200);
            })
          }
        />
      )}
    </Sheet>
  );
}

function PeopleSheet({
  visible,
  state,
  onClose,
  onRemove,
  onLeave,
  onCloseRoom,
}: {
  visible: boolean;
  state: RoomState;
  onClose: () => void;
  onRemove: (userId: string) => void;
  onLeave: () => void;
  onCloseRoom: () => void;
}) {
  const { t } = useTranslation('rooms');
  return (
    <Sheet visible={visible} title={t('inRoom')} onClose={onClose}>
      <ScrollView style={{ maxHeight: 340 }}>
        {state.members.map((m) => (
          <View key={m.id} style={styles.personRow}>
            <MemberFace m={m} size={40} />
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">
                {m.me ? t('you') : (m.name ?? t('learner'))} {m.host ? `· ${t('hostBadge')}` : ''}
              </Text>
              <Text variant="small" color={Colors.textSecondary}>
                {t('minutes', { count: m.focusMinutes })}
              </Text>
            </View>
            {state.room.host && !m.me && (
              <Pressable
                onPress={() => onRemove(m.id)}
                accessibilityRole="button"
                accessibilityLabel={t('remove')}
                hitSlop={8}>
                <Ionicons name="person-remove" size={20} color={Colors.danger} />
              </Pressable>
            )}
          </View>
        ))}
      </ScrollView>
      <Button title={t('leave')} variant="secondary" icon="exit-outline" onPress={onLeave} />
      {state.room.host && <Button title={t('close')} variant="danger" icon="trash" onPress={onCloseRoom} />}
    </Sheet>
  );
}

function ShareSheet({
  visible,
  onClose,
  onShare,
}: {
  visible: boolean;
  onClose: () => void;
  onShare: (s: ShareItem) => void;
}) {
  const { t } = useTranslation('rooms');
  const { materials } = useMaterials();
  const packs = materials.filter((m) => m.status === 'ready').slice(0, 20);
  return (
    <Sheet visible={visible} title={t('shareTitle')} onClose={onClose}>
      <Pressable
        onPress={() => onShare({ type: 'reel', id: 'feed', title: t('shareFlashcards') })}
        accessibilityRole="button"
        style={styles.personRow}>
        <Ionicons name="play-circle" size={26} color="#E0459A" />
        <Text variant="bodyStrong" style={{ flex: 1 }}>
          {t('shareFlashcards')}
        </Text>
      </Pressable>
      <Text variant="label" color={Colors.textSecondary}>
        {t('sharePacks')}
      </Text>
      <ScrollView style={{ maxHeight: 280 }}>
        {packs.length ? (
          packs.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => onShare({ type: 'pack', id: p.id, title: p.title.slice(0, 120) })}
              accessibilityRole="button"
              style={styles.personRow}>
              <Ionicons name="layers" size={22} color={Colors.primary} />
              <Text variant="body" style={{ flex: 1 }} numberOfLines={1}>
                {p.title}
              </Text>
            </Pressable>
          ))
        ) : (
          <Text variant="small" color={Colors.textSecondary}>
            {t('shareNone')}
          </Text>
        )}
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  round: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceRaised,
  },
  body: { padding: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.xl },
  people: { flexDirection: 'row', alignItems: 'center', gap: -6 },
  timer: { alignItems: 'stretch', gap: Spacing.sm },
  focusCard: { borderColor: Colors.success, borderWidth: 1.5 },
  breakCard: { borderColor: Colors.reward, borderWidth: 1.5 },
  clock: { fontFamily: Fonts.extrabold, fontSize: 56, lineHeight: 64, color: Colors.text, textAlign: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  input: {
    minHeight: 46,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    color: Colors.text,
    fontFamily: Fonts.regular,
    fontSize: 15,
  },
  composer: {
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  send: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  bubbleRow: { flexDirection: 'row' },
  bubble: { maxWidth: '82%', gap: 2, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  mine: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  theirs: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderBottomLeftRadius: 4 },
  shareCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 12,
    backgroundColor: Colors.surfaceRaised,
    minWidth: 220,
  },
  streak: {
    minWidth: 40,
    height: 32,
    paddingHorizontal: 10,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceRaised,
  },
  streakOn: { backgroundColor: Colors.reward },
  next: { paddingVertical: 6, borderRadius: Radius.md, backgroundColor: Colors.primarySoft },
  thinking: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 40 },
  koraFace: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  kora: { backgroundColor: Colors.primarySoft, borderWidth: 1, borderColor: Colors.primary, borderBottomLeftRadius: 4 },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xs },
});
