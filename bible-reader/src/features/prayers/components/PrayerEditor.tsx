import { useCallback, useEffect, useRef, useState } from 'react';
import type { Prayer, PrayerCategory } from '../../../types';
import { PRAYER_CATEGORIES } from '../../../types';
import { PrayerRepository } from '../../../lib/repositories/PrayerRepository';
import { createId } from '../../../lib/utils/id';
import { useDraft } from '../../../lib/hooks/useDraft';
import RichTextEditor from '../../notes/components/RichTextEditor';
import ProjectPicker from '../../projects/components/ProjectPicker';
import AsyncButton from '../../shared/components/AsyncButton';

const prayerRepository = new PrayerRepository();

type PrayerEditorProps = {
  prayer?: Prayer;
  onSave: (prayer: Prayer) => void;
  onCancel: () => void;
  initialProjectId?: string;
};

export default function PrayerEditor({ prayer, onSave, onCancel, initialProjectId }: PrayerEditorProps) {
  const draftKey = prayer?.id ? `prayer:${prayer.id}` : 'prayer:new';
  const [title, setTitle] = useState(prayer?.title ?? '');
  const [content, setContent] = useState(prayer?.content ?? '');
  const [category, setCategory] = useState<PrayerCategory>(prayer?.category ?? 'custom');
  const [tagsInput, setTagsInput] = useState(prayer?.tags?.join(', ') ?? '');
  const [favorite, setFavorite] = useState(prayer?.favorite ?? false);
  const [projectId, setProjectId] = useState<string | undefined>(initialProjectId);
  const titleRef = useRef<HTMLInputElement>(null);

  const { hasDraft, restoreDraft, clearDraft } = useDraft(draftKey, title, content);

  const handleRestore = useCallback(() => {
    const data = restoreDraft();
    if (data) {
      if (data.title) setTitle(data.title);
      if (data.content) setContent(data.content);
    }
  }, [restoreDraft]);

  const handleDiscardDraft = useCallback(() => clearDraft(), [clearDraft]);

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
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const saved: Prayer = {
      id: prayer?.id ?? createId('prayer'),
      title,
      content,
      category,
      favorite,
      answered: prayer?.answered ?? false,
      tags,
      projectId,
      createdAt: prayer?.createdAt ?? now,
      updatedAt: now,
      lastPrayed: prayer?.lastPrayed ?? null,
    };

    if (prayer) {
      await prayerRepository.update(saved);
    } else {
      await prayerRepository.create(saved);
    }

    clearDraft();
    onSave(saved);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={prayer ? 'Edit prayer' : 'New prayer'}
    >
      <div className="mx-4 flex w-full max-w-lg flex-col gap-4 rounded-lg bg-card border border-theme p-6 shadow-xl animate-slide-up max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold">
          {prayer ? 'Edit Prayer' : 'New Prayer'}
        </h2>

        {hasDraft && (
          <div className="flex items-center justify-between rounded border border-amber-300 bg-amber-50 px-3 py-2">
            <p className="text-sm text-amber-800">Unsaved draft found.</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="text-xs text-amber-600 hover:text-amber-800"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleRestore}
                className="rounded bg-amber-600 px-2 py-0.5 text-xs text-white hover:bg-amber-700"
              >
                Restore
              </button>
            </div>
          </div>
        )}

        <input
          ref={titleRef}
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm outline-none transition-colors duration-150 focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as PrayerCategory)}
          className="rounded-md border px-3 py-2 text-sm outline-none transition-colors duration-150 focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
        >
          {PRAYER_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Tags (comma-separated)"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm outline-none transition-colors duration-150 focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
        />

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={favorite}
            onChange={(e) => setFavorite(e.target.checked)}
            className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-400"
          />
          Mark as favorite
        </label>

        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Write your prayer here..."
          rows={8}
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
            onClick={handleSave}
            disabled={!title.trim()}
            busyLabel="Saving…"
            className="rounded-md btn-stained px-4 py-2 text-sm transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save
          </AsyncButton>
        </div>
      </div>
    </div>
  );
}
