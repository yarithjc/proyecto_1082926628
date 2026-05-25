'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import type { Role } from '@/lib/types';

interface Props {
  user: { email: string; name: string; role: Role };
  forced: boolean;
}

export function ProfileClient({ user, forced }: Props) {
  const router = useRouter();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (next !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (next.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? 'No se pudo cambiar la contraseña');
        return;
      }
      setSuccess('Contraseña actualizada');
      setCurrent('');
      setNext('');
      setConfirm('');
      router.refresh();
      setTimeout(() => router.push('/dashboard'), 600);
    } catch {
      setError('No se pudo conectar');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={36} />
            <div>
              <p className="font-semibold text-stone-900">{user.name}</p>
              <p className="text-xs text-stone-500">{user.email} · {user.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-sm text-stone-600 hover:text-stone-900">
            Salir
          </button>
        </div>

        {forced && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg px-3 py-2 text-sm">
            Antes de continuar, debes establecer una nueva contraseña.
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Cambiar contraseña</CardTitle>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block text-sm">
                <span className="block font-medium text-stone-700 mb-1">Contraseña actual</span>
                <input
                  type="password"
                  required
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                />
              </label>
              <label className="block text-sm">
                <span className="block font-medium text-stone-700 mb-1">Nueva contraseña</span>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                />
              </label>
              <label className="block text-sm">
                <span className="block font-medium text-stone-700 mb-1">Confirmar nueva contraseña</span>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                />
              </label>
              {error && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  {success}
                </div>
              )}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Guardando…' : 'Cambiar contraseña'}
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
