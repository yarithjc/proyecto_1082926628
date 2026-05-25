'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastKind = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  kind: ToastKind;
  title: string;
  body?: string;
  duration: number;
}

interface ToastApi {
  show: (t: Omit<ToastItem, 'id' | 'duration'> & { duration?: number }) => void;
  success: (title: string, body?: string) => void;
  error: (title: string, body?: string) => void;
  info: (title: string, body?: string) => void;
}

const Ctx = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return v;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, number>>(new Map());

  const remove = useCallback((id: string) => {
    setItems((curr) => curr.filter((t) => t.id !== id));
    const tid = timers.current.get(id);
    if (tid) {
      window.clearTimeout(tid);
      timers.current.delete(id);
    }
  }, []);

  const show = useCallback<ToastApi['show']>((t) => {
    const id = Math.random().toString(36).slice(2);
    const duration = t.duration ?? 3600;
    setItems((curr) => [...curr, { id, duration, ...t }]);
    const tid = window.setTimeout(() => remove(id), duration);
    timers.current.set(id, tid);
  }, [remove]);

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (title, body) => show({ kind: 'success', title, body }),
      error: (title, body) => show({ kind: 'error', title, body, duration: 5500 }),
      info: (title, body) => show({ kind: 'info', title, body }),
    }),
    [show]
  );

  useEffect(() => {
    const t = timers.current;
    return () => {
      t.forEach((tid) => window.clearTimeout(tid));
      t.clear();
    };
  }, []);

  return (
    <Ctx.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="fixed z-[100] top-4 right-4 sm:top-6 sm:right-6 flex flex-col gap-2 pointer-events-none w-[min(360px,calc(100vw-2rem))]"
      >
        {items.map((t) => (
          <ToastCard key={t.id} item={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </Ctx.Provider>
  );
}

const STYLES: Record<
  ToastKind,
  { bg: string; ring: string; iconBg: string; icon: React.ReactNode; title: string }
> = {
  success: {
    bg: 'bg-white',
    ring: 'ring-1 ring-green-200 shadow-[0_18px_38px_-10px_rgba(22,163,74,0.25)]',
    iconBg: 'bg-green-100 text-green-700',
    icon: <CheckCircle2 size={18} />,
    title: 'text-green-900',
  },
  error: {
    bg: 'bg-white',
    ring: 'ring-1 ring-red-200 shadow-[0_18px_38px_-10px_rgba(220,38,38,0.32)]',
    iconBg: 'bg-red-100 text-red-700',
    icon: <AlertCircle size={18} />,
    title: 'text-red-900',
  },
  info: {
    bg: 'bg-white',
    ring: 'ring-1 ring-stone-200 shadow-[0_18px_38px_-10px_rgba(0,0,0,0.18)]',
    iconBg: 'bg-stone-100 text-stone-700',
    icon: <Info size={18} />,
    title: 'text-stone-900',
  },
};

function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const s = STYLES[item.kind];
  return (
    <div
      role="status"
      className={`${s.bg} ${s.ring} pointer-events-auto rounded-xl p-3 pr-9 flex items-start gap-3 animate-slide-up relative overflow-hidden`}
    >
      <span className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${s.iconBg}`}>
        {s.icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${s.title} leading-tight`}>{item.title}</p>
        {item.body && (
          <p className="text-[13px] text-stone-600 mt-0.5 leading-snug">{item.body}</p>
        )}
      </div>
      <button
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute top-2 right-2 p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100"
      >
        <X size={14} />
      </button>
      <span
        className="absolute bottom-0 left-0 h-[2px] bg-current opacity-30"
        style={{ animation: `shrink ${item.duration}ms linear forwards`, width: '100%' }}
      />
      <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
    </div>
  );
}
