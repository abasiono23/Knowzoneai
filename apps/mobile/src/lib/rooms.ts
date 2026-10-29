import { formatDate, formatTime } from '@/i18n';
import { post, request, type WorldAvatar } from '@/lib/api';

/**
 * Study Rooms: friends study together with a shared focus timer, chat and a room goal. The room
 * screen checks in with the server every few seconds for new messages, who's here and the timer.
 */
export type RoomSummary = {
  id: string;
  code: string;
  name: string;
  subject: string | null;
  visibility: 'private' | 'school';
  members: number;
  host: boolean;
  phase: 'idle' | 'focus' | 'break';
  endsAt: number | null;
  streak: number;
  /** When the next scheduled session starts. */
  next: number | null;
};
export type RoomInvite = { id: string; room: RoomSummary; from: string };
export type RoomsHome = { rooms: RoomSummary[]; school: RoomSummary[]; invites: RoomInvite[] };

export type RoomMember = {
  id: string;
  me: boolean;
  name: string | null;
  avatar: WorldAvatar | null;
  host: boolean;
  online: boolean;
  goalDone: boolean;
  focusMinutes: number;
};
export type ShareItem = { type: 'pack' | 'reel' | 'lesson' | 'paper' | 'course'; id: string; title: string };
export type SystemData = {
  event: string;
  name?: string;
  count?: number;
  points?: number;
  at?: number;
  minutes?: number;
  exam?: string;
  subject?: string;
};
export type RoomMessage = {
  id: string;
  /** kora: Kora's answer to a question asked in the room. */
  kind: 'text' | 'share' | 'system' | 'kora';
  text: string;
  data?: ShareItem | SystemData | { toKora: true } | { replyTo: string; askedBy: string };
  createdAt: number;
  userId?: string;
  name?: string | null;
  mine?: boolean;
};
export type RoomState = {
  room: {
    id: string;
    code: string;
    name: string;
    subject: string | null;
    visibility: 'private' | 'school';
    goal: string | null;
    host: boolean;
    timer: {
      phase: 'idle' | 'focus' | 'break';
      endsAt: number | null;
      focusMinutes: number;
      breakMinutes: number;
      sessions: number;
    };
    streak: number;
    bestStreak: number;
    studiedToday: boolean;
    next: { at: number; minutes: number } | null;
  };
  members: RoomMember[];
  messages: RoomMessage[];
  quiz: RoomQuiz | null;
  now: number;
};

/** A quiz battle: answers stay hidden until each question closes (`reveals` grows as they do). */
export type RoomQuiz = {
  id: string;
  exam: string;
  subject: string;
  startedAt: number;
  leadMs: number;
  questionMs: number;
  revealMs: number;
  finished: boolean;
  questions: { q: string; options: string[] }[];
  reveals: { answer: number; explanation: string; picks: number[] }[];
  mine: (number | null)[];
  answered: number[];
  scores: { id: string; name: string | null; me: boolean; points: number; correct: number }[];
};

export type RoomHistory = {
  streak: number;
  bestStreak: number;
  totalSessions: number;
  totalMinutes: number;
  quizzes: number;
  days: { day: string; minutes: number }[];
  sessions: { endedAt: number; minutes: number; people: number }[];
};

/** Where the quiz is at a moment: the countdown before it, a question open, its answer showing, or done. */
export function quizStage(q: RoomQuiz, now: number) {
  const t = now - q.startedAt - q.leadMs;
  if (t < 0) return { stage: 'lead' as const, index: 0, left: -t };
  const slot = q.questionMs + q.revealMs;
  const index = Math.floor(t / slot);
  if (index >= q.questions.length || q.finished)
    return { stage: 'done' as const, index: q.questions.length - 1, left: 0 };
  const into = t - index * slot;
  return into < q.questionMs
    ? { stage: 'question' as const, index, left: q.questionMs - into }
    : { stage: 'reveal' as const, index, left: slot - into };
}

const base = '/me/study-rooms';
export const roomsApi = {
  home: () => request<RoomsHome>(base),
  create: (body: { name: string; subject?: string; visibility: 'private' | 'school' }) =>
    post<{ room: { id: string; code: string } }>(base, body),
  join: (body: { code?: string; roomId?: string }) =>
    post<{ room: { id: string; code: string } }>(`${base}/join`, body),
  decline: (inviteId: string) => post<{ ok: true }>(`${base}/invites/${inviteId}/decline`),
  state: (id: string, since?: number) => request<RoomState>(`${base}/${id}${since ? `?since=${since}` : ''}`),
  invite: (id: string, friends: string[]) => post<{ sent: number }>(`${base}/${id}/invite`, { friends }),
  say: (id: string, text: string) => post<{ id: string }>(`${base}/${id}/messages`, { text }),
  share: (id: string, share: ShareItem) => post<{ id: string }>(`${base}/${id}/messages`, { share }),
  report: (id: string, messageId: string) => post<{ ok: true }>(`${base}/${id}/messages/${messageId}/report`),
  timer: (id: string, action: 'start' | 'stop', focusMinutes?: number) =>
    post<RoomState>(`${base}/${id}/timer`, {
      action,
      ...(focusMinutes && { focusMinutes, breakMinutes: focusMinutes >= 45 ? 10 : 5 }),
    }),
  setGoal: (id: string, goal: string | null) =>
    request<RoomState>(`${base}/${id}`, { method: 'PATCH', body: JSON.stringify({ goal }) }),
  tick: (id: string, done: boolean) => post<RoomState>(`${base}/${id}/goal`, { done }),
  kora: (id: string, question: string) => post<RoomState>(`${base}/${id}/kora`, { question }),
  startQuiz: (id: string, exam: string, subject: string) => post<RoomState>(`${base}/${id}/quiz`, { exam, subject }),
  answer: (id: string, quizId: string, index: number, choice: number) =>
    post<{ ok: true }>(`${base}/${id}/quiz/answer`, { quizId, index, choice }),
  schedule: (id: string, at: number | null, minutes?: 25 | 50) =>
    post<RoomState>(`${base}/${id}/schedule`, { at, ...(minutes && { minutes }) }),
  history: (id: string) => request<RoomHistory>(`${base}/${id}/history`),
  leave: (id: string) => post<{ ok: true }>(`${base}/${id}/leave`),
  remove: (id: string, userId: string) => request<RoomState>(`${base}/${id}/members/${userId}`, { method: 'DELETE' }),
  close: (id: string) => request<{ ok: true }>(`${base}/${id}`, { method: 'DELETE' }),
};

/** Where a shared item opens. */
export function shareHref(s: ShareItem) {
  switch (s.type) {
    case 'pack':
      return `/study/${s.id}`;
    case 'reel':
      return '/reels';
    case 'paper':
      return `/exams/paper/${s.id}`;
    case 'course':
      return `/courses/${s.id}`;
    case 'lesson': {
      const [course, lesson] = s.id.split('/');
      return `/courses/${course}/lesson/${lesson}`;
    }
  }
}

/** "Today 6:00 PM", "Tomorrow 8:00 AM" or "Fri 31 Oct, 8:00 AM". */
export function when(at: number, labels: { today: string; tomorrow: string }) {
  const day = (t: number) => new Date(t).setHours(0, 0, 0, 0);
  const days = Math.round((day(at) - day(Date.now())) / 86_400_000);
  const date =
    days === 0
      ? labels.today
      : days === 1
        ? labels.tomorrow
        : formatDate(at, { weekday: 'short', day: 'numeric', month: 'short' });
  return `${date}, ${formatTime(at)}`;
}

export const clock = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
