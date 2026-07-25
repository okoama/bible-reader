import { useState } from 'react';
import Header from '../components/header/Header';
import Sidebar from '../components/sidebar/Sidebar';
import Reader from '../components/reader/Reader';
import RightPanel from '../components/right-panel/RightPanel';
import StatusBar from '../components/status-bar/StatusBar';
import type { BibleBook } from '../types';

export default function AppLayout() {
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar selectedBook={selectedBook} onSelectBook={setSelectedBook} />
        <Reader selectedBook={selectedBook} />
        <RightPanel />
      </div>

      <StatusBar />
    </div>
  );
}