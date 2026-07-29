import { useEffect, useRef, useState } from 'react';
import type { Note } from '../../types';
import { NoteRepository } from '../../lib/repositories/NoteRepository';
import { stripHtml } from '../../lib/utils/text';

const noteRepository = new NoteRepository();

type Props = {
  onSelectNote: (noteId: string) => void;
  onClose: () => void;
};

export default function GlobalSearchModal({ onSelectNote, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Note[]>([]);
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    noteRepository.findAll().then(setAllNotes);
  }, []);

  useEffect(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      setResults([]);
      return;
    }
    setResults(
      allNotes.filter((n) => {
        const title = n.title.toLowerCase();
        const content = stripHtml(n.content).toLowerCase();
        const tags = n.tags.some((t) => t.toLowerCase().includes(q));
        return title.includes(q) || content.includes(q) || tags;
      }).slice(0, 50),
    );
  }, [query, allNotes]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    inputRef.current?.focus();
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-[15vh]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="mx-4 w-full max-w-lg rounded-lg border bg-white shadow-lg">
        <div className="border-b p-3">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search notes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm outline-none placeholder:opacity-40"
          />
        </div>
        <div className="max-h-80 overflow-y-auto">
          {query && results.length === 0 && (
            <p className="p-4 text-center text-xs opacity-40">No matching notes found</p>
          )}
          {results.map((note) => (
            <button
              key={note.id}
              type="button"
              className="flex w-full flex-col gap-0.5 px-4 py-2.5 text-left text-sm transition-colors hover:bg-accent-lighter"
              onClick={() => { onSelectNote(note.id); onClose(); }}
            >
              <span className="font-medium">{note.title || 'Untitled'}</span>
              <span className="truncate text-xs opacity-50">{stripHtml(note.content).slice(0, 120)}</span>
              {note.sourceReference && (
                <span className="text-xs opacity-30">{note.sourceReference}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
