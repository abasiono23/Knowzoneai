// Draws every mouth shape on Kora's face, for a person to look at (mouths-<pose>.html), and the still picture
// for lesson cards (card.html). Run from apps/mobile after compose.py: npx tsx ../server/scripts/kora-kit/mouth-sheet.mts [pose]
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { MOUTH_COLORS as C, VISEMES, mouthPaths } from '../../../mobile/src/lib/kora/mouth';

const HERE = dirname(fileURLToPath(import.meta.url));
const kit = JSON.parse(readFileSync(join(HERE, 'kit.json'), 'utf8'));
const NAMES = ['rest', 'M B P', 'A I', 'E', 'O', 'U W', 'F V', 'L TH', 'S T D N', 'small'];
const uri = (f: string) => 'data:image/webp;base64,' + readFileSync(join(HERE, '../../../mobile/assets/kora', f)).toString('base64');

export function mouthSvg(i: number, [x, y, rot]: number[]) {
  const p = mouthPaths(VISEMES[i]);
  return `<g transform="translate(${x} ${y}) rotate(${rot})">
    ${p.inside ? `<path d="${p.inside}" fill="${C.inside}"/>` : ''}
    ${p.tongue ? `<path d="${p.tongue}" fill="${C.tongue}"/>` : ''}
    ${p.upperTeeth ? `<path d="${p.upperTeeth}" fill="${C.teeth}"/>` : ''}
    ${p.lowerTeeth ? `<path d="${p.lowerTeeth}" fill="${C.teeth}"/>` : ''}
    <path d="${p.upperLip}" fill="${C.upperLip}"/>
    <path d="${p.lowerLip}" fill="${C.lowerLip}" stroke="${C.line}" stroke-width="2.6" stroke-linejoin="round"/>
    ${p.shine.map((s) => `<ellipse cx="${s.x}" cy="${s.y}" rx="${s.rx}" ry="${s.ry}" fill="${C.shine}"/>`).join('')}
    <path d="${p.line}" fill="none" stroke="${C.line}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`;
}

const pose = process.argv[2] ?? 'rest';
const cells = VISEMES.map((_, i) => {
  const cx = (i % 5) * 300;
  const cyy = Math.floor(i / 5) * 330;
  return `<svg x="${cx}" y="${cyy}" width="300" height="330" viewBox="250 230 360 396"><image href="${uri(pose + '.webp')}" width="864" height="1152"/>${mouthSvg(i, kit.poses[pose].mouth)}<text x="262" y="262" font-size="26" fill="#fff" font-family="Arial" font-weight="700">${i} ${NAMES[i]}</text></svg>`;
});
writeFileSync(join(HERE, `mouths-${pose}.html`), `<body style="margin:0;background:#2a1a5e"><svg xmlns="http://www.w3.org/2000/svg" width="1500" height="660">${cells.join('')}</svg></body>`);
console.log('wrote', `mouths-${pose}.html`);

// The card picture: Kora, head and shoulders, with her resting smile drawn in (cards show a still picture, not the live mouth).
writeFileSync(join(HERE, 'card.html'), `<body style="margin:0;background:transparent"><svg xmlns="http://www.w3.org/2000/svg" width="600" height="640" viewBox="132 30 600 640"><image href="${uri('rest.webp')}" width="864" height="1152"/>${mouthSvg(0, kit.poses.rest.mouth)}</svg></body>`);
