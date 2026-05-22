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
            {/* Logo: Cuchillo con checkbox */}
            <svg 
              className={styles.knifeLogo}
              viewBox="0 0 60 60" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Cuchillo */}
              <path 
                d="M30 5L28 15L28 45C28 48.3137 30.6863 51 34 51C37.3137 51 40 48.3137 40 45V15L38 5H30Z" 
                fill="#dc2626" 
                stroke="#991b1b" 
                strokeWidth="1"
              />
              {/* Checkbox */}
              <rect x="10" y="35" width="14" height="14" rx="2" fill="none" stroke="#16a34a" strokeWidth="1.5"/>
              <path d="M13 43L16 46L23 39" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>

            <h1 className={styles.title}>
              Accede a tu cuenta
            </h1>
            <p className={styles.subtitle}>Sistema de gestión de stock para salsamentaría</p>
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
          </form>
        </div>
      </div>
    </div>
  );
}
