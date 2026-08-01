import { useEffect, useState } from 'react';
import type { Collection, CollectionItem, CollectionItemType } from '../../types';
import { CollectionRepository } from '../../lib/repositories/CollectionRepository';
import { createId } from '../../lib/utils/id';
import { useStudySession } from '../../lib/contexts/StudySessionContext';

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
  const { session, logCollectionEvent } = useStudySession();

  useEffect(() => {
    let active = true;
    void repo.findAll().then((all) => {
      if (active) setCollections(all);
    });
    return () => { active = false; };
  }, []);

  const handleAdd = async (collectionId: string) => {
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
    onAdded();
    onClose();
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
      <div className="mx-4 flex w-full max-w-sm flex-col gap-3 rounded-lg border bg-white p-6 shadow-xl animate-slide-up">
        <h2 className="text-lg font-semibold">Add to Collection</h2>
        <p className="text-sm opacity-60 truncate">{itemLabel}</p>

        {collections.length === 0 ? (
          <p className="text-sm italic opacity-50">No collections yet. Create one first.</p>
        ) : (
          <div className="max-h-60 space-y-1 overflow-y-auto">
            {collections.map((col) => (
              <button
                key={col.id}
                type="button"
                onClick={() => handleAdd(col.id)}
                className="w-full rounded-md border px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50"
              >
                <p className="font-medium">{col.name}</p>
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
          className="mt-1 self-end rounded-md border px-4 py-1.5 text-sm transition-colors hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
