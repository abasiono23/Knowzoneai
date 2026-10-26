/**
 * Stylised 3D art for the Tech Hub (Technology & Computer Science games, 2.5D): the hub and its
 * stations, the student in a Knowzone hoodie (the logo is given as a reference picture; the other
 * poses are edits of the first so it stays the same person), and game pieces. Run from apps/server:
 *
 *   npx tsx scripts/tech-art.ts <output folder> [name or prefix-] [--n 1]
 *
 * Copy the chosen ones (as WebP) to apps/mobile/assets/images/world/tech/.
 */
import { join } from 'node:path';

import { runArt, type Art } from './art-runner.js';

const LOOK =
  'Stylised 3D game render like a Pixar film or a premium console game: realistic lighting and materials (glass, brushed metal, glowing screens, circuit boards, neon light strips), slightly cartoon proportions, friendly rounded shapes. Deep navy and violet with teal and electric-green neon and warm orange highlights. No text, letters, numbers, labels or logos anywhere unless asked.';
const PLACE = (place: string) => `${LOOK} ${place} Portrait composition. No people.`;
const CUTOUT = 'A single object, fully transparent background, no floor, no shadow box, centred.';
const LOGO = join(import.meta.dirname, '../../mobile/assets/images/icon.png');
const STUDENT =
  'a Nigerian teenage boy (about 15) with short black hair, wearing a dark violet hoodie with thin teal circuit-line patterns, blue jeans, white and violet sneakers and black wireless headphones around his neck';

const ART: Record<string, Art> = {
  'scene-hub': {
    size: '1024x1536',
    prompt: PLACE(
      'A BRIGHT, well-lit, colourful futuristic tech innovation hub (daylight from a glass roof plus neon accents, not dark) seen from the entrance at standing eye level, all five areas clearly visible around the hall: glass walls, neon light strips, a shiny dark floor filling the lower half, open and empty to walk on. Left: a glowing grid floor arena with floating tiles (coding arena). Back left: a security room behind glass with screens showing shields and padlocks. Back right: a giant round vault door glowing with teal circuits. Right: a robotics bay with a small friendly robot on a test track. Front right: a workbench with wires, light bulbs and chips (electronics bench).',
    ),
  },
  'scene-code': {
    size: '1024x1536',
    prompt:
      'Abstract background only, portrait: a deep navy and violet digital void with a faint glowing teal perspective grid on the floor far below, soft floating light particles and bokeh. Absolutely no objects, no computers, no screens, no machines, no text. The middle is open and dark so game pieces can be drawn over it.',
  },
  'scene-cyber': {
    size: '1024x1536',
    prompt: PLACE('A cyber-security control room: a curved desk with three large glowing monitors showing a network map of connected computers and shield icons (no readable text), keyboard, dim blue light, seen from just behind the chair.'),
  },
  'scene-robot': {
    size: '1024x1536',
    prompt: PLACE('A robotics workshop bay: shelves with robot parts, cables, a tool wall, warm workshop lights and neon strips, the floor in the middle is a clear empty grey test area seen from above at an angle.'),
  },
  'scene-vault': {
    size: '1024x1536',
    prompt: PLACE('A high-tech vault room: in the centre a huge round metal vault door with glowing teal circuit patterns and a dark empty panel in its middle, pipes and lights around it.'),
  },
  'scene-circuit': {
    size: '1024x1536',
    prompt: PLACE('A top-down view of an electronics workbench: a large dark green circuit-board mat filling the middle (plain and empty), with tools, a soldering iron, spare wires, resistors and chips around the edges, warm desk light.'),
  },

  // The student: the first picture uses the Knowzone logo as a reference; the poses are edits of it.
  'student-back': {
    size: '1024x1536',
    transparent: true,
    ref: [LOGO],
    prompt: `${LOOK} Full body, seen from directly behind: ${STUDENT}. On the BACK of the hoodie, large and centred, is this exact logo from the reference picture: a white rounded letter K with a gold four-pointed sparkle and a small white sparkle, on a violet rounded-square patch. Standing relaxed, arms by the sides. Fully transparent background, no floor, no shadow.`,
  },
  'student-front': {
    size: '1024x1536',
    transparent: true,
    ref: [LOGO],
    prompt: `${LOOK} Full body, seen from the front: ${STUDENT}, smiling. On the FRONT chest of the hoodie is this exact logo from the reference picture, small: a white rounded letter K with a gold four-pointed sparkle on a violet rounded-square patch. Standing relaxed. Fully transparent background, no floor, no shadow.`,
  },
  'student-walk': {
    size: '1024x1536',
    transparent: true,
    ref: 'student-back-1.png',
    prompt: 'The exact same boy, same hoodie with the same logo on the back, same jeans, sneakers and headphones, seen from directly behind, now walking away mid-stride (left foot forward, arms swinging a little). Fully transparent background, no floor, no shadow.',
  },
  'student-side': {
    size: '1024x1536',
    transparent: true,
    ref: 'student-back-1.png',
    prompt: 'The exact same Nigerian boy with the same dark brown skin, same violet hoodie, jeans, sneakers and headphones, now seen from the side walking to the LEFT, mid-stride, friendly face in profile. Fully transparent background, no floor, no shadow.',
  },

  // Game pieces
  runner: { size: '1024x1024', transparent: true, prompt: `${LOOK} ${CUTOUT} A cute small round cartoon runner robot with big glowing teal eyes, a violet body and little legs, in a running pose, seen from the front and slightly above.` },
  robot: { size: '1024x1024', transparent: true, prompt: `${LOOK} ${CUTOUT} A cute friendly white and teal rescue robot on wheels with a round head, big glowing eyes and two small arms, seen from the front and slightly above.` },
  kitten: { size: '1024x1024', transparent: true, prompt: `${LOOK} ${CUTOUT} A cute small orange tabby kitten sitting and looking up, a little worried.` },
  crate: { size: '1024x1024', transparent: true, prompt: `${LOOK} ${CUTOUT} A sturdy metal-edged wooden crate, seen from slightly above.` },
  gem: { size: '1024x1024', transparent: true, prompt: `${LOOK} ${CUTOUT} A solid, shiny, cut teal-green gemstone (like an emerald) with bright facets and a soft glow, fully coloured, not see-through.` },
  flag: { size: '1024x1024', transparent: true, prompt: `${LOOK} ${CUTOUT} A small goal flag on a pole: a glowing orange-red flag on a silver pole with a round base.` },
};

await runArt(ART, 'npx tsx scripts/tech-art.ts');
