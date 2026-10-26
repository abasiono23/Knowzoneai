/**
 * Local Postgres without Docker: downloads nothing at runtime (the binaries come from the
 * embedded-postgres npm package) and keeps data in apps/server/.pgdata.
 *
 *   npm run db:start   # starts Postgres on port 5433 (databases knowzone_local + knowzone_testing) and leaves it running until Ctrl+C
 *
 * If you have Docker, `docker compose up -d` from the repo root works too (port 5432).
 */
import EmbeddedPostgres from 'embedded-postgres';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const dir = resolve(import.meta.dirname, '..', '.pgdata');
const pg = new EmbeddedPostgres({
  databaseDir: dir,
  user: 'knowzone',
  password: 'knowzone',
  port: Number(process.env.DEV_DB_PORT ?? 5433),
  persistent: true,
  // Windows otherwise defaults to WIN1252, which can't store Arabic and other scripts.
  initdbFlags: ['--encoding=UTF8', '--locale=C'],
});

const fresh = !existsSync(dir);
if (fresh) await pg.initialise();
await pg.start();
// Always UTF-8, even in a data folder created before the flag above (template0 allows that).
const client = pg.getPgClient();
await client.connect();
for (const name of ['knowzone_local', 'knowzone_testing']) {
  const { rowCount } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [name]);
  if (rowCount) continue;
  await client.query(`CREATE DATABASE ${name} ENCODING 'UTF8' LC_COLLATE 'C' LC_CTYPE 'C' TEMPLATE template0`);
  console.log(`Created database ${name}`);
}
await client.end();
console.log(`Postgres ready on port ${process.env.DEV_DB_PORT ?? 5433} (data in ${dir}). Ctrl+C to stop.`);

const stop = async () => {
  await pg.stop();
  process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
// Keep the process alive while Postgres runs.
setInterval(() => {}, 1 << 30);
