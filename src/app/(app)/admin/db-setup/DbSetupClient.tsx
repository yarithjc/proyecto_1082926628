'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Rocket, Database, Activity } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/Modal';

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
  const toast = useToast();
  const { confirm } = useConfirm();
  const [tab, setTab] = useState<'diag' | 'bootstrap'>('diag');
  const [data, setData] = useState<Diagnose | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/system/diagnose');
      const json = await res.json();
      if (!res.ok) {
        toast.error('Error al diagnosticar', json.error);
        return;
      }
      setData(json);
    } catch {
      toast.error('No se pudo conectar al servidor');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  async function runBootstrap() {
    const ok = await confirm({
      title: '¿Aplicar bootstrap?',
      description:
        'Se ejecutarán las migraciones pendientes y se cargará el seed inicial (admin + 3 productos demo).',
      confirmLabel: 'Aplicar bootstrap',
      icon: <Rocket size={22} />,
    });
    if (!ok) return;
    setLoading(true);
    try {
      const res = await fetch('/api/system/bootstrap', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) {
        toast.error('Error en bootstrap', json.error);
        return;
      }
      toast.success(
        '✓ Bootstrap completado',
        `${json.appliedMigrations.length} migrations · ${json.seededProducts} productos demo`
      );
      await load();
      router.refresh();
    } catch {
      toast.error('No se pudo conectar al servidor');
    } finally {
      setLoading(false);
    }
  }

  const pending = data?.migrations.filter((m) => !m.applied) ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <header>
        <p className="eyebrow text-brand">Administración / Base de datos</p>
        <h1 className="font-display text-[34px] leading-none text-stone-900 mt-1">
          Configuración de la BD
        </h1>
        <p className="text-sm text-stone-500 mt-1.5">
          Diagnóstico de Supabase, migraciones y bootstrap del sistema.
        </p>
      </header>

      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit">
        <TabButton active={tab === 'diag'} onClick={() => setTab('diag')} icon={<Activity size={14} />}>
          Diagnóstico
        </TabButton>
        <TabButton
          active={tab === 'bootstrap'}
          onClick={() => setTab('bootstrap')}
          icon={<Database size={14} />}
        >
          Bootstrap
          {pending.length > 0 && (
            <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-brand text-white text-[10px] font-semibold">
              {pending.length}
            </span>
          )}
        </TabButton>
      </div>

      {tab === 'diag' && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Estado del sistema</CardTitle>
            <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Recargar
            </Button>
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
              label="Migraciones aplicadas"
              value={
                <span className="text-stone-900 font-numeric font-medium">
                  {data
                    ? `${data.migrations.filter((m) => m.applied).length} / ${data.migrations.length}`
                    : '—'}
                </span>
              }
            />
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-stone-100">
              <CountTile label="Usuarios" value={data?.counts.users ?? 0} />
              <CountTile label="Productos" value={data?.counts.products ?? 0} />
              <CountTile label="Ventas" value={data?.counts.sales ?? 0} />
            </div>
          </CardBody>
        </Card>
      )}

      {tab === 'bootstrap' && (
        <Card>
          <CardHeader>
            <CardTitle>Migraciones</CardTitle>
          </CardHeader>
          <CardBody>
            {!data && <p className="text-sm text-stone-500">Cargando…</p>}
            {data && data.migrations.length === 0 && (
              <p className="text-sm text-stone-500">No hay migraciones registradas.</p>
            )}
            <ul className="divide-y divide-stone-200">
              {data?.migrations.map((m) => (
                <li key={m.filename} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-mono text-sm text-stone-700">{m.filename}</p>
                    {m.applied && m.applied_at && (
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        aplicada · {new Date(m.applied_at).toLocaleString('es-CO')}
                      </p>
                    )}
                  </div>
                  <Badge tone={m.applied ? 'ok' : 'warn'}>
                    {m.applied ? 'aplicada' : 'pendiente'}
                  </Badge>
                </li>
              ))}
            </ul>

            <div className="mt-5 pt-5 border-t border-stone-200">
              <p className="text-sm text-stone-600 mb-3">
                Ejecuta las migraciones pendientes e inserta el seed (admin + 3 productos demo).
              </p>
              <Button onClick={runBootstrap} disabled={loading || pending.length === 0}>
                <Rocket size={16} />
                {loading
                  ? 'Ejecutando…'
                  : pending.length === 0
                  ? 'Todo al día'
                  : `Aplicar ${pending.length} migración(es) + seed`}
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 text-sm rounded-lg font-medium transition inline-flex items-center gap-1.5 ${
        active ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
      }`}
    >
      {icon} {children}
    </button>
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

function CountTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-stone-50 border border-stone-200 p-3 text-center">
      <p className="eyebrow text-stone-500">{label}</p>
      <p className="font-display text-2xl text-stone-900 mt-1">{value}</p>
    </div>
  );
}
