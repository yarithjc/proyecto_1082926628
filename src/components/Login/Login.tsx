'use client';

import { useState } from 'react';
import type { LoginFormData, LoginState } from './Login.types';

/**
 * Componente Login — Página de autenticación
 *
 * Mejora estética en el formulario de acceso.
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
    <div className="min-h-screen bg-[#06071a] flex items-center justify-center overflow-hidden px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.2),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.18),_transparent_25%)]"></div>
      <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_40px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="relative bg-[radial-gradient(circle_at_top_left,_rgba(129,140,248,0.22),_transparent_30%),linear-gradient(180deg,#0f172a,#111827)] p-10 lg:p-12">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(99,102,241,0.08),transparent_40%)]"></div>
            <div className="relative space-y-6">
              <span className="inline-flex rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1 text-sm font-medium text-indigo-200">
                Nuevo diseño</span>
              <div className="space-y-4">
                <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                  Bienvenido de nuevo
                </h1>
                <p className="max-w-xl text-gray-300 text-base leading-7">
                  Inicia sesión para administrar tu proyecto con un diseño más limpio, moderno y profesional.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-indigo-300 font-semibold">Experiencia premium</p>
                  <p className="mt-2 text-sm text-gray-400">Interfaz intuitiva y controles claros.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-indigo-300 font-semibold">Feedback instantáneo</p>
                  <p className="mt-2 text-sm text-gray-400">Mensajes y estados visuales para cada paso.</p>
                </div>
              </div>
            </div>
          </section>

          <div className="bg-[#0f172a]/95 p-8 sm:p-10">
            <div className="mb-10 flex flex-col gap-2 text-center">
              <p className="text-sm uppercase tracking-[0.25em] text-indigo-300/80">Ingreso seguro</p>
              <h2 className="text-3xl font-bold text-white">Inicia tu sesión</h2>
              <p className="mx-auto max-w-sm text-sm text-gray-400">Usa tus credenciales para acceder al panel.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block text-sm font-medium text-gray-300">
                Email
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={state === 'loading'}
                  placeholder="tucorreo@ejemplo.com"
                  className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </label>

              <label className="block text-sm font-medium text-gray-300">
                Contraseña
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={state === 'loading'}
                  placeholder="●●●●●●●●"
                  className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </label>

              {error && (
                <div className="rounded-3xl border border-red-700/40 bg-red-950/80 p-4 text-sm text-red-200">
                  ❌ {error}
                </div>
              )}

              {state === 'success' && (
                <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/80 p-4 text-sm text-emerald-200">
                  ✅ ¡Bienvenido! Redirigiendo...
                </div>
              )}

              <button
                type="submit"
                disabled={state === 'loading' || state === 'success'}
                className="flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/20 transition duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {state === 'loading' ? 'Iniciando sesión...' : state === 'success' ? 'Acceso concedido' : 'Iniciar sesión'}
              </button>
            </form>

            <div className="mt-8 flex items-center justify-between text-sm text-gray-400">
              <a href="#" className="hover:text-white transition">¿Olvidaste tu contraseña?</a>
              <a href="#" className="text-indigo-300 hover:text-indigo-100 transition">Crear cuenta</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
