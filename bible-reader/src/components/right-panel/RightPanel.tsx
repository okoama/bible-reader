import { useState } from 'react';
import type { BibleBook, Note, VerseRef } from '../../types';
import { useHighlights } from '../../lib/hooks/useHighlights';
import { useChapterNotes } from '../../lib/hooks/useChapterNotes';
import { useBookmarks } from '../../lib/hooks/useBookmarks';
import { NoteRepository } from '../../lib/repositories/NoteRepository';
import { formatDate } from '../../lib/utils/date';
import ConfirmDialog from '../ConfirmDialog';

const noteRepository = new NoteRepository();

type RightPanelProps = {
  selectedVerse: VerseRef | null;
  selectedBook: BibleBook | null;
  selectedChapter: number | null;
  refreshKey: number;
  onNoteDeleted: () => void;
};

function coversVerse(sourceReference: string, verseNumber: number): boolean {
  const match = sourceReference.match(/^[^:]+:\d+:(\d+)(?:-(\d+))?$/);
  if (!match) return false;
  const start = Number.parseInt(match[1], 10);
  const end = match[2] ? Number.parseInt(match[2], 10) : start;
  return verseNumber >= start && verseNumber <= end;
}

export default function RightPanel({
  selectedVerse,
  selectedBook,
  selectedChapter,
  refreshKey,
  onNoteDeleted,
}: RightPanelProps) {
  const [deletingNote, setDeletingNote] = useState<Note | null>(null);
  const highlights = useHighlights(selectedBook?.id ?? null, selectedChapter, refreshKey);
  const notes = useChapterNotes(selectedBook?.id ?? null, selectedChapter, refreshKey);
  const bookmarks = useBookmarks(selectedBook?.id ?? null, selectedChapter, refreshKey);

  async function handleConfirmDelete() {
    if (!deletingNote) return;
    await noteRepository.delete(deletingNote.id);
    setDeletingNote(null);
    onNoteDeleted();
  }

  const verseNumber = selectedVerse?.verseNumber ?? null;

  const verseHighlights = verseNumber !== null
    ? highlights.filter((h) => coversVerse(h.sourceReference, verseNumber))
    : [];

  const verseNotes = verseNumber !== null
    ? notes.filter((n) => coversVerse(n.sourceReference, verseNumber))
    : [];

  const verseBookmarks = verseNumber !== null
    ? bookmarks.filter((b) => coversVerse(b.sourceReference, verseNumber))
    : [];

  const hasSelection = selectedVerse !== null;

  return (
    <aside className="w-72 shrink-0 border-l p-4 overflow-y-auto">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide opacity-70">
        Passage
      </h2>

      {hasSelection ? (
        <div className="space-y-4">
          <div className="rounded border p-3">
            <p className="font-semibold">
              {selectedBook?.name} {selectedChapter}:{verseNumber}
            </p>
          </div>

          {verseHighlights.length > 0 && (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-60">
                Highlights
              </h3>
              <div className="space-y-2">
                {verseHighlights.map((h) => (
                  <div key={h.id} className="rounded border p-2">
                    <p className="text-sm" style={{ borderLeft: `3px solid ${h.color}`, paddingLeft: 8 }}>
                      {h.selectedText}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {verseNotes.length > 0 && (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-60">
                Notes
              </h3>
              <div className="space-y-2">
                {verseNotes.map((note) => (
                  <div key={note.id} className="rounded border p-2">
                    <div className="flex items-start justify-between">
                      <p className="font-medium text-sm">{note.title}</p>
                      <button
                        type="button"
                        onClick={() => setDeletingNote(note)}
                        className="ml-2 shrink-0 text-xs text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                    {note.content && (
                      <p className="mt-1 text-xs opacity-80">{note.content}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {verseBookmarks.length > 0 && (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-60">
                Bookmarks
              </h3>
              <div className="space-y-2">
                {verseBookmarks.map((b) => (
                  <div key={b.id} className="rounded border p-2">
                    <p className="text-sm font-medium">{b.title ?? 'Bookmark'}</p>
                    <p className="mt-1 text-xs opacity-60">{formatDate(b.createdAt)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {verseHighlights.length === 0 && verseNotes.length === 0 && verseBookmarks.length === 0 && (
            <p className="text-sm opacity-60">
              No annotations on this verse yet.
            </p>
          )}
        </div>
      ) : (
        <div className="rounded border p-4">
          <p className="font-medium">No verse selected</p>
          <p className="mt-2 text-sm opacity-80">
            Click a verse to see highlights, notes, and bookmarks.
          </p>
        </div>
      )}
      {deletingNote && (
        <ConfirmDialog
          message={`Delete note "${deletingNote.title}"?`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingNote(null)}
        />
      )}
    </aside>
  );
}
