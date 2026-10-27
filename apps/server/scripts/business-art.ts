/**
 * Stylised 3D art for the Business District (Business, Finance & Economics games, 2.5D): the city
 * square and the five places, and the young entrepreneur in her emerald blazer (the Knowzone logo is
 * given as a reference picture; the other poses are edits of the first so she stays the same person).
 * Run from apps/server:
 *
 *   npx tsx scripts/business-art.ts <output folder> [name or prefix-] [--n 1]
 *
 * Copy the chosen ones (as WebP) to apps/mobile/assets/images/world/business/.
 */
import { join } from 'node:path';

import { runArt, type Art } from './art-runner.js';

const LOOK =
  'Stylised 3D game render like a Pixar film or a premium console game: realistic lighting and materials (glass towers, polished wood, brass, stone, fabric awnings, paper and coins), slightly cartoon proportions, friendly rounded shapes. Warm cream and emerald green with deep navy, gold and coral accents. No text, letters, numbers, labels or logos anywhere unless asked.';
const PLACE = (place: string) => `${LOOK} ${place} Portrait composition. No people.`;
const LOGO = join(import.meta.dirname, '../../mobile/assets/images/icon.png');
const WOMAN =
  'a young white woman (about 19) with wavy auburn hair in a high ponytail, light freckles and green eyes, wearing a smart emerald-green blazer over a white top, navy trousers and white sneakers, holding a dark tablet in one hand';

const ART: Record<string, Art> = {
  'scene-hub': {
    size: '1024x1536',
    prompt: PLACE(
      'A sunny, cheerful city business square seen from standing eye level at its edge, all five buildings clearly visible around the plaza: the warm stone-paved plaza fills the lower half, open and empty to walk on, with a small round fountain and a few trees. Back left: a modern glass startup office tower with a small rocket sculpture on its roof. Left: a classic bank building with stone columns and a golden piggy-bank statue by the door. Centre back: a row of colourful market stalls with striped awnings and crates of fruit. Right: a small red-brick factory with a chimney, big windows and a loading door with boxes. Back right: a grand stock exchange building with columns and a large glowing board of green and red arrows (no numbers).',
    ),
  },
  'scene-startup': {
    size: '1024x1536',
    prompt: PLACE(
      'The bright open-plan interior of a small startup office: wooden desks with laptops, plants, a coffee corner, a whiteboard with sticky notes (no readable text), big windows with a city view, warm daylight. The middle of the picture is calm and uncluttered.',
    ),
  },
  'scene-budget': {
    size: '1024x1536',
    prompt: PLACE(
      'A cosy, tidy apartment desk by a big window at golden hour: a wooden desk with a brass lamp, a glass savings jar with coins, a small plant, a calculator and a notebook, soft warm light. The middle of the picture is calm and uncluttered.',
    ),
  },
  'scene-market': {
    size: '1024x1536',
    prompt: PLACE(
      'A lively outdoor market street on a sunny day, seen from behind a lemonade and fruit stall with an orange-and-cream striped awning: crates of lemons and oranges, a glass drinks dispenser, and across the street a rival stall with a green awning. Cobblestones, bunting, warm light.',
    ),
  },
  'scene-factory': {
    size: '1024x1536',
    prompt: PLACE(
      'Inside a cheerful small factory: a conveyor belt carrying colourful backpacks, sewing machines, shelves of fabric rolls, stacked boxes ready to ship, big windows with warm sunlight, clean and safe.',
    ),
  },
  'scene-exchange': {
    size: '1024x1536',
    prompt: PLACE(
      'A grand stock exchange hall: tall columns, polished floor, a huge wall of glowing screens with green and red candlestick charts and arrows (no numbers or text), warm brass and evening light.',
    ),
  },

  // The entrepreneur: the first picture uses the Knowzone logo as a reference; the poses are edits of it.
  'woman-front': {
    size: '1024x1536',
    transparent: true,
    ref: [LOGO],
    prompt: `${LOOK} Full body, seen from the front: ${WOMAN}, smiling confidently. On the blazer's left chest pocket is a small badge with this exact logo from the reference picture: a white rounded letter K with a gold four-pointed sparkle on a violet rounded-square patch. Standing relaxed. Fully transparent background, no floor, no shadow.`,
  },
  'woman-back': {
    size: '1024x1536',
    transparent: true,
    ref: 'woman-front-1.png',
    prompt:
      'The exact same young woman, same auburn ponytail, same emerald blazer, white top, navy trousers and white sneakers, holding the same tablet, now seen from directly behind, standing relaxed. Fully transparent background, no floor, no shadow.',
  },
  'woman-walk': {
    size: '1024x1536',
    transparent: true,
    ref: 'woman-front-1.png',
    prompt:
      'The exact same young woman, same auburn ponytail, same emerald blazer, white top, navy trousers and white sneakers, holding the same tablet, now seen from directly behind walking away mid-stride (left foot forward, ponytail swinging). Fully transparent background, no floor, no shadow.',
  },
  'woman-side': {
    size: '1024x1536',
    transparent: true,
    ref: 'woman-front-1.png',
    prompt:
      'The exact same young woman with the same fair freckled skin, auburn ponytail, emerald blazer with the small violet logo badge, white top, navy trousers and white sneakers, holding the same tablet, now seen from the side walking to the LEFT, mid-stride, friendly face in profile. Fully transparent background, no floor, no shadow.',
  },
};

await runArt(ART, 'npx tsx scripts/business-art.ts');
