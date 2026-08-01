import { useEffect, useState } from 'react';
import type { Note } from '../../types';
import { NoteRepository } from '../repositories/NoteRepository';

const noteRepository = new NoteRepository();

export function useNotes(refreshKey = 0): { notes: Note[]; loading: boolean } {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    setLoading(true);

    const load = async () => {
      try {
        const all = await noteRepository.findAll();
        if (isActive) {
          setNotes(all);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      isActive = false;
    };
  }, [refreshKey]);

  return { notes, loading };
}
