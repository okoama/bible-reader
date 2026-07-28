import { useEffect, useState } from 'react';
import type { Highlight } from '../../types/highlight';
import { HighlightRepository } from '../repositories/HighlightRepository';

const repo = new HighlightRepository();

export function useWorkHighlights(
  workId: string | null,
  sectionId: string | null,
  refreshKey = 0,
): Highlight[] {
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      if (!workId || !sectionId) {
        if (isActive) setHighlights([]);
        return;
      }

      const all = await repo.findByBook(workId);
      const sectionHighlights = all.filter((h) => {
        const match = h.sourceReference.match(/^[^:]+:([^:]+):(\d+)(?:-(\d+))?$/);
        if (!match) return false;
        const refSection = match[1];
        return refSection === sectionId;
      });

      if (isActive) setHighlights(sectionHighlights);
    };

    void load();
    return () => { isActive = false; };
  }, [workId, sectionId, refreshKey]);

  return highlights;
}
