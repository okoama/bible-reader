import { useCallback, useEffect, useState } from 'react';
import type { BibleBook, Collection, Note, Prayer, ReadingProgress } from '../../types';
import type { ActiveView } from '../../layouts/AppLayout';
import { NoteRepository } from '../../lib/repositories/NoteRepository';
import { PrayerRepository } from '../../lib/repositories/PrayerRepository';
import { CollectionRepository } from '../../lib/repositories/CollectionRepository';
import { ReadingProgressRepository } from '../../lib/repositories/ReadingProgressRepository';
import { useReadingProgress } from '../../lib/hooks/useReadingProgress';
import { getRecentlyOpened, type RecentlyOpenedItem } from '../../lib/utils/recentlyOpened';
import { formatDate } from '../../lib/utils/date';
import { stripHtml } from '../../lib/utils/text';
import { TextService } from '../../features/companion-texts/services/TextService';
import { StudySessionRepository } from '../../lib/repositories/StudySessionRepository';
import type { StudySession } from '../../types';

const noteRepo = new NoteRepository();
const prayerRepo = new PrayerRepository();
const collectionRepo = new CollectionRepository();
const readingProgressRepo = new ReadingProgressRepository();
const sessionRepo = new StudySessionRepository();
const textService = new TextService();

type DashboardProps = {
  books: BibleBook[];
  onNavigateToPassage: (bookId: string, chapter: number) => void;
  onSelectView: (view: ActiveView) => void;
  onNavigateToWork: (workId: string, sectionId?: string) => void;
};

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function getBookName(books: BibleBook[], bookId: string): string {
  return books.find((b) => b.id === bookId)?.name ?? bookId;
}

function getWorkLabel(workId: string): string {
  const entry = textService.getManifestEntry(workId);
  return entry?.name ?? workId;
}

function getPassageLabel(books: BibleBook[], ref: string): string {
  const match = ref.match(/^([^:]+):(\d+)/);
  if (match) return `${getBookName(books, match[1])} ${match[2]}`;
  return ref;
}

function RecentlyOpenedItemButton({ item, onNavigateToPassage, onNavigateToWork }: {
  item: RecentlyOpenedItem;
  onNavigateToPassage: (bookId: string, chapter: number) => void;
  onNavigateToWork: (workId: string, sectionId?: string) => void;
}) {
  const handleClick = useCallback(() => {
    if (item.type === 'bible') {
      const parts = item.id.split(':');
      onNavigateToPassage(parts[1], Number(parts[2]));
    } else {
      const parts = item.id.split(':');
      onNavigateToWork(parts[0], parts[1]);
    }
  }, [item, onNavigateToPassage, onNavigateToWork]);

  return (
    <button type="button" onClick={handleClick} className="w-full text-left text-sm hover:text-accent">
      <span className="font-medium">{item.label}</span>
      <span className="ml-2 text-xs opacity-50">{item.subtitle}</span>
    </button>
  );
}

function HistoryItemButton({ r, onNavigateToPassage, onNavigateToWork }: {
  r: ReadingProgress;
  onNavigateToPassage: (bookId: string, chapter: number) => void;
  onNavigateToWork: (workId: string, sectionId?: string) => void;
}) {
  const ref = r.sourceReference;
  const match = ref.match(/^([^:]+):(\d+)/);
  const label = match ? `${getWorkLabel(match[1])} ${match[2]}` : ref;

  const handleClick = useCallback(() => {
    if (match) {
      if (match[1] === 'bible') {
        onNavigateToPassage(match[1], Number(match[2]));
      } else {
        onNavigateToWork(match[1], match[2]);
      }
    }
  }, [match, onNavigateToPassage, onNavigateToWork]);

  return (
    <button type="button" onClick={handleClick} className="w-full text-left text-sm hover:text-accent">
      <span className="font-medium">{label}</span>
      <span className="ml-2 text-xs opacity-50">{formatDate(r.updatedAt)}</span>
    </button>
  );
}

export default function Dashboard({ books, onNavigateToPassage, onSelectView, onNavigateToWork }: DashboardProps) {
  const { lastPosition } = useReadingProgress();
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [todayPrayers, setTodayPrayers] = useState<Prayer[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [history, setHistory] = useState<ReadingProgress[]>([]);
  const [recentlyOpened, setRecentlyOpened] = useState<RecentlyOpenedItem[]>([]);
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      noteRepo.findRecent(5).then(setRecentNotes),
      prayerRepo.findRecentPrayed(50).then((prayers) => setTodayPrayers(prayers.filter((p) => p.lastPrayed && isToday(p.lastPrayed)))),
      collectionRepo.findAll().then((all) => setCollections(all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5))),
      readingProgressRepo.findAll().then((all) => setHistory(all.filter((r) => !r.id.startsWith('last:')).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 10))),
      Promise.resolve(setRecentlyOpened(getRecentlyOpened().slice(0, 10))),
      sessionRepo.findAll().then((all) => setRecentSessions(all.filter((s) => s.endTime).slice(0, 5))),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div className="reading-text mx-auto max-w-4xl animate-fade-in p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Study Desk</h1>
        <p className="mt-1 opacity-60">Your Catholic study workspace</p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm opacity-50">Loading...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {lastPosition && (
          <SectionCard title="Continue Reading" onAction={() => onNavigateToPassage(lastPosition.bookId, lastPosition.chapter)} actionLabel="Continue">
            <p className="font-medium">{getBookName(books, lastPosition.bookId)}</p>
            <p className="text-sm opacity-60">Chapter {lastPosition.chapter}</p>
          </SectionCard>
        )}

        <SectionCard title="Favorites" onAction={() => onSelectView('favorites')} actionLabel="View All">
          <p className="text-sm italic opacity-50">Save favorite passages and notes for quick access</p>
        </SectionCard>

        <SectionCard title="Recent Notes" onAction={() => onSelectView('favorites')} actionLabel="All Notes">
          {recentNotes.length === 0 ? (
            <p className="text-sm italic opacity-50">No notes yet — create one with Ctrl+Alt+N</p>
          ) : (
            <ul className="space-y-1">
              {recentNotes.map((note) => (
                <li key={note.id} className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm">{note.title || stripHtml(note.content).slice(0, 40)}</span>
                  {note.sourceReference && (
                    <button
                      type="button"
                      onClick={() => onNavigateToPassage(note.sourceReference.split(':')[0], Number(note.sourceReference.split(':')[1]))}
                      className="shrink-0 text-xs text-accent hover:underline"
                    >
                      {getPassageLabel(books, note.sourceReference)}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Today's Prayers" onAction={() => onSelectView('prayer-journal')} actionLabel="Prayer Journal">
          {todayPrayers.length === 0 ? (
            <p className="text-sm italic opacity-50">No prayers recorded today</p>
          ) : (
            <ul className="space-y-1">
              {todayPrayers.map((p) => (
                <li key={p.id} className="truncate text-sm">{p.title}</li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Recently Opened" actionLabel="">
          {recentlyOpened.length === 0 ? (
            <p className="text-sm italic opacity-50">No recently opened items</p>
          ) : (
            <ul className="space-y-1">
              {recentlyOpened.map((item) => (
                <li key={item.id}>
                  <RecentlyOpenedItemButton item={item} onNavigateToPassage={onNavigateToPassage} onNavigateToWork={onNavigateToWork} />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Recent Collections" onAction={() => onSelectView('collections')} actionLabel="All Collections">
          {collections.length === 0 ? (
            <p className="text-sm italic opacity-50">No collections yet</p>
          ) : (
            <ul className="space-y-1">
              {collections.map((c) => (
                <li key={c.id} className="truncate text-sm">
                  {c.name}
                  <span className="ml-2 text-xs opacity-50">({c.items.length} items)</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Recent Sessions" actionLabel="">
          {recentSessions.length === 0 ? (
            <p className="text-sm italic opacity-50">No study sessions yet</p>
          ) : (
            <ul className="space-y-1">
              {recentSessions.map((s) => (
                <li key={s.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{s.title}</span>
                  <span className="shrink-0 text-xs opacity-50">{formatDate(s.startTime)}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Reading History" actionLabel="">
          {history.length === 0 ? (
            <p className="text-sm italic opacity-50">No reading history yet</p>
          ) : (
            <ul className="space-y-1">
              {history.map((r) => (
                <li key={r.id}>
                  <HistoryItemButton r={r} onNavigateToPassage={onNavigateToPassage} onNavigateToWork={onNavigateToWork} />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
        </div>
      )}
    </div>
  );
}

function SectionCard({ title, children, onAction, actionLabel }: {
  title: string;
  children: React.ReactNode;
  onAction?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide opacity-70">{title}</h2>
        {onAction && actionLabel && (
          <button type="button" onClick={onAction} className="text-xs text-accent hover:underline">{actionLabel}</button>
        )}
      </div>
      {children}
    </div>
  );
}
