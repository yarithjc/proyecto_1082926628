'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  UserPlus,
  AlertCircle,
  Check,
  PowerOff,
  Power,
  Copy,
  X,
} from 'lucide-react';
import type { Role, SafeUser } from '@/lib/types';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/dateUtils';

export function UsersClient({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('cajero');
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [tempPassword, setTempPassword] = useState<{ email: string; password: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/users');
    if (res.ok) {
      const j = await res.json();
      setUsers(j.users ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role }),
      });
      const j = await res.json();
      if (!res.ok) {
        setError(j.error ?? 'No se pudo crear el usuario');
        return;
      }
      setTempPassword({ email: j.user.email, password: j.tempPassword });
      setName('');
      setEmail('');
      setRole('cajero');
      setShowNew(false);
      load();
    } finally {
      setCreating(false);
    }
  }

  async function toggle(u: SafeUser) {
    const next = !u.is_active;
    const res = await fetch(`/api/users/${u.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: next }),
    });
    if (res.ok) load();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <header className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <p className="eyebrow text-brand">Administración / Usuarios</p>
          <h1 className="font-display text-[34px] leading-none text-stone-900 mt-1">
            Usuarios del sistema
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Crea cajeros o administradores y gestiona su acceso.
          </p>
        </div>
        <Button onClick={() => setShowNew((v) => !v)}>
          {showNew ? <X size={16} /> : <UserPlus size={16} />}
          {showNew ? 'Cancelar' : 'Nuevo usuario'}
        </Button>
      </header>

      {tempPassword && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 ribbon">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-amber-700 shrink-0" size={18} />
            <div className="flex-1">
              <p className="font-semibold text-amber-900">Contraseña temporal generada</p>
              <p className="text-sm text-amber-900/80 mt-1">
                Compártela una sola vez con <strong>{tempPassword.email}</strong>. Tendrá que
                cambiarla al iniciar sesión.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <code className="font-numeric text-sm bg-white px-2 py-1 rounded border border-amber-200 text-amber-900">
                  {tempPassword.password}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(tempPassword.password)}
                  className="inline-flex items-center gap-1 text-xs text-amber-900 underline underline-offset-2"
                >
                  <Copy size={12} /> Copiar
                </button>
              </div>
              <button
                onClick={() => setTempPassword(null)}
                className="text-xs text-amber-900/70 underline mt-2"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {showNew && (
        <Card>
          <CardBody>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <Field label="Nombre">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  className="form-input"
                />
              </Field>
              <Field label="Correo">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input"
                />
              </Field>
              <Field label="Rol">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="form-input"
                >
                  <option value="cajero">Cajero</option>
                  <option value="admin">Administrador</option>
                </select>
              </Field>
              {error && (
                <div className="sm:col-span-3 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
                </div>
              )}
              <div className="sm:col-span-3">
                <Button type="submit" disabled={creating}>
                  <UserPlus size={16} />
                  {creating ? 'Creando…' : 'Crear usuario'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      <Card className="overflow-hidden">
        {loading ? (
          <div className="px-5 py-8 text-sm text-stone-500 text-center">Cargando…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.18em] text-stone-500 bg-stone-50 border-b border-stone-200">
                  <th className="px-4 py-2.5 font-semibold">Nombre</th>
                  <th className="px-4 py-2.5 font-semibold">Correo</th>
                  <th className="px-4 py-2.5 font-semibold">Rol</th>
                  <th className="px-4 py-2.5 font-semibold">Último acceso</th>
                  <th className="px-4 py-2.5 font-semibold">Estado</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const self = u.id === currentUserId;
                  return (
                    <tr key={u.id} className="border-b border-stone-100 hover:bg-stone-50 transition">
                      <td className="px-4 py-3 text-stone-900 font-medium">{u.name}</td>
                      <td className="px-4 py-3 text-stone-700">{u.email}</td>
                      <td className="px-4 py-3">
                        <Badge tone={u.role === 'admin' ? 'danger' : 'neutral'}>{u.role}</Badge>
                      </td>
                      <td className="px-4 py-3 text-stone-600 font-numeric whitespace-nowrap">
                        {u.last_login_at ? formatDateTime(u.last_login_at) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={u.is_active ? 'ok' : 'neutral'}>
                          {u.is_active ? 'activo' : 'suspendido'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => toggle(u)}
                          disabled={self}
                          title={self ? 'No puedes suspenderte a ti mismo' : ''}
                          className={`inline-flex items-center gap-1 text-xs font-medium ${
                            self
                              ? 'text-stone-300 cursor-not-allowed'
                              : u.is_active
                              ? 'text-red-600 hover:underline'
                              : 'text-green-700 hover:underline'
                          }`}
                        >
                          {u.is_active ? <PowerOff size={14} /> : <Power size={14} />}
                          {u.is_active ? 'Suspender' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="px-5 py-10 text-sm text-stone-500 text-center">
                Sin usuarios. <button onClick={() => setShowNew(true)} className="underline">Crea el primero</button>.
              </div>
            )}
          </div>
        )}
      </Card>

      <p className="text-sm text-green-700 inline-flex items-center gap-1">
        <Check size={14} /> Cuando creas un usuario, se le asigna una contraseña temporal y
        deberá cambiarla en su primer login.
      </p>

      <style>{`.form-input { width:100%; padding:.55rem .75rem; border-radius:.55rem; border:1px solid #d6d3d1; background:#fff; font-size:.875rem; outline:none }
        .form-input:focus { border-color:#DC2626; box-shadow:0 0 0 3px rgba(220,38,38,.15) }`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-stone-500 mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}
