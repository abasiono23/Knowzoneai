import { describe, expect, it, vi } from 'vitest';

import { prisma } from '../src/db.js';
import type { GenerateOptions } from '../src/services/study-ai.js';
import type { VideoSettings } from '../src/services/video-ai.js';
import { tidyTopics, unshout } from '../src/services/textbooks.js';
import { http, signIn } from './helpers.js';

// OpenAI is replaced with a fake: reading the PDF, the background processing, topic search,
// study packs and videos are real. No test ever reaches the real API.
const ai = vi.hoisted(() => ({
  /** ok: lists topics; fail: the call throws; off: no key configured (503 not-configured). */
  mode: 'ok' as 'ok' | 'fail' | 'off',
  topics: [] as { title: string; chapter: string | null; startPage: number }[],
  inputs: [] as string[],
  packs: [] as { text: string; topic?: string }[],
  scripts: [] as { text?: string; topic?: string }[],
}));

vi.mock('../src/services/ai.js', async (importOriginal) => {
  const real = await importOriginal<typeof import('../src/services/ai.js')>();
  const { AppError } = await import('../src/lib/errors.js');
  return {
    ...real,
    openaiClient: vi.fn(() => {
      if (ai.mode === 'off') throw new AppError(503, 'AI features aren’t set up on this server yet', 'not-configured');
      return {
        responses: {
          parse: async (req: { input: string }) => {
            ai.inputs.push(req.input);
            if (ai.mode === 'fail') throw new Error('OpenAI timed out');
            return { output_parsed: { topics: ai.topics }, usage: { input_tokens: 1000, output_tokens: 100 } };
          },
        },
      };
    }),
  };
});

vi.mock('../src/services/study-ai.js', async (importOriginal) => {
  const real = await importOriginal<typeof import('../src/services/study-ai.js')>();
  return {
    ...real,
    generateStudyContent: vi.fn(async (_u: string, src: { text: string; topic?: string }, _o: GenerateOptions, _l: string, onStage: (n: number) => Promise<unknown>) => {
      ai.packs.push({ text: src.text, topic: src.topic });
      for (const s of [1, 2, 3, 4]) await onStage(s);
      return {
        content: { summary: { tldr: 'x', overview: [] }, notes: [], concepts: [], keyPoints: [], flashcards: [], quiz: [], mindMap: { center: 'x', branches: [] }, readingMinutes: 1 },
        title: 'Photosynthesis notes',
        subject: 'Biology',
      };
    }),
  };
});

vi.mock('../src/services/video-ai.js', async (importOriginal) => {
  const real = await importOriginal<typeof import('../src/services/video-ai.js')>();
  return {
    ...real,
    writeScript: vi.fn(async (_u: string, src: { text?: string; topic?: string }) => {
      ai.scripts.push(src);
      return {
        title: 'Respiration',
        subject: 'Biology',
        level: 'Beginner',
        description: 'How cells release energy.',
        scenes: [{ id: 'sc1', kind: 'title', heading: 'Respiration', emoji: '🔥', caption: 'Cells release energy.', seconds: 4 }],
      };
    }),
    illustrate: vi.fn(async () => Buffer.from([0xff, 0xd8, 0xff, 0xd9])),
    narrate: vi.fn(async () => ({ mp3: Buffer.from('ID3fake'), seconds: 3 })),
  };
});

const reset = () => {
  ai.mode = 'ok';
  ai.topics = [];
  ai.inputs.length = 0;
  ai.packs.length = 0;
  ai.scripts.length = 0;
};

// ─── A small PDF, written by hand (text pages with Helvetica, optional bookmarks) ───

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

/** A PDF with one page per entry (one text line per string; an empty entry is a blank, "scanned" page). */
function makePdf(pages: string[][], outline: { title: string; page: number }[] = []) {
  const objects: string[] = [];
  const add = (body: string) => objects.push(body);
  add(''); // 1: catalog, filled in last
  add(''); // 2: pages
  add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'); // 3
  const pageIds: number[] = [];
  for (const lines of pages) {
    const content = lines.length ? `BT /F1 12 Tf 14 TL 72 740 Td ${lines.map((l, i) => `${i ? 'T* ' : ''}(${esc(l)}) Tj`).join(' ')} ET` : '';
    const contentId = add(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    pageIds.push(add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`));
  }
  let outlines = '';
  if (outline.length) {
    const root = objects.length + 1;
    add(`<< /Type /Outlines /First ${root + 1} 0 R /Last ${root + outline.length} 0 R /Count ${outline.length} >>`);
    outline.forEach((o, i) => {
      const id = root + 1 + i;
      const prev = i ? `/Prev ${id - 1} 0 R ` : '';
      const next = i + 1 < outline.length ? `/Next ${id + 1} 0 R ` : '';
      add(`<< /Title (${esc(o.title)}) /Parent ${root} 0 R ${prev}${next}/Dest [${pageIds[o.page - 1]} 0 R /XYZ null null null] >>`);
    });
    outlines = ` /Outlines ${root} 0 R /PageMode /UseOutlines`;
  }
  objects[0] = `<< /Type /Catalog /Pages 2 0 R${outlines} >>`;
  objects[1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;

  let out = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(Buffer.byteLength(out));
    out += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = Buffer.byteLength(out);
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const o of offsets) out += `${String(o).padStart(10, '0')} 00000 n \n`;
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, 'latin1');
}

/** A 12-page biology book: the contents page prints page numbers that are 2 off the PDF's. */
const BOOK = [
  ['Senior Biology', 'A textbook for secondary schools'],
  ['Contents', 'Chapter 1 Cells ........ 1', 'Chapter 2 Photosynthesis ........ 4', 'Chapter 3 Respiration ........ 7', 'Index ........ 10'],
  ['Chapter 1', 'Cells', 'Cells are the basic unit of life. Every living thing is made of one or more cells.', 'A cell has a membrane, cytoplasm and a nucleus that holds the genetic material.'],
  ['The cell membrane controls what enters and leaves the cell. Ribosomes make proteins.', 'Some cells have a mitochondrion. Plant cells also have a cell wall and chloroplasts.'],
  ['Animal cells have no cell wall. Cells divide to make new cells for growth and repair.', 'Tissues are groups of similar cells working together. Organs are made of tissues.'],
  ['Chapter 2', 'Photosynthesis', 'Green plants make their own food from carbon dioxide and water using light energy.', 'Chlorophyll in the chloroplasts absorbs the light. Oxygen is released as a waste product.'],
  ['The word equation is carbon dioxide + water -> glucose + oxygen, with light and chlorophyll.', 'Photosynthesis happens mostly in the leaves, which are thin and broad to catch light.'],
  ['Factors that limit photosynthesis are light intensity, carbon dioxide and temperature.', 'Farmers raise carbon dioxide in greenhouses so crops grow faster.'],
  ['Chapter 3', 'Respiration', 'Respiration releases energy from glucose in every living cell. Mitochondria are where it happens.', 'The mitochondria have folded inner membranes. Aerobic respiration needs oxygen.'],
  ['Aerobic respiration in the mitochondria gives carbon dioxide, water and lots of energy as ATP.', 'Anaerobic respiration happens without oxygen and releases much less energy than the mitochondria do.'],
  ['In muscles, anaerobic respiration makes lactic acid, which causes cramps. Yeast makes ethanol.', 'Mitochondria are more numerous in cells that need lots of energy, such as muscle cells.'],
  ['Index', 'ATP 9', 'cells 3', 'chlorophyll 6', 'mitochondria 9', 'photosynthesis 6', 'respiration 9'],
];

const MOCK_TOPICS = [
  { title: 'Cells', chapter: 'Chapter 1', startPage: 3 },
  { title: 'Photosynthesis', chapter: 'Chapter 2', startPage: 6 },
  { title: 'Respiration', chapter: 'Chapter 3', startPage: 9 },
  // Front matter and the index are left out; duplicates and out-of-range pages are tidied.
  { title: 'Index', chapter: null, startPage: 12 },
  { title: 'Cells', chapter: 'Chapter 1', startPage: 3 },
  { title: 'Appendix', chapter: null, startPage: 99 },
];

const upload = (token: string, id: string, pdf: Buffer, extra: Record<string, string> = {}) => {
  let r = http().post(`/textbooks/${id}`).set('Authorization', `Bearer ${token}`);
  for (const [k, v] of Object.entries(extra)) r = r.field(k, v);
  return r.attach('file', pdf, { filename: 'senior-biology.pdf', contentType: 'application/pdf' });
};

/** Waits for the background reading and topic listing to finish. */
async function settled(as: Awaited<ReturnType<typeof signIn>>['as'], id: string) {
  for (let i = 0; i < 100; i++) {
    const { body } = await as.get(`/textbooks/${id}`).expect(200);
    if (body.textbook.status !== 'reading') return body.textbook;
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error('still reading');
}

async function settledPack(as: Awaited<ReturnType<typeof signIn>>['as'], id: string) {
  for (let i = 0; i < 100; i++) {
    const { body } = await as.get(`/materials/${id}`).expect(200);
    if (body.material.status !== 'processing') return body.material;
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error('still processing');
}

async function settledVideo(as: Awaited<ReturnType<typeof signIn>>['as'], id: string) {
  for (let i = 0; i < 100; i++) {
    const { body } = await as.get(`/videos/${id}`).expect(200);
    if (body.video.status !== 'generating') return body.video;
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error('still generating');
}

/** A ready book with the AI-listed topics. */
async function readyBook(id = 'book0001') {
  const who = await signIn();
  ai.topics = MOCK_TOPICS;
  await upload(who.token, id, makePdf(BOOK), { title: 'Senior Biology' }).expect(202);
  const book = await settled(who.as, id);
  expect(book.status).toBe('ready');
  return { ...who, book };
}

describe('uploading a textbook', () => {
  it('reads every page and lists the topics with the AI in the background', async () => {
    reset();
    const { as, token, sub } = await signIn();
    ai.topics = MOCK_TOPICS;
    const res = await upload(token, 'book0001', makePdf(BOOK), { title: 'Senior Biology' }).expect(202);
    expect(res.body.textbook).toMatchObject({ id: 'book0001', title: 'Senior Biology', fileName: 'senior-biology.pdf', status: 'reading', topics: [] });
    expect(res.body.textbook.pages).toBeUndefined();

    const book = await settled(as, 'book0001');
    expect(book).toMatchObject({ status: 'ready', pageCount: 12 });
    expect(book.error).toBeUndefined();
    expect(book.pages).toBeUndefined();
    expect(book.topics).toEqual([
      { id: 't1', title: 'Cells', chapter: 'Chapter 1', startPage: 3, endPage: 5 },
      { id: 't2', title: 'Photosynthesis', chapter: 'Chapter 2', startPage: 6, endPage: 8 },
      { id: 't3', title: 'Respiration', chapter: 'Chapter 3', startPage: 9, endPage: 11 },
      { id: 't4', title: 'Appendix', startPage: 12, endPage: 12 },
    ]);
    // The pages are stored as text only; the PDF itself isn't kept.
    const stored = await prisma.textbook.findUniqueOrThrow({ where: { id: 'book0001' } });
    expect(stored.pages).toHaveLength(12);
    expect(stored.pages[5]).toContain('Photosynthesis');

    // One cheap AI call: the opening pages in full, then each page's number and heading lines.
    expect(ai.inputs).toHaveLength(1);
    expect(ai.inputs[0]).toContain('[Page 2]\nContents');
    expect(ai.inputs[0]).toContain('p9: Chapter 3 | Respiration');
    expect(ai.inputs[0]).toContain('p12: Index');
    expect(await prisma.usageEvent.count({ where: { userId: sub, feature: 'textbook_topics' } })).toBe(1);

    // Listed newest first, without pages; a title comes from the file name when none is given.
    await upload(token, 'book0002', makePdf(BOOK)).expect(202);
    await settled(as, 'book0002');
    const list = (await as.get('/textbooks').expect(200)).body.textbooks;
    expect(list.map((t: { id: string; title: string }) => [t.id, t.title])).toEqual([
      ['book0002', 'senior-biology'],
      ['book0001', 'Senior Biology'],
    ]);
    expect(list[0].pages).toBeUndefined();
    await upload(token, 'book0001', makePdf(BOOK)).expect(409);
  });

  it('falls back to the PDF’s bookmarks when the AI isn’t available, and retries a failed listing', async () => {
    reset();
    const { as, token } = await signIn();
    // No AI key: the book's own bookmarks make the list.
    ai.mode = 'off';
    const bookmarked = makePdf(BOOK, [
      { title: 'Contents', page: 2 },
      { title: 'Cells', page: 3 },
      { title: 'Photosynthesis', page: 6 },
      { title: 'Respiration', page: 9 },
    ]);
    await upload(token, 'marks001', bookmarked).expect(202);
    const fromMarks = await settled(as, 'marks001');
    expect(fromMarks.status).toBe('ready');
    expect(fromMarks.topics.map((t: { title: string; startPage: number; endPage: number }) => [t.title, t.startPage, t.endPage])).toEqual([
      ['Cells', 3, 5],
      ['Photosynthesis', 6, 8],
      ['Respiration', 9, 12],
    ]);

    // No AI and no bookmarks: failed, and worth trying again once the AI is set up.
    await upload(token, 'nomarks1', makePdf(BOOK)).expect(202);
    expect(await settled(as, 'nomarks1')).toMatchObject({ status: 'failed', pageCount: 12, error: { code: 'not-configured', retryable: true } });

    // The AI fails: same, with ai-failed. The retry lists the stored pages again (no re-upload).
    ai.mode = 'fail';
    await upload(token, 'aifail01', makePdf(BOOK)).expect(202);
    expect(await settled(as, 'aifail01')).toMatchObject({ status: 'failed', error: { code: 'ai-failed', retryable: true } });
    ai.mode = 'ok';
    ai.topics = MOCK_TOPICS;
    expect((await as.post('/textbooks/aifail01/retry').expect(202)).body.textbook.status).toBe('reading');
    const retried = await settled(as, 'aifail01');
    expect(retried.status).toBe('ready');
    expect(retried.topics).toHaveLength(4);
    await as.post('/textbooks/aifail01/retry').expect(409);
  });

  it('refuses scanned books (no OCR), unreadable files and other file types', async () => {
    reset();
    const { as, token } = await signIn();
    // Pictures of pages have no text layer: nothing to read without OCR.
    const scanned = makePdf([['Senior Biology'], [], [], [], [], [], [], []]);
    await upload(token, 'scanned1', scanned).expect(202);
    expect(await settled(as, 'scanned1')).toMatchObject({ status: 'failed', pageCount: 0, error: { code: 'scanned-book', retryable: false } });
    // Nothing was read, so a retry means uploading again.
    expect((await as.post('/textbooks/scanned1/retry').expect(409)).body.reason).toBe('reupload');

    await upload(token, 'notpdf01', Buffer.from('not a pdf at all')).expect(202);
    expect(await settled(as, 'notpdf01')).toMatchObject({ status: 'failed', error: { code: 'unreadable-file', retryable: false } });

    const word = await http()
      .post('/textbooks/word0001')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('x'), { filename: 'book.docx', contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
      .expect(415);
    expect(word.body.reason).toBe('unsupported-file');
    await as.post('/textbooks/nofile01').expect(400);
    await http().post('/textbooks/anon0001').expect(401);
  });

  it('shows a book stuck reading after a restart as failed', async () => {
    reset();
    const { as, sub } = await signIn();
    await prisma.textbook.create({ data: { id: 'stuck001', userId: sub, title: 'Stuck', fileName: 'stuck.pdf' } });
    await prisma.textbook.create({ data: { id: 'stuck002', userId: sub, title: 'Stuck later', fileName: 'stuck.pdf', pages: ['Some text'], pageCount: 1 } });
    await prisma.$executeRaw`UPDATE "Textbook" SET "updatedAt" = (now() at time zone 'utc') - interval '30 minutes'`;
    // Interrupted while reading: the file is gone, so it can't be retried. Interrupted while listing: it can.
    expect((await as.get('/textbooks/stuck001')).body.textbook).toMatchObject({ status: 'failed', error: { code: 'ai-failed', retryable: false } });
    expect((await as.get('/textbooks/stuck002')).body.textbook).toMatchObject({ status: 'failed', error: { code: 'ai-failed', retryable: true } });
  });
});

describe('finding a topic in a textbook', () => {
  it('finds listed topics by name, typed topics by their pages, and nothing for the rest', async () => {
    reset();
    const { as } = await readyBook();
    // A listed topic, however it's typed (case and accents don't matter).
    expect((await as.get('/textbooks/book0001/find?topic=photosynthesis').expect(200)).body.topic).toEqual({
      title: 'Photosynthesis',
      startPage: 6,
      endPage: 8,
      listed: true,
    });
    expect((await as.get('/textbooks/book0001/find?topic=Chapter%203%20Respirátion').expect(200)).body.topic).toMatchObject({ title: 'Respiration', listed: true });
    // A topic that isn't listed is found where its words are: mitochondria are in the respiration pages.
    expect((await as.get('/textbooks/book0001/find?topic=Mitochondria').expect(200)).body.topic).toEqual({
      title: 'Mitochondria',
      startPage: 9,
      endPage: 11,
      listed: false,
    });
    expect((await as.get('/textbooks/book0001/find?topic=limiting%20factors%20of%20photosynthesis').expect(200)).body.topic).toMatchObject({
      startPage: 8,
      listed: false,
    });
    const missing = await as.get('/textbooks/book0001/find?topic=quantum%20chromodynamics').expect(404);
    expect(missing.body.reason).toBe('topic-not-found');
    await as.get('/textbooks/book0001/find').expect(400);
  });

  it('keeps textbooks private, and deletes them', async () => {
    reset();
    const { as } = await readyBook();
    const other = await signIn({ email: 'tunde@example.com' });
    await other.as.get('/textbooks/book0001').expect(404);
    await other.as.get('/textbooks/book0001/find?topic=Cells').expect(404);
    await other.as.post('/textbooks/book0001/retry').expect(404);
    expect((await other.as.get('/textbooks')).body.textbooks).toEqual([]);
    await other.as.post('/materials/pack0001', { type: 'textbook', textbookId: 'book0001', topic: 'Cells' }).expect(404);
    // Deleting someone else's does nothing; the owner's delete removes it.
    await other.as.delete('/textbooks/book0001').expect(200);
    await as.get('/textbooks/book0001').expect(200);
    await as.delete('/textbooks/book0001').expect(200);
    await as.get('/textbooks/book0001').expect(404);
    expect(await prisma.textbook.count()).toBe(0);
  });
});

describe('studying one topic of a textbook', () => {
  it('makes a study pack from just the topic’s pages', async () => {
    reset();
    const { as, sub } = await readyBook();
    const before = (await prisma.user.findUniqueOrThrow({ where: { id: sub } })).aiCredits;
    const res = await as.post('/materials/pack0001', { type: 'textbook', textbookId: 'book0001', topic: 'photosynthesis', options: { depth: 'Quick' } }).expect(202);
    expect(res.body.material).toMatchObject({
      id: 'pack0001',
      title: 'Photosynthesis',
      status: 'processing',
      source: { type: 'text', label: 'Photosynthesis · Senior Biology' },
    });
    const pack = await settledPack(as, 'pack0001');
    expect(pack.status).toBe('ready');
    expect(ai.packs).toHaveLength(1);
    expect(ai.packs[0].topic).toBeUndefined();
    // Only pages 6–8, with page markers; nothing from the cells or respiration chapters.
    expect(ai.packs[0].text).toContain('--- Page 6 ---');
    expect(ai.packs[0].text).toContain('Chlorophyll in the chloroplasts');
    expect(ai.packs[0].text).toContain('greenhouses');
    expect(ai.packs[0].text).not.toContain('--- Page 5 ---');
    expect(ai.packs[0].text).not.toContain('--- Page 9 ---');
    expect(ai.packs[0].text).not.toContain('Mitochondria');
    expect((await prisma.user.findUniqueOrThrow({ where: { id: sub } })).aiCredits).toBe(before - 1);

    // A typed topic works too, titled as typed; a chosen title wins.
    await as.post('/materials/pack0002', { type: 'textbook', textbookId: 'book0001', topic: 'mitochondria', title: 'Powerhouse notes' }).expect(202);
    expect((await as.get('/materials/pack0002')).body.material).toMatchObject({ title: 'Powerhouse notes', source: { label: 'mitochondria · Senior Biology' } });
    await settledPack(as, 'pack0002');
    expect(ai.packs[1].text).toContain('--- Page 9 ---');
    expect(ai.packs[1].text).not.toContain('--- Page 6 ---');

    // Unknown book or topic: a clear 404 before any credit is held.
    const credits = (await prisma.user.findUniqueOrThrow({ where: { id: sub } })).aiCredits;
    expect((await as.post('/materials/pack0003', { type: 'textbook', textbookId: 'nope0001', topic: 'Cells' }).expect(404)).body.reason).toBe('textbook-not-found');
    expect((await as.post('/materials/pack0003', { type: 'textbook', textbookId: 'book0001', topic: 'quantum chromodynamics' }).expect(404)).body.reason).toBe('topic-not-found');
    await as.post('/materials/pack0003', { type: 'textbook', textbookId: 'book0001' }).expect(400);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: sub } })).aiCredits).toBe(credits);
  });

  it('makes a video from just the topic’s pages', async () => {
    reset();
    const { as } = await readyBook();
    const settings: VideoSettings = { length: '30s', voiceId: 'none', styleId: 'galaxy', captions: true, captionStyle: 'classic', language: 'en' };
    await as
      .post('/videos/mine/vid00001', {
        title: 'Respiration in 30 seconds',
        source: { kind: 'textbook', textbookId: 'book0001', topic: 'Respiration', label: 'Respiration · Senior Biology' },
        settings,
      })
      .expect(202);
    const video = await settledVideo(as, 'vid00001');
    expect(video).toMatchObject({ status: 'ready', source: { kind: 'textbook', textbookId: 'book0001', topic: 'Respiration' } });
    expect(ai.scripts).toHaveLength(1);
    expect(ai.scripts[0].topic).toBeUndefined();
    expect(ai.scripts[0].text).toContain('--- Page 9 ---');
    expect(ai.scripts[0].text).toContain('lactic acid');
    expect(ai.scripts[0].text).not.toContain('Chlorophyll');
    expect(ai.scripts[0].text).not.toContain('--- Page 12 ---');

    const missing = await as
      .post('/videos/mine/vid00002', { title: 'X', source: { kind: 'textbook', textbookId: 'book0001', topic: 'quantum chromodynamics', label: 'x' }, settings })
      .expect(404);
    expect(missing.body.reason).toBe('topic-not-found');
    expect(await prisma.video.count()).toBe(1);
  });
});

describe('tidying the AI’s topic list', () => {
  it('keeps the first section, not the chapter heading on the same page, and un-capitalises headings', () => {
    const topics = tidyTopics(
      [
        { title: 'CHAPTER 2: DIFFUSION AND OSMOSIS', chapter: null, startPage: 7 },
        { title: '2.1 Diffusion', chapter: 'CHAPTER 2: DIFFUSION AND OSMOSIS', startPage: 7 },
        { title: '2.2 Osmosis', chapter: 'CHAPTER 2: DIFFUSION AND OSMOSIS', startPage: 8 },
        { title: 'Genetics', chapter: null, startPage: 10 },
      ],
      12,
    );
    expect(topics.map((t) => [t.title, t.chapter, t.startPage, t.endPage])).toEqual([
      ['2.1 Diffusion', 'Chapter 2: Diffusion and osmosis', 7, 7],
      ['2.2 Osmosis', 'Chapter 2: Diffusion and osmosis', 8, 9],
      ['Genetics', undefined, 10, 12],
    ]);
    expect(unshout('DNA')).toBe('DNA');
    expect(unshout('Photosynthesis')).toBe('Photosynthesis');
  });
});
