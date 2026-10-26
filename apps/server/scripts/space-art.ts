/**
 * Stylised 3D art for the Space Academy (Space & Physics games, 2.5D): empty scenes (no people),
 * planet surfaces, the student in a space suit (one base picture, edited into other poses so it
 * stays the same person), ships, asteroids, rocket parts and planets. Run from apps/server:
 *
 *   npx tsx scripts/space-art.ts <output folder> [name or prefix-] [--n 1]
 *
 * Pictures with `ref` are made by editing that earlier picture (from the same output folder).
 * Copy the chosen ones (as WebP) to apps/mobile/assets/images/world/space/.
 */
import { createReadStream, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { toFile } from 'openai';

import { config } from '../src/config.js';
import { openaiClient } from '../src/services/ai.js';

const LOOK =
  'Stylised 3D game render like a Pixar film or a premium console game: realistic lighting, reflections and physically based materials (brushed metal, glass, glowing screens), slightly cartoon proportions, friendly rounded shapes, rich colours. No text, letters, numbers, labels or logos anywhere.';
const STATION = 'Inside a bright, futuristic space academy station orbiting Earth: white and violet panels, warm orange and teal light strips, polished floor.';
const CUTOUT = 'A single object, fully transparent background, no floor, no shadow box, centred.';
const REAL_ROCKET =
  'Photorealistic render of part of a real modern orbital launch rocket (like a SpaceX Falcon 9 or NASA SLS), seen exactly from the side at eye level with no perspective, standing perfectly upright and centred, on a fully transparent background, no floor, no shadow. No text, letters, numbers, flags or logos.';
const SURFACE = (place: string) =>
  `${LOOK} A standing view across the surface of ${place}, portrait composition: the lower half is open, walkable ground stretching away, the upper part is the sky. No people, no vehicles, no buildings.`;

type Art = { size: '1024x1024' | '1024x1536' | '1536x1024'; prompt: string; transparent?: boolean; ref?: string };

const ART: Record<string, Art> = {
  // Scenes (no people)
  'scene-academy': {
    size: '1024x1536',
    prompt: `${LOOK} ${STATION} A wide view of a big round station hall seen from the entrance at standing eye level, portrait composition. The lower half is open, shiny floor to walk on, with a clear path to the back. Back wall: a huge curved window showing Earth and stars. Left: an open hangar doorway with a small rounded fighter spaceship inside. Back left: a rocket workshop bay with a white rocket on a launch frame. Back right: a glass dome room with glowing floating spheres (gravity lab). Right: an observatory corner with a big telescope and a glowing hologram of the solar system. No people.`,
  },
  'scene-hangar': {
    size: '1024x1536',
    prompt: `${LOOK} ${STATION} A spaceship hangar bay: a small rounded white and violet fighter spaceship parked on a glowing launch pad in the middle, seen from behind and slightly above, the open hangar doors at the back showing stars. No people.`,
  },
  'scene-workshop': {
    size: '1024x1536',
    prompt: `${LOOK} ${STATION} A rocket workshop: in the centre an EMPTY tall metal launch frame (gantry) with nothing on it, standing on a round launch pad; tool racks and screens at the sides; a large window with stars at the back. No rocket, no people.`,
  },
  'scene-gravity': {
    size: '1024x1536',
    prompt: `${LOOK} ${STATION} A gravity laboratory under a big glass dome: a round holographic table glowing teal in the middle with small floating glowing spheres above it, stars through the dome. No people.`,
  },
  'scene-observatory': {
    size: '1024x1536',
    prompt: `${LOOK} ${STATION} An observatory room: a huge brass and white telescope pointing up at an open dome slit full of stars, with a round glowing holographic projector on the floor in front. No people.`,
  },
  'bg-space': {
    size: '1024x1536',
    prompt: `Stylised 3D render of outer space, portrait: a soft violet and deep blue nebula cloud, many small twinkling stars, one small distant ringed planet in the top corner. Nothing else at all: no objects, no machines, no screens, no ships, no people, no text. The middle is calm and dark so game objects can be drawn over it.`,
  },
  'surface-moon': {
    size: '1024x1536',
    prompt: SURFACE("Earth's Moon: grey dusty ground with craters and rocks, black sky with stars and the blue Earth rising"),
  },
  'surface-mercury': { size: '1024x1536', prompt: SURFACE('Mercury: dark grey cratered rocky ground, a black sky with a huge blazing Sun low on the horizon') },
  'surface-venus': {
    size: '1024x1536',
    prompt: SURFACE('Venus: cracked orange-brown volcanic rock, thick glowing yellow-orange clouds, hazy hot air, a volcano in the distance'),
  },
  'surface-mars': {
    size: '1024x1536',
    prompt: SURFACE('Mars: red rocky dusty ground, a butterscotch dusty sky, distant mountains, two tiny moons in the sky'),
  },
  'surface-europa': {
    size: '1024x1536',
    prompt: SURFACE(
      "Europa, Jupiter's icy moon: cracked white and blue ice with brown streaks, black sky with the giant striped planet Jupiter filling part of it",
    ),
  },
  'surface-titan': {
    size: '1024x1536',
    prompt: SURFACE(
      "Titan, Saturn's moon: orange hazy sky, dark pebbly ground beside a dark methane lake, Saturn with its rings faintly visible through the haze",
    ),
  },
  'surface-miranda': {
    size: '1024x1536',
    prompt: SURFACE(
      "Miranda, Uranus's moon: grey icy ground with huge cliffs and grooves, black sky with the pale blue-green planet Uranus and its thin rings",
    ),
  },
  'surface-triton': {
    size: '1024x1536',
    prompt: SURFACE(
      "Triton, Neptune's moon: pinkish frozen nitrogen ground with dark streaks and a small geyser plume, black sky with the deep blue planet Neptune",
    ),
  },

  // The student (one base picture; the poses are edits of it)
  'student-back': {
    size: '1024x1536',
    transparent: true,
    prompt: `${LOOK} Full body, seen from directly behind: a Nigerian teenage student (about 15) in a white and violet space suit with orange details, a small backpack life-support unit, and a clear round bubble helmet. Standing relaxed, arms by the sides. Fully transparent background, no floor, no shadow.`,
  },
  'student-walk': {
    size: '1024x1536',
    transparent: true,
    ref: 'student-back-1.png',
    prompt:
      'The exact same student, same space suit and proportions, seen from directly behind, now walking away mid-stride (left foot forward, arms swinging a little). Fully transparent background, no floor, no shadow.',
  },
  'student-side': {
    size: '1024x1536',
    transparent: true,
    ref: 'student-back-1.png',
    prompt:
      'The exact same student, same space suit and proportions, now seen from the side walking to the LEFT, mid-stride, friendly face in profile. Keep the same large clear glass bubble helmet over the head, exactly as in the picture. Fully transparent background, no floor, no shadow.',
  },

  // Ships and space objects
  'ship-player': {
    size: '1024x1024',
    transparent: true,
    prompt: `${LOOK} ${CUTOUT} A small rounded white and violet fighter spaceship seen from directly above, nose pointing UP, two short wings, orange glowing engines at the bottom.`,
  },
  boss: {
    size: '1024x1024',
    transparent: true,
    prompt: `${LOOK} ${CUTOUT} A big menacing but cartoonish alien mothership seen from below and the front, dark blue-grey armour, glowing orange eyes-like lights, spiky edges, facing DOWN.`,
  },
  enemy: {
    size: '1024x1024',
    transparent: true,
    prompt: `${LOOK} ${CUTOUT} A small round alien drone spaceship seen from above, green and dark metal, one glowing red eye, facing DOWN.`,
  },
  'asteroid-1': { size: '1024x1024', transparent: true, prompt: `${LOOK} ${CUTOUT} A lumpy grey-brown rocky asteroid with craters.` },
  'asteroid-2': { size: '1024x1024', transparent: true, prompt: `${LOOK} ${CUTOUT} An elongated dark rocky asteroid with reddish streaks and craters.` },

  // Rocket parts (stacked by the app, seen from the side)
  'part-nose': {
    size: '1024x1024',
    transparent: true,
    prompt: `${LOOK} ${CUTOUT} A white rocket nose cone (payload fairing) seen from the side, pointed top, flat round bottom, a violet stripe.`,
  },
  'part-capsule': {
    size: '1024x1024',
    transparent: true,
    prompt: `${LOOK} ${CUTOUT} A white crew capsule for the top of a rocket, seen from the side: a cone shape with a small round window and a short escape tower on top.`,
  },
  'part-tank': {
    size: '1024x1024',
    transparent: true,
    prompt: `${LOOK} ${CUTOUT} A white cylindrical rocket fuel tank section seen from the side, flat top and bottom, with violet and orange bands, taller than it is wide.`,
  },
  'part-engine': {
    size: '1024x1024',
    transparent: true,
    prompt: `${LOOK} ${CUTOUT} A rocket engine seen from the side: a metal engine block on top and a large bell-shaped copper and steel nozzle below.`,
  },
  'part-fins': {
    size: '1024x1024',
    transparent: true,
    prompt: `${LOOK} ${CUTOUT} Only the tail section of a rocket, seen from the side: a short wide white metal cylinder ring (as wide as it is tall) with three swept-back violet fins sticking out at the bottom left, right and front. No nose, no body, no engine flame.`,
  },

  // A realistic launcher, in sections that stack (all the same diameter), seen exactly from the side.
  'rocket-fairing': {
    size: '1024x1536',
    transparent: true,
    prompt: `${REAL_ROCKET} ONLY the payload fairing (the pointed nose of the rocket): a tall white ogive nose cone with thin panel seams and a small dark band at its base. Its bottom edge is a straight flat horizontal cut, the full width of the rocket body.`,
  },
  'rocket-capsule': {
    size: '1024x1536',
    transparent: true,
    prompt: `${REAL_ROCKET} ONLY the crew section on top of a rocket: a white cone-shaped crew capsule with small dark windows, sitting on a short white cylindrical adapter, with a thin launch-abort tower on top. Its bottom edge is a straight flat horizontal cut, the full width of the rocket body.`,
  },
  'rocket-tank': {
    size: '1024x1536',
    transparent: true,
    prompt: `${REAL_ROCKET} ONLY one plain section of the rocket body: a tall white metal cylinder with faint horizontal panel seams, a thin black band at the very top and very bottom, and a small black roll-pattern stripe. Perfectly straight vertical sides, flat top and flat bottom, the silhouette is an exact rectangle about 3 times taller than wide.`,
  },
  'rocket-engine-spark': {
    size: '1024x1536',
    transparent: true,
    prompt: `${REAL_ROCKET} ONLY the bottom section of the rocket: a short white cylinder (its top edge flat and the full rocket width) with a dark heat shield at its base, ONE large dark metal bell-shaped engine nozzle below it, and four small grey swept fins at the bottom edge.`,
  },
  'rocket-engine-nova': {
    size: '1024x1536',
    transparent: true,
    prompt: `${REAL_ROCKET} ONLY the bottom section of the rocket: a short white cylinder (its top edge flat and the full rocket width) with a dark heat shield at its base, THREE dark metal bell-shaped engine nozzles side by side below it, and four small grey swept fins at the bottom edge.`,
  },
  'rocket-engine-titan': {
    size: '1024x1536',
    transparent: true,
    prompt: `${REAL_ROCKET} ONLY the bottom section of a heavy rocket: a short black and white cylinder (its top edge flat and the full rocket width) with a dark heat shield, a cluster of many dark metal engine nozzles packed together below it, and four grey grid fins near the top of the section.`,
  },
  'rocket-engine-ion': {
    size: '1024x1536',
    transparent: true,
    prompt: `${REAL_ROCKET} ONLY the bottom section of the rocket: a short white cylinder (its top edge flat and the full rocket width) ending in a gold-foil wrapped base with one round flat ion thruster with a fine metal grid, glowing faint blue, and four small grey fins.`,
  },
  'rocket-plume': {
    size: '1024x1536',
    transparent: true,
    prompt: `Photorealistic rocket engine exhaust flame on a fully transparent background: a long vertical plume pointing straight DOWN, a bright white-yellow core at the top narrowing at the nozzle, turning orange and fading out towards the bottom, with shock diamonds. Nothing else, no rocket, no smoke.`,
  },
  'rocket-smoke': {
    size: '1536x1024',
    transparent: true,
    prompt: `Photorealistic billowing white and light grey launch smoke clouds spreading sideways along the ground, wide and low, on a fully transparent background. Nothing else.`,
  },

  // Planets (round, for the map and the gravity puzzles)
  'planet-sun': { size: '1024x1024', transparent: true, prompt: `${LOOK} ${CUTOUT} The Sun as a glowing yellow-orange sphere with a soft glow.` },
  'planet-mercury': { size: '1024x1024', transparent: true, prompt: `${LOOK} ${CUTOUT} The planet Mercury: a small grey cratered sphere.` },
  'planet-venus': { size: '1024x1024', transparent: true, prompt: `${LOOK} ${CUTOUT} The planet Venus: a pale yellow cloudy sphere.` },
  'planet-earth': { size: '1024x1024', transparent: true, prompt: `${LOOK} ${CUTOUT} The planet Earth: blue oceans, green and brown land, white clouds.` },
  'planet-moon': { size: '1024x1024', transparent: true, prompt: `${LOOK} ${CUTOUT} Earth's Moon: a grey sphere with craters.` },
  'planet-mars': {
    size: '1024x1024',
    transparent: true,
    prompt: `${LOOK} ${CUTOUT} The planet Mars: a red-orange sphere with dark markings and a white polar cap.`,
  },
  'planet-jupiter': {
    size: '1024x1024',
    transparent: true,
    prompt: `${LOOK} ${CUTOUT} The planet Jupiter: a big sphere with cream and brown bands and the Great Red Spot.`,
  },
  'planet-saturn': {
    size: '1024x1024',
    transparent: true,
    prompt: `${LOOK} ${CUTOUT} The planet Saturn: a golden banded sphere with wide flat rings, tilted a little.`,
  },
  'planet-uranus': { size: '1024x1024', transparent: true, prompt: `${LOOK} ${CUTOUT} The planet Uranus: a smooth pale blue-green sphere.` },
  'planet-neptune': { size: '1024x1024', transparent: true, prompt: `${LOOK} ${CUTOUT} The planet Neptune: a deep blue sphere with faint white streaks.` },
};

const args = process.argv.slice(2);
const [outDir, only] = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'));
const n = Number(args[args.indexOf('--n') + 1]) || 1;
if (!outDir) throw new Error('Usage: npx tsx scripts/space-art.ts <output folder> [name or prefix-] [--n 1]');
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
        try {
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
        } catch (e) {
          console.error('FAILED', name, (e as Error).message);
        }
      }),
    );
  }
}
