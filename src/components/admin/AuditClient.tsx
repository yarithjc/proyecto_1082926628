'use client';

import { useEffect, useState } from 'react';
import { Calendar, Activity } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateTime } from '@/lib/dateUtils';

interface Entry {
  id: string;
  user_email: string | null;
  user_role: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  summary: string;
  created_at: string;
  metadata: unknown;
}

function thisMonth() {
  return new Date().toISOString().slice(0, 7).replace('-', '');
}

const ACTION_TONE: Record<string, 'ok' | 'warn' | 'danger' | 'neutral'> = {
  login: 'ok',
  logout: 'neutral',
  create_product: 'ok',
  update_price: 'warn',
  update_stock: 'warn',
  deactivate_product: 'danger',
  register_sale: 'ok',
  create_user: 'ok',
  toggle_user: 'warn',
  change_password: 'warn',
  bootstrap: 'danger',
};

export function AuditClient() {
  const [month, setMonth] = useState(thisMonth());
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/audit?month=${month}`)
      .then((r) => r.json())
      .then((j) => setEntries(j.entries ?? []))
      .finally(() => setLoading(false));
  }, [month]);

  const monthInputValue = `${month.slice(0, 4)}-${month.slice(4)}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <header className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <p className="eyebrow text-brand">Administración / Bitácora</p>
          <h1 className="font-display text-[34px] leading-none text-stone-900 mt-1">
            Auditoría de operaciones
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Registro append-only de acciones del sistema.
          </p>
        </div>
        <label className="text-sm flex items-center gap-2">
          <Calendar size={14} className="text-stone-500" />
          <input
            type="month"
            value={monthInputValue}
            onChange={(e) => setMonth(e.target.value.replace('-', ''))}
            className="px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </label>
      </header>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="px-5 py-10 text-sm text-stone-500 text-center">Cargando…</div>
        ) : entries.length === 0 ? (
          <EmptyState
            icon={<Activity size={32} strokeWidth={1.5} />}
            title="Sin actividad este mes"
            description="Las operaciones aparecerán aquí en orden cronológico."
          />
        ) : (
          <ul className="divide-y divide-stone-100">
            {entries.map((e) => (
              <li key={e.id} className="px-5 py-3 hover:bg-stone-50 transition">
                <div className="flex items-start gap-3">
                  <div className="font-numeric text-[11px] text-stone-500 w-32 shrink-0 mt-0.5 whitespace-nowrap">
                    {formatDateTime(e.created_at)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge tone={ACTION_TONE[e.action] ?? 'neutral'}>{e.action}</Badge>
                      <span className="text-xs text-stone-500">·</span>
                      <span className="text-xs text-stone-500">{e.entity}</span>
                      {e.user_email && (
                        <>
                          <span className="text-xs text-stone-300">·</span>
                          <span className="text-xs text-stone-600">{e.user_email}</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-stone-800 mt-0.5">{e.summary}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
