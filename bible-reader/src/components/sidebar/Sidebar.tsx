import { useState } from 'react';
import type { BibleBook } from '../../types';
import type { ActiveView } from '../../layouts/AppLayout';

type SidebarProps = {
  books: BibleBook[];
  selectedBook: BibleBook | null;
  onSelectBook: (book: BibleBook) => void;
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
};

export default function Sidebar({
  books,
  selectedBook,
  onSelectBook,
  activeView,
  onSelectView,
}: SidebarProps) {
  const [bibleExpanded, setBibleExpanded] = useState(true);

  return (
    <aside className="w-64 shrink-0 overflow-y-auto border-r p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide opacity-70">
        Library
      </h2>

      <div className="space-y-0.5">
        <button
          type="button"
          onClick={() => setBibleExpanded((prev) => !prev)}
          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm font-medium transition-colors duration-150 hover:bg-gray-100"
          aria-expanded={bibleExpanded}
        >
          <span className={`inline-block text-[10px] transition-transform duration-150 ${bibleExpanded ? 'rotate-90' : ''}`}>
            &#9654;
          </span>
          Bible
        </button>

        {bibleExpanded && (
          <div className="ml-3 space-y-0.5 border-l pl-2">
            {books.map((book) => {
              const isSelected = selectedBook?.id === book.id;

              return (
                <button
                  key={book.id}
                  type="button"
                  onClick={() => onSelectBook(book)}
                  className={`w-full rounded px-3 py-1 text-left text-sm transition-colors duration-150 ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {book.name}
                </button>
              );
            })}
          </div>
        )}

        <div className="rounded px-3 py-1.5 text-sm opacity-30 cursor-not-allowed select-none">Catechism</div>
        <div className="rounded px-3 py-1.5 text-sm opacity-30 cursor-not-allowed select-none">Summa Theologiae</div>
        <div className="rounded px-3 py-1.5 text-sm opacity-30 cursor-not-allowed select-none">Confessions</div>
        <div className="rounded px-3 py-1.5 text-sm opacity-30 cursor-not-allowed select-none">Imitation of Christ</div>
        <div className="rounded px-3 py-1.5 text-sm opacity-30 cursor-not-allowed select-none">Devout Life</div>

        <button
          type="button"
          onClick={() => onSelectView('prayer-journal')}
          className={`w-full rounded px-3 py-1.5 text-left text-sm transition-colors duration-150 ${
            activeView === 'prayer-journal'
              ? 'bg-blue-50 text-blue-700'
              : 'hover:bg-gray-100'
          }`}
        >
          Prayer Journal
        </button>
      </div>
    </aside>
  );
}
