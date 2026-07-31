import { useEffect, useRef, useState } from 'react';
import type { Bookmark } from '../../../types';
import { BookmarkRepository } from '../../../lib/repositories/BookmarkRepository';
import { createId } from '../../../lib/utils/id';
import ProjectPicker from '../../projects/components/ProjectPicker';

const bookmarkRepository = new BookmarkRepository();

type BookmarkEditorProps = {
  sourceReference: string;
  onSave: (bookmark: Bookmark) => void;
  onCancel: () => void;
  initialProjectId?: string;
};

export default function BookmarkEditor({
  sourceReference,
  onSave,
  onCancel,
  initialProjectId,
}: BookmarkEditorProps) {
  const [title, setTitle] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [projectId, setProjectId] = useState<string | undefined>(initialProjectId);
  const titleRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const handleSave = async () => {
    const bookmark: Bookmark = {
      id: createId('bm'),
      sourceReference,
      title: title.trim() || undefined,
      favorite,
      projectId,
      createdAt: new Date().toISOString(),
    };

    await bookmarkRepository.create(bookmark);
    onSave(bookmark);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="New bookmark"
    >
      <div
        ref={dialogRef}
        className="mx-4 flex w-full max-w-lg flex-col gap-4 rounded-lg bg-card border border-theme p-6 shadow-xl animate-slide-up"
      >
        <h2 className="text-lg font-semibold">New Bookmark</h2>

        <input
          ref={titleRef}
          type="text"
          placeholder="Label (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm outline-none transition-colors duration-150 focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
        />

        <p className="text-xs opacity-60">
          Attached to: {sourceReference}
        </p>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={favorite}
            onChange={(e) => setFavorite(e.target.checked)}
            className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-400"
          />
          Mark as favorite
        </label>

        <ProjectPicker value={projectId} onChange={setProjectId} />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border px-4 py-2 text-sm transition-colors duration-150 hover-bg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-md btn-stained px-4 py-2 text-sm transition-colors duration-150"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
