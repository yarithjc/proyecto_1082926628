import Link from 'next/link';
import { ArrowRight, AlertTriangle, ShoppingBag, TrendingUp, Crown } from 'lucide-react';
import { getDashboardData } from '@/lib/dataService';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCOP, formatDateTime } from '@/lib/dateUtils';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="relative">
      {/* Cinta superior decorativa */}
      <div className="butcher-divider opacity-50" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-7 animate-fade-in">
        <header className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="eyebrow text-brand">Mostrador / Resumen</p>
            <h1 className="font-display text-[34px] sm:text-[40px] leading-none text-stone-900 mt-1">
              Hoy en la salsamentaría
            </h1>
            <p className="text-sm text-stone-500 mt-2">
              <span className="font-numeric">{data.summary.date}</span> · zona horaria Bogotá
            </p>
          </div>
          <Link href="/sales">
            <Button size="lg" className="shadow-[0_4px_0_0_#7F1D1D] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#7F1D1D]">
              <ShoppingBag size={18} /> Nueva venta
            </Button>
          </Link>
        </header>

        {data.lowStock.length > 0 && (
          <div className="rounded-xl border border-amber-300/70 bg-gradient-to-r from-amber-50 to-amber-100/40 p-4 sm:p-5 ribbon">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-amber-200/70 text-amber-900 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-900 text-sm">
                  Stock bajo — {data.lowStock.length} producto{data.lowStock.length === 1 ? '' : 's'} cerca de agotarse
                </p>
                <p className="text-sm text-amber-900/80 mt-1">
                  {data.lowStock
                    .slice(0, 4)
                    .map((p) => `${p.name} · ${p.current_stock}u`)
                    .join('   ·   ')}
                  {data.lowStock.length > 4 ? `   ·   y ${data.lowStock.length - 4} más` : ''}
                </p>
                <Link
                  href="/inventory"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-amber-900 hover:underline mt-2"
                >
                  Ver inventario completo <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Ventas del día"
            value={data.summary.totalSales.toString()}
            hint="transacciones registradas"
            icon={<ShoppingBag size={16} />}
          />
          <StatCard
            label="Ingresos del día"
            value={formatCOP(data.summary.totalIncome)}
            hint="suma de totales en COP"
            icon={<TrendingUp size={16} />}
            highlight
          />
          <StatCard
            label="Top del día"
            value={data.summary.topProduct?.name ?? '—'}
            hint={
              data.summary.topProduct
                ? `${data.summary.topProduct.quantity} unidades`
                : 'sin ventas todavía'
            }
            icon={<Crown size={16} />}
          />
        </div>

        {data.lastSale && (
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-brand-paper to-white px-5 py-3 border-b border-stone-200 flex items-center justify-between">
              <p className="eyebrow text-brand">Última venta</p>
              <span className="text-[11px] text-stone-500 font-numeric">
                {formatDateTime(data.lastSale.sold_at)}
              </span>
            </div>
            <CardBody className="flex items-center justify-between gap-4">
              <div>
                <p className="font-display text-2xl text-stone-900">
                  {data.lastSale.quantity}
                  <span className="text-stone-400 mx-2">×</span>
                  {data.lastSale.product_name}
                </p>
              </div>
              <div className="price-tag rounded-lg px-4 py-2 text-right">
                <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Total</p>
                <p className="font-numeric text-xl font-semibold text-brand">
                  {formatCOP(data.lastSale.total)}
                </p>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
  highlight = false,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 transition shadow-tile ${
        highlight
          ? 'bg-gradient-to-br from-brand to-brand-dark text-white border-brand-deep'
          : 'bg-white border-stone-200'
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center justify-center h-7 w-7 rounded-md ${
            highlight ? 'bg-white/15 text-white' : 'bg-brand-light text-brand'
          }`}
        >
          {icon}
        </span>
        <p
          className={`eyebrow ${
            highlight ? 'text-red-100' : 'text-stone-500'
          }`}
        >
          {label}
        </p>
      </div>
      <p
        className={`font-display text-3xl sm:text-[34px] leading-none mt-3 ${
          highlight ? 'text-white' : 'text-stone-900'
        }`}
      >
        {value}
      </p>
      <p className={`text-[12px] mt-1.5 ${highlight ? 'text-red-100/85' : 'text-stone-500'}`}>
        {hint}
      </p>
    </div>
  );
}
