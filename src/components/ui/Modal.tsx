'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
  icon?: React.ReactNode;
}

interface ConfirmApi {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const Ctx = createContext<ConfirmApi | null>(null);

export function useConfirm(): ConfirmApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useConfirm debe usarse dentro de <ModalProvider>');
  return v;
}

interface PendingPrompt {
  options: ConfirmOptions;
  resolve: (ok: boolean) => void;
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<PendingPrompt | null>(null);

  const confirm = useCallback<ConfirmApi['confirm']>(
    (options) =>
      new Promise<boolean>((resolve) => {
        setPending({ options, resolve });
      }),
    []
  );

  const close = useCallback(
    (ok: boolean) => {
      pending?.resolve(ok);
      setPending(null);
    },
    [pending]
  );

  useEffect(() => {
    if (!pending) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false);
      if (e.key === 'Enter') close(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pending, close]);

  const api = useMemo<ConfirmApi>(() => ({ confirm }), [confirm]);

  return (
    <Ctx.Provider value={api}>
      {children}
      {pending && (
        <ConfirmModal
          options={pending.options}
          onResult={(ok) => close(ok)}
        />
      )}
    </Ctx.Provider>
  );
}

function ConfirmModal({
  options,
  onResult,
}: {
  options: ConfirmOptions;
  onResult: (ok: boolean) => void;
}) {
  const danger = options.tone === 'danger';
  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div
        className="absolute inset-0 bg-stone-950/55 backdrop-blur-sm"
        onClick={() => onResult(false)}
        aria-hidden
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-meat overflow-hidden animate-scale-in">
        <button
          onClick={() => onResult(false)}
          aria-label="Cerrar"
          className="absolute top-3 right-3 p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100 z-10"
        >
          <X size={16} />
        </button>

        <div className="p-6 pb-4 flex items-start gap-4">
          <span
            className={`h-12 w-12 shrink-0 rounded-xl flex items-center justify-center ${
              danger
                ? 'bg-red-100 text-red-700'
                : 'bg-brand-paper text-brand'
            }`}
          >
            {options.icon ?? <AlertTriangle size={22} />}
          </span>
          <div className="flex-1 pt-1">
            <h3 className="font-display text-xl text-stone-900 leading-tight">
              {options.title}
            </h3>
            {options.description && (
              <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                {options.description}
              </p>
            )}
          </div>
        </div>

        <div className="bg-stone-50 border-t border-stone-200 px-6 py-3 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onResult(false)}
          >
            {options.cancelLabel ?? 'Cancelar'}
          </Button>
          <Button
            type="button"
            variant={danger ? 'danger' : 'primary'}
            size="sm"
            onClick={() => onResult(true)}
          >
            {options.confirmLabel ?? 'Confirmar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
