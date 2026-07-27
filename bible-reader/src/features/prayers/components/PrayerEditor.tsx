import { useEffect, useRef, useState } from 'react';
import type { Prayer } from '../../../types';
import { PrayerRepository } from '../../../lib/repositories/PrayerRepository';
import { createId } from '../../../lib/utils/id';

const prayerRepository = new PrayerRepository();

type PrayerEditorProps = {
  prayer?: Prayer;
  onSave: (prayer: Prayer) => void;
  onCancel: () => void;
};

export default function PrayerEditor({ prayer, onSave, onCancel }: PrayerEditorProps) {
  const [title, setTitle] = useState(prayer?.title ?? '');
  const [content, setContent] = useState(prayer?.content ?? '');
  const titleRef = useRef<HTMLInputElement>(null);

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

    const saved: Prayer = {
      id: prayer?.id ?? createId('prayer'),
      title,
      content,
      createdAt: prayer?.createdAt ?? now,
      updatedAt: now,
    };

    if (prayer) {
      await prayerRepository.update(saved);
    } else {
      await prayerRepository.create(saved);
    }

    onSave(saved);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={prayer ? 'Edit prayer' : 'New prayer'}
    >
      <div className="mx-4 flex w-full max-w-lg flex-col gap-4 rounded-lg border bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold">
          {prayer ? 'Edit Prayer' : 'New Prayer'}
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
          placeholder="Write your prayer here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="resize-none rounded border px-3 py-2 text-sm outline-none focus:border-blue-500"
        />

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
