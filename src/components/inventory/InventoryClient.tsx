'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, PackageX, AlertTriangle } from 'lucide-react';
import type { Product, Role } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProductRow } from './ProductRow';

export function InventoryClient({ role }: { role: Role }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/products')
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled) setProducts(j.products ?? []);
      })
      .catch(() => !cancelled && setError('No se pudo cargar el inventario'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, query]);

  const lowStock = useMemo(
    () => products.filter((p) => p.current_stock < 5),
    [products]
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <header className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <p className="eyebrow text-brand">Mostrador / Inventario</p>
          <h1 className="font-display text-[34px] leading-none text-stone-900 mt-1">
            Inventario
          </h1>
          <p className="text-sm text-stone-500 mt-1.5">
            {products.length} producto{products.length === 1 ? '' : 's'} activo
            {products.length === 1 ? '' : 's'}
          </p>
        </div>
        {role === 'admin' && (
          <Link href="/inventory/new">
            <Button size="lg">
              <Plus size={18} /> Agregar producto
            </Button>
          </Link>
        )}
      </header>

      {lowStock.length > 0 && (
        <div className="ribbon rounded-xl border border-amber-300/70 bg-amber-50/70 p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-700 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-900">
            <strong>{lowStock.length} producto{lowStock.length === 1 ? ' tiene' : 's tienen'} stock bajo.</strong>{' '}
            {lowStock.slice(0, 4).map((p) => `${p.name} (${p.current_stock})`).join('  ·  ')}
            {lowStock.length > 4 && `  ·  y ${lowStock.length - 4} más`}
          </p>
        </div>
      )}

      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre…"
          className="w-full pl-10 pr-3 py-3 rounded-xl border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-tile overflow-hidden">
        {loading && (
          <div className="px-5 py-8 text-sm text-stone-500">Cargando inventario…</div>
        )}
        {error && (
          <div className="px-5 py-6 text-sm text-red-700 bg-red-50">{error}</div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            icon={<PackageX size={36} strokeWidth={1.5} />}
            title={query ? 'Sin resultados' : 'Aún no hay productos'}
            description={
              query
                ? `No encontramos productos para "${query}"`
                : role === 'admin'
                ? 'Comienza agregando tu primer producto.'
                : 'El administrador aún no ha registrado productos.'
            }
            action={
              role === 'admin' && !query ? (
                <Link href="/inventory/new">
                  <Button>
                    <Plus size={16} /> Agregar producto
                  </Button>
                </Link>
              ) : undefined
            }
          />
        )}
        {!loading && !error && filtered.length > 0 && (
          <div>
            {filtered.map((p) => (
              <ProductRow key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
