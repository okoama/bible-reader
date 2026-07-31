import { useEffect, useState } from 'react';
import type { Note } from '../../types';
import { NoteRepository } from '../repositories/NoteRepository';

const repo = new NoteRepository();

export function useRefNotes(
  bookId: string | null,
  section: string | number | null,
  refreshKey = 0,
): Note[] {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      if (!bookId || section === null || section === undefined) {
        if (isActive) setNotes([]);
        return;
      }

      const all = await repo.findByBook(bookId);
      const sectionNotes = all.filter((n) => {
        const match = n.sourceReference.match(/^[^:]+:([^:]+):(\d+)(?:-(\d+))?$/);
        if (!match) return false;
        const refSection = match[1];
        return refSection === String(section);
      });

      if (isActive) setNotes(sectionNotes);
    };

    void load();
    return () => { isActive = false; };
  }, [bookId, section, refreshKey]);

  return notes;
}
