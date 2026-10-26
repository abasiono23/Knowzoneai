import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import i18n from '@/i18n';

import { ApiError } from '../api';
import { USE_MOCKS } from '../config';
import { useSession } from '../session';
import { storage } from '../storage';
import { generateAnswer, titleFrom } from './brain';
import * as remote from './remote';
import {
  DAILY_LIMITS,
  type AssistantMessage,
  type Attachment,
  type Conversation,
  type Deck,
  type Note,
  type TutorLevel,
  type TutorMode,
  type UserMessage,
} from './types';

const KEY = 'knowzone.tutor';
const uid = () => Math.random().toString(36).slice(2, 10);
/** Ids for things the server hasn't confirmed yet. */
const localId = () => `local-${uid()}`;
const isLocal = (id: string) => id.startsWith('local-');
const today = () => new Date().toISOString().slice(0, 10);
const nextMidnight = () => {
  const d = new Date();
  d.setHours(24, 0, 0, 0);
  return d.getTime();
};

/** Web image picks are base64 data URIs; keep them in memory but don't overflow device storage. */
function dropLargeDataUris(key: string, value: unknown) {
  return key === 'uri' && typeof value === 'string' && value.startsWith('data:') && value.length > 150_000 ? '' : value;
}

type State = {
  conversations: Conversation[];
  notes: Note[];
  decks: Deck[];
  /** Mock mode counts questions on the device; real mode uses `serverUsage`. */
  usage: { date: string; used: number };
};
const EMPTY: State = { conversations: [], notes: [], decks: [], usage: { date: today(), used: 0 } };

export type SendResult = 'ok' | 'error' | 'limit';
export type MakeResult = 'ok' | 'error' | 'no-credits' | 'unavailable';

type Tutor = State & {
  ready: boolean;
  thinking: Record<string, boolean>;
  limit: number;
  remaining: number;
  /** When today's allowance starts again (epoch ms). */
  resetAt: number;
  createConversation: (input: {
    mode: TutorMode;
    level: TutorLevel;
    subject?: string;
    context?: Conversation['context'];
  }) => string;
  /** Loads a conversation's messages (real mode; the history list comes without them). */
  open: (conversationId: string) => void;
  send: (conversationId: string, text: string, attachment?: Attachment) => Promise<SendResult>;
  retry: (conversationId: string, assistantId: string) => Promise<SendResult>;
  remove: (conversationId: string) => void;
  togglePin: (conversationId: string) => void;
  saveNote: (note: Omit<Note, 'id' | 'createdAt'>) => Note;
  removeNote: (id: string) => void;
  saveDeck: (deck: Omit<Deck, 'id' | 'createdAt'>) => Deck;
  /** Makes flashcards / a quiz for an answer with AI (kept with the answer). */
  makeFlashcards: (conversationId: string, messageId: string) => Promise<MakeResult>;
  makeQuiz: (conversationId: string, messageId: string) => Promise<MakeResult>;
  /** Draws a diagram for an answer (1 AI credit). */
  drawDiagram: (conversationId: string, messageId: string) => Promise<MakeResult>;
  /** Diagrams need the server; the offline demo can't draw. */
  canDraw: boolean;
};

const Ctx = createContext<Tutor | null>(null);

/**
 * AI tutor state: conversations, notes, flashcard decks and the daily allowance.
 * Real mode: answers come from the server (OpenAI), which also keeps the history, usage, notes and
 * decks; this device keeps a copy for offline reading. Mock mode: answers come from the demo brain.
 */
export function TutorProvider({ children }: { children: ReactNode }) {
  const { user, setUser } = useSession();
  // One copy per account, so a shared device never shows someone else's chats.
  const key = USE_MOCKS || !user ? KEY : `${KEY}.${user.id}`;
  const [state, setState] = useState<State>(EMPTY);
  const [ready, setReady] = useState(false);
  const [thinking, setThinking] = useState<Record<string, boolean>>({});
  const [serverUsage, setServerUsage] = useState<remote.Usage | null>(null);
  const stateRef = useRef(state);
  const failedOnce = useRef(new Set<string>());

  // Updates are applied to the ref synchronously so back-to-back calls (create a chat, then send)
  // see each other's changes; React state follows for rendering.
  const mutate = useCallback(
    (fn: (s: State) => State) => {
      const next = fn(stateRef.current);
      stateRef.current = next;
      setState(next);
      storage.set(key, JSON.stringify(next, dropLargeDataUris));
    },
    [key],
  );

  const patchConversation = useCallback(
    (id: string, fn: (c: Conversation) => Conversation) =>
      mutate((s) => ({ ...s, conversations: s.conversations.map((c) => (c.id === id ? fn(c) : c)) })),
    [mutate],
  );

  useEffect(() => {
    let cancelled = false;
    storage.get(key).then(async (raw) => {
      let saved = EMPTY;
      if (raw) {
        try {
          saved = { ...EMPTY, ...JSON.parse(raw) } as State;
          // The demo allowance resets every day.
          if (saved.usage.date !== today()) saved.usage = { date: today(), used: 0 };
        } catch {
          // Corrupt store: start fresh.
        }
      }
      if (cancelled) return;
      stateRef.current = saved;
      setState(saved);
      setReady(true);
      if (USE_MOCKS) return;

      // The account's history, allowance, notes and decks. Chats already read on this device keep
      // their messages if nothing changed since.
      try {
        const [list, usage, library] = await Promise.all([remote.listConversations(), remote.getUsage(), remote.getNotes()]);
        if (cancelled) return;
        setServerUsage(usage);
        mutate((s) => {
          const cached = new Map(s.conversations.map((c) => [c.id, c]));
          const pending = s.conversations.filter((c) => !c.messages.length && !list.some((x) => x.id === c.id));
          return {
            ...s,
            notes: library.notes,
            decks: library.decks,
            conversations: [
              ...pending,
              ...list.map((c) => {
                const mine = cached.get(c.id);
                return mine?.loaded && mine.updatedAt === c.updatedAt ? mine : c;
              }),
            ],
          };
        });
      } catch {
        // Offline: keep the copy on this device.
      }
    });
    return () => {
      cancelled = true;
    };
  }, [key, mutate]);

  const limit = serverUsage?.limit ?? DAILY_LIMITS[user?.plan ?? 'FREE'];
  const used = serverUsage?.used ?? (state.usage.date === today() ? state.usage.used : 0);
  const remaining = Math.max(0, limit - used);

  const createConversation: Tutor['createConversation'] = useCallback(
    ({ mode, level, subject, context }) => {
      // The server creates its copy on the first question, with this id.
      const id = `c${uid()}${uid()}`;
      const now = Date.now();
      mutate((s) => ({
        ...s,
        conversations: [
          {
            id,
            title: 'New conversation',
            subject: subject ?? 'General',
            mode,
            level,
            pinned: false,
            createdAt: now,
            updatedAt: now,
            messages: [],
            context,
            loaded: true,
          },
          ...s.conversations,
        ],
      }));
      return id;
    },
    [mutate],
  );

  const open: Tutor['open'] = useCallback(
    (id) => {
      const conv = stateRef.current.conversations.find((c) => c.id === id);
      if (USE_MOCKS || !conv || conv.loaded) return;
      remote
        .getConversation(id)
        .then((full) => patchConversation(id, () => full))
        .catch(() => {});
    },
    [patchConversation],
  );

  /** Mock mode: the demo brain answers on the device. */
  const answerOffline = useCallback(
    async (conversationId: string, question: UserMessage): Promise<SendResult> => {
      const conv = stateRef.current.conversations.find((c) => c.id === conversationId);
      if (!conv) return 'error';
      setThinking((t) => ({ ...t, [conversationId]: true }));
      await new Promise((r) => setTimeout(r, 1400));

      // Test hook: "simulate error" fails the first attempt so retry can be exercised.
      const shouldFail = /simulate error/i.test(question.text) && !failedOnce.current.has(question.id);
      if (shouldFail) failedOnce.current.add(question.id);

      const reply: AssistantMessage = shouldFail
        ? {
            id: uid(),
            role: 'assistant',
            createdAt: Date.now(),
            status: 'error',
            replyTo: question.id,
            // Stored in English; the chat shows the translated text for the error kind.
            error: { kind: 'network', message: 'We couldn’t reach the tutor. Check your connection and try again.' },
          }
        : {
            id: uid(),
            role: 'assistant',
            createdAt: Date.now(),
            status: 'ok',
            replyTo: question.id,
            answer: generateAnswer({
              question: question.text,
              mode: conv.mode,
              level: conv.level,
              attachment: question.attachment,
              contextLabel: conv.context?.label,
            }),
          };

      mutate((s) => ({
        ...s,
        usage: shouldFail ? s.usage : { date: today(), used: (s.usage.date === today() ? s.usage.used : 0) + 1 },
        conversations: s.conversations.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                subject: c.subject === 'General' && reply.answer ? reply.answer.subject : c.subject,
                updatedAt: Date.now(),
                messages: [...c.messages.filter((m) => !(m.role === 'assistant' && m.replyTo === question.id)), reply],
              }
            : c,
        ),
      }));
      setThinking((t) => ({ ...t, [conversationId]: false }));
      return shouldFail ? 'error' : 'ok';
    },
    [mutate],
  );

  /** Real mode: the server answers and stores both messages; they replace the local copies. */
  const answerOnline = useCallback(
    async (conversationId: string, question: UserMessage): Promise<SendResult> => {
      const conv = stateRef.current.conversations.find((c) => c.id === conversationId);
      if (!conv) return 'error';
      setThinking((t) => ({ ...t, [conversationId]: true }));
      try {
        const r = await remote.ask(conversationId, question.text, question.attachment, conv);
        setServerUsage(r.usage);
        patchConversation(conversationId, (c) => ({
          ...c,
          title: r.conversation.title,
          subject: r.conversation.subject,
          updatedAt: r.conversation.updatedAt,
          // Keep the picked photo on this device; the server's copy is used elsewhere.
          messages: [
            ...c.messages.filter((m) => m.id !== question.id && !(m.role === 'assistant' && m.replyTo === question.id)),
            { ...r.question, attachment: question.attachment ?? r.question.attachment },
            r.reply,
          ],
        }));
        return r.reply.status === 'ok' ? 'ok' : 'error';
      } catch (e) {
        const err = e as ApiError;
        if (err.reason === 'tutor-limit') {
          patchConversation(conversationId, (c) => ({ ...c, messages: c.messages.filter((m) => m.id !== question.id) }));
          remote.getUsage().then(setServerUsage).catch(() => {});
          return 'limit';
        }
        // Never reached the tutor: show Retry, which sends the question again.
        const reply: AssistantMessage = {
          id: localId(),
          role: 'assistant',
          createdAt: Date.now(),
          status: 'error',
          replyTo: question.id,
          error: {
            kind: err.status === 0 ? 'network' : 'server',
            message: err.message || 'The tutor couldn’t answer just now. Please try again.',
          },
        };
        patchConversation(conversationId, (c) => ({
          ...c,
          messages: [...c.messages.filter((m) => !(m.role === 'assistant' && m.replyTo === question.id)), reply],
        }));
        return 'error';
      } finally {
        setThinking((t) => ({ ...t, [conversationId]: false }));
      }
    },
    [patchConversation],
  );

  const answer = USE_MOCKS ? answerOffline : answerOnline;

  const send: Tutor['send'] = useCallback(
    async (conversationId, text, attachment) => {
      if (remaining <= 0) return 'limit';
      const msg: UserMessage = { id: localId(), role: 'user', text: text.trim(), attachment, createdAt: Date.now() };
      mutate((st) => ({
        ...st,
        conversations: st.conversations.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                title:
                  c.messages.length === 0
                    ? titleFrom(
                        text || (attachment ? i18n.t('tutor:shared.questionFrom', { name: attachment.name }) : ''),
                      )
                    : c.title,
                updatedAt: Date.now(),
                messages: [...c.messages, msg],
              }
            : c,
        ),
      }));
      return answer(conversationId, msg);
    },
    [answer, remaining, mutate],
  );

  const retry: Tutor['retry'] = useCallback(
    async (conversationId, assistantId) => {
      const conv = stateRef.current.conversations.find((c) => c.id === conversationId);
      const failed = conv?.messages.find((m) => m.id === assistantId);
      const question = conv?.messages.find(
        (m): m is UserMessage => m.role === 'user' && failed?.role === 'assistant' && m.id === failed.replyTo,
      );
      if (!question) return 'error';
      if (remaining <= 0) return 'limit';
      // The server never saw it (offline, or demo mode): ask again.
      if (USE_MOCKS || isLocal(assistantId)) return answer(conversationId, question);

      setThinking((t) => ({ ...t, [conversationId]: true }));
      try {
        const r = await remote.retry(conversationId, assistantId);
        setServerUsage(r.usage);
        patchConversation(conversationId, (c) => ({
          ...c,
          updatedAt: Date.now(),
          messages: c.messages.map((m) => (m.id === assistantId ? r.reply : m)),
        }));
        return r.reply.status === 'ok' ? 'ok' : 'error';
      } catch (e) {
        return (e as ApiError).reason === 'tutor-limit' ? 'limit' : 'error';
      } finally {
        setThinking((t) => ({ ...t, [conversationId]: false }));
      }
    },
    [answer, patchConversation, remaining],
  );

  /** Updates one assistant message's answer in place. */
  const patchAnswer = (conversationId: string, messageId: string, fn: (m: AssistantMessage) => AssistantMessage) =>
    patchConversation(conversationId, (c) => ({
      ...c,
      messages: c.messages.map((m) => (m.id === messageId && m.role === 'assistant' ? fn(m) : m)),
    }));

  const make =
    (kind: 'flashcards' | 'quiz') =>
    async (conversationId: string, messageId: string): Promise<MakeResult> => {
      // The demo brain includes them with every answer.
      if (USE_MOCKS) return 'ok';
      try {
        if (kind === 'flashcards') {
          const flashcards = await remote.makeFlashcards(messageId);
          patchAnswer(conversationId, messageId, (m) => ({ ...m, answer: m.answer && { ...m.answer, flashcards } }));
        } else {
          const quiz = await remote.makeQuiz(messageId);
          patchAnswer(conversationId, messageId, (m) => ({ ...m, answer: m.answer && { ...m.answer, quiz } }));
        }
        return 'ok';
      } catch {
        return 'error';
      }
    };

  const syncList = <T extends { id: string }>(list: 'notes' | 'decks', localItem: T, saved: Promise<T>) =>
    saved
      .then((real) =>
        mutate((s) => ({ ...s, [list]: (s[list] as unknown as T[]).map((x) => (x.id === localItem.id ? real : x)) })),
      )
      .catch(() => {});

  const value: Tutor = {
    ...state,
    ready,
    thinking,
    limit,
    remaining,
    resetAt: serverUsage?.resetAt ?? nextMidnight(),
    createConversation,
    open,
    send,
    retry,
    remove: (id) => {
      mutate((s) => ({ ...s, conversations: s.conversations.filter((c) => c.id !== id) }));
      if (!USE_MOCKS) remote.deleteConversation(id).catch(() => {});
    },
    togglePin: (id) => {
      const pinned = !stateRef.current.conversations.find((c) => c.id === id)?.pinned;
      patchConversation(id, (c) => ({ ...c, pinned }));
      if (!USE_MOCKS) remote.setPinned(id, pinned).catch(() => {});
    },
    saveNote: (n) => {
      const note: Note = { ...n, id: USE_MOCKS ? uid() : localId(), createdAt: Date.now() };
      mutate((s) => ({ ...s, notes: [note, ...s.notes] }));
      if (!USE_MOCKS) syncList('notes', note, remote.createNote(n));
      return note;
    },
    removeNote: (id) => {
      mutate((s) => ({ ...s, notes: s.notes.filter((n) => n.id !== id) }));
      if (!USE_MOCKS && !isLocal(id)) remote.deleteNote(id).catch(() => {});
    },
    saveDeck: (d) => {
      const deck: Deck = { ...d, id: USE_MOCKS ? uid() : localId(), createdAt: Date.now() };
      mutate((s) => ({ ...s, decks: [deck, ...s.decks] }));
      if (!USE_MOCKS) syncList('decks', deck, remote.createDeck(d));
      return deck;
    },
    makeFlashcards: make('flashcards'),
    makeQuiz: make('quiz'),
    drawDiagram: async (conversationId, messageId) => {
      if (USE_MOCKS) return 'unavailable';
      try {
        const { image, credits } = await remote.drawDiagram(messageId);
        patchAnswer(conversationId, messageId, (m) => ({ ...m, image }));
        if (user) setUser({ ...user, aiCredits: credits });
        return 'ok';
      } catch (e) {
        return (e as ApiError).reason === 'no-credits' ? 'no-credits' : 'error';
      }
    },
    canDraw: !USE_MOCKS,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTutor() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTutor must be used inside TutorProvider');
  return ctx;
}

/** Finds an assistant answer and the question it replies to. */
export function useAnswer(conversationId?: string, messageId?: string) {
  const { conversations } = useTutor();
  const conv = conversations.find((c) => c.id === conversationId);
  const msg = conv?.messages.find((m): m is AssistantMessage => m.id === messageId && m.role === 'assistant');
  const question = conv?.messages.find((m): m is UserMessage => m.role === 'user' && m.id === msg?.replyTo);
  return { conv, msg, answer: msg?.answer, question };
}
