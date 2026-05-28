'use client';

import { useCallback, useEffect, useState } from 'react';
import { Receipt, Hash, Trash2, Edit2, X, Check } from 'lucide-react';
import type { SaleWithProduct } from '@/lib/types';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SaleForm } from './SaleForm';
import { formatCOP, formatDateTime } from '@/lib/dateUtils';

export function SalesClient() {
  const [sales, setSales] = useState<SaleWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingQuantity, setEditingQuantity] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleEditStart = (sale: SaleWithProduct) => {
    setEditingId(sale.id);
    setEditingQuantity(sale.quantity);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingQuantity(null);
  };

  const handleEditSave = async (saleId: string) => {
    if (editingQuantity === null || editingQuantity < 1) return;
    
    setSavingId(saleId);
    try {
      const res = await fetch(`/api/sales/${saleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: editingQuantity }),
      });
      if (res.ok) {
        setEditingId(null);
        setEditingQuantity(null);
        await load();
      }
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (saleId: string) => {
    setDeletingId(saleId);
    try {
      const res = await fetch(`/api/sales/${saleId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDeleteConfirmId(null);
        await load();
      }
    } finally {
      setDeletingId(null);
    }
  };

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
            <SaleForm onSold={load} />
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
                      {editingId === s.id ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-stone-600">Cantidad:</label>
                            <input
                              type="number"
                              min="1"
                              value={editingQuantity || ''}
                              onChange={(e) => setEditingQuantity(parseInt(e.target.value) || 0)}
                              className="w-16 px-2 py-1 text-sm border border-stone-200 rounded"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditSave(s.id)}
                              disabled={savingId === s.id}
                              className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                            >
                              <Check size={14} /> {savingId === s.id ? 'Guardando...' : 'Guardar'}
                            </button>
                            <button
                              onClick={handleEditCancel}
                              disabled={savingId === s.id}
                              className="flex items-center gap-1 px-2 py-1 text-xs bg-stone-100 text-stone-600 rounded hover:bg-stone-200 disabled:opacity-50"
                            >
                              <X size={14} /> Cancelar
                            </button>
                          </div>
                        </div>
                      ) : deleteConfirmId === s.id ? (
                        <div className="space-y-2">
                          <p className="text-xs text-stone-600">¿Eliminar esta venta?</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDelete(s.id)}
                              disabled={deletingId === s.id}
                              className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                            >
                              <Trash2 size={14} /> {deletingId === s.id ? 'Eliminando...' : 'Eliminar'}
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              disabled={deletingId === s.id}
                              className="flex items-center gap-1 px-2 py-1 text-xs bg-stone-100 text-stone-600 rounded hover:bg-stone-200 disabled:opacity-50"
                            >
                              <X size={14} /> Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-baseline justify-between gap-3 mb-2">
                            <p className="text-sm font-medium text-stone-900 truncate flex-1">
                              <span className="font-numeric text-stone-500 mr-2">{s.quantity}×</span>
                              {s.product_name}
                            </p>
                            <p className="font-numeric font-semibold text-stone-900 tabular-nums">
                              {formatCOP(Number(s.total))}
                            </p>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[11px] text-stone-500 font-numeric">
                              {formatDateTime(s.sold_at)} · {formatCOP(Number(s.unit_price))} c/u
                            </p>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditStart(s)}
                                className="p-1 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded transition"
                                title="Editar cantidad"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(s.id)}
                                className="p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                                title="Eliminar venta"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
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
