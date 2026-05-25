'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { useToast } from '@/components/ui/Toast';
import type { Role } from '@/lib/types';

interface Props {
  user: { email: string; name: string; role: Role };
  forced: boolean;
}

export function ProfileClient({ user, forced }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (next !== confirmPass) {
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
        toast.error('No se pudo cambiar', json.error);
        setError(json.error ?? 'No se pudo cambiar la contraseña');
        return;
      }
      toast.success('Contraseña actualizada', 'Te llevamos al inicio…');
      setCurrent('');
      setNext('');
      setConfirmPass('');
      router.refresh();
      setTimeout(() => router.push('/dashboard'), 800);
    } catch {
      toast.error('No se pudo conectar');
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
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                />
              </label>
              {error && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
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
