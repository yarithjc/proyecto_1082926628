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
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.18),_transparent_30%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.7),rgba(15,23,42,0.95))]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-12">
        <div className="w-full overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 shadow-[0_40px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <aside className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-10 sm:p-12">
              <div className="absolute -right-16 top-4 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
              <div className="absolute left-10 bottom-10 h-32 w-32 rounded-full bg-fuchsia-500/10 blur-3xl" />
              <div className="relative space-y-8 text-white">
                <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-200">
                  Control de stock</p>
                <div className="space-y-4">
                  <h1 className="text-4xl font-black tracking-tight leading-tight sm:text-5xl">
                    Acceso seguro y profesional
                  </h1>
                  <p className="max-w-xl text-sm text-slate-300 sm:text-base">
                    Un login moderno con foco en claridad, velocidad y seguridad. Ideal para iniciar sesión en tu panel administrativo con estilo.
                  </p>
                </div>

                <div className="grid gap-3">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-indigo-200">Experiencia refinada</p>
                    <p className="mt-2 text-sm text-slate-300">Controles espaciados, tipografía legible y contraste equilibrado.</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-indigo-200">Estado claro</p>
                    <p className="mt-2 text-sm text-slate-300">Mensajes de error y éxito visibles para guiar al usuario.</p>
                  </div>
                </div>
              </div>
            </aside>

            <main className="p-8 sm:p-10">
              <div className="mb-8 text-center sm:mb-10">
                <p className="text-sm uppercase tracking-[0.3em] text-indigo-300/80">Entrada rápida</p>
                <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">Inicia sesión</h2>
                <p className="mx-auto mt-3 max-w-md text-sm text-slate-400 sm:text-base">
                  Ingresa con tu correo y contraseña para continuar al tablero principal.
                </p>
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
                    className="w-full rounded-3xl border border-slate-800/80 bg-slate-950/95 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
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
                    className="w-full rounded-3xl border border-slate-800/80 bg-slate-950/95 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                {error && (
                  <div className="rounded-3xl border border-red-700/40 bg-red-950/90 px-4 py-3 text-sm text-red-200">
                    ❌ {error}
                  </div>
                )}

                {state === 'success' && (
                  <div className="rounded-3xl border border-emerald-500/40 bg-emerald-950/90 px-4 py-3 text-sm text-emerald-200">
                    ✅ ¡Bienvenido de nuevo! Redirigiendo...
                  </div>
                )}

                <button
                  type="submit"
                  disabled={state === 'loading' || state === 'success'}
                  className="flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/20 transition duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {state === 'loading'
                    ? 'Iniciando sesión...'
                    : state === 'success'
                    ? 'Acceso concedido'
                    : 'Iniciar sesión'}
                </button>
              </form>

              <div className="mt-8 grid gap-4 text-sm text-slate-400 sm:grid-cols-2">
                <a href="#" className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-center transition hover:border-indigo-500/40 hover:text-white">
                  ¿Olvidaste tu contraseña?
                </a>
                <a href="#" className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-center text-indigo-200 transition hover:border-indigo-500/40 hover:text-white">
                  Crear cuenta
                </a>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
