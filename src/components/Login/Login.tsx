'use client';

import { useState } from 'react';
import type { LoginFormData, LoginState } from './Login.types';

/**
 * Componente Login — Página de autenticación
 *
 * Características:
 * - Client component (estado local)
 * - Validación básica de email/password
 * - Estados: idle, loading, success, error
 * - Diseño consistente con paleta del proyecto (indigo/violeta)
 * - Listo para conectar a Supabase Auth
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

    // Validación básica
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
      // TODO: Implementar autenticación con Supabase
      // await signInWithEmail(formData.email, formData.password);
      
      // Por ahora, simulamos una respuesta exitosa
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setState('success');
      setFormData({ email: '', password: '' });
      
      // Aquí iría la redirección al dashboard
      console.log('Login exitoso:', formData.email);
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      {/* Fondo con efecto glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl opacity-50"></div>
      </div>

      {/* Contenedor del formulario */}
      <div className="relative w-full max-w-md">
        <div className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Login
              </span>
            </h1>
            <p className="text-gray-400 text-sm">Accede a tu cuenta</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={state === 'loading'}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                disabled={state === 'loading'}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-900/30 border border-red-700/50 rounded-lg">
                <p className="text-sm text-red-300">❌ {error}</p>
              </div>
            )}

            {/* Success Message */}
            {state === 'success' && (
              <div className="p-4 bg-green-900/30 border border-green-700/50 rounded-lg">
                <p className="text-sm text-green-300">✅ ¡Bienvenido! Redirigiendo...</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={state === 'loading' || state === 'success'}
              className="w-full py-3 px-4 mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              {state === 'loading' ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Iniciando sesión...
                </>
              ) : state === 'success' ? (
                <>
                  <span>✅</span>
                  Acceso concedido
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-center text-gray-400 text-sm">
              ¿No tienes cuenta?{' '}
              <a href="#" className="text-indigo-400 hover:text-indigo-300 font-medium transition">
                Regístrate aquí
              </a>
            </p>
          </div>
        </div>

        {/* Información de desarrollo */}
        <div className="mt-6 p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
          <p className="text-xs text-gray-500 font-mono text-center">
            🚀 Listo para conectar a Supabase Auth
          </p>
        </div>
      </div>
    </div>
  );
}
