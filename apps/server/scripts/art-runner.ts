/**
 * Shared runner for the Knowzone World art scripts: generates each picture with OpenAI (or edits an
 * earlier one, for consistent characters), four at a time, into an output folder.
 *
 *   <script> <output folder> [name or prefix-] [--n 1]
 */
import { createReadStream, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { toFile } from 'openai';

import { config } from '../src/config.js';
import { openaiClient } from '../src/services/ai.js';

/**
 * `ref`: earlier pictures (from the output folder, or a path) the new one is an edit of, e.g. the same
 * character in another pose, or a logo to put on their clothes.
 */
export type Art = { size: '1024x1024' | '1024x1536' | '1536x1024'; prompt: string; transparent?: boolean; ref?: string | string[] };

export async function runArt(art: Record<string, Art>, usage: string) {
  const args = process.argv.slice(2);
  const [outDir, only] = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'));
  const n = Number(args[args.indexOf('--n') + 1]) || 1;
  if (!outDir) throw new Error(`Usage: ${usage} <output folder> [name or prefix-] [--n 1]`);
  mkdirSync(outDir, { recursive: true });

  const save = (name: string, data: { b64_json?: string }[] | undefined) =>
    data?.forEach((img, k) => {
      const file = join(outDir, `${name}-${k + 1}.png`);
      writeFileSync(file, Buffer.from(img.b64_json!, 'base64'));
      console.log('saved', file);
    });

  const todo = Object.entries(art).filter(([name]) => !only || name === only || (only.endsWith('-') && name.startsWith(only)));
  // Base pictures first, then the edits that need them.
  for (const pass of [false, true]) {
    // Pictures whose references are all outside the folder (e.g. a logo) can go in the first pass.
    const needsFolder = (a: Art) => (Array.isArray(a.ref) ? a.ref : a.ref ? [a.ref] : []).some((r) => !existsSync(r));
    const batch = todo.filter(([, a]) => needsFolder(a) === pass);
    for (let i = 0; i < batch.length; i += 4) {
      await Promise.all(
        batch.slice(i, i + 4).map(async ([name, a]) => {
          const background = a.transparent ? 'transparent' : 'opaque';
          try {
            if (a.ref) {
              const refs = (Array.isArray(a.ref) ? a.ref : [a.ref]).map((r) => (existsSync(r) ? r : join(outDir, r)));
              for (const r of refs) if (!existsSync(r)) throw new Error(`${name} needs ${r} first`);
              const images = await Promise.all(refs.map((r) => toFile(createReadStream(r), r.split(/[\\/]/).pop()!, { type: 'image/png' })));
              const result = await openaiClient().images.edit({
                model: config.OPENAI_MODEL_IMAGE,
                image: images.length === 1 ? images[0]! : images,
                prompt: a.prompt,
                size: a.size,
                quality: 'medium',
                background,
                n,
              });
              save(name, result.data);
              return;
            }
            const result = await openaiClient().images.generate({
              model: config.OPENAI_MODEL_IMAGE,
              prompt: a.prompt,
              size: a.size,
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
}
