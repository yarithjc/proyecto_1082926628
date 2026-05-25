'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { LoginFormData, LoginState } from './Login.types';

/**
 * Componente Login — Página de autenticación
 *
 * Interfaz más limpia y profesional.
 */

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const [state, setState] = useState<LoginState>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Email inválido');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setState('loading');
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setState('error');
        setError(data?.error || 'Credenciales inválidas');
        return;
      }

      setState('success');
      setFormData({ email: '', password: '' });
      router.push('/dashboard');
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.24),_transparent_25%),radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.18),_transparent_25%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/95" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-2xl items-center justify-center px-4 py-12">
        <div className="w-full overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/90 shadow-[0_40px_120px_rgba(15,23,42,0.55)] backdrop-blur-xl">
          <div className="p-8 sm:p-10">
            <div className="mb-10 text-center">
              <span className="inline-flex rounded-full bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-200">
                stockcontrol
              </span>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Bienvenido de nuevo
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-sm text-slate-400 sm:text-base">
                Un login limpio, suave y profesional para acceder a tu panel.
              </p>
              <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500 sm:text-base">
                Usa <span className="font-semibold text-white">admin@stockcontrol.com</span> y <span className="font-semibold text-white">Admin1234!</span> para ingresar como administrador.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-3">
                <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={state === 'loading'}
                  placeholder="tucorreo@ejemplo.com"
                  className="w-full rounded-[1.75rem] border border-white/10 bg-slate-950/90 px-5 py-4 text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={state === 'loading'}
                  placeholder="●●●●●●●●"
                  className="w-full rounded-[1.75rem] border border-white/10 bg-slate-950/90 px-5 py-4 text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {error && (
                <div className="rounded-[1.5rem] border border-red-700/40 bg-red-950/90 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              {state === 'success' && (
                <div className="rounded-[1.5rem] border border-emerald-500/40 bg-emerald-950/90 px-4 py-3 text-sm text-emerald-200">
                  ¡Acceso concedido! Redirigiendo...
                </div>
              )}

              <button
                type="submit"
                disabled={state === 'loading' || state === 'success'}
                className="flex w-full items-center justify-center gap-2 rounded-[1.75rem] bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-5 py-4 text-base font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {state === 'loading'
                  ? 'Entrando...'
                  : state === 'success'
                  ? 'Acceso concedido'
                  : 'Iniciar sesión'}
              </button>
            </form>

            <div className="mt-8 flex flex-col gap-3 text-sm text-slate-400 sm:flex-row sm:justify-between">
              <a href="#" className="text-center text-slate-300 transition hover:text-white">
                Olvidé mi contraseña
              </a>
              <a href="#" className="text-center text-indigo-300 transition hover:text-indigo-100">
                Crear cuenta
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
