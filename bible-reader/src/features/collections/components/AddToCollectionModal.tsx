import { useEffect, useState } from 'react';
import type { Collection, CollectionItem, CollectionItemType } from '../../../types';
import { CollectionRepository } from '../../../lib/repositories/CollectionRepository';
import { createId } from '../../../lib/utils/id';
import { useModalFocus } from '../../../lib/hooks/useModalFocus';
import { useStudySession } from '../../../lib/contexts/StudySessionContext';
import { useToast } from '../../../lib/contexts/ToastContext';
import LoadingIndicator from '../../shared/components/LoadingIndicator';

const repo = new CollectionRepository();

type AddToCollectionModalProps = {
  itemType: CollectionItemType;
  itemLabel: string;
  sourceReference?: string;
  itemId?: string;
  onClose: () => void;
  onAdded: () => void;
};

export default function AddToCollectionModal({
  itemType,
  itemLabel,
  sourceReference,
  itemId,
  onClose,
  onAdded,
}: AddToCollectionModalProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const panelRef = useModalFocus<HTMLDivElement>();
  const { session, logCollectionEvent } = useStudySession();
  const { showToast } = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    let active = true;
    void repo.findAll().then((all) => {
      if (active) setCollections(all);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleAdd = async (collectionId: string) => {
    if (addingId) return;
    setAddingId(collectionId);
    try {
      const item: CollectionItem = {
        id: createId('ci'),
        type: itemType,
        sourceReference,
        itemId,
        label: itemLabel,
        addedAt: new Date().toISOString(),
      };
      await repo.addItem(collectionId, item);
      const col = collections.find((c) => c.id === collectionId);
      if (session && !session.endTime && col) logCollectionEvent(collectionId, col.name, 'add_item');
      showToast(col ? `Added to "${col.name}"` : 'Added to collection');
      onAdded();
      onClose();
    } finally {
      setAddingId(null);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Add to collection"
    >
      <div ref={panelRef} className="mx-4 flex w-full max-w-sm flex-col gap-3 rounded-lg bg-card border border-theme p-6 shadow-xl animate-slide-up">
        <h2 className="text-lg font-semibold">Add to Collection</h2>
        <p className="text-sm opacity-60 truncate">{itemLabel}</p>

        {loading ? (
          <LoadingIndicator compact message="Fetching the chests…" className="py-6" />
        ) : collections.length === 0 ? (
          <p className="text-sm italic opacity-50">No collections yet. Create one first.</p>
        ) : (
          <div className="max-h-60 space-y-1 overflow-y-auto">
            {collections.map((col) => (
              <button
                key={col.id}
                type="button"
                onClick={() => handleAdd(col.id)}
                disabled={addingId !== null}
                aria-busy={addingId === col.id}
                className="w-full rounded-md border px-3 py-2 text-left text-sm transition-colors hover-bg disabled:opacity-60"
              >
                <p className="font-medium">
                  {addingId === col.id ? (
                    <span className="inline-flex items-center gap-1.5">
                      <LoadingIndicator compact size="xs" />
                      <span>Adding…</span>
                    </span>
                  ) : (
                    col.name
                  )}
                </p>
                {col.items.length > 0 && (
                  <p className="text-xs opacity-40">{col.items.length} items</p>
                )}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="btn-stained-ghost mt-1 self-end rounded px-4 py-1.5 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
