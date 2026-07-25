import { useEffect, useState } from 'react';
import { BibleService } from '../../features/bible/services/BibleService';
import type { BibleBook } from '../../types';

const bibleService = new BibleService();

export default function Sidebar() {
  const [books, setBooks] = useState<BibleBook[]>([]);

  useEffect(() => {
    const loadBooks = async () => {
      const loadedBooks = await bibleService.loadBooks();
      setBooks(loadedBooks);
    };

    void loadBooks();
  }, []);

  return (
    <aside className="w-64 shrink-0 overflow-y-auto border-r p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide opacity-70">
        Library
      </h2>

      <div className="space-y-2">
        <div className="rounded border px-3 py-2">Bible</div>
        {books.map((book) => (
          <div key={book.id} className="rounded border px-3 py-2 text-sm">
            {book.name}
          </div>
        ))}
        <div className="rounded border px-3 py-2">Catechism</div>
        <div className="rounded border px-3 py-2">Summa Theologiae</div>
        <div className="rounded border px-3 py-2">Confessions</div>
        <div className="rounded border px-3 py-2">Imitation of Christ</div>
        <div className="rounded border px-3 py-2">Devout Life</div>
        <div className="rounded border px-3 py-2">Prayer Journal</div>
      </div>
    </aside>
  );
}