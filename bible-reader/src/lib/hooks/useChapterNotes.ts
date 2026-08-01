import { useEffect, useState } from 'react';
import type { Note } from '../../types';
import { NoteRepository } from '../repositories/NoteRepository';

const repo = new NoteRepository();

export function useChapterNotes(
  bookId: string | null,
  chapterNumber: number | null,
  refreshKey = 0,
): Note[] {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      if (!bookId || chapterNumber === null) {
        if (isActive) setNotes([]);
        return;
      }

      const all = await repo.findByBook(bookId);
      const chapterNotes = all.filter((n) => {
        const match = n.sourceReference.match(/^[^:]+:(\d+):(\d+)(?:-(\d+))?$/);
        if (!match) return false;
        const refChapter = Number.parseInt(match[1], 10);
        return refChapter === chapterNumber;
      });

      if (isActive) setNotes(chapterNotes);
    };

    void load();
    return () => { isActive = false; };
  }, [bookId, chapterNumber, refreshKey]);

  return notes;
}
