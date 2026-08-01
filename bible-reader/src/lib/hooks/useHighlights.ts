import { useEffect, useState } from 'react';
import type { Highlight } from '../../types/highlight';
import { HighlightRepository } from '../repositories/HighlightRepository';

const repo = new HighlightRepository();

export function useHighlights(
  bookId: string | null,
  chapterNumber: number | null,
  refreshKey = 0,
): Highlight[] {
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      if (!bookId || chapterNumber === null) {
        if (isActive) setHighlights([]);
        return;
      }

      const all = await repo.findByBook(bookId);
      const chapterHighlights = all.filter((h) => {
        const match = h.sourceReference.match(/^[^:]+:(\d+):(\d+)(?:-(\d+))?$/);
        if (!match) return false;
        const refChapter = Number.parseInt(match[1], 10);
        return refChapter === chapterNumber;
      });

      if (isActive) setHighlights(chapterHighlights);
    };

    void load();
    return () => { isActive = false; };
  }, [bookId, chapterNumber, refreshKey]);

  return highlights;
}
