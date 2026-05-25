import Link from 'next/link';
import { TriangleAlert, ArrowRight } from 'lucide-react';

export function SeedModeBanner({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="bg-[#FEF3C7] border-y border-amber-400/40 text-[#92400E]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
        <div className="flex items-start sm:items-center gap-2.5">
          <TriangleAlert size={16} className="shrink-0 mt-0.5 sm:mt-0" />
          <p>
            <strong className="font-semibold">Modo semilla.</strong> Aún no se ha aplicado el
            bootstrap. Inventario y ventas están bloqueados.
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/admin/db-setup"
            className="self-start sm:self-auto inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:opacity-80"
          >
            Ir al bootstrap
            <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </div>
  );
}
