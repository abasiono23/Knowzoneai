/**
 * Makes Knowzone World illustrations with OpenAI (transparent PNGs, or full scenes), so they can be
 * remade in the same style later. Run from apps/server:
 *
 *   npx tsx scripts/world-art.ts <output folder> [name or prefix, e.g. play-hero or english-] [--n 2]
 *
 * Pick the best and copy it (as WebP) to apps/mobile/assets/images/world/.
 * Cost: about $0.01–0.02 per picture with gpt-image-1-mini at medium quality.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { config } from '../src/config.js';
import { openaiClient } from '../src/services/ai.js';

const STYLE = [
  'Polished modern cartoon illustration for a learning game app, soft 3D shading, rounded friendly shapes, clean outlines.',
  'Vibrant palette of violet, magenta, coral pink, teal and warm gold that reads well on a dark purple background.',
  'Characters are Nigerian secondary-school students (about 14–16), dark skin, joyful and confident, age-appropriate and modest.',
].join(' ');

type Art = {
  size: '1536x1024' | '1024x1024' | '1024x1536';
  prompt: string;
  /** A complete scene with its own sky instead of a cut-out on a transparent background. */
  opaque?: boolean;
  /** Letter tiles are part of the picture (game covers). */
  letters?: boolean;
};

const KORA =
  'Kora, the app mascot: a small round cartoon owl with soft violet-purple feathers, a lighter lavender belly, big round eyes with warm gold rims, a little orange beak and tiny feet; friendly, clever and kind.';
const ARENA =
  'An empty magical battle arena for a mobile game, seen from the side: two small floating rock islands with grass on top, one on the left and one on the right, with open space between them and a large glowing moon or light in the sky. No characters, no creatures. The lower third is darker and calm.';
const MONSTER = 'Full body, facing left, standing on nothing. Cute but menacing, friendly enough for young children.';

const ART: Record<string, Art> = {
  'play-hero-tall': {
    size: '1024x1536',
    prompt: [
      'A tall portrait composition that fills the frame from top to bottom, full body characters.',
      'In front, a girl in a white lab coat with clear safety goggles pushed up on her braids, holding up a glowing, bubbling round flask with a proud smile.',
      'Just behind her and a little higher, a boy sitting cross-legged on a floating stack of colourful books, typing on an open laptop, a game controller floating beside him.',
      'Above them, floating game rewards fill the sky: a big ringed planet, gold stars, a shiny trophy, gold coins, a little snowy mountain and a paint palette.',
    ].join(' '),
  },
  'play-hero': {
    size: '1536x1024',
    prompt: [
      'Two students side by side, full body.',
      'On the left, a girl in a white lab coat and clear safety goggles pushed up on her braids, holding up a glowing, bubbling round flask with a proud smile.',
      'On the right, a boy sitting cross-legged on a floating stack of books, typing on an open laptop, a game controller beside him, the laptop screen glowing.',
      'Around them float small game rewards: a ringed planet, gold stars, a shiny trophy, a gold coin, a little mountain and a paint palette.',
    ].join(' '),
  },
  'welcome-hero': {
    size: '1024x1024',
    prompt: [
      'A student wearing headphones riding a giant open laptop like a flying hoverboard through space, one hand raised in excitement, holding a game controller in the other.',
      'Around the student, seven small floating islands, each a learning world: a ringed planet, a snowy mountain, a leafy jungle island, a tropical island with an open book, a classical museum with columns, a friendly robot, and a giant paint palette.',
      'Sparkles and stars connect the islands like a game map path.',
    ].join(' '),
  },

  // English word games
  'english-kora': { size: '1024x1024', prompt: `${KORA} Full body, standing, one wing raised in a cheerful wave, facing the viewer.` },
  'english-wizard': {
    size: '1024x1024',
    prompt:
      'A Nigerian secondary-school student wizard (about 14), full body, facing right, in a violet robe with gold trim and a pointed violet wizard hat, holding a wooden staff topped with a glowing gold crystal, brave confident smile.',
  },
  'english-monster-slime': {
    size: '1024x1024',
    prompt: `A purple slime monster with two small curved horns and an angry frown, glossy jelly body with little sparkles inside. ${MONSTER}`,
  },
  'english-monster-crystal': {
    size: '1024x1024',
    prompt: `A crystal golem made of glowing teal and violet gem crystals, chunky arms, grumpy face. ${MONSTER}`,
  },
  'english-monster-ember': {
    size: '1024x1024',
    prompt: `A little lava dragon with orange and coral glowing scales, tiny wings, puffing a little smoke. ${MONSTER}`,
  },
  'english-monster-frost': { size: '1024x1024', prompt: `A frost yeti with fluffy icy-blue fur, ice-crystal horns and a cheeky frown. ${MONSTER}` },
  'english-monster-shadow': {
    size: '1024x1024',
    prompt: `A shadow knight made of swirling dark violet smoke with glowing gold eyes, a small crown and a cape. ${MONSTER}`,
  },
  'english-arena-slime': {
    size: '1024x1024',
    opaque: true,
    prompt: `${ARENA} Moonlit night: deep navy and violet sky full of stars, a big pale blue full moon.`,
  },
  'english-arena-crystal': {
    size: '1024x1024',
    opaque: true,
    prompt: `${ARENA} Inside a vast crystal cave: glowing teal and violet crystals on the walls, soft magical light.`,
  },
  'english-arena-ember': {
    size: '1024x1024',
    opaque: true,
    prompt: `${ARENA} Volcanic peaks at dusk: coral and orange sky, distant glowing lava rivers, floating embers.`,
  },
  'english-arena-frost': {
    size: '1024x1024',
    opaque: true,
    prompt: `${ARENA} A frozen kingdom: icy blue sky with northern lights, snowy mountains and ice castle towers far away.`,
  },
  'english-arena-shadow': {
    size: '1024x1024',
    opaque: true,
    prompt: `${ARENA} A shadow castle at midnight: dark violet sky, a crimson-violet moon, castle silhouettes far away; fun, not scary.`,
  },
  'english-cover-hidden-letters': {
    size: '1024x1024',
    letters: true,
    prompt:
      'Game icon: a short row of glossy violet letter tiles where one tile is an empty glowing dashed slot, a golden magnifying glass hovering over the gap, a small gold timer ring and sparkles.',
  },
  'english-cover-word-clash': {
    size: '1024x1024',
    letters: true,
    prompt: 'Game icon: two big glossy gold Scrabble-style letter tiles, a Q and a Z, clashing together with an electric violet lightning burst between them.',
  },
  'english-cover-word-hunter': {
    size: '1024x1024',
    letters: true,
    prompt:
      'Game icon: a small tilted grid of glossy letter cells with a glowing teal capsule highlighting one row, and a big golden magnifying glass over it, sparkles around.',
  },
  'english-cover-spellcaster': {
    size: '1024x1024',
    letters: true,
    prompt:
      'Game icon: a violet wizard hat and a wooden magic staff with a glowing gold crystal, glowing gold letters swirling out of the crystal like a spell, sparkles.',
  },
  'english-cover-sentence-master': {
    size: '1024x1024',
    letters: true,
    prompt:
      'Game icon: rounded blank word chips in violet, blue and teal snapping together into a neat line like puzzle pieces, one chip floating into place with a gold sparkle, a small green check mark.',
  },
};

const background = (art: Art) =>
  [
    art.opaque ? 'A complete scene that fills the whole square, no frame.' : 'Fully transparent background, no ground shadow box, no frame.',
    art.letters ? 'Only the letters described; no words, no logos.' : 'No text, letters, numbers or logos anywhere.',
  ].join(' ');

const args = process.argv.slice(2);
const [outDir, only] = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'));
const n = Number(args[args.indexOf('--n') + 1]) || 2;
if (!outDir) throw new Error('Usage: npx tsx scripts/world-art.ts <output folder> [name or prefix-] [--n 2]');
mkdirSync(outDir, { recursive: true });

// A few at a time, so a big batch doesn't hit the rate limit.
const todo = Object.entries(ART).filter(([name]) => !only || name === only || (only.endsWith('-') && name.startsWith(only)));
for (let i = 0; i < todo.length; i += 4) {
  await Promise.all(
    todo.slice(i, i + 4).map(async ([name, art]) => {
      const result = await openaiClient().images.generate({
        model: config.OPENAI_MODEL_IMAGE,
        prompt: `${STYLE} ${background(art)}\n${art.prompt}`,
        size: art.size,
        quality: 'medium',
        background: art.opaque ? 'opaque' : 'transparent',
        output_format: 'png',
        n,
      });
      result.data?.forEach((img, k) => {
        const file = join(outDir, `${name}-${k + 1}.png`);
        writeFileSync(file, Buffer.from(img.b64_json!, 'base64'));
        console.log('saved', file);
      });
    }),
  );
}
