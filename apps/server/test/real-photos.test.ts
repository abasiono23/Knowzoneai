import { afterEach, describe, expect, it, vi } from 'vitest';

import { findPhoto } from '../src/services/real-photos.js';

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
