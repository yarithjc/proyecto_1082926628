'use client';

import { useState } from 'react';
import type { LoginFormData, LoginState } from './Login.types';
import styles from './Login.module.css';

/**
 * Componente Login — Página de autenticación
 *
 * Características:
 * - Client component (estado local)
 * - Validación básica de email/password
 * - Estados: idle, loading, success, error
 * - Diseño moderno con gradiente y animaciones
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
    <div className={styles.container}>
      {/* Fondo con efecto glow */}
      <div className={styles.glowBackground}></div>

      {/* Contenedor del formulario */}
      <div className={styles.cardWrapper}>
        <div className={styles.card}>
          {/* Header */}
          <div className={styles.header}>
            <h1 className={styles.title}>
              Accede a tu cuenta
            </h1>
            <p className={styles.subtitle}>Sistema fullstack con TypeScript y Next.js</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Email Input */}
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
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
                className={styles.input}
              />
            </div>

            {/* Password Input */}
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
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
                className={styles.input}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className={styles.errorMessage}>
                <p>❌ {error}</p>
              </div>
            )}

            {/* Success Message */}
            {state === 'success' && (
              <div className={styles.successMessage}>
                <p>✅ ¡Bienvenido! Redirigiendo...</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={state === 'loading' || state === 'success'}
              className={styles.button}
            >
              {state === 'loading' ? (
                <>
                  <span className={styles.spinner}></span>
                  Iniciando sesión...
                </>
              ) : state === 'success' ? (
                'Sesión iniciada'
              ) : (
                'Iniciar Sesión'
              )}
            </button>

            {/* Links */}
            <div className={styles.links}>
              <a href="#" className={styles.link}>¿No tienes cuenta? Regístrate aquí</a>
              <a href="#" className={styles.link}>Listo para conectar a Supabase Auth</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
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
