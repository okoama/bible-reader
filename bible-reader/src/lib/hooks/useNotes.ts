import { useEffect, useState } from 'react';
import type { Note } from '../../types';
import { NoteRepository } from '../repositories/NoteRepository';

const noteRepository = new NoteRepository();

export function useNotes(refreshKey = 0): Note[] {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      const all = await noteRepository.findAll();
      if (isActive) {
        setNotes(all);
      }
    };

    void load();

    return () => {
      isActive = false;
    };
  }, [refreshKey]);

  return notes;
}
