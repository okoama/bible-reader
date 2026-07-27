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
  return (
    <aside className="w-64 shrink-0 overflow-y-auto border-r p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide opacity-70">
        Library
      </h2>

      <div className="space-y-1">
        <button
          type="button"
          onClick={() => onSelectView('bible')}
          className={`w-full rounded px-3 py-1.5 text-left text-sm transition-colors duration-150 ${
            activeView === 'bible' && !selectedBook
              ? 'bg-blue-50 text-blue-700'
              : 'hover:bg-gray-100'
          }`}
        >
          Bible
        </button>
        {books.map((book) => {
          const isSelected = selectedBook?.id === book.id;

          return (
            <button
              key={book.id}
              type="button"
              onClick={() => onSelectBook(book)}
              className={`w-full rounded px-3 py-1.5 text-left text-sm transition-colors duration-150 ${
                isSelected
                  ? 'bg-blue-50 text-blue-700'
                  : 'hover:bg-gray-100'
              }`}
            >
              {book.name}
            </button>
          );
        })}
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
