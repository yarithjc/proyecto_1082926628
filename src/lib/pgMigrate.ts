import postgres from 'postgres';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { getPostgresUrl } from './supabase';

export interface MigrationStatus {
  filename: string;
  applied: boolean;
  applied_at?: string;
}

function getSql() {
  const conn = getPostgresUrl();
  if (!conn) throw new Error('POSTGRES_URL no configurado');
  return postgres(conn, { ssl: 'require', max: 1, idle_timeout: 5, connect_timeout: 15 });
}

function migrationsDir() {
  return join(process.cwd(), 'supabase', 'migrations');
}

function listFiles(): string[] {
  try {
    return readdirSync(migrationsDir())
      .filter((f) => f.endsWith('.sql'))
      .sort();
  } catch {
    return [];
  }
}

async function ensureMigrationsTable(sql: postgres.Sql) {
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id         SERIAL       PRIMARY KEY,
      filename   VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ  DEFAULT NOW()
    );
  `);
}

export async function getMigrationStatus(): Promise<MigrationStatus[]> {
  const files = listFiles();
  const sql = getSql();
  try {
    await ensureMigrationsTable(sql);
    const rows = await sql<{ filename: string; applied_at: string }[]>`
      SELECT filename, applied_at FROM _migrations ORDER BY id
    `;
    const map = new Map(rows.map((r) => [r.filename, r.applied_at]));
    return files.map((f) => ({
      filename: f,
      applied: map.has(f),
      applied_at: map.get(f),
    }));
  } finally {
    await sql.end();
  }
}

export async function runPendingMigrations(): Promise<string[]> {
  const files = listFiles();
  if (files.length === 0) return [];
  const sql = getSql();
  const applied: string[] = [];
  try {
    await ensureMigrationsTable(sql);
    const rows = await sql<{ filename: string }[]>`SELECT filename FROM _migrations`;
    const done = new Set(rows.map((r) => r.filename));
    for (const f of files) {
      if (done.has(f)) continue;
      const ddl = readFileSync(join(migrationsDir(), f), 'utf8');
      await sql.begin(async (tx) => {
        await tx.unsafe(ddl);
        await tx`INSERT INTO _migrations (filename) VALUES (${f})`;
      });
      applied.push(f);
    }
    await sql.unsafe(`NOTIFY pgrst, 'reload schema'`);
    return applied;
  } finally {
    await sql.end();
  }
}

export async function countMigrationsApplied(): Promise<number> {
  const sql = getSql();
  try {
    await ensureMigrationsTable(sql);
    const r = await sql<{ count: number }[]>`SELECT COUNT(*)::int AS count FROM _migrations`;
    return r[0]?.count ?? 0;
  } finally {
    await sql.end();
  }
}
