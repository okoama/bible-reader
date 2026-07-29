import { useEffect, useState } from 'react';
import Header from '../components/header/Header';
import Sidebar from '../components/sidebar/Sidebar';
import Reader from '../components/reader/Reader';
import RightPanel from '../components/right-panel/RightPanel';
import StatusBar from '../components/status-bar/StatusBar';
import { BibleService } from '../features/bible/services/BibleService';
import { useReadingProgress } from '../lib/hooks/useReadingProgress';
import { useNotes } from '../lib/hooks/useNotes';
import { NoteRepository } from '../lib/repositories/NoteRepository';
import type { BibleBook, Note, PrayerFilter, VerseRef } from '../types';
import NoteViewer from '../components/reader/NoteViewer';
import Dashboard from '../components/dashboard/Dashboard';
import { addRecentlyOpened } from '../lib/utils/recentlyOpened';
import { TextService } from '../features/companion-texts/services/TextService';
import { useStudySession } from '../lib/contexts/StudySessionContext';

export type ActiveView = 'dashboard' | 'bible' | 'prayer-journal' | 'companion-text' | 'favorites' | 'collections';

const bibleService = new BibleService();
const noteRepository = new NoteRepository();

const COMPANION_POSITIONS_KEY = 'companion-positions';

function loadCompanionPositions(): Record<string, string> {
  try {
    const stored = localStorage.getItem(COMPANION_POSITIONS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {};
}

function persistCompanionPositions(positions: Record<string, string>): void {
  try {
    localStorage.setItem(COMPANION_POSITIONS_KEY, JSON.stringify(positions));
  } catch {}
}

export default function AppLayout() {
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [notesRefreshKey, setNotesRefreshKey] = useState(0);
  const [selectedVerse, setSelectedVerse] = useState<VerseRef | null>(null);
  const [pendingNavigation, setPendingNavigation] = useState<VerseRef | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedWorkId, setSelectedWorkId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [companionPositions, setCompanionPositions] = useState<Record<string, string>>(loadCompanionPositions);
  const [prayerFilter, setPrayerFilter] = useState<PrayerFilter>({ type: 'all' });
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const { lastPosition, loaded, savePosition } = useReadingProgress();
  const { session, logVisit } = useStudySession();
  const notes = useNotes(notesRefreshKey);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      const loadedBooks = await bibleService.loadBooks();
      if (isActive) {
        setBooks(loadedBooks);
      }
    };

    void load();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded || !lastPosition || books.length === 0 || selectedBook) {
      return;
    }

    const book = books.find((b) => b.id === lastPosition.bookId);
    if (book) {
      setSelectedBook(book);
      setSelectedChapter(lastPosition.chapter);
    }
  }, [loaded, lastPosition, books, selectedBook]);

  const handleSelectBook = (book: BibleBook) => {
    setActiveView('bible');
    setSelectedBook(book);
    setSelectedChapter(null);
    setSelectedVerse(null);
    addRecentlyOpened({ id: `bible:${book.id}`, label: book.name, subtitle: book.testament, type: 'bible' });
  };

  const handleSelectView = (view: ActiveView) => {
    setActiveView(view);
    if (view === 'prayer-journal') {
      setSelectedBook(null);
      setSelectedChapter(null);
      setSelectedVerse(null);
      setSelectedWorkId(null);
    }
  };

  const handlePrayerFilter = (filter: PrayerFilter) => {
    setPrayerFilter(filter);
  };

  const handleSelectWork = (workId: string, sectionId?: string) => {
    if (activeView === 'companion-text' && selectedWorkId && selectedSectionId) {
      setCompanionPositions((prev) => {
        const next = { ...prev, [selectedWorkId]: selectedSectionId };
        persistCompanionPositions(next);
        return next;
      });
    }

    setActiveView('companion-text');
    setSelectedBook(null);
    setSelectedChapter(null);
    setSelectedVerse(null);
    setSelectedWorkId(workId);

    const targetSectionId = sectionId ?? companionPositions[workId] ?? null;
    setSelectedSectionId(targetSectionId);

    const textService = new TextService();
    const manifest = textService.getManifestEntry(workId);
    addRecentlyOpened({ id: `${workId}${targetSectionId ? `:${targetSectionId}` : ''}`, label: manifest?.name ?? workId, subtitle: targetSectionId ?? '', type: 'companion' });
  };

  const handleSelectChapter = (chapter: number) => {
    setSelectedChapter(chapter);
    setSelectedVerse(null);
    if (selectedBook) {
      void savePosition(selectedBook.id, chapter);
      addRecentlyOpened({ id: `bible:${selectedBook.id}:${chapter}`, label: selectedBook.name, subtitle: `Chapter ${chapter}`, type: 'bible' });
      if (session && !session.endTime) logVisit(selectedBook.id, String(chapter), `${selectedBook.name} ${chapter}`);
    }
  };

  const handleSelectVerse = (verse: VerseRef) => {
    setSelectedVerse(verse);
  };

  const handleNoteSaved = () => {
    setNotesRefreshKey((k) => k + 1);
  };

  const handleNoteDeleted = () => {
    setNotesRefreshKey((k) => k + 1);
  };

  const handleNavigateToBookmark = (sourceReference: string) => {
    const match = sourceReference.match(/^([^:]+):(\d+):(\d+)/);
    if (!match) return;

    const [, bookId, chapterStr, verseStr] = match;
    const book = books.find((b) => b.id === bookId);
    if (!book) return;

    const target: VerseRef = {
      bookId,
      chapterNumber: Number.parseInt(chapterStr, 10),
      verseNumber: Number.parseInt(verseStr, 10),
    };

    setSelectedBook(book);
    setSelectedChapter(target.chapterNumber);
    setSelectedVerse(target);
    setPendingNavigation(target);
  };

  const handlePendingNavigationClear = () => {
    setPendingNavigation(null);
  };

  const handleSelectSection = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    if (selectedWorkId) {
      setCompanionPositions((prev) => {
        const next = { ...prev, [selectedWorkId]: sectionId };
        persistCompanionPositions(next);
        return next;
      });
      const textService = new TextService();
      const manifest = textService.getManifestEntry(selectedWorkId);
      addRecentlyOpened({ id: `${selectedWorkId}:${sectionId}`, label: manifest?.name ?? selectedWorkId, subtitle: sectionId, type: 'companion' });
      if (session && !session.endTime) logVisit(selectedWorkId, sectionId, `${manifest?.name ?? selectedWorkId} - ${sectionId}`);
    }
  };

  const handleSelectNote = (noteId: string | null) => {
    setSelectedNoteId(noteId);
  };

  const handleCrossLinkNavigate = (type: string, id: string) => {
    switch (type) {
      case 'note':
        void noteRepository.findById(id).then((n) => { if (n) setViewingNote(n); });
        break;
      case 'prayer':
        setPrayerFilter({ type: 'all' });
        handleSelectView('prayer-journal');
        break;
      case 'collection':
        handleSelectView('collections');
        break;
      case 'passage': {
        const match = id.match(/^([^:]+):(\d+)/);
        if (match) {
          handleSelectWork(match[1], match[2]);
        }
        break;
      }
      case 'article': {
        const parts = id.split(':');
        if (parts.length >= 2) {
          handleSelectWork(parts[0], parts[1]);
        }
        break;
      }
    }
  };

  const handleDeleteSelectedNote = async () => {
    if (!selectedNoteId) return;
    await noteRepository.delete(selectedNoteId);
    setSelectedNoteId(null);
    setNotesRefreshKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          books={books}
          selectedBook={selectedBook}
          onSelectBook={handleSelectBook}
          activeView={activeView}
          onSelectView={handleSelectView}
          selectedWorkId={selectedWorkId}
          selectedSectionId={selectedSectionId}
          onSelectWork={handleSelectWork}
          prayerFilter={prayerFilter}
          onPrayerFilter={handlePrayerFilter}
        />
        {activeView === 'dashboard' ? (
          <Dashboard
            books={books}
            onNavigateToPassage={(bookId, chapter) => {
              const book = books.find((b) => b.id === bookId);
              if (book) {
                setActiveView('bible');
                setSelectedBook(book);
                setSelectedChapter(chapter);
                setSelectedVerse(null);
                void savePosition(bookId, chapter);
              }
            }}
            onSelectView={handleSelectView}
            onNavigateToWork={handleSelectWork}
          />
        ) : (
          <Reader
            selectedBook={selectedBook}
            selectedChapter={selectedChapter}
            selectedVerse={selectedVerse}
            onSelectChapter={handleSelectChapter}
            onSelectVerse={handleSelectVerse}
            onNoteSaved={handleNoteSaved}
            pendingNavigation={pendingNavigation}
            onPendingNavigationClear={handlePendingNavigationClear}
            activeView={activeView}
            selectedWorkId={selectedWorkId}
            selectedSectionId={selectedSectionId}
            onSelectWork={handleSelectWork}
            onSelectSection={handleSelectSection}
            prayerRefreshKey={notesRefreshKey}
            prayerFilter={prayerFilter}
            selectedNoteId={selectedNoteId}
            onSelectNote={handleSelectNote}
            onDeleteSelectedNote={handleDeleteSelectedNote}
            onCrossLinkNavigate={handleCrossLinkNavigate}
          />
        )}
        {(activeView === 'bible' || activeView === 'companion-text') && (
          <RightPanel
            selectedVerse={selectedVerse}
            selectedBook={selectedBook}
            selectedChapter={selectedChapter}
            notes={notes}
            books={books}
            refreshKey={notesRefreshKey}
            onNoteDeleted={handleNoteDeleted}
            onNavigateToBookmark={handleNavigateToBookmark}
            onNavigateToNote={handleNavigateToBookmark}
            selectedNoteId={selectedNoteId}
            onSelectNote={handleSelectNote}
            workId={activeView === 'companion-text' ? selectedWorkId : null}
            sectionId={activeView === 'companion-text' ? selectedSectionId : null}
          />
        )}
      </div>

      <StatusBar />

      {viewingNote && (
        <NoteViewer
          note={viewingNote}
          onClose={() => setViewingNote(null)}
          onCrossLinkNavigate={handleCrossLinkNavigate}
        />
      )}
    </div>
  );
}
