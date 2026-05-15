import { createClient, SupabaseClient } from '@supabase/supabase-js';
import postgres from 'postgres';

/**
 * Cliente Supabase build-safe
 * Retorna null si las variables de entorno no están configuradas
 * NUNCA lanza error durante el build
 */
let _client: SupabaseClient | null = null;
let _checked = false;

export function getSupabaseClient(): SupabaseClient | null {
  if (_client) return _client;
  if (_checked) return null;

  // Intentar detectar el prefijo de las variables de entorno
  // Si vienen de Vercel + Supabase integration, pueden tener prefijo (ej: VERCEL_POSTGRES_URL_NONPOOLING)
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VERCEL_POSTGRES_DATABASE_URL;

  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  _checked = true;

  if (!url || !key) {
    console.warn(
      '[supabase] No configurado — retornando null (build-safe). ' +
        'Variables esperadas: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY'
    );
    return null;
  }

  _client = createClient(url, key, {
    auth: { persistSession: false },
  });

  console.log('[supabase] Cliente inicializado');
  return _client;
}

export function requireSupabaseClient(): SupabaseClient {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error(
      'Supabase no configurado. ' +
        'Verifica: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY en variables de entorno'
    );
  }
  return client;
}

/**
 * Ejecutar SQL DDL contra PostgreSQL directamente
 * Necesita POSTGRES_URL (conexión directa, no vía PostgREST)
 */
export async function executeSql(query: string): Promise<void> {
  const connString =
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.VERCEL_POSTGRES_URL_NONPOOLING;

  if (!connString) {
    throw new Error(
      'POSTGRES_URL no configurada. ' +
        'Necesita conexión directa a PostgreSQL para DDL (CREATE TABLE, ALTER, etc.)'
    );
  }

  const sql = postgres(connString, {
    ssl: 'require',
    connect_timeout: 10,
    idle_timeout: 5,
    max: 1,
  });

  try {
    await sql.unsafe(query);
    console.log('[supabase:sql] Query ejecutada');
  } finally {
    await sql.end();
  }
}
