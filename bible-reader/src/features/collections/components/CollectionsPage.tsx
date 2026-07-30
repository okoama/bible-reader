import { useEffect, useState } from 'react';
import type { Collection } from '../../../types';
import { CollectionRepository } from '../../../lib/repositories/CollectionRepository';

const repo = new CollectionRepository();

type CollectionsPageProps = {
  refreshKey: number;
  onSelectCollection: (id: string) => void;
  onNewCollection: () => void;
};

export default function CollectionsPage({ refreshKey, onSelectCollection, onNewCollection }: CollectionsPageProps) {
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    let active = true;
    void repo.findAll().then((all) => {
      if (active) setCollections(all);
    });
    return () => { active = false; };
  }, [refreshKey]);

  if (collections.length === 0) {
    return (
      <div className="mx-auto reading-width animate-fade-in">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Collections</h2>
          <button
            type="button"
            onClick={onNewCollection}
            className="rounded-md bg-accent px-4 py-2 text-sm text-white transition-colors hover:bg-accent-hover"
          >
            + New Collection
          </button>
        </div>
        <p className="mt-12 text-center text-sm opacity-50 italic">
          Group your notes, bookmarks, prayers, and passages into collections.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto reading-width animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Collections</h2>
        <button
          type="button"
          onClick={onNewCollection}
          className="rounded-md bg-accent px-4 py-2 text-sm text-white transition-colors hover:bg-accent-hover"
        >
          + New Collection
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {collections.map((col) => (
          <button
            key={col.id}
            type="button"
            onClick={() => onSelectCollection(col.id)}
            className="rounded-lg border p-5 text-left transition-colors hover:bg-gray-50"
          >
            <p className="text-lg font-semibold">{col.name}</p>
            {col.description && (
              <p className="mt-1 text-sm opacity-60 line-clamp-2">{col.description}</p>
            )}
            <p className="mt-2 text-xs opacity-40">
              {col.items.length} item{col.items.length !== 1 ? 's' : ''}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
