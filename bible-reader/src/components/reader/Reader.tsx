import { useCallback, useEffect, useRef, useState } from 'react';
import { BibleService } from '../../features/bible/services/BibleService';
import { useTextSelection } from '../../features/annotations/hooks/useTextSelection';
import type { SelectedVerse } from '../../features/annotations/hooks/useTextSelection';
import type { BibleBook, BibleChapter, BibleVerse, Highlight, Note, VerseRef } from '../../types';
import type { ActiveView } from '../../layouts/AppLayout';
import { HighlightRepository } from '../../lib/repositories/HighlightRepository';
import { BookmarkEditor } from '../../features/bookmarks';
import { useHighlights } from '../../lib/hooks/useHighlights';
import { useChapterNotes } from '../../lib/hooks/useChapterNotes';
import { createId } from '../../lib/utils/id';
import AnnotationToolbar from '../AnnotationToolbar';
import NoteEditor from '../../features/notes/components/NoteEditor';
import PrayerJournal from './PrayerJournal';

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
  pendingNavigation: VerseRef | null;
  onPendingNavigationClear: () => void;
  activeView: ActiveView;
  prayerRefreshKey: number;
  selectedNoteId: string | null;
  onSelectNote: (noteId: string | null) => void;
  onDeleteSelectedNote: () => void;
};

export default function Reader({
  selectedBook,
  selectedChapter,
  selectedVerse,
  onSelectChapter,
  onSelectVerse,
  onNoteSaved,
  pendingNavigation,
  onPendingNavigationClear,
  activeView,
  prayerRefreshKey,
  selectedNoteId,
  onSelectNote,
  onDeleteSelectedNote,
}: ReaderProps) {
  const [chapters, setChapters] = useState<BibleChapter[]>([]);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const verseRefs = useRef<Map<string, HTMLParagraphElement>>(new Map());
  const [refreshKey, setRefreshKey] = useState(0);
  const [modalSourceRef, setModalSourceRef] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [bookmarkModalSourceRef, setBookmarkModalSourceRef] = useState<string | null>(null);
  const { selection, clearSelection } = useTextSelection(containerElement);
  const highlights = useHighlights(selectedBook?.id ?? null, selectedChapter, refreshKey);
  const chapterNotes = useChapterNotes(selectedBook?.id ?? null, selectedChapter, refreshKey);

  const verseRefCallback = useCallback((key: string) => {
    return (node: HTMLParagraphElement | null) => {
      if (node) {
        verseRefs.current.set(key, node);
      } else {
        verseRefs.current.delete(key);
      }
    };
  }, []);

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
    onSelectNote(note.id);
  }

  function handleVerseClick(verseNumber: number) {
    if (selectedBook && selectedChapter) {
      onSelectVerse({ bookId: selectedBook.id, chapterNumber: selectedChapter, verseNumber });
    }
  }

  const handleHighlight = async (text: string, selectedVerses: SelectedVerse[], color: string) => {
    const first = selectedVerses[0];
    const last = selectedVerses[selectedVerses.length - 1];
    const sourceReference = `${first.bookId}:${first.chapterNumber}:${first.verseNumber}-${last.verseNumber}`;

    await highlightRepository.create({
      id: createId('hl'),
      sourceReference,
      color,
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
    const first = verses[0];
    const last = verses[verses.length - 1];
    const sourceReference = `${first.bookId}:${first.chapterNumber}:${first.verseNumber}-${last.verseNumber}`;

    setBookmarkModalSourceRef(sourceReference);
    clearSelection();
  };

  const handleBookmarkSave = () => {
    setBookmarkModalSourceRef(null);
    setRefreshKey((k) => k + 1);
    onNoteSaved?.();
  };

  const handleBookmarkCancel = () => {
    setBookmarkModalSourceRef(null);
  };

  const handlePrayerRefresh = () => {
    onNoteSaved?.();
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

      if (isActive) {
        setVerses([]);
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

  useEffect(() => {
    if (!pendingNavigation || verses.length === 0) return;

    const key = `${pendingNavigation.bookId}:${pendingNavigation.chapterNumber}:${pendingNavigation.verseNumber}`;
    const el = verseRefs.current.get(key);

    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      onPendingNavigationClear();
    }
  }, [pendingNavigation, verses, onPendingNavigationClear]);

  useEffect(() => {
    const isInputFocused = () => {
      const el = document.activeElement;
      return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInputFocused()) return;

      const ctrl = e.ctrlKey || e.metaKey;

      if (e.key === 'Escape') {
        if (modalSourceRef) {
          handleNoteCancel();
        } else if (bookmarkModalSourceRef) {
          handleBookmarkCancel();
        } else if (selection) {
          clearSelection();
        }
        return;
      }

      if (ctrl && e.key === 'b') {
        e.preventDefault();
        if (selection) {
          handleBookmark(selection.verses);
        } else if (selectedBook && selectedChapter && selectedVerse) {
          handleBookmark([{
            bookId: selectedBook.id,
            chapterNumber: selectedChapter,
            verseNumber: selectedVerse.verseNumber,
          }]);
        }
        return;
      }

      if (ctrl && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        if (selection) {
          handleNote(selection.text, selection.verses);
        } else if (selectedBook && selectedChapter && selectedVerse) {
          const sourceReference = `${selectedBook.id}:${selectedChapter}:${selectedVerse.verseNumber}`;
          setEditingNote(null);
          setModalSourceRef(sourceReference);
        }
        return;
      }

      if (e.key === 'Delete' && selectedNoteId) {
        e.preventDefault();
        onDeleteSelectedNote();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    selection, modalSourceRef, bookmarkModalSourceRef, selectedNoteId,
    selectedBook, selectedChapter, selectedVerse,
    handleBookmark, handleNote, handleNoteCancel, handleBookmarkCancel,
    clearSelection, onDeleteSelectedNote, onSelectNote,
  ]);

  return (
    <main ref={mainRef} className="flex-1 overflow-y-auto p-6">
      {activeView === 'prayer-journal' ? (
        <div className="mx-auto max-w-3xl rounded-lg border p-6 animate-fade-in">
          <PrayerJournal refreshKey={prayerRefreshKey} onRefresh={handlePrayerRefresh} />
        </div>
      ) : (
        <div className="mx-auto max-w-3xl rounded-lg border p-6">
          {selectedBook ? (
            <div>
              <h2 className="text-2xl font-semibold">{selectedBook.name}</h2>
              <p className="mt-1 text-sm opacity-60">
                {selectedBook.testament}
              </p>

              <div className="mt-6">
                <h3 className="mb-2 font-semibold">Chapters</h3>
                <div className="flex flex-wrap gap-1.5">
                  {chapters.map((chapter) => {
                    const chapterNumber = chapter.chapterNumber;
                    const isSelected = selectedChapter === chapterNumber;

                    return (
                      <button
                        key={chapterNumber}
                        type="button"
                        onClick={() => onSelectChapter(chapterNumber)}
                        className={`rounded-md px-3 py-1.5 text-sm transition-colors duration-150 ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'border hover:bg-gray-100'
                        }`}
                      >
                        {chapterNumber}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedChapter && verses.length > 0 ? (
                <div ref={setContainerElement} className="mt-6 space-y-1">
                  {verses.map((verse) => {
                    const verseHighlights = getHighlightsForVerse(highlights, verse.verseNumber);

                    return (
                      <p
                        key={verse.verseNumber}
                        ref={verseRefCallback(`${selectedBook.id}:${selectedChapter}:${verse.verseNumber}`)}
                        className={`cursor-pointer leading-relaxed rounded px-1 -mx-1 transition-colors duration-100 ${
                          selectedVerse?.verseNumber === verse.verseNumber
                            ? 'bg-blue-50'
                            : 'hover:bg-gray-50'
                        }`}
                        data-book={selectedBook.id}
                        data-chapter={selectedChapter}
                        data-verse={verse.verseNumber}
                        onClick={() => handleVerseClick(verse.verseNumber)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') handleVerseClick(verse.verseNumber);
                        }}
                      >
                        <span className="mr-1 text-xs font-semibold align-super text-blue-600">
                          {verse.verseNumber}
                        </span>
                        {getVerseNotes(verse.verseNumber).map((note) => (
                          <button
                            key={note.id}
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleNoteIndicatorClick(note); }}
                            title={note.title}
                            className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-500 align-super transition-transform duration-150 hover:scale-150"
                          />
                        ))}
                        {renderVerseText(verse.text, verseHighlights)}
                      </p>
                    );
                  })}
                </div>
              ) : selectedChapter ? (
                <div className="mt-8 flex items-center justify-center gap-2 text-sm opacity-60">
                  <svg className="h-4 w-4 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.07-5.07l-2.83 2.83M9.76 14.24l-2.83 2.83m11.14 0l-2.83-2.83M9.76 9.76L6.93 6.93" />
                  </svg>
                  Loading...
                </div>
              ) : (
                <p className="mt-4 opacity-60">Select a chapter to read.</p>
              )}
            </div>
          ) : (
            <div className="py-12 text-center">
              <h2 className="text-2xl font-semibold">Welcome to Catholic Study Desk</h2>
              <p className="mt-3 opacity-60">
                Select a work from the Library to begin reading.
              </p>
            </div>
          )}
        </div>
      )}

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

      {bookmarkModalSourceRef && (
        <BookmarkEditor
          sourceReference={bookmarkModalSourceRef}
          onSave={handleBookmarkSave}
          onCancel={handleBookmarkCancel}
        />
      )}
    </main>
  );
}
