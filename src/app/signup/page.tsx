'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useToast } from '@/components/ui/Toast';

export default function SignupPage() {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    if (!email.trim()) {
      setError('El correo es obligatorio');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? 'No se pudo crear la cuenta');
        return;
      }
      toast.success('¡Cuenta creada exitosamente!');
      router.push('/login');
    } catch {
      setError('No se pudo conectar al servidor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10 bg-brand-deep relative overflow-hidden">
      {/* Capas decorativas */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 18% 22%, rgba(254,226,226,0.18) 0, transparent 38%), radial-gradient(circle at 82% 78%, rgba(0,0,0,0.35) 0, transparent 42%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.18] mix-blend-overlay pointer-events-none bg-paper-grain"
      />

      {/* Sello decorativo */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-[10.5px] tracking-[0.32em] uppercase text-red-200/60 font-semibold">
        <span>Est. 2026</span>
        <span>Inv & ventas</span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-sm animate-scale-in"
      >
        {/* Cinta superior */}
        <div className="absolute -top-3 left-6 right-6 h-3 rounded-t-md bg-brand shadow-[0_3px_0_0_#7F1D1D]" />

        <div className="bg-white rounded-xl shadow-meat border-l-4 border-brand p-8">
          <div className="flex flex-col items-center text-center mb-7">
            <div className="p-2.5 rounded-2xl bg-brand-light/60 ring-1 ring-brand/15">
              <Logo size={52} />
            </div>
            <h1 className="mt-4 font-display text-[30px] font-semibold text-stone-900 leading-none">
              StockControl
            </h1>
            <p className="text-[13px] text-stone-500 mt-2">
              Crea tu <span className="text-brand font-medium">nueva cuenta</span>
            </p>
            <div className="butcher-divider w-24 mt-4" />
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-stone-500 mb-1.5">
                Nombre
              </span>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
                />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-stone-300 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 transition"
                  placeholder="Tu nombre completo"
                />
              </div>
            </label>

            <label className="block">
              <span className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-stone-500 mb-1.5">
                Correo
              </span>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
                />
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-stone-300 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 transition"
                  placeholder="tu@email.com"
                />
              </div>
            </label>

            <label className="block">
              <span className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-stone-500 mb-1.5">
                Contraseña
              </span>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
                />
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-stone-300 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 transition"
                  placeholder="••••••••"
                />
              </div>
            </label>

            <label className="block">
              <span className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-stone-500 mb-1.5">
                Confirmar contraseña
              </span>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
                />
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-stone-300 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 transition"
                  placeholder="••••••••"
                />
              </div>
            </label>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-brand hover:bg-brand-dark text-white font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shadow-[0_4px_0_0_#7F1D1D] hover:shadow-[0_2px_0_0_#7F1D1D] hover:translate-y-[2px]"
            >
              <UserPlus size={16} />
              {loading ? 'Creando…' : 'Crear cuenta'}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-stone-200 text-center">
            <p className="text-[13px] text-stone-600">
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-brand font-semibold hover:underline"
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>

          <p className="text-center text-[11px] text-stone-400 mt-6 uppercase tracking-[0.18em]">
            StockControl · Salsamentaría
          </p>
        </div>
      </form>
    </main>
  );
}
