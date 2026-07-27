import { useCallback, useEffect, useState } from 'react';
import { ReadingProgressRepository } from '../repositories/ReadingProgressRepository';

const WORK_ID = 'bible';
const repo = new ReadingProgressRepository();

interface ReadingPosition {
  bookId: string;
  chapter: number;
}

function parseSourceReference(ref: string): ReadingPosition | null {
  const parts = ref.split(':');
  if (parts.length !== 3 || parts[0] !== 'bible') {
    return null;
  }
  const chapter = Number.parseInt(parts[2], 10);
  if (!parts[1] || Number.isNaN(chapter)) {
    return null;
  }
  return { bookId: parts[1], chapter };
}

function serializeSourceReference(bookId: string, chapter: number): string {
  return `bible:${bookId}:${chapter}`;
}

export function useReadingProgress() {
  const [lastPosition, setLastPosition] = useState<ReadingPosition | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      const record = await repo.findLastPosition(WORK_ID);
      if (isActive && record) {
        const position = parseSourceReference(record.sourceReference);
        if (position) {
          setLastPosition(position);
        }
      }
      if (isActive) {
        setLoaded(true);
      }
    };

    void load();

    return () => {
      isActive = false;
    };
  }, []);

  const savePosition = useCallback(async (bookId: string, chapter: number) => {
    const position: ReadingPosition = { bookId, chapter };
    setLastPosition(position);

    await repo.save({
      id: `last:${WORK_ID}`,
      sourceReference: serializeSourceReference(bookId, chapter),
      progress: chapter,
      updatedAt: new Date().toISOString(),
    });
  }, []);

  return { lastPosition, loaded, savePosition };
}
