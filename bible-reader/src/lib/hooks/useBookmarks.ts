import { useEffect, useState } from 'react';
import type { Bookmark } from '../../types';
import { BookmarkRepository } from '../repositories/BookmarkRepository';

const repo = new BookmarkRepository();

export function useBookmarks(
  bookId: string | null,
  section: string | number | null,
  refreshKey = 0,
): Bookmark[] {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      if (!bookId || section === null || section === undefined) {
        if (isActive) setBookmarks([]);
        return;
      }

      const all = await repo.findByBook(bookId);
      const sectionBookmarks = all.filter((b) => {
        const match = b.sourceReference.match(/^[^:]+:([^:]+):(\d+)(?:-(\d+))?$/);
        if (!match) return false;
        const refSection = match[1];
        return refSection === String(section);
      });

      if (isActive) setBookmarks(sectionBookmarks);
    };

    void load();
    return () => { isActive = false; };
  }, [bookId, section, refreshKey]);

  return bookmarks;
}
