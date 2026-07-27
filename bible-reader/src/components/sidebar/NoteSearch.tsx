import { useMemo, useState } from 'react';
import type { Note } from '../../types';
import { truncateText } from '../../lib/utils/text';

type NoteSearchProps = {
  notes: Note[];
  onNavigate: (sourceReference: string) => void;
};

export default function NoteSearch({ notes, onNavigate }: NoteSearchProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return notes;

    const lower = query.toLowerCase();
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(lower) ||
        n.content.toLowerCase().includes(lower) ||
        n.tags.some((t) => t.toLowerCase().includes(lower)),
    );
  }, [notes, query]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search notes…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-3 w-full rounded border px-3 py-2 text-sm outline-none focus:border-blue-500"
      />

      <div className="space-y-2">
        {filtered.map((note) => (
          <button
            key={note.id}
            type="button"
            onClick={() => onNavigate(note.sourceReference)}
            className="w-full rounded border px-3 py-2 text-left text-sm hover:bg-gray-50"
          >
            <p className="font-medium">{note.title || 'Untitled'}</p>
            <p className="mt-1 text-xs opacity-60">{note.sourceReference}</p>
            {note.content && (
              <p className="mt-1 text-xs opacity-80">{truncateText(note.content, 60)}</p>
            )}
            {note.tags.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {note.tags.map((tag) => (
                  <span key={tag} className="rounded bg-gray-100 px-1.5 py-0.5 text-xs opacity-70">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </button>
        ))}

        {notes.length === 0 && (
          <p className="text-xs opacity-60">No notes yet. Select text and click Note to create one.</p>
        )}

        {query.trim() && filtered.length === 0 && notes.length > 0 && (
          <p className="text-xs opacity-60">No matching notes.</p>
        )}
      </div>
    </div>
  );
}
