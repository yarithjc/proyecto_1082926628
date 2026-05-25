import { HTMLAttributes } from 'react';

type Tone = 'ok' | 'warn' | 'danger' | 'neutral';

const TONE: Record<Tone, string> = {
  ok: 'bg-green-50 text-green-700 border-green-200',
  warn: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  neutral: 'bg-stone-100 text-stone-700 border-stone-200',
};

export function Badge({
  tone = 'neutral',
  className = '',
  ...rest
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      {...rest}
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${TONE[tone]} ${className}`}
    />
  );
}

export function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <Badge tone="danger">AGOTADO</Badge>;
  if (stock < 5) return <Badge tone="warn">{stock} u · stock bajo</Badge>;
  return <Badge tone="ok">{stock} u</Badge>;
}
