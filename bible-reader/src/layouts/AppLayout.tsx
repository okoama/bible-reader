import { useState } from 'react';
import Header from '../components/header/Header';
import Sidebar from '../components/sidebar/Sidebar';
import Reader from '../components/reader/Reader';
import RightPanel from '../components/right-panel/RightPanel';
import StatusBar from '../components/status-bar/StatusBar';
import type { BibleBook } from '../types';

export default function AppLayout() {
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);

  const handleSelectBook = (book: BibleBook) => {
    setSelectedBook(book);
    setSelectedChapter(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar selectedBook={selectedBook} onSelectBook={handleSelectBook} />
        <Reader
          selectedBook={selectedBook}
          selectedChapter={selectedChapter}
          onSelectChapter={setSelectedChapter}
        />
        <RightPanel />
      </div>

      <StatusBar />
    </div>
  );
}