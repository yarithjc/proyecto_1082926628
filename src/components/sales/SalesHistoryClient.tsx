'use client';

import { useCallback, useEffect, useState } from 'react';
import { Calendar, Filter, Receipt } from 'lucide-react';
import type { Product, SaleWithProduct } from '@/lib/types';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCOP, formatDateTime } from '@/lib/dateUtils';

export function SalesHistoryClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<SaleWithProduct[]>([]);
  const [productId, setProductId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/products?all=1')
      .then((r) => r.json())
      .then((j) => setProducts(j.products ?? []));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (from) params.set('from', new Date(from).toISOString());
    if (to) {
      const toDate = new Date(to);
      toDate.setDate(toDate.getDate() + 1);
      params.set('to', toDate.toISOString());
    }
    if (productId) params.set('productId', productId);
    const res = await fetch(`/api/sales/history?${params.toString()}`);
    if (res.ok) {
      const j = await res.json();
      setSales(j.sales ?? []);
    }
    setLoading(false);
  }, [from, to, productId]);

  useEffect(() => {
    load();
  }, [load]);

  const total = sales.reduce((sum, s) => sum + Number(s.total), 0);
  const units = sales.reduce((sum, s) => sum + s.quantity, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <header>
        <p className="eyebrow text-brand">Administración / Historial</p>
        <h1 className="font-display text-[34px] leading-none text-stone-900 mt-1">
          Historial de ventas
        </h1>
      </header>

      <Card>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <Field label="Desde">
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="form-input pl-9"
                />
              </div>
            </Field>
            <Field label="Hasta">
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="form-input pl-9"
                />
              </div>
            </Field>
            <Field label="Producto">
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="form-input"
              >
                <option value="">Todos</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Button onClick={load} disabled={loading}>
              <Filter size={16} /> {loading ? 'Cargando…' : 'Filtrar'}
            </Button>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Ventas" value={sales.length.toString()} />
        <Stat label="Unidades" value={units.toString()} />
        <Stat label="Ingresos" value={formatCOP(total)} highlight />
      </div>

      <Card className="overflow-hidden">
        {sales.length === 0 && !loading ? (
          <EmptyState
            icon={<Receipt size={32} strokeWidth={1.5} />}
            title="Sin resultados"
            description="Ajusta los filtros para ver ventas."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.18em] text-stone-500 bg-stone-50 border-b border-stone-200">
                  <th className="px-4 py-2.5 font-semibold">Fecha</th>
                  <th className="px-4 py-2.5 font-semibold">Producto</th>
                  <th className="px-4 py-2.5 font-semibold">Cajero</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Cant.</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Precio</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.id} className="border-b border-stone-100 hover:bg-stone-50 transition">
                    <td className="px-4 py-2.5 text-stone-700 font-numeric whitespace-nowrap">
                      {formatDateTime(s.sold_at)}
                    </td>
                    <td className="px-4 py-2.5 text-stone-900">{s.product_name}</td>
                    <td className="px-4 py-2.5 text-stone-600">{s.seller_name ?? '—'}</td>
                    <td className="px-4 py-2.5 text-stone-900 font-numeric text-right">
                      {s.quantity}
                    </td>
                    <td className="px-4 py-2.5 text-stone-700 font-numeric text-right">
                      {formatCOP(Number(s.unit_price))}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-stone-900 font-numeric text-right">
                      {formatCOP(Number(s.total))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <style>{`.form-input { width:100%; padding:.6rem .8rem; border-radius:.55rem; border:1px solid #d6d3d1; background:#fff; color:#1c1917; outline:none; font-size:.875rem }
        .form-input:focus { border-color:#DC2626; box-shadow:0 0 0 3px rgba(220,38,38,.15) }`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-stone-500 mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 shadow-tile ${
        highlight ? 'bg-brand text-white border-brand-deep' : 'bg-white border-stone-200'
      }`}
    >
      <p className={`eyebrow ${highlight ? 'text-red-100' : 'text-stone-500'}`}>{label}</p>
      <p
        className={`font-display text-2xl mt-1 ${
          highlight ? 'text-white' : 'text-stone-900'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
