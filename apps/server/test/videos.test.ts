import { describe, expect, it, vi } from 'vitest';

import { prisma } from '../src/db.js';
import type { Scene, VideoSettings } from '../src/services/video-ai.js';
import { http, signIn } from './helpers.js';

// OpenAI is replaced with fakes: scripts, pictures and narration are instant; everything else is real.
const ai = vi.hoisted(() => ({
  fail: 0,
  scripts: [] as { text?: string; topic?: string; settings: VideoSettings }[],
  narrated: [] as string[],
  drawn: 0,
  /** The style and quality of each AI picture, e.g. "galaxy/low". */
  looks: [] as string[],
  // Real photos: off unless a test turns them on (then the first illustrated scene gets one).
  photos: false,
  // Labelled diagrams (textbook summaries only): the second illustrated scene gets one.
  diagrams: false,
  /** What the picture search was asked for: "photo" or "diagram" queries. */
  searched: [] as string[],
  clips: 0,
  clipStyles: [] as string[],
  clipFail: false,
}));

vi.mock('../src/services/real-photos.js', () => {
  const picture = (kind: 'photo' | 'diagram') => ({
    data: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
    mimeType: 'image/png',
    credit: { author: kind === 'photo' ? 'Jane Doe' : 'LadyofHats', license: 'CC BY-SA 4.0', url: `https://commons.wikimedia.org/wiki/File:Leaf-${kind}.png` },
  });
  return {
    photoQueries: vi.fn(async (_u: string, descriptions: string[]) => descriptions.map((_, i) => (ai.photos && i === 0 ? 'green leaf' : null))),
    pictureQueries: vi.fn(async (_u: string, descriptions: string[]) =>
      descriptions.map((_, i) => (ai.photos && i === 0 ? { query: 'green leaf', kind: 'photo' } : ai.diagrams && i === 1 ? { query: 'leaf structure diagram', kind: 'diagram' } : null)),
    ),
    findPhoto: vi.fn(async () => picture('photo')),
    findPicture: vi.fn(async (_u: string, want: { query: string; kind: 'photo' | 'diagram' }) => {
      ai.searched.push(`${want.kind}:${want.query}`);
      return picture(want.kind);
    }),
  };
});

vi.mock('../src/services/video-ai.js', async (importOriginal) => {
  const real = await importOriginal<typeof import('../src/services/video-ai.js')>();
  let n = 0;
  return {
    ...real,
    writeScript: vi.fn(async (_u: string, src: { text?: string; topic?: string }, settings: VideoSettings) => {
      ai.scripts.push({ ...src, settings });
      if (ai.fail > 0) {
        ai.fail--;
        throw new Error('OpenAI timed out');
      }
      const scenes: Scene[] = Array.from({ length: real.LENGTHS[settings.length].scenes }, (_, i) => ({
        id: `sc${n++}`,
        kind: i === 0 ? 'title' : i === 2 ? 'check' : 'concept',
        heading: `Scene ${i + 1}`,
        emoji: '💡',
        caption: `Narration for scene ${i + 1}.`,
        seconds: 4,
        ...(i !== 2 && { illustration: 'a green leaf in sunlight' }),
        ...(i === 2 && { check: { question: 'True?', options: ['Yes', 'No'], correctIndex: 0 } }),
      }));
      return { title: 'Photosynthesis', subject: 'Biology', level: 'Beginner', description: 'How plants make food.', scenes };
    }),
    illustrate: vi.fn(async (_u: string, _d: string, styleId: string, quality = 'low') => {
      ai.drawn++;
      ai.looks.push(`${styleId}/${quality}`);
      return Buffer.from([0xff, 0xd8, 0xff, 0xd9]);
    }),
    clipsOn: () => true,
    makeClip: vi.fn(async (_u: string, _t: string, _p: string | undefined, styleId: string) => {
      ai.clips++;
      ai.clipStyles.push(styleId);
      if (ai.clipFail) throw new Error('Sora is busy');
      return Buffer.from('fakemp4');
    }),
    narrate: vi.fn(async (_u: string, text: string) => {
      ai.narrated.push(text);
      return { mp3: Buffer.from('ID3fake'), seconds: 5.2 };
    }),
  };
});

const reset = () => {
  ai.fail = 0;
  ai.scripts.length = 0;
  ai.narrated.length = 0;
  ai.drawn = 0;
  ai.looks.length = 0;
  ai.photos = false;
  ai.diagrams = false;
  ai.searched.length = 0;
  ai.clips = 0;
  ai.clipStyles.length = 0;
  ai.clipFail = false;
};

const SETTINGS: VideoSettings = { length: '1m', voiceId: 'ada', styleId: 'galaxy', captions: true, captionStyle: 'karaoke', language: 'en' };

async function settled(as: Awaited<ReturnType<typeof signIn>>['as'], id: string) {
  for (let i = 0; i < 60; i++) {
    const { body } = await as.get(`/videos/${id}`).expect(200);
    if (body.video.status !== 'generating') return body.video;
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error('still generating');
}
const credits = async (id: string) => (await prisma.user.findUniqueOrThrow({ where: { id } })).aiCredits;

describe('generating a video', () => {
  it('writes, illustrates and narrates a video in the background, for its length’s credits (98–105)', async () => {
    reset();
    const { as, sub } = await signIn();
    const before = await credits(sub);
    const res = await as
      .post('/videos/mine/vid00001', {
        title: 'Photosynthesis in 1 minute',
        source: { kind: 'topic', topic: 'Photosynthesis' },
        settings: { ...SETTINGS, language: 'yo' },
      })
      .expect(202);
    expect(res.body.video).toMatchObject({ id: 'vid00001', status: 'generating', origin: 'generated', creator: 'You' });
    expect(await credits(sub)).toBe(before - 1);

    const v = await settled(as, 'vid00001');
    expect(v).toMatchObject({ status: 'ready', stage: 4, title: 'Photosynthesis in 1 minute', subject: 'Biology', level: 'Beginner' });
    expect(v.scenes).toHaveLength(7);
    // Pictures for illustrated scenes (1m allows 4), narration for every scene, timed to the audio.
    expect(v.scenes.filter((s: Scene) => s.image)).toHaveLength(4);
    expect(v.scenes.every((s: Scene) => s.audio?.startsWith('/videos/files/'))).toBe(true);
    expect(v.scenes[0].seconds).toBe(5.8);
    expect(ai.scripts[0]).toMatchObject({ topic: 'Photosynthesis', settings: { language: 'yo' } });
    const audio = await http().get(v.scenes[0].audio).expect(200);
    expect(audio.headers['content-type']).toBe('audio/mpeg');
    // Phones ask for byte ranges.
    const part = await http().get(v.scenes[0].audio).set('Range', 'bytes=0-2').expect(206);
    expect(part.headers['content-range']).toBe('bytes 0-2/7');
    expect(await credits(sub)).toBe(before - 1);
    expect(await prisma.creditEntry.count({ where: { userId: sub, reason: 'spend' } })).toBe(1);
  });

  it('mixes real photos (credited) with AI pictures', async () => {
    reset();
    ai.photos = true;
    const { as } = await signIn();
    await as.post('/videos/mine/photo001', { title: 'Leaves', source: { kind: 'topic', topic: 'Leaves' }, settings: SETTINGS }).expect(202);
    const v = await settled(as, 'photo001');
    // A photo for the first scene, and still up to 4 AI pictures for the others, in the chosen style.
    expect(v.scenes[0]).toMatchObject({ credit: { author: 'Jane Doe', license: 'CC BY-SA 4.0' } });
    expect(ai.drawn).toBe(4);
    expect(ai.looks).toEqual(['galaxy/low', 'galaxy/low', 'galaxy/low', 'galaxy/low']);
    expect(v.scenes.filter((s: Scene) => s.image)).toHaveLength(5);
    expect(v.scenes.filter((s: Scene) => s.credit)).toHaveLength(1);
    expect((await http().get(v.scenes[0].image).expect(200)).headers['content-type']).toBe('image/png');
  });

  it('makes silent videos without narration, and charges longer videos more', async () => {
    reset();
    const { as, sub } = await signIn();
    const before = await credits(sub);
    await as
      .post('/videos/mine/silent01', { title: 'Quiet', source: { kind: 'topic', topic: 'Gravity' }, settings: { ...SETTINGS, voiceId: 'none', length: '3m' } })
      .expect(202);
    const v = await settled(as, 'silent01');
    expect(v.scenes).toHaveLength(14);
    expect(v.scenes.some((s: Scene) => s.audio)).toBe(false);
    expect(ai.narrated).toHaveLength(0);
    expect(await credits(sub)).toBe(before - 2);
  });

  it('writes from the learner’s study pack or a lesson, and fails clearly when it’s gone', async () => {
    reset();
    const { as, sub } = await signIn();
    await prisma.material.create({
      data: {
        id: 'pack0001',
        userId: sub,
        title: 'Cells',
        sourceType: 'text',
        sourceLabel: 'Pasted text',
        sourceText: 'Cells are the unit of life.',
        options: {},
        status: 'READY',
      },
    });
    await as
      .post('/videos/mine/frompack', { title: 'Cells', source: { kind: 'material', materialId: 'pack0001', label: 'Cells' }, settings: SETTINGS })
      .expect(202);
    expect((await settled(as, 'frompack')).status).toBe('ready');
    expect(ai.scripts[0].text).toBe('Cells are the unit of life.');
    await as.post('/videos/mine/lesson01', { title: 'Energy', source: { kind: 'lesson', lessonId: 'l1', label: 'Energy' }, settings: SETTINGS }).expect(202);
    await settled(as, 'lesson01');
    expect(ai.scripts[1].text).toContain('Mitochondria');

    const before = await credits(sub);
    await as.post('/videos/mine/gonepack', { title: 'Gone', source: { kind: 'material', materialId: 'nope', label: 'Gone' }, settings: SETTINGS }).expect(202);
    expect(await settled(as, 'gonepack')).toMatchObject({ status: 'failed', error: { code: 'material-missing', retryable: false } });
    expect(await credits(sub)).toBe(before);
  });

  it('refunds failures and retries them (109)', async () => {
    reset();
    const { as, sub } = await signIn();
    const before = await credits(sub);
    ai.fail = 1;
    await as.post('/videos/mine/retry001', { title: 'X', source: { kind: 'topic', topic: 'Atoms' }, settings: SETTINGS }).expect(202);
    expect(await settled(as, 'retry001')).toMatchObject({ status: 'failed', error: { code: 'render-timeout', retryable: true } });
    expect(await credits(sub)).toBe(before);
    await as.post('/videos/mine/retry001/retry').expect(202);
    expect((await settled(as, 'retry001')).status).toBe('ready');
    expect(await credits(sub)).toBe(before - 1);

    await prisma.user.update({ where: { id: sub }, data: { aiCredits: 0 } });
    const broke = await as.post('/videos/mine/broke001', { title: 'X', source: { kind: 'topic', topic: 'Atoms' }, settings: SETTINGS }).expect(402);
    expect(broke.body.reason).toBe('no-credits');
    await as.post('/videos/mine/bad', { title: 'X', source: { kind: 'text', text: 'short', label: 'x' }, settings: SETTINGS }).expect(400);
  });

  it('regenerates: a new voice re-records only the narration; a new length rewrites (106)', async () => {
    reset();
    const { as, sub } = await signIn();
    await as.post('/videos/mine/regen001', { title: 'X', source: { kind: 'topic', topic: 'Atoms' }, settings: SETTINGS }).expect(202);
    const first = await settled(as, 'regen001');
    const before = await credits(sub);

    await as.post('/videos/mine/regen001/regenerate', { settings: { ...SETTINGS, voiceId: 'tunde' } }).expect(202);
    const voiced = await settled(as, 'regen001');
    expect(ai.scripts).toHaveLength(1);
    expect(voiced.scenes.map((s: Scene) => s.id)).toEqual(first.scenes.map((s: Scene) => s.id));
    expect(voiced.scenes[0].audio).not.toBe(first.scenes[0].audio);
    expect(voiced.scenes[1].image).toBe(first.scenes[1].image);
    expect(voiced).toMatchObject({ revision: 2, settings: { voiceId: 'tunde' } });
    // The old recordings are gone; the pictures stay.
    await http().get(first.scenes[0].audio).expect(404);
    await http().get(first.scenes[1].image).expect(200);

    await as.post('/videos/mine/regen001/regenerate', { settings: { ...SETTINGS, voiceId: 'tunde', length: '30s' } }).expect(202);
    const shorter = await settled(as, 'regen001');
    expect(ai.scripts).toHaveLength(2);
    expect(shorter.scenes).toHaveLength(4);
    expect(await credits(sub)).toBe(before - 2);
  });

  it('applies instant edits, re-recording only edited lines for free (106)', async () => {
    reset();
    const { as, sub } = await signIn();
    await as.post('/videos/mine/edit0001', { title: 'X', source: { kind: 'topic', topic: 'Atoms' }, settings: SETTINGS }).expect(202);
    const v = await settled(as, 'edit0001');
    const before = await credits(sub);
    ai.narrated.length = 0;
    const scenes = v.scenes.map((s: Scene, i: number) => ({
      id: s.id,
      heading: i === 0 ? 'New heading' : s.heading,
      caption: i === 1 ? 'A clearer line.' : s.caption,
    }));
    const res = await as.patch('/videos/mine/edit0001', { title: 'Atoms, simply', scenes, settings: { styleId: 'chalk', captions: false } }).expect(200);
    expect(res.body.video).toMatchObject({ title: 'Atoms, simply', settings: { styleId: 'chalk', captions: false, voiceId: 'ada' } });
    expect(res.body.video.scenes[0].heading).toBe('New heading');
    expect(res.body.video.scenes[1].caption).toBe('A clearer line.');
    expect(ai.narrated).toEqual(['A clearer line.']);
    expect(res.body.video.scenes[0].audio).toBe(v.scenes[0].audio);
    expect(res.body.video.scenes[1].audio).not.toBe(v.scenes[1].audio);
    expect(await credits(sub)).toBe(before);
    // Length and voice changes need a regeneration.
    await as.patch('/videos/mine/edit0001', { settings: { voiceId: 'sam' } }).expect(200);
    expect((await as.get('/videos/edit0001')).body.video.settings.voiceId).toBe('ada');
  });

  it('keeps generated videos private; syncs and deletes the library (107, 108)', async () => {
    reset();
    const { as, sub } = await signIn();
    await as.post('/videos/mine/mine0001', { title: 'Mine', source: { kind: 'topic', topic: 'Atoms' }, settings: SETTINGS }).expect(202);
    await settled(as, 'mine0001');
    const lib = (await as.get('/videos/mine').expect(200)).body;
    expect(lib.ids).toEqual(['mine0001']);
    const other = await signIn({ email: 'tunde@example.com' });
    await other.as.get('/videos/mine0001').expect(404);
    await other.as.patch('/videos/mine/mine0001', { title: 'Mine now' }).expect(404);
    await http().get('/videos/mine0001').expect(404);
    const audio = (await as.get('/videos/mine0001')).body.video.scenes[0].audio;
    await as.delete('/videos/mine/mine0001').expect(200);
    await http().get(audio).expect(404);
    expect(await prisma.video.count({ where: { userId: sub } })).toBe(0);
  });
});

describe('watching videos', () => {
  async function original(lang = 'en', id = `o-l1-${lang}`) {
    await prisma.video.create({
      data: {
        id,
        origin: 'catalog',
        lessonId: 'l1',
        language: lang,
        title: `Cells (${lang})`,
        settings: SETTINGS,
        scenes: [{ id: 's1', kind: 'title', heading: 'Cells', emoji: '🧬', caption: 'Hi', seconds: 4 }],
        status: 'ready',
        views: 100,
        baseLikes: 8,
      },
    });
  }

  it('serves Originals in the reader’s language, falling back to English (88–90)', async () => {
    await original('en');
    await original('fr');
    await prisma.video.create({
      data: { id: 'o-l2-en', origin: 'catalog', lessonId: 'l2', language: 'en', title: 'Genetics', settings: SETTINGS, status: 'ready' },
    });
    const fr = (await http().get('/videos/originals?lang=fr').expect(200)).body.videos;
    // Shown by lesson, so the id is the same in every language.
    expect(fr.map((v: { id: string; title: string }) => `${v.id} ${v.title}`).sort()).toEqual(['v-l1 Cells (fr)', 'v-l2 Genetics']);
    expect(fr.find((v: { id: string }) => v.id === 'v-l1')).toMatchObject({ creator: 'Knowzone Originals', likes: 8, views: 100 });
    expect((await http().get('/videos/v-l1?lang=fr').expect(200)).body.video.title).toBe('Cells (fr)');
    expect((await http().get('/videos/v-l1?lang=yo').expect(200)).body.video.title).toBe('Cells (en)');
    await http().get('/videos/v-l9').expect(404);
  });

  it('likes, saves into collections, tracks progress and counts views once (89, 95)', async () => {
    await original();
    const { as } = await signIn();
    await as.post('/me/videos/v-l1/like', { liked: true }).expect(200);
    expect((await http().get('/videos/v-l1')).body.video.likes).toBe(9);
    await as.put('/me/videos/v-l1/save', { collection: 'Biology revision', offline: true }).expect(200);
    await as.put('/me/videos/v-l1/progress', { seconds: 12.5 }).expect(200);
    await as.put('/me/videos/v-l1/progress', { seconds: 20 }).expect(200);
    expect((await http().get('/videos/v-l1')).body.video.views).toBe(101);
    // Built-in fallback videos (no row on the server) can be liked and saved too.
    await as.post('/me/videos/v-l9/like', { liked: true }).expect(200);
    await as.post('/me/video-collections', { name: 'Physics' }).expect(200);

    const state = (await as.get('/me/videos').expect(200)).body;
    expect(state).toMatchObject({
      liked: expect.arrayContaining(['v-l1', 'v-l9']),
      saved: { 'v-l1': 'Biology revision' },
      offline: ['v-l1'],
      progress: { 'v-l1': 20 },
    });
    expect(state.collections).toEqual(['Watch later', 'Exam revision', 'Biology revision', 'Physics']);
    await as.delete('/me/videos/v-l1/save').expect(200);
    expect((await as.get('/me/videos')).body).toMatchObject({ saved: {}, offline: [] });
    await http().get('/me/videos').expect(401);
  });

  it('records reports for moderation (97)', async () => {
    await original();
    const { as, sub } = await signIn();
    await as.post('/me/videos/v-l1/report', { reason: 'incorrect', details: 'The formula is wrong' }).expect(201);
    expect(await prisma.videoReport.findFirst({ where: { userId: sub } })).toMatchObject({ videoId: 'v-l1', reason: 'incorrect', status: 'open' });
    await as.post('/me/videos/v-l1/report', { reason: '' }).expect(400);
  });
});

describe('textbook video summaries', () => {
  const book = (id: string, userId: string) =>
    prisma.textbook.create({
      data: {
        id,
        userId,
        title: 'Senior Biology',
        fileName: 'senior-biology.pdf',
        status: 'ready',
        pageCount: 2,
        pages: ['Osmosis is the movement of water across a membrane. '.repeat(6), 'Diffusion and osmosis compared. '.repeat(6)],
        topics: [{ id: 't1', title: 'Osmosis', startPage: 1, endPage: 2 }],
      },
    });
  const source = (textbookId: string) => ({ kind: 'textbook', textbookId, topic: 'Osmosis', label: 'Osmosis · Senior Biology' });

  it('opens with a moving AI clip on a paid plan, made from the topic’s pages', async () => {
    reset();
    const { as, sub } = await signIn();
    await prisma.user.update({ where: { id: sub }, data: { plan: 'PLUS', aiCredits: 20 } });
    await book('bookv001', sub);
    await as.post('/videos/mine/tbclip01', { title: 'Osmosis', source: source('bookv001'), settings: SETTINGS }).expect(202);
    const v = await settled(as, 'tbclip01');
    expect(v.status).toBe('ready');
    expect(ai.scripts[0].text).toContain('Osmosis is the movement of water');
    expect(ai.clips).toBe(1);
    expect(v.scenes[0].clip).toMatch(/^\/videos\/files\//);
    expect(v.scenes.slice(1).some((s: Scene) => s.clip)).toBe(false);
    const clip = await http().get(v.scenes[0].clip).expect(200);
    expect(clip.headers['content-type']).toBe('video/mp4');
  });

  it('charges 5 credits for a video with the clip, and a remake never buys another clip', async () => {
    reset();
    const { as, sub } = await signIn();
    await prisma.user.update({ where: { id: sub }, data: { plan: 'PLUS', aiCredits: 20 } });
    await book('bookv101', sub);
    await as.post('/videos/mine/tbcost01', { title: 'Osmosis', source: source('bookv101'), settings: SETTINGS }).expect(202);
    const first = await settled(as, 'tbcost01');
    expect(await credits(sub)).toBe(15);
    expect(ai.clips).toBe(1);
    // A new language writes a new script for 1 credit, and shows the same clip again.
    await as.post('/videos/mine/tbcost01/regenerate', { settings: { ...SETTINGS, language: 'fr' } }).expect(202);
    const again = await settled(as, 'tbcost01');
    expect(again.status).toBe('ready');
    expect(ai.clips).toBe(1);
    expect(again.scenes[0].clip).toBe(first.scenes[0].clip);
    expect(await credits(sub)).toBe(14);
  });

  it('makes the video without the clip, for 1 credit, when there aren’t enough credits for it', async () => {
    reset();
    const { as, sub } = await signIn();
    await prisma.user.update({ where: { id: sub }, data: { plan: 'PRO', aiCredits: 3 } });
    await book('bookv102', sub);
    await as.post('/videos/mine/tbcost02', { title: 'Osmosis', source: source('bookv102'), settings: SETTINGS }).expect(202);
    const v = await settled(as, 'tbcost02');
    expect(v.status).toBe('ready');
    expect(ai.clips).toBe(0);
    expect(v.scenes.some((s: Scene) => s.clip)).toBe(false);
    expect(await credits(sub)).toBe(2);
  });

  it('keeps the clip for paid plans even while everything else is free', async () => {
    reset();
    const { as, sub } = await signIn();
    await book('bookv002', sub);
    await as.post('/videos/mine/tbfree01', { title: 'Osmosis', source: source('bookv002'), settings: SETTINGS }).expect(202);
    const v = await settled(as, 'tbfree01');
    expect(v.status).toBe('ready');
    expect(ai.clips).toBe(0);
    // Every scene but the quiz has a picture (other 1-minute videos stop at 4).
    expect(ai.scripts[0]).toMatchObject({ pictureEveryScene: true });
    expect(ai.drawn).toBe(6);
    expect(v.scenes.filter((s: Scene) => s.image)).toHaveLength(6);
    expect(v.scenes.some((s: Scene) => s.clip)).toBe(false);
  });

  it('looks real: realistic AI pictures, and labelled diagrams from Commons as well as photos', async () => {
    reset();
    ai.photos = true;
    ai.diagrams = true;
    const { as, sub } = await signIn();
    await prisma.user.update({ where: { id: sub }, data: { plan: 'PLUS', aiCredits: 20 } });
    await book('bookv004', sub);
    await as.post('/videos/mine/tbreal01', { title: 'Osmosis', source: source('bookv004'), settings: SETTINGS }).expect(202);
    const v = await settled(as, 'tbreal01');
    expect(v.status).toBe('ready');
    // The search may answer with photos or diagrams; both are credited.
    expect(ai.searched).toEqual(['photo:green leaf', 'diagram:leaf structure diagram']);
    expect(v.scenes[0].credit).toMatchObject({ author: 'Jane Doe' });
    expect(v.scenes[1].credit).toMatchObject({ author: 'LadyofHats', license: 'CC BY-SA 4.0' });
    // The other 4 pictures are AI, realistic at medium quality whatever the video's style; the clip too.
    expect(ai.looks).toEqual(['real/medium', 'real/medium', 'real/medium', 'real/medium']);
    expect(v.scenes.filter((s: Scene) => s.image)).toHaveLength(6);
    expect(ai.clipStyles).toEqual(['real']);
    // Other videos never search for diagrams.
    await as.post('/videos/mine/topic902', { title: 'Leaves', source: { kind: 'topic', topic: 'Leaves' }, settings: SETTINGS }).expect(202);
    await settled(as, 'topic902');
    expect(ai.searched).toEqual(['photo:green leaf', 'diagram:leaf structure diagram', 'photo:green leaf']);
    expect(ai.looks.slice(4)).toEqual(['galaxy/low', 'galaxy/low', 'galaxy/low', 'galaxy/low']);
  });

  it('makes no clip for other videos, and a failed clip doesn’t fail the video', async () => {
    reset();
    const { as, sub } = await signIn();
    await prisma.user.update({ where: { id: sub }, data: { plan: 'PRO', aiCredits: 20 } });
    await as.post('/videos/mine/topic901', { title: 'Leaves', source: { kind: 'topic', topic: 'Leaves' }, settings: SETTINGS }).expect(202);
    expect((await settled(as, 'topic901')).status).toBe('ready');
    expect(ai.clips).toBe(0);

    ai.clipFail = true;
    await book('bookv003', sub);
    await as.post('/videos/mine/tbfail01', { title: 'Osmosis', source: source('bookv003'), settings: SETTINGS }).expect(202);
    const v = await settled(as, 'tbfail01');
    expect(v.status).toBe('ready');
    expect(ai.clips).toBe(1);
    expect(v.scenes[0].clip).toBeUndefined();
    expect(v.scenes[0].image).toBeTruthy();
  });
});
