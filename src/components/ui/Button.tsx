import { forwardRef, ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const VARIANT: Record<Variant, string> = {
  primary: 'bg-brand hover:bg-brand-dark text-white',
  secondary: 'bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-200',
  ghost: 'bg-transparent hover:bg-stone-100 text-stone-700',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
};
const SIZE: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm rounded-md',
  md: 'h-11 px-4 text-sm rounded-lg',
  lg: 'h-12 px-5 text-base rounded-lg',
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', size = 'md', className = '', ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      {...rest}
      className={`${VARIANT[variant]} ${SIZE[size]} font-medium transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 ${className}`}
    />
  );
});
