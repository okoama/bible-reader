import { useEffect, useState } from 'react';
import type { Collection, CollectionItem, Note, CrossLinkType } from '../../types';
import { CollectionRepository } from '../../lib/repositories/CollectionRepository';
import { NoteRepository } from '../../lib/repositories/NoteRepository';
import { formatDate } from '../../lib/utils/date';
import NoteViewer from './NoteViewer';

const repo = new CollectionRepository();
const noteRepo = new NoteRepository();

type CollectionViewerProps = {
  collectionId: string;
  refreshKey: number;
  onNavigateToItem: (item: CollectionItem) => void;
  onNavigateToPassage: (sourceReference: string) => void;
  onBack: () => void;
  onEdit: (collection: Collection) => void;
  onDelete: (id: string) => void;
  onCrossLinkNavigate?: (type: CrossLinkType, id: string) => void;
};

function typeIcon(type: string): string {
  switch (type) {
    case 'note': return '\u{1F4DD}';
    case 'bookmark': return '\u{1F516}';
    case 'prayer': return '\u{1F4E7}';
    case 'passage': return '\u{1F4D6}';
    default: return '\u{2022}';
  }
}

export default function CollectionViewer({
  collectionId,
  refreshKey,
  onNavigateToItem,
  onNavigateToPassage,
  onBack,
  onEdit,
  onDelete,
  onCrossLinkNavigate,
}: CollectionViewerProps) {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);

  useEffect(() => {
    let active = true;
    void repo.findById(collectionId).then((c) => {
      if (active && c) setCollection(c);
    });
    return () => { active = false; };
  }, [collectionId, refreshKey]);

  if (!collection) {
    return (
      <div className="mx-auto reading-width animate-fade-in">
        <p className="mt-12 text-center text-sm opacity-50 italic">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto reading-width animate-fade-in">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-2 text-sm text-accent hover:text-accent-hover"
          >
            &larr; Collections
          </button>
          <h2 className="text-2xl font-semibold">{collection.name}</h2>
          {collection.description && (
            <p className="mt-1 text-sm opacity-60">{collection.description}</p>
          )}
          <p className="mt-1 text-xs opacity-40">
            {collection.items.length} item{collection.items.length !== 1 ? 's' : ''}
            &middot; Created {formatDate(collection.createdAt)}
          </p>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onEdit(collection)}
            className="rounded border px-3 py-1 text-sm transition-colors hover:bg-gray-100"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(collection.id)}
            className="rounded border px-3 py-1 text-sm text-red-600 transition-colors hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      {collection.items.length === 0 && (
        <p className="mt-12 text-center text-sm opacity-50 italic">
          This collection is empty. Add notes, bookmarks, prayers, or passages to it.
        </p>
      )}

      <div className="space-y-2">
        {collection.items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              if (item.type === 'note' && item.itemId) {
                void noteRepo.findById(item.itemId).then((n) => { if (n) setViewingNote(n); });
              } else if (item.type === 'passage' && item.sourceReference) {
                onNavigateToPassage(item.sourceReference);
              } else {
                onNavigateToItem(item);
              }
            }}
            className="flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-gray-50"
          >
            <span className="mt-0.5 text-lg">{typeIcon(item.type)}</span>
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{item.label}</p>
              <div className="mt-0.5 flex items-center gap-2 text-xs opacity-50">
                <span className="rounded bg-gray-100 px-1.5 py-0.5 capitalize">{item.type}</span>
                {item.sourceReference && <span className="truncate">{item.sourceReference}</span>}
                <span>{formatDate(item.addedAt)}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {viewingNote && (
        <NoteViewer
          note={viewingNote}
          onClose={() => setViewingNote(null)}
          onCrossLinkNavigate={onCrossLinkNavigate}
        />
      )}
    </div>
  );
}
