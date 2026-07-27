import { useEffect, useState } from 'react';
import Header from '../components/header/Header';
import Sidebar from '../components/sidebar/Sidebar';
import Reader from '../components/reader/Reader';
import RightPanel from '../components/right-panel/RightPanel';
import StatusBar from '../components/status-bar/StatusBar';
import { BibleService } from '../features/bible/services/BibleService';
import { useReadingProgress } from '../lib/hooks/useReadingProgress';
import { useNotes } from '../lib/hooks/useNotes';
import type { BibleBook, VerseRef } from '../types';

export type ActiveView = 'bible' | 'prayer-journal';

const bibleService = new BibleService();

export default function AppLayout() {
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [notesRefreshKey, setNotesRefreshKey] = useState(0);
  const [selectedVerse, setSelectedVerse] = useState<VerseRef | null>(null);
  const [pendingNavigation, setPendingNavigation] = useState<VerseRef | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('bible');
  const { lastPosition, loaded, savePosition } = useReadingProgress();
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
  };

  const handleSelectView = (view: ActiveView) => {
    setActiveView(view);
    if (view === 'prayer-journal') {
      setSelectedBook(null);
      setSelectedChapter(null);
      setSelectedVerse(null);
    }
  };

  const handleSelectChapter = (chapter: number) => {
    setSelectedChapter(chapter);
    setSelectedVerse(null);
    if (selectedBook) {
      void savePosition(selectedBook.id, chapter);
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          books={books}
          selectedBook={selectedBook}
          onSelectBook={handleSelectBook}
          notes={notes}
          onNavigateToNote={handleNavigateToBookmark}
          activeView={activeView}
          onSelectView={handleSelectView}
        />
        <Reader
          selectedBook={selectedBook}
          selectedChapter={selectedChapter}
          onSelectChapter={handleSelectChapter}
          onSelectVerse={handleSelectVerse}
          onNoteSaved={handleNoteSaved}
          pendingNavigation={pendingNavigation}
          onPendingNavigationClear={handlePendingNavigationClear}
          activeView={activeView}
          prayerRefreshKey={notesRefreshKey}
        />
        {activeView === 'bible' && (
          <RightPanel
            selectedVerse={selectedVerse}
            selectedBook={selectedBook}
            selectedChapter={selectedChapter}
            refreshKey={notesRefreshKey}
            onNoteDeleted={handleNoteDeleted}
            onNavigateToBookmark={handleNavigateToBookmark}
          />
        )}
      </div>

      <StatusBar />
    </div>
  );
}
