import { useEffect, useState } from 'react';
import type { Note } from '../../types';
import { NoteRepository } from '../repositories/NoteRepository';

const repo = new NoteRepository();

export function useWorkNotes(
  workId: string | null,
  sectionId: string | null,
  refreshKey = 0,
): Note[] {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      if (!workId || !sectionId) {
        if (isActive) setNotes([]);
        return;
      }

      const all = await repo.findByBook(workId);
      const sectionNotes = all.filter((n) => {
        const match = n.sourceReference.match(/^[^:]+:([^:]+):(\d+)(?:-(\d+))?$/);
        if (!match) return false;
        const refSection = match[1];
        return refSection === sectionId;
      });

      if (isActive) setNotes(sectionNotes);
    };

    void load();
    return () => { isActive = false; };
  }, [workId, sectionId, refreshKey]);

  return notes;
}
