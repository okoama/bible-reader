import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { StudySession, SessionCollectionEvent } from '../../types';
import { StudySessionRepository } from '../repositories/StudySessionRepository';
import { createId } from '../utils/id';

const repo = new StudySessionRepository();

type StudySessionContextValue = {
  session: StudySession | null;
  elapsed: number;
  startSession: (title?: string) => void;
  endSession: () => StudySession | null;
  logVisit: (workId: string, sectionId: string | undefined, label: string) => void;
  logNote: (noteId: string, title: string, sourceReference: string) => void;
  logPrayer: (prayerId: string, title: string) => void;
  logBookmark: (bookmarkId: string, sourceReference: string, label: string) => void;
  logCollectionEvent: (collectionId: string, name: string, action: SessionCollectionEvent['action']) => void;
};

const StudySessionContext = createContext<StudySessionContextValue | null>(null);

export function StudySessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<StudySession | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    void repo.findActive().then((s) => {
      if (s) setSession(s);
    });
  }, []);

  useEffect(() => {
    if (!session?.startTime || session.endTime) return;
    setElapsed(Date.now() - new Date(session.startTime).getTime());
    const interval = setInterval(() => {
      setElapsed(Date.now() - new Date(session.startTime).getTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [session?.startTime, session?.endTime]);

  const updateSession = useCallback((update: (prev: StudySession) => StudySession) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = update(prev);
      void repo.save(next);
      return next;
    });
  }, []);

  const startSession = useCallback((title?: string) => {
    const now = new Date().toISOString();
    const newSession: StudySession = {
      id: createId('ses'),
      title: title ?? `Session ${new Date().toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      startTime: now,
      worksVisited: [],
      notesCreated: [],
      prayersWritten: [],
      bookmarksAdded: [],
      collectionEvents: [],
    };
    setSession(newSession);
    setElapsed(0);
    void repo.save(newSession);
  }, []);

  const endSession = useCallback(() => {
    let finalized: StudySession | null = null;
    setSession((prev) => {
      if (!prev) return prev;
      const now = new Date().toISOString();
      finalized = {
        ...prev,
        endTime: now,
        duration: Math.round((Date.now() - new Date(prev.startTime).getTime()) / 60000),
      };
      void repo.save(finalized);
      return finalized;
    });
    return finalized;
  }, []);

  const logVisit = useCallback((workId: string, sectionId: string | undefined, label: string) => {
    updateSession((prev) => ({
      ...prev,
      worksVisited: [...prev.worksVisited, { workId, sectionId, label, visitedAt: new Date().toISOString() }],
    }));
  }, [updateSession]);

  const logNote = useCallback((noteId: string, title: string, sourceReference: string) => {
    updateSession((prev) => ({
      ...prev,
      notesCreated: [...prev.notesCreated, { noteId, title, sourceReference, createdAt: new Date().toISOString() }],
    }));
  }, [updateSession]);

  const logPrayer = useCallback((prayerId: string, title: string) => {
    updateSession((prev) => ({
      ...prev,
      prayersWritten: [...prev.prayersWritten, { prayerId, title, createdAt: new Date().toISOString() }],
    }));
  }, [updateSession]);

  const logBookmark = useCallback((bookmarkId: string, sourceReference: string, label: string) => {
    updateSession((prev) => ({
      ...prev,
      bookmarksAdded: [...prev.bookmarksAdded, { bookmarkId, sourceReference, label, createdAt: new Date().toISOString() }],
    }));
  }, [updateSession]);

  const logCollectionEvent = useCallback((collectionId: string, name: string, action: SessionCollectionEvent['action']) => {
    updateSession((prev) => ({
      ...prev,
      collectionEvents: [...prev.collectionEvents, { collectionId, name, action, updatedAt: new Date().toISOString() }],
    }));
  }, [updateSession]);

  return (
    <StudySessionContext.Provider value={{ session, elapsed, startSession, endSession, logVisit, logNote, logPrayer, logBookmark, logCollectionEvent }}>
      {children}
    </StudySessionContext.Provider>
  );
}

export function useStudySession(): StudySessionContextValue {
  const ctx = useContext(StudySessionContext);
  if (!ctx) throw new Error('useStudySession must be used within StudySessionProvider');
  return ctx;
}
