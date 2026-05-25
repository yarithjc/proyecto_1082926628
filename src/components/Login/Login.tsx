'use client';

import { useState } from 'react';
import type { LoginFormData, LoginState } from './Login.types';

/**
 * Componente Login — Página de autenticación
 *
 * Interfaz más limpia y profesional.
 */

export default function Login() {
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

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setState('success');
      setFormData({ email: '', password: '' });
      console.log('Login exitoso:', formData.email);
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.24),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.18),_transparent_30%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/95" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-12">
        <div className="w-full overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/95 shadow-[0_25px_120px_rgba(15,23,42,0.5)] backdrop-blur-xl">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <aside className="relative overflow-hidden bg-slate-950 p-10 sm:p-12">
              <div className="absolute -right-20 top-10 h-52 w-52 rounded-full bg-indigo-500/15 blur-3xl" />
              <div className="absolute left-8 top-20 h-24 w-24 rounded-full bg-fuchsia-500/15 blur-3xl" />
              <div className="relative space-y-8">
                <div className="inline-flex rounded-full bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-200">
                  Stock Control</div>
                <div className="space-y-4">
                  <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                    Bienvenido a tu espacio
                  </h1>
                  <p className="max-w-md text-sm text-slate-400 sm:text-base">
                    Un login elegante, rápido y profesional para acceder a tu dashboard con un estilo moderno.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                    <p className="text-sm font-semibold text-slate-100">Diseño sofisticado</p>
                    <p className="mt-2 text-sm text-slate-400">Minimalismo cálido y espacioso, perfecto para un panel moderno.</p>
                  </div>
                  <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                    <p className="text-sm font-semibold text-slate-100">Acceso fluido</p>
                    <p className="mt-2 text-sm text-slate-400">Botones suaves, tipografía elegante y un flujo sencillo.</p>
                  </div>
                </div>
              </div>
            </aside>

            <main className="p-8 sm:p-10">
              <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Iniciar sesión</p>
                  <h2 className="mt-3 text-3xl font-semibold text-white">Bienvenido de nuevo</h2>
                </div>
                <div className="rounded-full bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-200">
                  Profesional
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-slate-300">
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
                    className="w-full rounded-[1.5rem] border border-slate-800/90 bg-slate-950/95 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-slate-300">
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
                    className="w-full rounded-[1.5rem] border border-slate-800/90 bg-slate-950/95 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
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
                  className="flex w-full items-center justify-center gap-2 rounded-[1.5rem] bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {state === 'loading'
                    ? 'Entrando...'
                    : state === 'success'
                    ? 'Acceso concedido'
                    : 'Iniciar sesión'}
                </button>
              </form>

              <div className="mt-8 flex flex-col gap-3 text-sm text-slate-400 sm:flex-row sm:justify-between">
                <a href="#" className="hover:text-white transition">Olvidé mi contraseña</a>
                <a href="#" className="text-indigo-300 hover:text-indigo-100 transition">Crear cuenta</a>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
