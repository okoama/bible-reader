import { useEffect, useState } from 'react';
import { BibleService } from '../../features/bible/services/BibleService';
import { useTextSelection } from '../../features/annotations/hooks/useTextSelection';
import type { SelectedVerse } from '../../features/annotations/hooks/useTextSelection';
import type { BibleBook, BibleChapter, BibleVerse } from '../../types';
import AnnotationToolbar from '../AnnotationToolbar';

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
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);
  const { selection, clearSelection } = useTextSelection(containerElement);

  const handleHighlight = (text: string, verses: SelectedVerse[]) => {
    console.log('Highlight:', text, verses);
    clearSelection();
  };

  const handleNote = (text: string, verses: SelectedVerse[]) => {
    console.log('Note:', text, verses);
    clearSelection();
  };

  const handleBookmark = (verses: SelectedVerse[]) => {
    console.log('Bookmark:', verses);
    clearSelection();
  };

  useEffect(() => {
    let isActive = true;

    const loadChapters = async () => {
      if (!selectedBook) {
        if (isActive) {
          setChapters([]);
          setVerses([]);
        }
        return;
      }

      const loadedChapters = await bibleService.loadChapters(selectedBook.id);

      if (isActive) {
        setChapters(loadedChapters);
        setVerses([]);
      }
    };

    void loadChapters();

    return () => {
      isActive = false;
    };
  }, [selectedBook]);

  useEffect(() => {
    let isActive = true;

    const loadVerses = async () => {
      if (!selectedBook || !selectedChapter) {
        if (isActive) {
          setVerses([]);
        }
        return;
      }

      const loadedVerses = await bibleService.loadVerses(
        selectedBook.id,
        selectedChapter,
      );

      if (isActive) {
        setVerses(loadedVerses);
      }
    };

    void loadVerses();

    return () => {
      isActive = false;
    };
  }, [selectedBook, selectedChapter]);

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-3xl rounded border p-6">
        {selectedBook ? (
          <div>
            <h2 className="text-2xl font-semibold">{selectedBook.name}</h2>
            <p className="mt-2 opacity-80">
              {selectedBook.testament}
            </p>

            <div className="mt-6">
              <h3 className="mb-3 font-semibold">Chapters</h3>
              <div className="flex flex-wrap gap-2">
                {chapters.map((chapter) => {
                  const chapterNumber = chapter.chapterNumber;
                  const isSelected = selectedChapter === chapterNumber;

                  return (
                    <button
                      key={chapterNumber}
                      type="button"
                      onClick={() => onSelectChapter(chapterNumber)}
                      className={`rounded border px-3 py-2 ${
                        isSelected ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                    >
                      {chapterNumber}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedChapter && verses.length > 0 ? (
              <div ref={setContainerElement} className="mt-6 space-y-2">
                {verses.map((verse) => (
                  <p
                    key={verse.verseNumber}
                    className="leading-relaxed"
                    data-book={selectedBook.id}
                    data-chapter={selectedChapter}
                    data-verse={verse.verseNumber}
                  >
                    <span className="mr-1 text-xs font-semibold align-super text-blue-600">
                      {verse.verseNumber}
                    </span>
                    {verse.text}
                  </p>
                ))}
              </div>
            ) : selectedChapter ? (
              <p className="mt-4 opacity-80">Loading…</p>
            ) : (
              <p className="mt-4 opacity-80">Select a chapter to read.</p>
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

      {selection && (
        <AnnotationToolbar
          selection={selection}
          onHighlight={handleHighlight}
          onNote={handleNote}
          onBookmark={handleBookmark}
        />
      )}
    </main>
  );
}
