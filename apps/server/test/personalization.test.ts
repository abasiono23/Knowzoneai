import { describe, expect, it } from 'vitest';

import { languageInstruction } from '../src/services/personalization.js';
import { signIn } from './helpers.js';

const PROFILE = {
  learnerType: 'exam',
  ageGroup: '16-18',
  educationLevel: 'school-leaver',
  track: 'science',
  institution: 'University of Lagos, Medicine',
  examGoals: ['jamb', 'waec'],
  examMonth: '2027-05',
  subjects: ['Biology', 'Chemistry', 'Physics', 'English Language'],
  interests: ['health', 'space'],
  goals: ['pass-exam'],
  formats: ['quizzes', 'videos'],
  language: 'yo',
  dailyMinutes: 30,
  reminders: { enabled: true, time: '18:30', days: [1, 3, 5], types: ['daily', 'streak'] },
  teacherRole: null,
  teachLevels: [],
  teacherGoals: [],
  firstClass: null,
};

describe('personalization (screens 18–32)', () => {
  it('stores the answers and keeps the goal, reminders and language in step', async () => {
    const { as } = await signIn();
    const saved = await as.post('/me/personalization', PROFILE).expect(200);
    expect(saved.body.user.dailyGoalMinutes).toBe(30);
    const back = await as.get('/me/personalization').expect(200);
    expect(back.body.personalization).toEqual(PROFILE);
    const { body } = await as.get('/me/settings').expect(200);
    expect(body.settings.reminders[0]).toMatchObject({ time: '18:30', days: [1, 3, 5], enabled: true });
    expect(body.settings.appLanguage).toBe('yo');
    expect(body.settings.notifications.categories).toMatchObject({ reminders: true, streak: true });
  });

  it('turns off reminder notifications when reminders are off', async () => {
    const { as } = await signIn();
    await as.post('/me/personalization', { ...PROFILE, reminders: { ...PROFILE.reminders, enabled: false } }).expect(200);
    const { body } = await as.get('/me/settings').expect(200);
    expect(body.settings.notifications.categories).toMatchObject({ reminders: false, streak: false });
  });

  it('fills sensible defaults and drops unknown fields', async () => {
    const { as } = await signIn();
    await as.post('/me/personalization', { learnerType: 'school', subjects: ['Mathematics'], hacker: true }).expect(200);
    const { body } = await as.get('/me/personalization');
    expect(body.personalization).toMatchObject({ learnerType: 'school', language: 'en', dailyMinutes: 15, examGoals: [] });
    expect(body.personalization).not.toHaveProperty('hacker');
  });

  it('rejects answers the app could never send', async () => {
    const { as } = await signIn();
    for (const bad of [
      { ...PROFILE, learnerType: 'astronaut' },
      { ...PROFILE, language: 'klingon' },
      { ...PROFILE, dailyMinutes: 2 },
      { ...PROFILE, examMonth: '2027-13' },
      { ...PROFILE, reminders: { ...PROFILE.reminders, time: '25:00' } },
      { ...PROFILE, subjects: Array.from({ length: 31 }, (_, i) => `S${i}`) },
    ])
      await as.post('/me/personalization', bad).expect(400);
  });

  it('keeps a later app-language choice when onboarding answers are saved again', async () => {
    const { as } = await signIn();
    await as.post('/me/personalization', PROFILE).expect(200);
    await as.post('/me/settings', { appLanguage: 'fr' }).expect(200);
    await as.post('/me/personalization', { ...PROFILE, dailyMinutes: 45 }).expect(200);
    expect((await as.get('/me/settings')).body.settings.appLanguage).toBe('fr');
  });
});

describe('learning language for the AI', () => {
  it('asks for explanations in the chosen language and keeps quizzes in exam English', () => {
    expect(languageInstruction('en')).toMatch(/English/);
    const yo = languageInstruction('yo');
    expect(yo).toMatch(/summaries, explanations.*in Yoruba/);
    expect(yo).toMatch(/quiz questions and options in English/);
    expect(languageInstruction('pcm')).toMatch(/Nigerian Pidgin/);
  });
});
