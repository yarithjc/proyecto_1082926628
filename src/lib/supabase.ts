import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;
let _checked = false;

function getEnv(...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = process.env[k];
    if (v) return v;
  }
  return undefined;
}

export function getSupabaseUrl(): string | undefined {
  return getEnv(
    'SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_STOCKCONTROL_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_STOCKCONTROL_SUPABASE_URL'
  );
}

export function getSupabaseServiceKey(): string | undefined {
  return getEnv(
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_STOCKCONTROL_SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_STOCKCONTROL_SUPABASE_SECRET_KEY'
  );
}

export function getPostgresUrl(): string | undefined {
  return getEnv(
    'POSTGRES_URL_NON_POOLING',
    'POSTGRES_URL',
    'DATABASE_URL',
    'SUPABASE_STOCKCONTROL_POSTGRES_URL_NON_POOLING',
    'SUPABASE_STOCKCONTROL_POSTGRES_URL',
    'SUPABASE_STOCKCONTROL_POSTGRES_PRISMA_URL'
  );
}

export function getSupabaseClient(): SupabaseClient | null {
  if (_client) return _client;
  if (_checked) return null;
  _checked = true;

  const url = getSupabaseUrl();
  const key = getSupabaseServiceKey();
  if (!url || !key) return null;

  _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}

export function requireSupabaseClient(): SupabaseClient {
  const c = getSupabaseClient();
  if (!c) throw new Error('Supabase no configurado (faltan SUPABASE_URL/SERVICE_ROLE_KEY)');
  return c;
}
