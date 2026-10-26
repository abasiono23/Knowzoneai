/**
 * Realistic art for the walkable chemistry lab (2.5D): empty scenes (no people), the student in a
 * lab coat (one base picture, edited into other poses so it stays the same person), and cut-out
 * equipment. Run from apps/server:
 *
 *   npx tsx scripts/lab-art.ts <output folder> [name or prefix-] [--n 1]
 *
 * Pictures with `ref` are made by editing that earlier picture (from the same output folder).
 * Copy the chosen ones (as WebP) to apps/mobile/assets/images/world/chemistry/.
 */
import { createReadStream, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { toFile } from 'openai';

import { config } from '../src/config.js';
import { openaiClient } from '../src/services/ai.js';

const REAL =
  'Photorealistic high-end 3D game render (Unreal Engine quality), physically based materials, soft natural daylight, realistic proportions. No text, letters, numbers, labels or logos anywhere.';
const ROOM =
  'A modern, clean, well-equipped Nigerian secondary-school chemistry laboratory: white cabinets, black resin bench tops, light grey floor tiles, daylight from windows.';
const CUTOUT = 'A single object, fully transparent background, no shadow box, no floor, centred, seen straight on from slightly above.';

type Art = { size: '1024x1024' | '1024x1536' | '1536x1024'; prompt: string; transparent?: boolean; ref?: string };

const ART: Record<string, Art> = {
  // Scenes (no people)
  'scene-hall': {
    size: '1024x1536',
    prompt: `${REAL} ${ROOM} A wide view of the whole lab seen from the entrance at standing eye level, portrait composition. The lower half is open floor to walk on, with a clear aisle leading to the back. Left wall: tall white shelves full of reagent bottles. Back wall: a large whiteboard, and a big periodic table poster. Back right: a tall glass-front cabinet of element samples. Right wall: windows with daylight, and below them a bench with a draining rack of glassware. Middle left: a lab bench with an open box of molecular model kit balls. Middle right: a workbench with a test tube rack and a Bunsen burner. No people.`,
  },
  'scene-shelves': {
    size: '1024x1536',
    prompt: `${REAL} Straight-on close view of a chemistry store-room wall: three long, completely EMPTY white shelves (nothing on them) spaced evenly from the middle to the top of the picture, with a counter at the bottom. A hazard-symbol poster at the edge. Soft daylight. No people, no bottles.`,
  },
  'scene-glassware': {
    size: '1024x1536',
    prompt: `${REAL} Straight-on close view of a lab bench under a window: a black resin bench top filling the lower half, completely EMPTY and clean, a pegboard drying rack on the wall above with only a few pegs, a sink at the far right edge. No people, no glassware on the bench.`,
  },
  'scene-bench': {
    size: '1024x1536',
    prompt: `${REAL} A standing view down onto a black resin lab workbench: the bench top fills most of the picture and its middle is completely EMPTY and clear; at the back edge a gas tap and a small sink; a white wall tiled behind. No people, nothing in the middle of the bench.`,
  },
  'scene-cabinet': {
    size: '1024x1536',
    prompt: `${REAL} Straight-on view of a tall glass-front lab cabinet with its doors open, four EMPTY glass shelves evenly spaced, softly lit from inside, white frame, standing on a grey floor. No people, nothing on the shelves.`,
  },
  'scene-models': {
    size: '1024x1536',
    prompt: `${REAL} A standing view down onto a light wooden study desk in the chemistry lab, the middle of the desk completely EMPTY and clear; an open plastic molecular model kit box with compartments of coloured balls at the top right corner; a pencil and notebook at the top left. No people.`,
  },
  'scene-board': {
    size: '1024x1536',
    prompt: `${REAL} Straight-on view of a large, completely BLANK white whiteboard on the chemistry lab wall, filling the upper two thirds of the picture, an aluminium marker tray with three markers below it, a lab bench top at the very bottom. No people, nothing written.`,
  },

  // The student (one base picture; the poses are edits of it)
  'student-back': {
    size: '1024x1536',
    transparent: true,
    prompt: `${REAL} Full body, seen from directly behind: a Nigerian teenage student (about 15, short dark hair) in a crisp white knee-length lab coat, black trousers, black school shoes, blue nitrile gloves, with the strap of clear safety goggles visible around the head. Standing relaxed, arms by the sides. Fully transparent background, no floor, no shadow.`,
  },
  'student-walk': {
    size: '1024x1536',
    transparent: true,
    ref: 'student-back-1.png',
    prompt:
      'The exact same student, same clothes and proportions, seen from directly behind, now walking away mid-stride (left foot forward, arms swinging a little). Fully transparent background, no floor, no shadow.',
  },
  'student-side': {
    size: '1024x1536',
    transparent: true,
    ref: 'student-back-1.png',
    prompt:
      'The exact same student, same clothes and proportions, now seen from the side walking to the LEFT, mid-stride, face in profile wearing clear safety goggles. Fully transparent background, no floor, no shadow.',
  },

  // Equipment cut-outs (labels are added by the app)
  'item-bottle': {
    size: '1024x1024',
    transparent: true,
    prompt: `${REAL} ${CUTOUT} A clear glass laboratory reagent bottle with a black screw cap and a plain blank white paper label, filled two-thirds with a colourless liquid.`,
  },
  'item-bottle-brown': {
    size: '1024x1024',
    transparent: true,
    prompt: `${REAL} ${CUTOUT} An amber-brown glass laboratory reagent bottle with a black screw cap and a plain blank white paper label.`,
  },
  'item-beaker': {
    size: '1024x1024',
    transparent: true,
    prompt: `${REAL} ${CUTOUT} An empty clear borosilicate glass beaker (250 ml) with white graduation marks and a pouring spout.`,
  },
  'item-flask': { size: '1024x1024', transparent: true, prompt: `${REAL} ${CUTOUT} An empty clear glass conical (Erlenmeyer) flask.` },
  'item-tube': { size: '1024x1024', transparent: true, prompt: `${REAL} ${CUTOUT} A single empty clear glass test tube standing upright.` },
  'item-dropper': { size: '1024x1024', transparent: true, prompt: `${REAL} ${CUTOUT} A small brown glass dropper bottle with a rubber teat pipette.` },
  'item-litmus': { size: '1024x1024', transparent: true, prompt: `${REAL} ${CUTOUT} A small open booklet of litmus paper strips, some blue and some red.` },
  'item-magnesium': { size: '1024x1024', transparent: true, prompt: `${REAL} ${CUTOUT} A short coil of shiny silver-grey magnesium ribbon.` },
  'item-burner': { size: '1024x1024', transparent: true, prompt: `${REAL} ${CUTOUT} A metal Bunsen burner with a blue flame.` },
  'item-phmeter': { size: '1024x1024', transparent: true, prompt: `${REAL} ${CUTOUT} A handheld digital pH meter with a probe, the display blank.` },
  'item-jar': {
    size: '1024x1024',
    transparent: true,
    prompt: `${REAL} ${CUTOUT} A small empty clear glass sample jar with a silver metal screw lid and a plain blank white label.`,
  },
};

const args = process.argv.slice(2);
const [outDir, only] = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'));
const n = Number(args[args.indexOf('--n') + 1]) || 1;
if (!outDir) throw new Error('Usage: npx tsx scripts/lab-art.ts <output folder> [name or prefix-] [--n 1]');
mkdirSync(outDir, { recursive: true });

const save = (name: string, data: { b64_json?: string }[] | undefined) =>
  data?.forEach((img, k) => {
    const file = join(outDir, `${name}-${k + 1}.png`);
    writeFileSync(file, Buffer.from(img.b64_json!, 'base64'));
    console.log('saved', file);
  });

const todo = Object.entries(ART).filter(([name]) => !only || name === only || (only.endsWith('-') && name.startsWith(only)));
// Base pictures first, then the edits that need them.
for (const pass of [false, true]) {
  const batch = todo.filter(([, a]) => !!a.ref === pass);
  for (let i = 0; i < batch.length; i += 4) {
    await Promise.all(
      batch.slice(i, i + 4).map(async ([name, art]) => {
        const background = art.transparent ? 'transparent' : 'opaque';
        if (art.ref) {
          const refFile = join(outDir, art.ref);
          if (!existsSync(refFile)) throw new Error(`${name} needs ${art.ref} first`);
          const result = await openaiClient().images.edit({
            model: config.OPENAI_MODEL_IMAGE,
            image: await toFile(createReadStream(refFile), art.ref, { type: 'image/png' }),
            prompt: art.prompt,
            size: art.size,
            quality: 'medium',
            background,
            n,
          });
          save(name, result.data);
          return;
        }
        const result = await openaiClient().images.generate({
          model: config.OPENAI_MODEL_IMAGE,
          prompt: art.prompt,
          size: art.size,
          quality: 'medium',
          background,
          output_format: 'png',
          n,
        });
        save(name, result.data);
      }),
    );
  }
}
