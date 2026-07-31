import { useEffect } from 'react';

type ConfirmDialogProps = {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
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
            className="btn-stained-ghost rounded px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn-stained-danger rounded px-4 py-2 text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
