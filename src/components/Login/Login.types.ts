/**
 * Tipos para el componente Login
 */

export type LoginFormData = {
  email: string;
  password: string;
};

export type LoginState = 'idle' | 'loading' | 'success' | 'error';

export type LoginProps = {
  onSubmit?: (data: LoginFormData) => Promise<void>;
};
