import { useEffect, useRef, useState } from 'react';
import type { Collection } from '../../types';

type CollectionEditorProps = {
  collection?: Collection;
  onSave: (name: string, description: string) => void;
  onCancel: () => void;
};

export default function CollectionEditor({ collection, onSave, onCancel }: CollectionEditorProps) {
  const [name, setName] = useState(collection?.name ?? '');
  const [description, setDescription] = useState(collection?.description ?? '');
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onCancel();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={collection ? 'Edit collection' : 'New collection'}
    >
      <div className="mx-4 flex w-full max-w-lg flex-col gap-4 rounded-lg border bg-white p-6 shadow-xl animate-slide-up">
        <h2 className="text-lg font-semibold">
          {collection ? 'Edit Collection' : 'New Collection'}
        </h2>

        <input
          ref={nameRef}
          type="text"
          placeholder="Collection name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
        />

        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="rounded-md border px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-200 resize-none"
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border px-4 py-2 text-sm transition-colors hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!name.trim()}
            onClick={() => onSave(name.trim(), description.trim())}
            className="rounded-md bg-accent px-4 py-2 text-sm text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {collection ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
