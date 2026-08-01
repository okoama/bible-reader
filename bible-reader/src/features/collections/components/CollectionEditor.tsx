import { useEffect, useRef, useState } from 'react';
import type { Collection } from '../../../types';
import { useModalFocus } from '../../../lib/hooks/useModalFocus';
import ProjectPicker from '../../projects/components/ProjectPicker';
import AsyncButton from '../../shared/components/AsyncButton';

type CollectionEditorProps = {
  collection?: Collection;
  onSave: (name: string, description: string, projectId?: string) => void | Promise<void>;
  onCancel: () => void;
};

export default function CollectionEditor({ collection, onSave, onCancel }: CollectionEditorProps) {
  const [name, setName] = useState(collection?.name ?? '');
  const [description, setDescription] = useState(collection?.description ?? '');
  const [projectId, setProjectId] = useState<string | undefined>(collection?.projectId);
  const nameRef = useRef<HTMLInputElement>(null);
  const panelRef = useModalFocus<HTMLDivElement>();

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

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
      aria-label={collection ? 'Edit collection' : 'New collection'}
    >
      <div ref={panelRef} className="mx-4 flex w-full max-w-lg flex-col gap-4 rounded-lg bg-card border border-theme p-6 shadow-xl animate-slide-up">
        <h2 className="text-lg font-semibold">
          {collection ? 'Edit Collection' : 'New Collection'}
        </h2>

        <input
          ref={nameRef}
          type="text"
          placeholder="Collection name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm outline-none transition-colors focus-accent"
        />

        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="rounded-md border px-3 py-2 text-sm outline-none transition-colors focus-accent resize-none"
        />

        <ProjectPicker value={projectId} onChange={setProjectId} />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border px-4 py-2 text-sm btn-stained-ghost"
          >
            Cancel
          </button>
          <AsyncButton
            onClick={() => onSave(name.trim(), description.trim(), projectId)}
            disabled={!name.trim()}
            busyLabel="Saving…"
            className="rounded-md btn-stained px-4 py-2 text-sm transition-colors disabled:opacity-50"
          >
            {collection ? 'Save' : 'Create'}
          </AsyncButton>
        </div>
      </div>
    </div>
  );
}
