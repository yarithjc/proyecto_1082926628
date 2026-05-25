'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, ShoppingBag, AlertCircle, X } from 'lucide-react';
import type { Product, SaleWithProduct } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { StockBadge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { formatCOP } from '@/lib/dateUtils';

interface Props {
  onSold: (sale: SaleWithProduct, total: number, productName: string) => void;
}

export function SaleForm({ onSold }: Props) {
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [qty, setQty] = useState('1');
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const j = await res.json();
        setResults(j.products ?? []);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!searchRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const qtyNum = Number(qty);
  const total = selected ? Number(selected.price) * (Number.isFinite(qtyNum) ? qtyNum : 0) : 0;
  const stockExceeded =
    selected !== null && Number.isFinite(qtyNum) && qtyNum > selected.current_stock;
  const canSubmit =
    !!selected &&
    Number.isInteger(qtyNum) &&
    qtyNum >= 1 &&
    !stockExceeded &&
    selected.current_stock > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !canSubmit) return;
    setError(null);
    setLoadingSubmit(true);
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selected.id, quantity: qtyNum }),
      });
      const j = await res.json();
      if (!res.ok) {
        if (res.status === 409 && j.details?.available !== undefined) {
          const msg = `Stock insuficiente — hay ${j.details.available} u disponibles.`;
          setError(msg);
          toast.error('Stock insuficiente', `Disponibles: ${j.details.available}`);
        } else {
          setError(j.error ?? 'No se pudo registrar la venta');
          toast.error('No se pudo registrar la venta', j.error);
        }
        return;
      }
      toast.success(
        `Venta registrada · ${formatCOP(total)}`,
        `${qtyNum} × ${selected.name}`
      );
      onSold({
        ...j.sale,
        product_name: selected.name,
        seller_name: null,
      }, total, selected.name);
      setSelected(null);
      setQuery('');
      setQty('1');
      setResults([]);
    } finally {
      setLoadingSubmit(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div ref={searchRef} className="relative">
        <span className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-stone-500 mb-1.5">
          Buscar producto
        </span>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <input
            value={selected ? selected.name : query}
            onChange={(e) => {
              setSelected(null);
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Empieza a escribir…"
            className="w-full pl-10 pr-9 py-3 rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            disabled={!!selected}
          />
          {selected && (
            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setQuery('');
              }}
              aria-label="Cambiar producto"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-stone-100 text-stone-500"
            >
              <X size={16} />
            </button>
          )}
        </div>
        {open && query.trim() && !selected && results.length > 0 && (
          <ul className="absolute z-30 mt-1.5 w-full bg-white border border-stone-200 rounded-xl shadow-lg max-h-72 overflow-auto">
            {results.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(p);
                    setOpen(false);
                  }}
                  className="w-full text-left flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-brand-paper transition"
                >
                  <div>
                    <p className="text-sm font-medium text-stone-900">{p.name}</p>
                    <p className="text-xs text-stone-500 font-numeric">{formatCOP(Number(p.price))}</p>
                  </div>
                  <StockBadge stock={p.current_stock} />
                </button>
              </li>
            ))}
          </ul>
        )}
        {open && query.trim() && !selected && results.length === 0 && (
          <div className="absolute z-30 mt-1.5 w-full bg-white border border-stone-200 rounded-xl px-3 py-3 text-sm text-stone-500">
            Sin resultados para &ldquo;{query}&rdquo;.
          </div>
        )}
      </div>

      {selected && (
        <div className="rounded-xl bg-gradient-to-br from-brand-paper to-white border border-brand/10 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-display text-lg text-stone-900">{selected.name}</p>
            <StockBadge stock={selected.current_stock} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-500">Precio unitario</span>
            <span className="font-numeric font-semibold">
              {formatCOP(Number(selected.price))}
            </span>
          </div>
        </div>
      )}

      <div>
        <span className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-stone-500 mb-1.5">
          Cantidad
        </span>
        <input
          type="number"
          inputMode="numeric"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          min={1}
          step={1}
          required
          disabled={!selected}
          className={`w-full px-3 py-3 rounded-xl border bg-white font-numeric text-2xl focus:outline-none focus:ring-2 focus:ring-brand/20 ${
            stockExceeded ? 'border-amber-400 text-amber-700' : 'border-stone-300 text-stone-900'
          }`}
        />
        {stockExceeded && selected && (
          <p className="text-xs text-amber-700 mt-1 flex items-center gap-1">
            <AlertCircle size={12} /> Supera el stock disponible ({selected.current_stock}).
          </p>
        )}
      </div>

      <div className="price-tag rounded-xl p-4 flex items-center justify-between">
        <span className="eyebrow text-stone-500">Total</span>
        <span
          className={`font-numeric font-semibold text-3xl ${
            stockExceeded ? 'text-amber-700' : 'text-brand-deep'
          }`}
        >
          {formatCOP(total)}
        </span>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={!canSubmit || loadingSubmit}
        className="w-full shadow-[0_4px_0_0_#7F1D1D] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#7F1D1D]"
      >
        <ShoppingBag size={18} />
        {loadingSubmit ? 'Registrando…' : 'Registrar venta'}
      </Button>
    </form>
  );
}
