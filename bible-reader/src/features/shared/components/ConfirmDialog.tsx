import { useCallback, useEffect, useState } from 'react';
import LoadingIndicator from './LoadingIndicator';

type ConfirmDialogProps = {
  message: string;
  confirmLabel?: string;
  busyLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

export default function ConfirmDialog({
  message,
  confirmLabel = 'Delete',
  busyLabel = 'Deleting…',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onCancel();
  };

  const handleConfirm = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  }, [busy, onConfirm]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Confirm delete"
    >
      <div className="mx-4 w-full max-w-sm rounded-lg bg-card border border-theme p-6 shadow-xl animate-slide-up">
        <p className="text-sm">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="btn-stained-ghost rounded px-4 py-2 text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy}
            aria-busy={busy}
            className="btn-stained-danger rounded px-4 py-2 text-sm disabled:opacity-70"
          >
            {busy ? (
              <span className="inline-flex items-center gap-1.5">
                <LoadingIndicator compact size="xs" />
                <span>{busyLabel}</span>
              </span>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
