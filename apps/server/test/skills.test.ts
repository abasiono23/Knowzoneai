import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { useSkills, type Skill } from '../src/services/skills.js';
import { http } from './helpers.js';

const text = (en: string) => ({ en, fr: `${en} (fr)` });
const skill: Skill = {
  id: 'coding',
  name: text('Coding'),
  tagline: text('Tell computers what to do'),
  summary: text('What coding is.'),
  videos: Array.from({ length: 5 }, (_, k) => ({
    youtubeId: `aaaaaaaaaa${k}`,
    title: `Video ${k + 1}`,
    channel: 'A Channel',
    seconds: 300,
    summary: text(`Summary ${k + 1}.`),
  })),
};

beforeAll(() => useSkills([skill]));
afterAll(() => useSkills(null));

describe('future skills', () => {
  it('lists the subjects in the reader’s language', async () => {
    const { body } = await http().get('/skills').set('X-Language', 'fr').expect(200);
    expect(body.skills).toEqual([
      { id: 'coding', name: 'Coding (fr)', tagline: 'Tell computers what to do (fr)', lessons: 5 },
    ]);
  });

  it('gives a subject’s lessons with summaries, keeping the video’s own title', async () => {
    const { body } = await http().get('/skills/coding').set('X-Language', 'fr').expect(200);
    expect(body.skill).toMatchObject({ id: 'coding', summary: 'What coding is. (fr)' });
    expect(body.skill.videos).toHaveLength(5);
    expect(body.skill.videos[0]).toEqual({
      youtubeId: 'aaaaaaaaaa0',
      title: 'Video 1',
      channel: 'A Channel',
      seconds: 300,
      summary: 'Summary 1. (fr)',
    });
    // A language without a translation falls back to English.
    const yo = await http().get('/skills/coding').set('X-Language', 'yo').expect(200);
    expect(yo.body.skill.summary).toBe('What coding is.');
    await http().get('/skills/nope').expect(404);
  });
});
