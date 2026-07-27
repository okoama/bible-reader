import { useEffect, useState } from 'react';
import Header from '../components/header/Header';
import Sidebar from '../components/sidebar/Sidebar';
import Reader from '../components/reader/Reader';
import RightPanel from '../components/right-panel/RightPanel';
import StatusBar from '../components/status-bar/StatusBar';
import { BibleService } from '../features/bible/services/BibleService';
import { useReadingProgress } from '../lib/hooks/useReadingProgress';
import type { BibleBook } from '../types';

const bibleService = new BibleService();

export default function AppLayout() {
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const { lastPosition, loaded, savePosition } = useReadingProgress();

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
    setSelectedBook(book);
    setSelectedChapter(null);
  };

  const handleSelectChapter = (chapter: number) => {
    setSelectedChapter(chapter);
    if (selectedBook) {
      void savePosition(selectedBook.id, chapter);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          books={books}
          selectedBook={selectedBook}
          onSelectBook={handleSelectBook}
        />
        <Reader
          selectedBook={selectedBook}
          selectedChapter={selectedChapter}
          onSelectChapter={handleSelectChapter}
        />
        <RightPanel />
      </div>

      <StatusBar />
    </div>
  );
}
