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
export type RoomMessage = {
  id: string;
  kind: 'text' | 'share' | 'system';
  text: string;
  data?: ShareItem | { event: string; name?: string };
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
  };
  members: RoomMember[];
  messages: RoomMessage[];
  now: number;
};

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

export const clock = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
