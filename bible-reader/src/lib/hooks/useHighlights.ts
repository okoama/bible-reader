import { useEffect, useState } from 'react';
import type { Highlight } from '../../types/highlight';
import { HighlightRepository } from '../repositories/HighlightRepository';

const repo = new HighlightRepository();

export function useHighlights(
  bookId: string | null,
  section: string | number | null,
  refreshKey = 0,
): Highlight[] {
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      if (!bookId || section === null || section === undefined) {
        if (isActive) setHighlights([]);
        return;
      }

      const sectionHighlights = await repo.findBySection(bookId, String(section));
      if (isActive) setHighlights(sectionHighlights);
    };

    void load();
    return () => { isActive = false; };
  }, [bookId, section, refreshKey]);

  return highlights;
}
