import { useCallback, useEffect, useRef, useState } from 'react';
import { BibleService } from '../../features/bible/services/BibleService';
import { useTextSelection } from '../../features/annotations/hooks/useTextSelection';
import type { SelectedVerse } from '../../features/annotations/hooks/useTextSelection';
import type { BibleBook, BibleVerse, Bookmark, Collection, CollectionItem, Highlight, Note, PrayerFilter, VerseRef } from '../../types';
import type { ActiveView } from '../../layouts/AppLayout';
import { CollectionRepository } from '../../lib/repositories/CollectionRepository';
import { HighlightRepository } from '../../lib/repositories/HighlightRepository';
import { BookmarkEditor } from '../../features/bookmarks';
import { useHighlights } from '../../lib/hooks/useHighlights';
import { useChapterNotes } from '../../lib/hooks/useChapterNotes';
import { createId } from '../../lib/utils/id';
import { useStudySession } from '../../lib/contexts/StudySessionContext';
import AnnotationToolbar from '../AnnotationToolbar';
import NoteEditor from '../../features/notes/components/NoteEditor';
import PrayerLibrary from './PrayerLibrary';
import FavoritesPage from './FavoritesPage';
import CollectionsPage from './CollectionsPage';
import CollectionViewer from './CollectionViewer';
import CollectionEditor from './CollectionEditor';
import ContentReader from './ContentReader';

import CompanionTextReader from './CompanionTextReader';

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
  selectedWorkId: string | null;
  selectedSectionId: string | null;
  onSelectWork: (workId: string, sectionId?: string) => void;
  onSelectSection?: (sectionId: string) => void;
  prayerRefreshKey: number;
  selectedNoteId: string | null;
  onSelectNote: (noteId: string | null) => void;
  onDeleteSelectedNote: () => void;
  prayerFilter: PrayerFilter;
  onCrossLinkNavigate?: (type: string, id: string) => void;
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
  selectedWorkId,
  selectedSectionId,
  onSelectWork: _onSelectWork,
  onSelectSection,
  prayerRefreshKey,
  selectedNoteId,
  onSelectNote,
  onDeleteSelectedNote,
  prayerFilter,
  onCrossLinkNavigate,
}: ReaderProps) {
  const [chapterNumbers, setChapterNumbers] = useState<number[]>([]);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const verseRefs = useRef<Map<string, HTMLParagraphElement>>(new Map());
  const [refreshKey, setRefreshKey] = useState(0);
  const [collectionsRefreshKey, setCollectionsRefreshKey] = useState(0);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [showCollectionEditor, setShowCollectionEditor] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [modalSourceRef, setModalSourceRef] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [bookmarkModalSourceRef, setBookmarkModalSourceRef] = useState<string | null>(null);
  const { selection, clearSelection } = useTextSelection(containerElement);
  const highlights = useHighlights(selectedBook?.id ?? null, selectedChapter, refreshKey);
  const chapterNotes = useChapterNotes(selectedBook?.id ?? null, selectedChapter, refreshKey);
  const { session, logNote, logBookmark, logCollectionEvent } = useStudySession();

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

  const handleNote = (_text: string, verses: SelectedVerse[]) => {
    const first = verses[0];
    const last = verses[verses.length - 1];
    const sourceReference = `${first.bookId}:${first.chapterNumber}:${first.verseNumber}-${last.verseNumber}`;

    setEditingNote(null);
    setModalSourceRef(sourceReference);
    clearSelection();
  };

  const handleNoteSave = (savedNote?: Note) => {
    setEditingNote(null);
    setModalSourceRef(null);
    setRefreshKey((k) => k + 1);
    onNoteSaved?.();
    if (savedNote && session && !session.endTime) logNote(savedNote.id, savedNote.title, savedNote.sourceReference);
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

  const handleBookmarkSave = (savedBookmark?: Bookmark) => {
    setBookmarkModalSourceRef(null);
    setRefreshKey((k) => k + 1);
    onNoteSaved?.();
    if (savedBookmark && session && !session.endTime) logBookmark(savedBookmark.id, savedBookmark.sourceReference, savedBookmark.title ?? savedBookmark.sourceReference);
  };

  const handleBookmarkCancel = () => {
    setBookmarkModalSourceRef(null);
  };

  const handlePrayerRefresh = () => {
    onNoteSaved?.();
  };

  const collectionRepo = new CollectionRepository();

  const handleSelectCollection = (id: string) => {
    setSelectedCollectionId(id);
  };

  const handleBackToCollections = () => {
    setSelectedCollectionId(null);
  };

  const handleNewCollection = () => {
    setEditingCollection(null);
    setShowCollectionEditor(true);
  };

  const handleEditCollection = (col: Collection) => {
    setEditingCollection(col);
    setShowCollectionEditor(true);
  };

  const handleSaveCollection = async (name: string, description: string) => {
    if (editingCollection) {
      await collectionRepo.update({ ...editingCollection, name, description });
      setShowCollectionEditor(false);
      setEditingCollection(null);
      if (session && !session.endTime) logCollectionEvent(editingCollection.id, name, 'update');
    } else {
      const id = await collectionRepo.create(name, description || undefined);
      setShowCollectionEditor(false);
      if (session && !session.endTime) logCollectionEvent(id, name, 'create');
    }
    setCollectionsRefreshKey((k) => k + 1);
  };

  const handleDeleteCollection = async (id: string) => {
    await collectionRepo.delete(id);
    setSelectedCollectionId(null);
    setCollectionsRefreshKey((k) => k + 1);
  };

  const handleNavigateToCollectionItem = (item: CollectionItem) => {
    if (item.type === 'passage' && item.sourceReference) {
      const match = item.sourceReference.match(/^([^:]+):(\d+)/);
      if (match && match[1] && match[2]) {
        setSelectedCollectionId(null);
        _onSelectWork(match[1], match[2]);
      }
    }
  };

  const handleNavigateToPassage = (sourceReference: string) => {
    const match = sourceReference.match(/^([^:]+):(\d+)/);
    if (match && match[1] && match[2]) {
      setSelectedCollectionId(null);
      _onSelectWork(match[1], match[2]);
    }
  };

  useEffect(() => {
    let isActive = true;

    const loadChapters = async () => {
      if (!selectedBook) {
        if (isActive) {
          setChapterNumbers([]);
          setVerses([]);
        }
        return;
      }

      const loadedChapters = await bibleService.loadChapters(selectedBook.id);

      if (isActive) {
        setChapterNumbers(loadedChapters.map((c) => c.chapterNumber));
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

  const chapterSections = chapterNumbers.map((n) => ({ id: String(n), label: String(n) }));
  const isLoading = selectedBook && selectedChapter && verses.length === 0;

  return (
    <main ref={mainRef} className="flex-1 overflow-y-auto p-6">
      {activeView === 'favorites' ? (
        <div className="mx-auto max-w-3xl animate-fade-in">
          <FavoritesPage refreshKey={prayerRefreshKey} onRefresh={handlePrayerRefresh} onCrossLinkNavigate={onCrossLinkNavigate} />
        </div>
      ) : activeView === 'prayer-journal' ? (
        <div className="mx-auto max-w-3xl rounded-lg border p-6 animate-fade-in">
          <PrayerLibrary filter={prayerFilter} refreshKey={prayerRefreshKey} onRefresh={handlePrayerRefresh} />
        </div>
      ) : activeView === 'companion-text' && selectedWorkId ? (
        <div className="animate-fade-in">
          <CompanionTextReader workId={selectedWorkId} initialSectionId={selectedSectionId} onSectionChange={onSelectSection} />
        </div>
      ) : activeView === 'collections' && selectedCollectionId ? (
        <CollectionViewer
          collectionId={selectedCollectionId}
          refreshKey={collectionsRefreshKey}
          onNavigateToItem={handleNavigateToCollectionItem}
          onNavigateToPassage={handleNavigateToPassage}
          onBack={handleBackToCollections}
          onEdit={handleEditCollection}
          onDelete={handleDeleteCollection}
          onCrossLinkNavigate={onCrossLinkNavigate}
        />
      ) : activeView === 'collections' ? (
        <CollectionsPage
          refreshKey={collectionsRefreshKey}
          onSelectCollection={handleSelectCollection}
          onNewCollection={handleNewCollection}
        />
      ) : selectedBook ? (
        <ContentReader
          title={selectedBook.name}
          subtitle={selectedBook.testament}
          sections={chapterSections}
          currentSectionId={selectedChapter ? String(selectedChapter) : null}
          onSelectSection={(id) => onSelectChapter(Number.parseInt(id, 10))}
          loading={!!isLoading}
        >
          <div ref={setContainerElement} className="animate-fade-in space-y-1">
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
        </ContentReader>
      ) : (
        <div className="mx-auto max-w-3xl rounded-lg border p-6">
          <div className="py-12 text-center">
            <h2 className="text-2xl font-semibold">Welcome to Catholic Study Desk</h2>
            <p className="mt-3 opacity-60">
              Select a work from the Library to begin reading.
            </p>
          </div>
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

      {showCollectionEditor && (
        <CollectionEditor
          collection={editingCollection ?? undefined}
          onSave={handleSaveCollection}
          onCancel={() => { setShowCollectionEditor(false); setEditingCollection(null); }}
        />
      )}
    </main>
  );
}
