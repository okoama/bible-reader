import type { BibleBook, Note } from '../../types';
import { truncateText } from '../../lib/utils/text';

type SidebarProps = {
  books: BibleBook[];
  selectedBook: BibleBook | null;
  onSelectBook: (book: BibleBook) => void;
  notes: Note[];
};

export default function Sidebar({ books, selectedBook, onSelectBook, notes }: SidebarProps) {
  return (
    <aside className="w-64 shrink-0 overflow-y-auto border-r p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide opacity-70">
        Library
      </h2>

      <div className="space-y-2">
        <div className="rounded border px-3 py-2">Bible</div>
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
        <div className="rounded border px-3 py-2">Catechism</div>
        <div className="rounded border px-3 py-2">Summa Theologiae</div>
        <div className="rounded border px-3 py-2">Confessions</div>
        <div className="rounded border px-3 py-2">Imitation of Christ</div>
        <div className="rounded border px-3 py-2">Devout Life</div>
        <div className="rounded border px-3 py-2">Prayer Journal</div>
      </div>

      {notes.length > 0 && (
        <>
          <h2 className="mt-6 mb-3 text-sm font-semibold uppercase tracking-wide opacity-70">
            Notes
          </h2>
          <div className="space-y-2">
            {notes.map((note) => (
              <div
                key={note.id}
                className="rounded border px-3 py-2 text-sm"
              >
                <p className="font-medium">{note.title}</p>
                <p className="mt-1 text-xs opacity-60">{note.sourceReference}</p>
                {note.content && (
                  <p className="mt-1 text-xs opacity-80">{truncateText(note.content, 60)}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </aside>
  );
}
