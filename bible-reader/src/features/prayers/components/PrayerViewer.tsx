import { useEffect, useState } from 'react';
import type { Prayer } from '../../../types';
import { PRAYER_CATEGORIES } from '../../../types';
import { formatDate } from '../../../lib/utils/date';
import { useModalFocus } from '../../../lib/hooks/useModalFocus';
import { PrayerRepository } from '../../../lib/repositories/PrayerRepository';
import LoadingIndicator from '../../shared/components/LoadingIndicator';
import ConfirmDialog from '../../shared/components/ConfirmDialog';
import { useToast } from '../../../lib/contexts/ToastContext';

const prayerRepository = new PrayerRepository();

type PrayerViewerProps = {
  prayer: Prayer;
  readOnly?: boolean;
  onClose: () => void;
  onEdit?: (prayer: Prayer) => void;
  onRefresh: () => void;
};

const CATEGORY_COLORS: Record<string, string> = {
  thanksgiving: 'bg-green-100 text-green-800',
  petitions: 'bg-accent-light text-accent',
  intercession: 'bg-purple-100 text-purple-800',
  rosary: 'bg-indigo-100 text-indigo-800',
  novena: 'bg-pink-100 text-pink-800',
  family: 'bg-amber-100 text-amber-800',
  work: 'bg-orange-100 text-orange-800',
  study: 'bg-cyan-100 text-cyan-800',
  custom: 'bg-gray-100 text-gray-800',
};

export default function PrayerViewer({ prayer, readOnly = false, onClose, onEdit, onRefresh }: PrayerViewerProps) {
  const catLabel = PRAYER_CATEGORIES.find((c) => c.value === prayer.category)?.label ?? prayer.category;
  const catColor = CATEGORY_COLORS[prayer.category] ?? 'bg-gray-100 text-gray-800';
  const [busyAction, setBusyAction] = useState<'answered' | 'prayed' | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const panelRef = useModalFocus<HTMLDivElement>();
  const { showToast } = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !confirmingDelete) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, confirmingDelete]);

  async function handleMarkAnswered() {
    setBusyAction('answered');
    try {
      await prayerRepository.update({ ...prayer, answered: !prayer.answered, updatedAt: new Date().toISOString() });
      showToast(prayer.answered ? 'Prayer marked as not answered' : 'Prayer marked as answered');
      onRefresh();
    } finally {
      setBusyAction(null);
    }
  }

  async function handleMarkPrayed() {
    setBusyAction('prayed');
    try {
      await prayerRepository.markPrayed(prayer.id);
      showToast('Prayer marked as prayed');
      onRefresh();
    } finally {
      setBusyAction(null);
    }
  }

  async function handleDelete() {
    await prayerRepository.delete(prayer.id);
    showToast('Prayer deleted');
    onRefresh();
    onClose();
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={prayer.title}
    >
      <div ref={panelRef} className="mx-4 flex w-full max-w-2xl flex-col gap-4 rounded-lg bg-card border border-theme p-6 shadow-xl animate-slide-up max-h-[85vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {prayer.favorite && <span className="text-yellow-500" title="Favorite">★</span>}
              <h2 className="text-xl font-semibold">{prayer.title}</h2>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs opacity-60">
              {!readOnly && (
                <span className={`rounded-full px-2 py-0.5 font-medium ${catColor}`}>{catLabel}</span>
              )}
              {prayer.lastPrayed && <span>Last prayed: {formatDate(prayer.lastPrayed)}</span>}
              {prayer.answered && <span className="text-green-600 font-medium">Answered</span>}
              {!readOnly && <span>Created: {formatDate(prayer.createdAt)}</span>}
            </div>
            {prayer.tags.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {prayer.tags.map((tag) => (
                  <span key={tag} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">{tag}</span>
                ))}
              </div>
            )}
          </div>
          <button type="button" onClick={onClose} className="text-lg leading-none opacity-50 hover:opacity-100">&times;</button>
        </div>

        <div
          className="prose prose-sm max-w-none [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-3 [&_blockquote]:text-gray-600"
          dangerouslySetInnerHTML={{ __html: prayer.content }}
        />

        <div className="flex flex-wrap items-center gap-2 border-t pt-4">
          {!readOnly && (
            <>
              <button
                type="button"
                onClick={() => onEdit?.(prayer)}
                className="btn-stained-ghost rounded px-3 py-1.5 text-sm"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleMarkPrayed}
                disabled={busyAction !== null}
                aria-busy={busyAction === 'prayed'}
                className="btn-stained rounded px-3 py-1.5 text-sm disabled:opacity-60"
              >
                {busyAction === 'prayed' ? (
                  <span className="inline-flex items-center gap-1.5">
                    <LoadingIndicator compact size="xs" />
                    <span>Sealing…</span>
                  </span>
                ) : prayer.lastPrayed ? 'Prayed Again' : 'Mark Prayed'}
              </button>
              <button
                type="button"
                onClick={handleMarkAnswered}
                disabled={busyAction !== null}
                aria-busy={busyAction === 'answered'}
                className={`rounded-md border px-3 py-1.5 text-sm transition-colors duration-150 disabled:opacity-60 ${
                  prayer.answered ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'hover-bg'
                }`}
              >
                {busyAction === 'answered' ? (
                  <span className="inline-flex items-center gap-1.5">
                    <LoadingIndicator compact size="xs" />
                    <span>Sealing…</span>
                  </span>
                ) : prayer.answered ? '✓ Answered' : 'Mark Answered'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                disabled={busyAction !== null}
                className="ml-auto rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 transition-colors duration-150 hover:bg-red-50 disabled:opacity-60"
              >
                Delete
              </button>
            </>
          )}
          {readOnly && (
            <p className="text-xs opacity-40 italic">Traditional prayer</p>
          )}
        </div>
      </div>

      {confirmingDelete && (
        <ConfirmDialog
          message={`Delete prayer "${prayer.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}
    </div>
  );
}
