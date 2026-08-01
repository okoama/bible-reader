import { useCallback, useEffect, useRef, useState } from 'react';
import { ToastContext } from '../../lib/contexts/ToastContext';
import type { Toast, ToastType } from '../../lib/contexts/ToastContext';

let nextToastId = 1;

const TOAST_GLYPH: Record<ToastType, string> = {
  success: '\u2713',
  error: '!',
  info: '\u2726',
};

const TOAST_ACCENT: Record<ToastType, string> = {
  success: '#4ade80',
  error: '#ef4444',
  info: 'var(--secondary)',
};

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<number, number>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback((message: string, options?: { type?: ToastType; duration?: number }) => {
    const id = nextToastId++;
    const type = options?.type ?? 'success';
    const duration = options?.duration ?? (type === 'error' ? 6000 : 3500);

    setToasts((prev) => [...prev.slice(-3), { id, message, type, duration }]);
    const timer = window.setTimeout(() => dismiss(id), duration);
    timersRef.current.set(id, timer);
  }, [dismiss]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="pointer-events-none fixed bottom-16 right-4 z-[70] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-2.5 rounded-lg border border-theme bg-card px-3 py-2.5 text-sm shadow-xl animate-slide-in"
            style={{ borderLeft: `3px solid ${TOAST_ACCENT[toast.type]}` }}
          >
            <span
              className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-black"
              style={{ backgroundColor: TOAST_ACCENT[toast.type] }}
              aria-hidden="true"
            >
              {TOAST_GLYPH[toast.type]}
            </span>
            <p className="flex-1 leading-snug">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="shrink-0 text-sm leading-none opacity-40 transition-opacity hover:opacity-100"
              aria-label="Dismiss notification"
            >
              {'\u2715'}
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
