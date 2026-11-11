import { afterEach, describe, expect, it, vi } from 'vitest';

import { findPhoto, findPicture } from '../src/services/real-photos.js';

// The AI picks photo number `ai.best` (or none).
const ai = vi.hoisted(() => ({ best: 0, images: 0 }));
vi.mock('../src/services/ai.js', async (original) => ({
  ...(await original<typeof import('../src/services/ai.js')>()),
  logUsage: vi.fn(async () => {}),
  openaiClient: () => ({
    responses: {
      parse: async ({ input }: { input: { content: { type: string }[] }[] }) => {
        ai.images = input[0]!.content.filter((c) => c.type === 'input_image').length;
        return { output_parsed: { best: ai.best }, usage: {} };
      },
    },
  }),
}));

const page = (index: number, name: string, license: string, extra: Record<string, unknown> = {}) => ({
  index,
  imageinfo: [
    {
      thumburl: `https://upload.wikimedia.org/thumb/${name}.jpg`,
      mime: 'image/jpeg',
      width: 2000,
      height: 1500,
      descriptionurl: `https://commons.wikimedia.org/wiki/File:${name}.jpg`,
      extmetadata: { LicenseShortName: { value: license }, Artist: { value: '<a href="//x">Jane &amp; Co</a>' } },
      ...extra,
    },
  ],
});

/** Wikimedia answers with these pages; photos download as a few bytes. */
function commons(pages: Record<string, unknown>) {
  const calls: string[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      calls.push(url);
      if (url.includes('api.php')) return new Response(JSON.stringify({ query: { pages } }));
      return new Response(new Uint8Array([0xff, 0xd8, 0xff, 0xd9]));
    }),
  );
  return calls;
}

afterEach(() => {
  vi.unstubAllGlobals();
  ai.best = 0;
  ai.images = 0;
});

describe('real photos for videos', () => {
  it('only offers freely licensed, big enough photos, and credits the author', async () => {
    const calls = commons({
      1: page(2, 'Leaf', 'CC BY-SA 4.0'),
      2: page(1, 'Tiny', 'CC BY 4.0', { width: 200, height: 150 }),
      3: page(3, 'Logo', 'Copyrighted'),
      4: page(4, 'Svg', 'CC0', { mime: 'image/svg+xml' }),
    });
    const photo = await findPhoto('u1', 'green leaf', 'a green leaf in sunlight');
    expect(photo).toMatchObject({
      mimeType: 'image/jpeg',
      credit: { author: 'Jane & Co', license: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Leaf.jpg' },
    });
    // Only the one usable photo was shown to the AI.
    expect(ai.images).toBe(1);
    expect(calls[0]).toContain('gsrsearch=green+leaf+filetype%3Abitmap');
  });

  it('uses no photo when the AI finds none that fits, or nothing is found', async () => {
    commons({ 1: page(1, 'Leaf', 'CC BY 4.0') });
    ai.best = -1;
    expect(await findPhoto('u1', 'green leaf', 'a green leaf')).toBeNull();
    commons({});
    expect(await findPhoto('u1', 'nothing', 'nothing')).toBeNull();
  });
});

describe('labelled diagrams for textbook material', () => {
  it('accepts SVG diagrams as the PNG thumbnail Commons renders, and smaller bitmaps', async () => {
    const calls = commons({
      1: page(1, 'Plant_cell', 'CC BY-SA 3.0', {
        mime: 'image/svg+xml',
        thumburl: 'https://upload.wikimedia.org/thumb/Plant_cell.svg/1024px-Plant_cell.svg.png',
        thumbmime: 'image/png',
        width: 300,
        height: 200,
      }),
      2: page(2, 'Small', 'CC0', { mime: 'image/png', width: 450, height: 450 }),
      3: page(3, 'Tiny', 'CC0', { mime: 'image/png', width: 350, height: 350 }),
      4: page(4, 'Doc', 'CC0', { mime: 'application/pdf' }),
    });
    const diagram = await findPicture('u1', { query: 'plant cell diagram', kind: 'diagram' }, 'a labelled plant cell');
    expect(diagram).toMatchObject({ mimeType: 'image/png', credit: { license: 'CC BY-SA 3.0', url: 'https://commons.wikimedia.org/wiki/File:Plant_cell.jpg' } });
    // The SVG and the smaller PNG were shown to the AI; the tiny one and the PDF weren't.
    expect(ai.images).toBe(2);
    // Diagrams aren't limited to bitmaps.
    expect(calls[0]).toContain('gsrsearch=plant+cell+diagram&');
    expect(calls[1]).toBe('https://upload.wikimedia.org/thumb/Plant_cell.svg/1024px-Plant_cell.svg.png');
  });

  it('still rejects drawings when a photo is wanted', async () => {
    commons({ 1: page(1, 'Svg', 'CC0', { mime: 'image/svg+xml', thumbmime: 'image/png' }) });
    expect(await findPicture('u1', { query: 'leaf', kind: 'photo' }, 'a leaf')).toBeNull();
    expect(ai.images).toBe(0);
  });
});
