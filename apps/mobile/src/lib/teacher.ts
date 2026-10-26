import i18n from '@/i18n';

import { post, request } from './api';

export type ClassSummary = {
  id: string;
  name: string;
  subject: string;
  level: string;
  joinCode: string;
  studentCount: number;
  avgMastery: number;
  activeAssignments: number;
  color: string;
};

export type Student = {
  id: string;
  name: string;
  mastery: number;
  streak: number;
  lastActive: string;
  completed: number;
  weakTopics: string[];
};

export type Assignment = {
  id: string;
  classId: string;
  title: string;
  topic: string;
  dueAt: string;
  questionCount: number;
  submitted: number;
  total: number;
  avgScore: number | null;
  createdAt: string;
};

export type ClassDetail = ClassSummary & {
  students: Student[];
  assignments: Assignment[];
  topicMastery: { topic: string; mastery: number }[];
  gaps: { topic: string; studentsStruggling: number; suggestion: string }[];
};

export type AssignmentReport = Assignment & {
  className: string;
  questions: { question: string; correctRate: number; commonWrong: string }[];
  results: { studentId: string; name: string; score: number | null; submittedAt: string | null }[];
  reteach: string;
};

export type TeacherOverview = {
  classes: ClassSummary[];
  totals: { students: number; activeAssignments: number; avgMastery: number; submissionsThisWeek: number };
  needsAttention: { classId: string; className: string; topic: string; studentsStruggling: number }[];
  upcoming: (Assignment & { className: string })[];
};

export type NewAssignment = {
  classId: string;
  title: string;
  topic: string;
  source: 'ai' | 'library' | 'text';
  sourceText?: string;
  questionCount: number;
  dueAt: string;
  allowRetries: boolean;
  showAnswers: boolean;
};

export const teacherApi = {
  overview: () => request<TeacherOverview>('/teacher/overview'),
  classes: () => request<{ classes: ClassSummary[] }>('/teacher/classes'),
  classDetail: (id: string) => request<{ class: ClassDetail }>(`/teacher/classes/${id}`),
  createClass: (input: { name: string; subject: string; level: string }) =>
    post<{ class: ClassSummary }>('/teacher/classes', input),
  createAssignment: (input: NewAssignment) => post<{ assignment: Assignment }>('/teacher/assignments', input),
  assignment: (id: string) => request<{ assignment: AssignmentReport }>(`/teacher/assignments/${id}`),
  /** Students: join a class with the teacher's code. */
  joinClass: (code: string) => post<{ className: string; teacherName: string }>('/classes/join', { code }),
};

export const isPast = (iso: string) => new Date(iso).getTime() < Date.now();

export function relativeDue(iso: string, now = Date.now()) {
  const days = Math.round((new Date(iso).getTime() - now) / 86_400_000);
  if (days < 0) return i18n.t('teacher:due.closedAgo', { count: -days });
  if (days === 0) return i18n.t('teacher:due.today');
  if (days === 1) return i18n.t('teacher:due.tomorrow');
  return i18n.t('teacher:due.inDays', { count: days });
}
