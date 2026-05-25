'use client';

import { useCallback, useEffect, useState } from 'react';
import { Receipt, Hash } from 'lucide-react';
import type { SaleWithProduct } from '@/lib/types';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SaleForm } from './SaleForm';
import { formatCOP, formatDateTime } from '@/lib/dateUtils';

export function SalesClient() {
  const [sales, setSales] = useState<SaleWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sales');
      if (res.ok) {
        const j = await res.json();
        setSales(j.sales ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const total = sales.reduce((sum, s) => sum + Number(s.total), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <header className="mb-6">
        <p className="eyebrow text-brand">Mostrador / Venta</p>
        <h1 className="font-display text-[34px] leading-none text-stone-900 mt-1">
          Registrar venta
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3 overflow-hidden">
          <div className="bg-gradient-to-r from-white to-brand-paper px-5 py-3 border-b border-stone-200 flex items-center justify-between">
            <p className="eyebrow text-brand">Nueva venta</p>
            <span className="text-[11px] text-stone-500 font-numeric">{new Date().toLocaleDateString('es-CO')}</span>
          </div>
          <CardBody>
            <SaleForm onSold={() => load()} />
          </CardBody>
        </Card>

        <Card className="lg:col-span-2 overflow-hidden">
          <div className="bg-gradient-to-r from-white to-brand-paper px-5 py-3 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt size={16} className="text-brand" />
              <p className="eyebrow text-brand">Ventas de hoy</p>
            </div>
            <span className="text-[11px] text-stone-500 font-numeric">
              <Hash size={11} className="inline -mt-0.5" /> {sales.length}
            </span>
          </div>
          <CardBody className="p-0">
            {loading ? (
              <div className="px-5 py-8 text-sm text-stone-500 text-center">
                Cargando…
              </div>
            ) : sales.length === 0 ? (
              <EmptyState
                icon={<Receipt size={32} strokeWidth={1.5} />}
                title="Sin ventas todavía"
                description="Cuando registres una venta, aparecerá acá."
              />
            ) : (
              <>
                <ul className="divide-y divide-stone-100 max-h-[460px] overflow-auto">
                  {sales.map((s) => (
                    <li key={s.id} className="px-5 py-3 hover:bg-stone-50 transition">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-sm font-medium text-stone-900 truncate">
                          <span className="font-numeric text-stone-500 mr-2">{s.quantity}×</span>
                          {s.product_name}
                        </p>
                        <p className="font-numeric font-semibold text-stone-900 tabular-nums">
                          {formatCOP(Number(s.total))}
                        </p>
                      </div>
                      <p className="text-[11px] text-stone-500 font-numeric mt-0.5">
                        {formatDateTime(s.sold_at)} · {formatCOP(Number(s.unit_price))} c/u
                      </p>
                    </li>
                  ))}
                </ul>
                <div className="bg-brand-paper border-t border-stone-200 px-5 py-3 flex items-center justify-between">
                  <span className="eyebrow text-brand-deep">Total del día</span>
                  <span className="font-numeric font-semibold text-xl text-brand-deep">
                    {formatCOP(total)}
                  </span>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
