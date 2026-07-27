import { useEffect, useState } from 'react';
import { BibleService } from '../../features/bible/services/BibleService';
import { useTextSelection } from '../../features/annotations/hooks/useTextSelection';
import type { SelectedVerse } from '../../features/annotations/hooks/useTextSelection';
import type { BibleBook, BibleChapter, BibleVerse, Highlight, Note, VerseRef } from '../../types';
import { HighlightRepository } from '../../lib/repositories/HighlightRepository';
import { useHighlights } from '../../lib/hooks/useHighlights';
import { useChapterNotes } from '../../lib/hooks/useChapterNotes';
import { createId } from '../../lib/utils/id';
import AnnotationToolbar from '../AnnotationToolbar';
import NoteEditor from '../../features/notes/components/NoteEditor';

const bibleService = new BibleService();
const highlightRepository = new HighlightRepository();

function getHighlightsForVerse(highlights: Highlight[], verseNumber: number): Highlight[] {
  return highlights.filter((h) => {
    const match = h.sourceReference.match(/^[^:]+:\d+:(\d+)(?:-(\d+))?$/);
    if (!match) return false;
    const start = Number.parseInt(match[1], 10);
    const end = match[2] ? Number.parseInt(match[2], 10) : start;
    return verseNumber >= start && verseNumber <= end;
  });
}

function renderVerseText(text: string, verseHighlights: Highlight[]): React.ReactNode {
  if (verseHighlights.length === 0) {
    return text;
  }

  const segments: React.ReactNode[] = [];
  let remaining = text;

  for (const h of verseHighlights) {
    const idx = remaining.indexOf(h.selectedText);
    if (idx === -1) continue;

    if (idx > 0) {
      segments.push(remaining.slice(0, idx));
    }

    segments.push(
      <mark key={h.id} style={{ backgroundColor: h.color }}>
        {remaining.slice(idx, idx + h.selectedText.length)}
      </mark>,
    );

    remaining = remaining.slice(idx + h.selectedText.length);
  }

  if (remaining) {
    segments.push(remaining);
  }

  return segments.length > 0 ? segments : text;
}

type ReaderProps = {
  selectedBook: BibleBook | null;
  selectedChapter: number | null;
  selectedVerse: VerseRef | null;
  onSelectChapter: (chapterNumber: number) => void;
  onSelectVerse: (verse: VerseRef) => void;
  onNoteSaved?: () => void;
};

export default function Reader({
  selectedBook,
  selectedChapter,
  selectedVerse,
  onSelectChapter,
  onSelectVerse,
  onNoteSaved,
}: ReaderProps) {
  const [chapters, setChapters] = useState<BibleChapter[]>([]);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [modalSourceRef, setModalSourceRef] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const { selection, clearSelection } = useTextSelection(containerElement);
  const highlights = useHighlights(selectedBook?.id ?? null, selectedChapter, refreshKey);
  const chapterNotes = useChapterNotes(selectedBook?.id ?? null, selectedChapter, refreshKey);

  function getVerseNotes(verseNumber: number): Note[] {
    return chapterNotes.filter((n) => {
      const match = n.sourceReference.match(/^[^:]+:\d+:(\d+)(?:-(\d+))?$/);
      if (!match) return false;
      const start = Number.parseInt(match[1], 10);
      const end = match[2] ? Number.parseInt(match[2], 10) : start;
      return verseNumber >= start && verseNumber <= end;
    });
  }

  function handleNoteIndicatorClick(note: Note) {
    setEditingNote(note);
    setModalSourceRef(note.sourceReference);
  }

  function handleVerseClick(verseNumber: number) {
    if (selectedBook && selectedChapter) {
      onSelectVerse({ bookId: selectedBook.id, chapterNumber: selectedChapter, verseNumber });
    }
  }

  const handleHighlight = async (text: string, selectedVerses: SelectedVerse[]) => {
    const first = selectedVerses[0];
    const last = selectedVerses[selectedVerses.length - 1];
    const sourceReference = `${first.bookId}:${first.chapterNumber}:${first.verseNumber}-${last.verseNumber}`;

    await highlightRepository.create({
      id: createId('hl'),
      sourceReference,
      color: '#fef08a',
      selectedText: text,
      createdAt: new Date().toISOString(),
    });

    setRefreshKey((k) => k + 1);
    clearSelection();
  };

  const handleNote = (text: string, verses: SelectedVerse[]) => {
    const first = verses[0];
    const last = verses[verses.length - 1];
    const sourceReference = `${first.bookId}:${first.chapterNumber}:${first.verseNumber}-${last.verseNumber}`;

    setEditingNote(null);
    setModalSourceRef(sourceReference);
    clearSelection();
  };

  const handleNoteSave = () => {
    setEditingNote(null);
    setModalSourceRef(null);
    setRefreshKey((k) => k + 1);
    onNoteSaved?.();
  };

  const handleNoteCancel = () => {
    setEditingNote(null);
    setModalSourceRef(null);
  };

  const handleBookmark = (verses: SelectedVerse[]) => {
    console.log('Bookmark:', verses);
    clearSelection();
  };

  useEffect(() => {
    let isActive = true;

    const loadChapters = async () => {
      if (!selectedBook) {
        if (isActive) {
          setChapters([]);
          setVerses([]);
        }
        return;
      }

      const loadedChapters = await bibleService.loadChapters(selectedBook.id);

      if (isActive) {
        setChapters(loadedChapters);
        setVerses([]);
      }
    };

    void loadChapters();

    return () => {
      isActive = false;
    };
  }, [selectedBook]);

  useEffect(() => {
    let isActive = true;

    const loadVerses = async () => {
      if (!selectedBook || !selectedChapter) {
        if (isActive) {
          setVerses([]);
        }
        return;
      }

      const loadedVerses = await bibleService.loadVerses(
        selectedBook.id,
        selectedChapter,
      );

      if (isActive) {
        setVerses(loadedVerses);
      }
    };

    void loadVerses();

    return () => {
      isActive = false;
    };
  }, [selectedBook, selectedChapter]);

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-3xl rounded border p-6">
        {selectedBook ? (
          <div>
            <h2 className="text-2xl font-semibold">{selectedBook.name}</h2>
            <p className="mt-2 opacity-80">
              {selectedBook.testament}
            </p>

            <div className="mt-6">
              <h3 className="mb-3 font-semibold">Chapters</h3>
              <div className="flex flex-wrap gap-2">
                {chapters.map((chapter) => {
                  const chapterNumber = chapter.chapterNumber;
                  const isSelected = selectedChapter === chapterNumber;

                  return (
                    <button
                      key={chapterNumber}
                      type="button"
                      onClick={() => onSelectChapter(chapterNumber)}
                      className={`rounded border px-3 py-2 ${
                        isSelected ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                    >
                      {chapterNumber}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedChapter && verses.length > 0 ? (
              <div ref={setContainerElement} className="mt-6 space-y-2">
                {verses.map((verse) => {
                  const verseHighlights = getHighlightsForVerse(highlights, verse.verseNumber);

                  return (
                    <p
                      key={verse.verseNumber}
                      className={`cursor-pointer leading-relaxed rounded px-1 -mx-1 ${
                        selectedVerse?.verseNumber === verse.verseNumber
                          ? 'bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                      data-book={selectedBook.id}
                      data-chapter={selectedChapter}
                      data-verse={verse.verseNumber}
                      onClick={() => handleVerseClick(verse.verseNumber)}
                    >
                      <span className="mr-1 text-xs font-semibold align-super text-blue-600">
                        {verse.verseNumber}
                      </span>
                      {getVerseNotes(verse.verseNumber).map((note) => (
                        <button
                          key={note.id}
                          type="button"
                          onClick={() => handleNoteIndicatorClick(note)}
                          title={note.title}
                          className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-500 align-super hover:scale-150"
                        />
                      ))}
                      {renderVerseText(verse.text, verseHighlights)}
                    </p>
                  );
                })}
              </div>
            ) : selectedChapter ? (
              <p className="mt-4 opacity-80">Loading…</p>
            ) : (
              <p className="mt-4 opacity-80">Select a chapter to read.</p>
            )}
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Welcome to Catholic Study Desk</h2>
            <p className="mt-4 opacity-80">
              Select a work from the Library to begin reading.
            </p>
          </div>
        )}
      </div>

      {selection && (
        <AnnotationToolbar
          selection={selection}
          onHighlight={handleHighlight}
          onNote={handleNote}
          onBookmark={handleBookmark}
        />
      )}

      {modalSourceRef && (
        <NoteEditor
          key={editingNote?.id ?? 'new'}
          note={editingNote ?? undefined}
          sourceReference={modalSourceRef}
          onSave={handleNoteSave}
          onCancel={handleNoteCancel}
        />
      )}
    </main>
  );
}
