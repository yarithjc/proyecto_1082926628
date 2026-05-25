'use client';

import Link from 'next/link';
import { ChevronRight, Package } from 'lucide-react';
import type { Product } from '@/lib/types';
import { formatCOP } from '@/lib/dateUtils';
import { StockBadge } from '@/components/ui/Badge';

export function ProductRow({ product }: { product: Product }) {
  return (
    <Link
      href={`/inventory/${product.id}`}
      className="group flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 hover:bg-stone-50 transition border-b border-stone-100 last:border-b-0"
    >
      <div className="h-11 w-11 rounded-xl bg-brand-paper border border-brand/10 text-brand flex items-center justify-center shrink-0">
        <Package size={20} strokeWidth={2.2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-stone-900 truncate group-hover:text-brand-deep transition">
          {product.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <StockBadge stock={product.current_stock} />
        </div>
      </div>
      <div className="text-right">
        <p className="font-numeric font-semibold text-stone-900 tabular-nums">
          {formatCOP(Number(product.price))}
        </p>
        <p className="text-[11px] text-stone-400 uppercase tracking-wider mt-0.5">
          unidad
        </p>
      </div>
      <ChevronRight
        size={18}
        className="text-stone-300 group-hover:text-stone-500 transition"
      />
    </Link>
  );
}
