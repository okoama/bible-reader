import { useEffect, useState } from 'react';
import { BibleService } from '../../features/bible/services/BibleService';
import type { BibleBook, BibleChapter } from '../../types';

const bibleService = new BibleService();

type ReaderProps = {
  selectedBook: BibleBook | null;
  selectedChapter: number | null;
  onSelectChapter: (chapterNumber: number) => void;
};

export default function Reader({
  selectedBook,
  selectedChapter,
  onSelectChapter,
}: ReaderProps) {
  const [chapters, setChapters] = useState<BibleChapter[]>([]);

  useEffect(() => {
    let isActive = true;

    const loadChapters = async () => {
      if (!selectedBook) {
        if (isActive) {
          setChapters([]);
        }
        return;
      }

      const loadedChapters = await bibleService.loadChapters(selectedBook.id);

      if (isActive) {
        setChapters(loadedChapters);
      }
    };

    void loadChapters();

    return () => {
      isActive = false;
    };
  }, [selectedBook]);

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-3xl rounded border p-6">
        {selectedBook ? (
          <div>
            <h2 className="text-2xl font-semibold">{selectedBook.name}</h2>
            <p className="mt-2 opacity-80">
              {selectedBook.testament} · Order {selectedBook.order}
            </p>

            <div className="mt-6">
              <h3 className="mb-3 font-semibold">Chapters</h3>
              <div className="flex flex-wrap gap-2">
                {chapters.map((chapter) => {
                  const isSelected = selectedChapter === chapter.number;

                  return (
                    <button
                      key={chapter.number}
                      type="button"
                      onClick={() => onSelectChapter(chapter.number)}
                      className={`rounded border px-3 py-2 ${
                        isSelected ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                    >
                      {chapter.number}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedChapter ? (
              <p className="mt-4">Selected chapter: {selectedChapter}</p>
            ) : (
              <p className="mt-4 opacity-80">Select a chapter to view it here.</p>
            )}
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