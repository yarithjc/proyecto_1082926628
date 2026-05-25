'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface MigrationStatus {
  filename: string;
  applied: boolean;
  applied_at?: string;
}

interface Diagnose {
  mode: 'seed' | 'live';
  supabase: { configured: boolean };
  migrations: MigrationStatus[];
  counts: { users: number; products: number; sales: number };
}

export function DbSetupClient() {
  const router = useRouter();
  const [tab, setTab] = useState<'diag' | 'bootstrap'>('diag');
  const [data, setData] = useState<Diagnose | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/system/diagnose');
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? 'Error al diagnosticar');
        return;
      }
      setData(json);
    } catch {
      setError('No se pudo conectar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function runBootstrap() {
    if (!confirm('¿Aplicar migraciones pendientes y cargar el seed inicial?')) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/system/bootstrap', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? 'Error en bootstrap');
        return;
      }
      setResult(
        `Bootstrap OK · ${json.appliedMigrations.length} migrations · ${json.seededProducts} productos`
      );
      await load();
      router.refresh();
    } catch {
      setError('No se pudo conectar');
    } finally {
      setLoading(false);
    }
  }

  const pending = data?.migrations.filter((m) => !m.applied) ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Configuración de la base de datos</h1>
        <p className="text-sm text-stone-500">Diagnóstico y bootstrap del sistema.</p>
      </div>

      <div className="flex gap-2 border-b border-stone-200">
        <button
          onClick={() => setTab('diag')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
            tab === 'diag' ? 'border-brand text-brand' : 'border-transparent text-stone-500'
          }`}
        >
          Diagnóstico
        </button>
        <button
          onClick={() => setTab('bootstrap')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
            tab === 'bootstrap' ? 'border-brand text-brand' : 'border-transparent text-stone-500'
          }`}
        >
          Bootstrap{pending.length > 0 ? ` (${pending.length})` : ''}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-3 py-2 text-sm">
          {error}
        </div>
      )}
      {result && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-3 py-2 text-sm">
          {result}
        </div>
      )}

      {tab === 'diag' && (
        <Card>
          <CardHeader>
            <CardTitle>Estado del sistema</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            <Row
              label="Modo del sistema"
              value={
                <Badge tone={data?.mode === 'live' ? 'ok' : 'warn'}>
                  {data?.mode ?? '—'}
                </Badge>
              }
            />
            <Row
              label="Supabase"
              value={
                <Badge tone={data?.supabase.configured ? 'ok' : 'danger'}>
                  {data?.supabase.configured ? 'conectado' : 'no configurado'}
                </Badge>
              }
            />
            <Row
              label="Migrations aplicadas"
              value={
                <span className="text-stone-900 font-medium">
                  {data ? `${data.migrations.filter((m) => m.applied).length} / ${data.migrations.length}` : '—'}
                </span>
              }
            />
            <Row
              label="Usuarios"
              value={<span className="font-medium">{data?.counts.users ?? 0}</span>}
            />
            <Row
              label="Productos"
              value={<span className="font-medium">{data?.counts.products ?? 0}</span>}
            />
            <Row
              label="Ventas"
              value={<span className="font-medium">{data?.counts.sales ?? 0}</span>}
            />
            <div className="pt-3">
              <Button variant="secondary" size="sm" onClick={load} disabled={loading}>
                {loading ? 'Cargando…' : 'Recargar'}
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {tab === 'bootstrap' && (
        <Card>
          <CardHeader>
            <CardTitle>Migrations</CardTitle>
          </CardHeader>
          <CardBody>
            {!data && <p className="text-sm text-stone-500">Cargando…</p>}
            {data && data.migrations.length === 0 && (
              <p className="text-sm text-stone-500">No hay migrations registradas.</p>
            )}
            <ul className="divide-y divide-stone-200">
              {data?.migrations.map((m) => (
                <li key={m.filename} className="py-2 flex items-center justify-between">
                  <span className="text-sm font-mono text-stone-700">{m.filename}</span>
                  <Badge tone={m.applied ? 'ok' : 'warn'}>
                    {m.applied ? 'aplicada' : 'pendiente'}
                  </Badge>
                </li>
              ))}
            </ul>

            <div className="mt-4 pt-4 border-t border-stone-200">
              <p className="text-sm text-stone-600 mb-3">
                Ejecuta las migrations pendientes e inserta el seed (admin + 3 productos demo).
              </p>
              <Button onClick={runBootstrap} disabled={loading || pending.length === 0}>
                {loading
                  ? 'Ejecutando…'
                  : pending.length === 0
                  ? 'Todo al día'
                  : `Aplicar ${pending.length} migration(s) + seed`}
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-stone-600">{label}</span>
      {value}
    </div>
  );
}
