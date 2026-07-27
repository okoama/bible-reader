import type { BibleBook, Note } from '../../types';
import type { ActiveView } from '../../layouts/AppLayout';
import NoteSearch from './NoteSearch';

type SidebarProps = {
  books: BibleBook[];
  selectedBook: BibleBook | null;
  onSelectBook: (book: BibleBook) => void;
  notes: Note[];
  onNavigateToNote: (sourceReference: string) => void;
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
};

export default function Sidebar({
  books,
  selectedBook,
  onSelectBook,
  notes,
  onNavigateToNote,
  activeView,
  onSelectView,
}: SidebarProps) {
  return (
    <aside className="w-64 shrink-0 overflow-y-auto border-r p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide opacity-70">
        Notes
      </h2>
      <NoteSearch notes={notes} books={books} onNavigate={onNavigateToNote} />

      <h2 className="mt-6 mb-3 text-sm font-semibold uppercase tracking-wide opacity-70">
        Library
      </h2>

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => onSelectView('bible')}
          className={`w-full rounded border px-3 py-2 text-left text-sm ${
            activeView === 'bible' && !selectedBook ? 'border-blue-500 bg-blue-50' : ''
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
              className={`w-full rounded border px-3 py-2 text-left text-sm ${
                isSelected ? 'border-blue-500 bg-blue-50' : ''
              }`}
            >
              {book.name}
            </button>
          );
        })}
        <div className="rounded border px-3 py-2 opacity-50">Catechism</div>
        <div className="rounded border px-3 py-2 opacity-50">Summa Theologiae</div>
        <div className="rounded border px-3 py-2 opacity-50">Confessions</div>
        <div className="rounded border px-3 py-2 opacity-50">Imitation of Christ</div>
        <div className="rounded border px-3 py-2 opacity-50">Devout Life</div>
        <button
          type="button"
          onClick={() => onSelectView('prayer-journal')}
          className={`w-full rounded border px-3 py-2 text-left text-sm ${
            activeView === 'prayer-journal' ? 'border-blue-500 bg-blue-50' : ''
          }`}
        >
          Prayer Journal
        </button>
      </div>
    </aside>
  );
}
