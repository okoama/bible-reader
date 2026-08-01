import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Note } from '../../../types';
import { NoteRepository } from '../../../lib/repositories/NoteRepository';
import { createId } from '../../../lib/utils/id';
import { useDraft } from '../../../lib/hooks/useDraft';
import RichTextEditor from './RichTextEditor';
import ProjectPicker from '../../projects/components/ProjectPicker';
import AsyncButton from '../../shared/components/AsyncButton';

const noteRepository = new NoteRepository();

const PRESET_TAGS = ['grace', 'prayer', 'study', 'important', 'christology'];

type NoteEditorProps = {
  note?: Note;
  sourceReference: string;
  onSave: (note: Note) => void;
  onCancel: () => void;
  initialProjectId?: string;
};

export default function NoteEditor({
  note,
  sourceReference,
  onSave,
  onCancel,
  initialProjectId,
}: NoteEditorProps) {
  const draftKey = note?.id ? `note:${note.id}` : `note:new:${sourceReference}`;
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [tags, setTags] = useState<string[]>(note?.tags ?? []);
  const [favorite, setFavorite] = useState(note?.favorite ?? false);
  const [tagInput, setTagInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allUsedTags, setAllUsedTags] = useState<string[]>([]);
  const [projectId, setProjectId] = useState<string | undefined>(initialProjectId);
  const titleRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

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
    let isActive = true;
    noteRepository.findAllTags().then((t) => {
      if (isActive) setAllUsedTags(t);
    });
    return () => { isActive = false; };
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        e.target !== tagInputRef.current
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestions = useMemo(() => {
    const lower = tagInput.toLowerCase();
    const existing = new Set(tags);

    const allAvailable = [...new Set([...PRESET_TAGS, ...allUsedTags])];

    return allAvailable
      .filter((t) => !existing.has(t))
      .filter((t) => lower === '' || t.toLowerCase().includes(lower));
  }, [tagInput, tags, allUsedTags]);

  function addTag(tag: string) {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) setTags([...tags, trimmed]);
    setTagInput('');
    setShowSuggestions(false);
    tagInputRef.current?.focus();
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function handleTagKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInput.trim()) {
        addTag(tagInput);
      }
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onCancel();
  };

  const handleSave = async () => {
    const now = new Date().toISOString();

    const saved: Note = {
      id: note?.id ?? createId('note'),
      sourceReference,
      title,
      content,
      tags,
      favorite,
      projectId,
      createdAt: note?.createdAt ?? now,
      updatedAt: now,
    };

    if (note) {
      await noteRepository.update(saved);
    } else {
      await noteRepository.create(saved);
    }

    clearDraft();
    onSave(saved);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in" onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-label={note ? 'Edit note' : 'New note'}>
      <div className="mx-4 flex w-full max-w-lg flex-col gap-4 rounded-lg bg-card border border-theme p-6 shadow-xl animate-slide-up">
        <h2 className="text-lg font-semibold">
          {note ? 'Edit Note' : 'New Note'}
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

        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Write your note here..."
          rows={6}
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

        <div className="relative">
          <label className="mb-1 block text-xs font-medium opacity-70">Tags</label>
          <div className="flex flex-wrap gap-1 rounded border px-2 py-1.5 focus-within:border-blue-500">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded bg-accent-lighter px-2 py-0.5 text-xs text-accent"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-accent hover:text-accent-hover"
                >
                  &times;
                </button>
              </span>
            ))}
            <input
              ref={tagInputRef}
              type="text"
              placeholder={tags.length === 0 ? 'Add tags...' : ''}
              value={tagInput}
              onChange={(e) => {
                setTagInput(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleTagKeyDown}
              className="min-w-[80px] flex-1 bg-transparent text-sm outline-none"
            />
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded border bg-white shadow-lg"
            >
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addTag(s)}
                  className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent-light"
                >
                  <span>{s}</span>
                  {PRESET_TAGS.includes(s) && (
                    <span className="ml-2 text-xs opacity-40">preset</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <ProjectPicker value={projectId} onChange={setProjectId} />

        <p className="text-xs opacity-60">
          Attached to: {sourceReference}
        </p>

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
