import { useCallback, useEffect, useState } from 'react';
import type { BibleBook, Collection, Note, Prayer, ReadingProgress, ResearchProject } from '../../../types';
import type { ActiveView } from '../../../layouts/AppLayout';
import LoadingIndicator from '../../shared/components/LoadingIndicator';
import { NoteRepository } from '../../../lib/repositories/NoteRepository';
import { BookmarkRepository } from '../../../lib/repositories/BookmarkRepository';
import { HighlightRepository } from '../../../lib/repositories/HighlightRepository';
import { PrayerRepository } from '../../../lib/repositories/PrayerRepository';
import { CollectionRepository } from '../../../lib/repositories/CollectionRepository';
import { ReadingProgressRepository } from '../../../lib/repositories/ReadingProgressRepository';
import { useReadingProgress } from '../../../lib/hooks/useReadingProgress';
import { getRecentlyOpened, type RecentlyOpenedItem } from '../../../lib/utils/recentlyOpened';
import { formatDate } from '../../../lib/utils/date';
import { stripHtml } from '../../../lib/utils/text';
import { TextService } from '../../../features/companion-texts/services/TextService';
import { StudySessionRepository } from '../../../lib/repositories/StudySessionRepository';
import { ResearchProjectRepository } from '../../../lib/repositories/ResearchProjectRepository';
import type { StudySession } from '../../../types';

const noteRepo = new NoteRepository();
const bookmarkRepo = new BookmarkRepository();
const highlightRepo = new HighlightRepository();
const prayerRepo = new PrayerRepository();
const collectionRepo = new CollectionRepository();
const readingProgressRepo = new ReadingProgressRepository();
const sessionRepo = new StudySessionRepository();
const projectRepo = new ResearchProjectRepository();
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
  const [recentProjects, setRecentProjects] = useState<ResearchProject[]>([]);
  const [totalNotes, setTotalNotes] = useState(0);
  const [totalBookmarks, setTotalBookmarks] = useState(0);
  const [totalHighlights, setTotalHighlights] = useState(0);
  const [readingMinutes, setReadingMinutes] = useState(0);
  const [mostStudiedBookName, setMostStudiedBookName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      noteRepo.findRecent(5).then(setRecentNotes),
      prayerRepo.findRecentPrayed(50).then((prayers) => setTodayPrayers(prayers.filter((p) => p.lastPrayed && isToday(p.lastPrayed)))),
      collectionRepo.findRecent(5).then(setCollections),
      readingProgressRepo.findRecentHistory(10).then(setHistory),
      Promise.resolve(setRecentlyOpened(getRecentlyOpened().slice(0, 10))),
      sessionRepo.findRecentCompleted(5).then(setRecentSessions),
      projectRepo.findAll(5).then(setRecentProjects),
      Promise.all([
        noteRepo.count(),
        bookmarkRepo.count(),
        highlightRepo.count(),
        sessionRepo.findAll().then((all) => {
          const completed = all.filter((s) => s.endTime != null && s.duration != null);
          return completed.reduce((sum, s) => sum + (s.duration ?? 0), 0);
        }),
        noteRepo.findAll(),
        bookmarkRepo.findAll(),
        highlightRepo.findAll(),
      ]).then(([nc, bc, hc, rm, notes, bookmarks, highlights]) => {
        setTotalNotes(nc);
        setTotalBookmarks(bc);
        setTotalHighlights(hc);
        setReadingMinutes(rm);
        const bookCounts = new Map<string, number>();
        const inc = (ref: string) => {
          const bid = ref.split(':')[0];
          if (bid) bookCounts.set(bid, (bookCounts.get(bid) ?? 0) + 1);
        };
        for (const n of notes) inc(n.sourceReference);
        for (const b of bookmarks) inc(b.sourceReference);
        for (const h of highlights) inc(h.sourceReference);
        let bestBookId: string | null = null;
        let bestCount = 0;
        for (const [bid, count] of bookCounts) {
          if (count > bestCount) { bestCount = count; bestBookId = bid; }
        }
        setMostStudiedBookName(bestBookId ? getBookName(books, bestBookId) : null);
      }),
    ]).finally(() => setLoading(false));
  }, [books]);

  return (
    <div className="reading-text mx-auto max-w-4xl animate-fade-in p-6 space-y-8">
      <header>
        <h2 className="text-3xl font-bold">Study Desk</h2>
        <p className="mt-1 opacity-60">Your Catholic study workspace</p>
      </header>

      {loading ? (
        <LoadingIndicator message="Preparing the table…" className="py-12" />
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

        <SectionCard title="Recent Notes" variant="paper" onAction={() => onSelectView('favorites')} actionLabel="All">
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

        <SectionCard title="Today's Prayers" variant="journal" onAction={() => onSelectView('prayer-journal')} actionLabel="Prayer Journal">
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

        <SectionCard title="Recent Collections" variant="folder" onAction={() => onSelectView('collections')} actionLabel="All">
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

        <SectionCard title="Recent Sessions" variant="ledger" actionLabel="">
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

        <SectionCard title="Projects" variant="folder" actionLabel="">
          {recentProjects.length === 0 ? (
            <p className="text-sm italic opacity-50">No research projects yet</p>
          ) : (
            <ul className="space-y-1">
              {recentProjects.map((p) => (
                <li key={p.id} className="flex items-center gap-2 text-sm">
                  <span>{p.icon}</span>
                  <span className="truncate">{p.title}</span>
                  <span className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-xs capitalize ${
                    p.status === 'active' ? 'bg-accent-light text-accent' : 'bg-gray-100 text-gray-600'
                  }`}>{p.status}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="All-Time Stats">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <StatBox label="Notes" value={totalNotes} />
            <StatBox label="Bookmarks" value={totalBookmarks} />
            <StatBox label="Highlights" value={totalHighlights} />
            <StatBox label="Reading Hours" value={readingMinutes < 60 ? `${readingMinutes}m` : `${Math.floor(readingMinutes / 60)}h ${readingMinutes % 60}m`} />
            {mostStudiedBookName && (
              <div className="col-span-2 mt-1 rounded-md bg-card p-2 text-center">
                <span className="text-xs uppercase tracking-wide opacity-60">Most Studied</span>
                <p className="font-semibold">{mostStudiedBookName}</p>
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Reading History" variant="ledger" actionLabel="">
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

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md bg-card p-2 text-center">
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs uppercase tracking-wide opacity-60">{label}</p>
    </div>
  );
}

function SectionCard({ title, children, onAction, actionLabel, variant = 'default' }: {
  title: string;
  children: React.ReactNode;
  onAction?: () => void;
  actionLabel?: string;
  variant?: 'default' | 'paper' | 'folder' | 'journal' | 'ledger';
}) {
  return (
    <div className={`rounded-lg border p-4 ${variant === 'default' ? 'border-theme bg-card' : `card-${variant}`}`}>
      <div className="mb-2 flex items-center justify-between">
        <h3 className={`text-sm font-semibold uppercase tracking-wide opacity-70 ${variant === 'default' ? '' : 'card-title-serif'}`}>{title}</h3>
        {onAction && actionLabel && (
          <button type="button" onClick={onAction} className="text-xs text-accent hover:underline">{actionLabel}</button>
        )}
      </div>
      {children}
    </div>
  );
}
