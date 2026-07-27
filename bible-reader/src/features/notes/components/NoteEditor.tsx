import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Note } from '../../../types';
import { NoteRepository } from '../../../lib/repositories/NoteRepository';
import { createId } from '../../../lib/utils/id';
import { useDraft } from '../../../lib/hooks/useDraft';
import RichTextEditor from '../../../components/RichTextEditor';

const noteRepository = new NoteRepository();

const PRESET_TAGS = ['grace', 'prayer', 'study', 'important', 'christology'];

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
  const draftKey = note?.id ? `note:${note.id}` : `note:new:${sourceReference}`;
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [tags, setTags] = useState<string[]>(note?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allUsedTags, setAllUsedTags] = useState<string[]>([]);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-label={note ? 'Edit note' : 'New note'}>
      <div className="mx-4 flex w-full max-w-lg flex-col gap-4 rounded-lg border bg-white p-6 shadow-xl">
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
          className="rounded border px-3 py-2 text-sm outline-none focus:border-blue-500"
        />

        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Write your note here..."
          rows={6}
        />

        <div className="relative">
          <label className="mb-1 block text-xs font-medium opacity-70">Tags</label>
          <div className="flex flex-wrap gap-1 rounded border px-2 py-1.5 focus-within:border-blue-500">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-blue-500 hover:text-blue-700"
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
                  className="w-full px-3 py-1.5 text-left text-sm hover:bg-blue-50"
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
