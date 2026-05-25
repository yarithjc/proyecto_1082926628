import { getSupabaseClient } from './supabase';
import type { AuditEntry } from './types';

export async function recordAudit(entry: AuditEntry): Promise<void> {
  const sb = getSupabaseClient();
  if (!sb) return;
  try {
    await sb.from('_audit').insert({
      user_id: entry.user_id ?? null,
      user_email: entry.user_email ?? null,
      user_role: entry.user_role ?? null,
      action: entry.action,
      entity: entry.entity,
      entity_id: entry.entity_id ?? null,
      summary: entry.summary,
      metadata: entry.metadata ?? null,
    });
  } catch (err) {
    console.error('[audit] failed to record', err);
  }
}

export async function readAuditMonth(yyyymm: string): Promise<unknown[]> {
  const sb = getSupabaseClient();
  if (!sb) return [];
  const year = Number(yyyymm.slice(0, 4));
  const month = Number(yyyymm.slice(4, 6));
  if (!year || !month) return [];
  const start = new Date(Date.UTC(year, month - 1, 1)).toISOString();
  const end = new Date(Date.UTC(year, month, 1)).toISOString();
  const { data } = await sb
    .from('_audit')
    .select('*')
    .gte('created_at', start)
    .lt('created_at', end)
    .order('created_at', { ascending: false });
  return data ?? [];
}
