/**
 * Builds or updates the smart-search index in data/search/ (see src/services/search-index.ts).
 *
 *   npx tsx scripts/search-index.ts            # embed what's new or changed, drop what's gone
 *   npx tsx scripts/search-index.ts --dry-run  # only say what would be embedded
 *   npx tsx scripts/search-index.ts --max-usd 1
 *   npx tsx scripts/search-index.ts --only questions   # just one kind, or one file: --only notes.biology
 *
 * Run it after adding or editing summaries (data/summaries), papers (data/exams) or books (data/books),
 * then commit data/search with them. It needs VULTR_INFERENCE_API_KEY in .env. Unchanged items cost
 * nothing, and a run that stops part-way carries on where it left off next time.
 */
import 'dotenv/config';

const flag = (name: string) => process.argv.includes(name);
const value = (name: string) => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

// The services read their config on import; this script never touches the database.
process.env.DATABASE_URL ||= 'postgresql://unused';
process.env.SUPABASE_URL ||= 'https://unused.supabase.co';

const { buildSearchIndex } = await import('../src/services/search-index.js');
const { embeddingsConfigured, EMBED_MODEL, EMBED_DIMS } = await import('../src/services/embeddings.js');

const dryRun = flag('--dry-run');
if (!dryRun && !embeddingsConfigured()) {
  console.error('Set VULTR_INFERENCE_API_KEY in apps/server/.env first (or use --dry-run).');
  process.exit(1);
}

const maxUsd = Number(value('--max-usd') ?? 5);
console.log(
  `Smart-search index: ${EMBED_MODEL}, ${EMBED_DIMS} numbers per item${dryRun ? ' (dry run)' : `, budget $${maxUsd}`}`,
);
const started = Date.now();
const only = value('--only');
const report = await buildSearchIndex({
  dryRun,
  ...(only && { only: (shard: string) => shard === only || shard.startsWith(`${only}.`) }),
  maxUsd,
  batch: Number(value('--batch') ?? 32),
  // About three requests a second at most.
  pauseMs: Number(value('--pause') ?? 300),
  onProgress: (line) => console.log(`  ${line}`),
});
console.log(
  [
    `Done in ${Math.round((Date.now() - started) / 1000)}s.`,
    `Index: ${report.items} items (${report.byKind.notes} notes, ${report.byKind.questions} questions, ${report.byKind.books} books).`,
    `This run: ${report.embedded} embedded, ${report.kept} unchanged, ${report.removed} removed${report.waiting ? `, ${report.waiting} still waiting (run again)` : ''}.`,
    `Cost: ${report.tokens.toLocaleString('en')} tokens = $${report.costUsd.toFixed(4)}.`,
  ].join('\n'),
);
