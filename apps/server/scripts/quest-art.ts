/**
 * Art for World Quests (stylised 3D, like the rest of Knowzone World): the quest board, chests, place
 * icons and the weekly journey map. Run from apps/server:
 *
 *   npx tsx scripts/quest-art.ts <output folder> [name or prefix-] [--n 1]
 *
 * Copy the chosen ones (as WebP) to apps/mobile/assets/images/world/quests/.
 */
import { runArt, type Art } from './art-runner.js';

const LOOK =
  'Stylised 3D game render like a Pixar film or a premium mobile game: warm lighting, real materials (polished wood, parchment, brass, gold, glowing magic light), slightly cartoon proportions, rich colours. No text, letters, numbers, labels or logos anywhere.';
const ICON = `${LOOK} A single game icon object, fully transparent background, no floor, no shadow box, centred, seen slightly from the front and above.`;

const ART: Record<string, Art> = {
  'board-bg': {
    size: '1024x1536',
    prompt: `${LOOK} Portrait background for a quest screen: a large empty wooden notice board with a carved frame filling most of the picture, warm lanterns hanging on both sides, a deep navy and violet night sky with stars around it. The board surface is plain, clear warm wood, nothing pinned on it.`,
  },
  'chest-closed': { size: '1024x1024', transparent: true, prompt: `${ICON} A closed ornate wooden treasure chest with gold bands, gold corners and a gold lock.` },
  'chest-open': {
    size: '1024x1024',
    transparent: true,
    prompt: `${ICON} The same style of ornate wooden treasure chest with gold bands, lid wide open, overflowing with shiny gold coins and golden light glowing out, a few sparkles.`,
  },
  'icon-english': { size: '1024x1024', transparent: true, prompt: `${ICON} A big open magical book with glowing golden letters floating up from its pages.` },
  'icon-chemistry': { size: '1024x1024', transparent: true, prompt: `${ICON} A round-bottomed glass chemistry flask full of bubbling bright green liquid with a cork.` },
  'icon-space': { size: '1024x1024', transparent: true, prompt: `${ICON} A small white and violet cartoon rocket with orange flames at the bottom, pointing up.` },
  'icon-history': { size: '1024x1024', transparent: true, prompt: `${ICON} A round brass time machine dial with gears and a glowing golden-violet swirl in the middle.` },
  'icon-any': { size: '1024x1024', transparent: true, prompt: `${ICON} A shining golden star with a soft glow.` },
  'journey-map': {
    size: '1024x1536',
    prompt: `${LOOK} A portrait illustrated fantasy map seen from above at an angle, on a deep navy and violet magical sea with stars reflected, four small glowing places on islands, spread out with lots of sea between them: TOP LEFT a tropical island with a giant open book standing on it; TOP RIGHT a small floating space station with a white rocket; MIDDLE LEFT an island with a glass chemistry laboratory dome and a green flask; MIDDLE RIGHT an island with a grand white museum with columns; BOTTOM CENTRE a small island with a big closed golden treasure chest. No paths, no roads drawn between the islands.`,
  },
};

await runArt(ART, 'npx tsx scripts/quest-art.ts');
