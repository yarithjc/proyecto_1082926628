'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutGrid,
  Package,
  ScanLine,
  Settings,
  User,
  LogOut,
  Users,
  Activity,
  Receipt,
  type LucideIcon,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import type { Role } from '@/lib/types';

interface SessionInfo {
  id: string;
  email: string;
  name: string;
  role: Role;
}

interface NavItem {
  href: string;
  label: string;
  Icon: LucideIcon;
  roles?: Role[];
}

const NAV: NavItem[] = [
  { href: '/dashboard', label: 'Inicio', Icon: LayoutGrid },
  { href: '/inventory', label: 'Inventario', Icon: Package },
  { href: '/sales', label: 'Vender', Icon: ScanLine },
  { href: '/admin/db-setup', label: 'Admin', Icon: Settings, roles: ['admin'] },
  { href: '/profile', label: 'Perfil', Icon: User },
];

const ADMIN_SUB: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: '/admin/db-setup', label: 'BD & Bootstrap', Icon: Settings },
  { href: '/admin/users', label: 'Usuarios', Icon: Users },
  { href: '/sales/history', label: 'Historial ventas', Icon: Receipt },
  { href: '/admin/audit', label: 'Auditoría', Icon: Activity },
];

export function AppLayout({
  user,
  children,
}: {
  user: SessionInfo;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const items = NAV.filter((n) => !n.roles || n.roles.includes(user.role));

  async function handleLogout() {
    setLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  }

  useEffect(() => {
    setLoggingOut(false);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-stone-50">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-stone-200 relative">
        <div className="px-5 py-5 flex items-center gap-3 border-b border-stone-200/80 bg-gradient-to-br from-white to-brand-paper">
          <Logo size={36} />
          <div className="leading-tight">
            <p className="font-display text-[17px] font-semibold text-stone-900 tracking-tight">
              StockControl
            </p>
            <p className="text-[10.5px] tracking-[0.22em] uppercase text-brand font-semibold">
              Salsamentaría
            </p>
          </div>
        </div>
        <div className="butcher-divider mx-5 mt-0" />

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="eyebrow text-stone-400 px-3 mb-2">Navegación</p>
          {items.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname?.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition group ${
                  active
                    ? 'bg-brand-light/70 text-brand-deep font-semibold'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Icon
                  size={18}
                  strokeWidth={active ? 2.4 : 2}
                  className={active ? 'text-brand' : 'text-stone-500 group-hover:text-stone-900'}
                />
                <span>{label}</span>
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
                )}
              </Link>
            );
          })}

          {user.role === 'admin' && (
            <div className="pt-3 mt-3 border-t border-stone-200/70">
              <p className="eyebrow text-stone-400 px-3 mb-2">Administración</p>
              {ADMIN_SUB.map(({ href, label, Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition ${
                      active
                        ? 'bg-stone-100 text-stone-900 font-semibold'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Icon size={15} className={active ? 'text-brand' : 'text-stone-400'} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        <div className="px-3 py-3 border-t border-stone-200 bg-gradient-to-b from-white to-stone-50">
          <div className="px-2 mb-2 flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-brand-light text-brand font-semibold flex items-center justify-center text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-stone-900 truncate leading-tight">
                {user.name}
              </p>
              <p className="text-[10.5px] uppercase tracking-[0.16em] text-brand font-semibold mt-0.5">
                {user.role}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 hover:text-stone-900 disabled:opacity-50 transition"
          >
            <LogOut size={16} />
            <span>{loggingOut ? 'Saliendo…' : 'Cerrar sesión'}</span>
          </button>
        </div>
      </aside>

      {/* Header — mobile */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-white/95 backdrop-blur border-b border-stone-200">
        <div className="flex items-center gap-2.5">
          <Logo size={30} />
          <div className="leading-tight">
            <p className="font-display font-semibold text-stone-900 text-[15px]">StockControl</p>
            <p className="text-[9px] uppercase tracking-[0.2em] text-brand font-semibold -mt-0.5">
              Salsamentaría
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          aria-label="Cerrar sesión"
          className="text-stone-600 disabled:opacity-50 p-2 -mr-2"
        >
          <LogOut size={18} />
        </button>
      </header>

      <main className="flex-1 pb-24 lg:pb-0">{children}</main>

      {/* Bottom nav — mobile */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-t border-stone-200 grid grid-cols-5">
        {items.map(({ href, label, Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center py-2.5 text-[11px] gap-0.5 ${
                active ? 'text-brand font-semibold' : 'text-stone-500'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
