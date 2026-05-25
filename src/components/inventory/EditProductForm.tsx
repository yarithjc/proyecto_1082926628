'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, DollarSign, Boxes, AlertCircle } from 'lucide-react';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { formatCOP } from '@/lib/dateUtils';

export function EditProductForm({ product }: { product: Product }) {
  const router = useRouter();
  const toast = useToast();
  const [price, setPrice] = useState(String(Number(product.price)));
  const [addStock, setAddStock] = useState('');
  const [busy, setBusy] = useState<null | 'price' | 'stock'>(null);
  const [error, setError] = useState<string | null>(null);

  async function updatePrice(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const v = Number(price);
    if (!Number.isFinite(v) || v <= 0) return setError('Precio debe ser mayor a 0');
    setBusy('price');
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'price', price: v }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error('No se pudo actualizar', json.error);
        return setError(json.error ?? 'No se pudo actualizar el precio');
      }
      toast.success('Precio actualizado', formatCOP(v));
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function addToStock(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const v = Number(addStock);
    if (!Number.isInteger(v) || v < 1) return setError('Ingresa una cantidad entera ≥ 1');
    setBusy('stock');
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'stock', quantity: v }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error('No se pudo actualizar', json.error);
        return setError(json.error ?? 'No se pudo actualizar el stock');
      }
      toast.success(`+${v} unidades agregadas`, product.name);
      setAddStock('');
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 space-y-5 animate-fade-in">
      <Link
        href={`/inventory/${product.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900"
      >
        <ArrowLeft size={16} /> Volver al producto
      </Link>

      <div>
        <p className="eyebrow text-brand">Inventario / Editar</p>
        <h1 className="font-display text-3xl text-stone-900 mt-1">{product.name}</h1>
        <p className="text-sm text-stone-500 mt-1">
          Stock actual: <span className="font-numeric font-semibold">{product.current_stock}</span> u ·
          precio actual: <span className="font-numeric font-semibold">{formatCOP(Number(product.price))}</span>
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign size={18} className="text-brand" /> Cambiar precio
          </CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={updatePrice} className="flex items-end gap-3">
            <label className="flex-1">
              <span className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-stone-500 mb-1.5">
                Nuevo precio (COP)
              </span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-numeric">$</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min={1}
                  step="any"
                  required
                  className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-stone-300 font-numeric focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>
            </label>
            <Button disabled={busy === 'price'}>
              {busy === 'price' ? 'Guardando…' : 'Aplicar'}
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Boxes size={18} className="text-brand" /> Entrada de mercancía
          </CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={addToStock} className="flex items-end gap-3">
            <label className="flex-1">
              <span className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-stone-500 mb-1.5">
                Unidades a agregar
              </span>
              <input
                type="number"
                value={addStock}
                onChange={(e) => setAddStock(e.target.value)}
                min={1}
                step={1}
                required
                placeholder="20"
                className="w-full px-3 py-2.5 rounded-lg border border-stone-300 font-numeric focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </label>
            <Button disabled={busy === 'stock'}>
              {busy === 'stock' ? 'Sumando…' : 'Sumar al stock'}
            </Button>
          </form>
          <p className="text-[12px] text-stone-500 mt-2">
            Se suma al stock actual — útil cuando entra nueva mercancía.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
