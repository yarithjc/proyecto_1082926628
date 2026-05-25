'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowLeft,
  Package,
  Pencil,
  PowerOff,
  Receipt,
} from 'lucide-react';
import type { Product, Role, SaleWithProduct } from '@/lib/types';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge, StockBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCOP, formatDateTime } from '@/lib/dateUtils';

interface Props {
  product: Product;
  role: Role;
  sales: SaleWithProduct[];
}

export function ProductDetail({ product, role, sales }: Props) {
  const router = useRouter();
  const [deactivating, setDeactivating] = useState(false);

  async function handleDeactivate() {
    if (!confirm(`¿Desactivar "${product.name}"? No aparecerá más en el inventario activo.`)) {
      return;
    }
    setDeactivating(true);
    const res = await fetch(`/api/products/${product.id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/inventory');
      router.refresh();
    } else {
      const j = await res.json().catch(() => ({}));
      alert(j.error ?? 'No se pudo desactivar');
      setDeactivating(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <Link
        href="/inventory"
        className="inline-flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900"
      >
        <ArrowLeft size={16} /> Volver al inventario
      </Link>

      <header className="flex items-start gap-4">
        <div className="h-14 w-14 rounded-2xl bg-brand-paper border border-brand/10 text-brand flex items-center justify-center shrink-0">
          <Package size={26} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="eyebrow text-brand">Producto</p>
          <h1 className="font-display text-3xl text-stone-900 mt-1 leading-tight">
            {product.name}
          </h1>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <StockBadge stock={product.current_stock} />
            {!product.is_active && <Badge tone="danger">Inactivo</Badge>}
          </div>
        </div>
        {role === 'admin' && product.is_active && (
          <div className="flex flex-col gap-2 shrink-0">
            <Link href={`/inventory/${product.id}/edit`}>
              <Button variant="secondary" size="sm">
                <Pencil size={14} /> Editar
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeactivate}
              disabled={deactivating}
              className="text-red-600 hover:bg-red-50"
            >
              <PowerOff size={14} /> {deactivating ? 'Desactivando…' : 'Desactivar'}
            </Button>
          </div>
        )}
      </header>

      <div className="grid grid-cols-2 gap-3">
        <div className="price-tag rounded-xl p-4">
          <p className="eyebrow text-stone-500">Precio unitario</p>
          <p className="font-numeric font-semibold text-2xl text-brand-deep mt-1">
            {formatCOP(Number(product.price))}
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <p className="eyebrow text-stone-500">Stock actual</p>
          <p className="font-display font-semibold text-2xl mt-1">
            {product.current_stock}
            <span className="text-stone-400 text-sm font-sans ml-1">u</span>
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt size={18} className="text-brand" /> Historial de ventas
          </CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          {sales.length === 0 ? (
            <div className="px-5 py-8 text-sm text-stone-500 text-center">
              Aún no se ha vendido este producto.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.18em] text-stone-500 bg-stone-50 border-b border-stone-200">
                  <th className="px-4 py-2 font-semibold">Fecha</th>
                  <th className="px-4 py-2 font-semibold text-right">Cantidad</th>
                  <th className="px-4 py-2 font-semibold text-right">Precio</th>
                  <th className="px-4 py-2 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.id} className="border-b border-stone-100 last:border-b-0">
                    <td className="px-4 py-2.5 text-sm text-stone-700 font-numeric">
                      {formatDateTime(s.sold_at)}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-stone-900 font-numeric text-right">
                      {s.quantity}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-stone-700 font-numeric text-right">
                      {formatCOP(Number(s.unit_price))}
                    </td>
                    <td className="px-4 py-2.5 text-sm font-semibold text-stone-900 font-numeric text-right">
                      {formatCOP(Number(s.total))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
