'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';

export function ProductForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const priceNum = Number(price);
    const stockNum = Number(stock);
    if (!name.trim()) return setError('El nombre es obligatorio');
    if (!Number.isFinite(priceNum) || priceNum <= 0) return setError('Precio debe ser mayor a 0');
    if (!Number.isInteger(stockNum) || stockNum < 0) return setError('Stock debe ser entero ≥ 0');
    setLoading(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), price: priceNum, current_stock: stockNum }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? 'No se pudo crear el producto');
        return;
      }
      router.push('/inventory');
      router.refresh();
    } catch {
      setError('No se pudo conectar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 space-y-5 animate-fade-in">
      <Link
        href="/inventory"
        className="inline-flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900"
      >
        <ArrowLeft size={16} /> Volver al inventario
      </Link>

      <div>
        <p className="eyebrow text-brand">Inventario / Nuevo producto</p>
        <h1 className="font-display text-3xl text-stone-900 mt-1">Agregar producto</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos básicos</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Nombre del producto">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Salchichón"
                maxLength={150}
                required
                className="form-input"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Precio unitario (COP)">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-numeric">$</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min={1}
                    step="any"
                    required
                    className="form-input pl-7 font-numeric"
                    placeholder="8500"
                  />
                </div>
              </Field>

              <Field label="Cantidad inicial">
                <input
                  type="number"
                  inputMode="numeric"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  min={0}
                  step={1}
                  required
                  className="form-input font-numeric"
                  placeholder="50"
                />
              </Field>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <Button type="submit" disabled={loading}>
                <Save size={16} />
                {loading ? 'Guardando…' : 'Guardar producto'}
              </Button>
              <Link href="/inventory">
                <Button variant="secondary" type="button">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardBody>
      </Card>
      <style>{`.form-input { width:100%; padding:.65rem .8rem; border-radius:.6rem; border:1px solid #d6d3d1; background:#fff; color:#1c1917; outline:none; transition:.15s border-color, .15s box-shadow }
        .form-input:focus { border-color:#DC2626; box-shadow:0 0 0 3px rgba(220,38,38,.2) }`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-stone-500 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
