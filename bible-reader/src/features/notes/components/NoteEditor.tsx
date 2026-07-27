import { useEffect, useRef, useState } from 'react';
import type { Note } from '../../../types';
import { NoteRepository } from '../../../lib/repositories/NoteRepository';
import { createId } from '../../../lib/utils/id';

const noteRepository = new NoteRepository();

type NoteEditorProps = {
  note?: Note;
  sourceReference: string;
  onSave: (note: Note) => void;
  onCancel: () => void;
};

export default function NoteEditor({
  note,
  sourceReference,
  onSave,
  onCancel,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
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
    const now = new Date().toISOString();

    const saved: Note = {
      id: note?.id ?? createId('note'),
      sourceReference,
      title,
      content,
      tags: note?.tags ?? [],
      createdAt: note?.createdAt ?? now,
      updatedAt: now,
    };

    if (note) {
      await noteRepository.update(saved);
    } else {
      await noteRepository.create(saved);
    }

    onSave(saved);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={note ? 'Edit note' : 'New note'}
    >
      <div
        ref={dialogRef}
        className="mx-4 flex w-full max-w-lg flex-col gap-4 rounded-lg border bg-white p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold">
          {note ? 'Edit Note' : 'New Note'}
        </h2>

        <input
          ref={titleRef}
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded border px-3 py-2 text-sm outline-none focus:border-blue-500"
        />

        <textarea
          placeholder="Write your note here…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="resize-none rounded border px-3 py-2 text-sm outline-none focus:border-blue-500"
        />

        <p className="text-xs opacity-60">
          Attached to: {sourceReference}
        </p>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded border px-4 py-2 text-sm hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!title.trim()}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
