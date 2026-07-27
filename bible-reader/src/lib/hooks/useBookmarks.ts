import { useEffect, useState } from 'react';
import type { Bookmark } from '../../types';
import { BookmarkRepository } from '../repositories/BookmarkRepository';

const repo = new BookmarkRepository();

export function useBookmarks(
  bookId: string | null,
  chapterNumber: number | null,
  refreshKey = 0,
): Bookmark[] {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      if (!bookId) {
        if (isActive) setBookmarks([]);
        return;
      }

      const all = await repo.findByBook(bookId);
      const chapterBookmarks = chapterNumber === null
        ? all
        : all.filter((b) => {
            const match = b.sourceReference.match(/^[^:]+:(\d+):(\d+)(?:-(\d+))?$/);
            if (!match) return false;
            const refChapter = Number.parseInt(match[1], 10);
            return refChapter === chapterNumber;
          });

      if (isActive) setBookmarks(chapterBookmarks);
    };

    void load();
    return () => { isActive = false; };
  }, [bookId, chapterNumber, refreshKey]);

  return bookmarks;
}
