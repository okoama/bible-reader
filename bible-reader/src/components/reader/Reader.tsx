import type { BibleBook } from '../../types';

type ReaderProps = {
  selectedBook: BibleBook | null;
};

export default function Reader({ selectedBook }: ReaderProps) {
  return (
    <main className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-3xl rounded border p-6">
        {selectedBook ? (
          <div>
            <h2 className="text-2xl font-semibold">{selectedBook.name}</h2>
            <p className="mt-2 opacity-80">
              {selectedBook.testament} · Order {selectedBook.order}
            </p>
            <p className="mt-4">The reader will show this book here next.</p>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Welcome to Catholic Study Desk</h2>
            <p className="mt-4 opacity-80">
              Select a work from the Library to begin reading.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}