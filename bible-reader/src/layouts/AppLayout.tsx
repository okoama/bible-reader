import { useCallback, useEffect, useRef, useState } from 'react';
import Header from '../components/header/Header';
import Sidebar from '../components/sidebar/Sidebar';
import Reader from '../features/reader/components/Reader';
import RightPanel from '../components/right-panel/RightPanel';
import StatusBar from '../components/status-bar/StatusBar';
import { BibleService } from '../features/bible/services/BibleService';
import { useReadingProgress } from '../lib/hooks/useReadingProgress';
import { useNotes } from '../lib/hooks/useNotes';
import { NoteRepository } from '../lib/repositories/NoteRepository';
import type { BibleBook, Note, PrayerFilter, Tab, VerseRef } from '../types';
import NoteViewer from '../features/notes/components/NoteViewer';
import NoteEditor from '../features/notes/components/NoteEditor';
import PrayerEditor from '../features/prayers/components/PrayerEditor';
import CollectionEditor from '../features/collections/components/CollectionEditor';
import ProjectEditor from '../features/projects/components/ProjectEditor';
import Dashboard from '../features/dashboard/components/Dashboard';
import { addRecentlyOpened } from '../lib/utils/recentlyOpened';
import { TextService } from '../features/companion-texts/services/TextService';
import { useStudySession } from '../lib/contexts/StudySessionContext';
import GlobalSearchModal from '../features/search/components/GlobalSearchModal';
import { ResearchProjectRepository } from '../lib/repositories/ResearchProjectRepository';
import { createId } from '../lib/utils/id';
import KeyboardShortcutsHelp from '../features/help/components/KeyboardShortcutsHelp';
import LoadingIndicator from '../features/shared/components/LoadingIndicator';
import KnowledgeGraphView from '../features/knowledge-graph/components/KnowledgeGraphView';
import TabBar from '../components/tabs/TabBar';
import type { GraphNodeType } from '../types';

export type ActiveView = 'dashboard' | 'bible' | 'prayer-journal' | 'companion-text' | 'favorites' | 'collections' | 'projects' | 'graph';

interface NavSnapshot {
  activeView: ActiveView;
  selectedBook: BibleBook | null;
  selectedChapter: number | null;
  selectedVerse: VerseRef | null;
  selectedWorkId: string | null;
  selectedSectionId: string | null;
  prayerFilter: PrayerFilter;
}

const bibleService = new BibleService();
const noteRepository = new NoteRepository();

const COMPANION_POSITIONS_KEY = 'companion-positions';

function loadCompanionPositions(): Record<string, string> {
  try {
    const stored = localStorage.getItem(COMPANION_POSITIONS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {};
}

function persistCompanionPositions(positions: Record<string, string>): void {
  try {
    localStorage.setItem(COMPANION_POSITIONS_KEY, JSON.stringify(positions));
  } catch {}
}

function loadTabs(): Tab[] {
  try {
    const stored = localStorage.getItem('workspace-tabs');
    if (stored) return JSON.parse(stored);
  } catch {}
  return [{ id: 'dashboard', type: 'dashboard', label: 'Dashboard' }];
}

function persistTabs(tabs: Tab[]): void {
  try {
    localStorage.setItem('workspace-tabs', JSON.stringify(tabs));
  } catch {}
}

function loadActiveTabId(): string {
  try {
    return localStorage.getItem('workspace-active-tab') ?? 'dashboard';
  } catch {}
  return 'dashboard';
}

function persistActiveTabId(id: string): void {
  try {
    localStorage.setItem('workspace-active-tab', id);
  } catch {}
}

export default function AppLayout() {
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [notesRefreshKey, setNotesRefreshKey] = useState(0);
  const [selectedVerse, setSelectedVerse] = useState<VerseRef | null>(null);
  const [pendingNavigation, setPendingNavigation] = useState<VerseRef | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedWorkId, setSelectedWorkId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [companionPositions, setCompanionPositions] = useState<Record<string, string>>(loadCompanionPositions);
  const [prayerFilter, setPrayerFilter] = useState<PrayerFilter>({ type: 'all' });
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const { lastPosition, loaded, savePosition } = useReadingProgress();
  const { session, logVisit } = useStudySession();
  const { notes, loading: notesLoading } = useNotes(notesRefreshKey);

  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [showNewNote, setShowNewNote] = useState(false);
  const [showNewPrayer, setShowNewPrayer] = useState(false);
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);

  const [tabs, setTabs] = useState<Tab[]>(loadTabs);
  const [activeTabId, setActiveTabId] = useState<string>(loadActiveTabId);

  const navBackStack = useRef<NavSnapshot[]>([]);
  const navForwardStack = useRef<NavSnapshot[]>([]);
  const navSnapshotRef = useRef<NavSnapshot>({
    activeView: 'dashboard', selectedBook: null, selectedChapter: null,
    selectedVerse: null, selectedWorkId: null, selectedSectionId: null, prayerFilter: { type: 'all' },
  });
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    navSnapshotRef.current = { activeView, selectedBook, selectedChapter, selectedVerse, selectedWorkId, selectedSectionId, prayerFilter };
  }, [activeView, selectedBook, selectedChapter, selectedVerse, selectedWorkId, selectedSectionId, prayerFilter]);

  const syncTabState = useCallback(() => {
    setTabs((prev) => {
      const next = prev.map((t) =>
        t.id === activeTabId
          ? { ...t, bookId: selectedBook?.id, chapterNumber: selectedChapter ?? undefined, workId: selectedWorkId ?? undefined, sectionId: selectedSectionId ?? undefined }
          : t,
      );
      return next;
    });
  }, [activeTabId, selectedBook, selectedChapter, selectedWorkId, selectedSectionId]);

  const scheduleSync = useCallback(() => {
    if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    persistTimerRef.current = setTimeout(() => {
      syncTabState();
      persistTimerRef.current = null;
    }, 300);
  }, [syncTabState]);

  useEffect(() => {
    return () => { if (persistTimerRef.current) clearTimeout(persistTimerRef.current); };
  }, []);

  useEffect(() => {
    persistTabs(tabs);
  }, [tabs]);

  useEffect(() => {
    persistActiveTabId(activeTabId);
  }, [activeTabId]);

  const activateTab = useCallback((tab: Tab) => {
    setActiveTabId(tab.id);
    setActiveView(tab.type as ActiveView);
    setSelectedBook((tab.type === 'bible' || tab.type === 'dashboard') && tab.bookId ? books.find((b) => b.id === tab.bookId) ?? null : null);
    setSelectedChapter(tab.type === 'bible' ? (tab.chapterNumber ?? null) : null);
    setSelectedVerse(null);
    if (tab.type === 'companion-text') {
      setSelectedWorkId(tab.workId ?? null);
      setSelectedSectionId(tab.sectionId ?? null);
    } else if (tab.type !== 'bible') {
      setSelectedWorkId(null);
      setSelectedSectionId(null);
    }
  }, [books]);

  useEffect(() => {
    let isActive = true;
    const load = async () => {
      try {
        const loadedBooks = await bibleService.loadBooks();
        if (isActive) setBooks(loadedBooks);
      } finally {
        if (isActive) setBooksLoading(false);
      }
    };
    void load();
    return () => { isActive = false; };
  }, []);

  useEffect(() => {
    if (books.length === 0) return;
    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (!activeTab) return;
    if (activeTab.type === 'bible' && activeTab.bookId && !selectedBook) {
      const book = books.find((b) => b.id === activeTab.bookId);
      if (book) {
        setSelectedBook(book);
        setSelectedChapter(activeTab.chapterNumber ?? null);
      }
    } else if (activeTab.type === 'companion-text' && activeTab.workId && !selectedWorkId) {
      setSelectedWorkId(activeTab.workId);
      setSelectedSectionId(activeTab.sectionId ?? null);
      setActiveView('companion-text');
    }
  }, [books, tabs, activeTabId, selectedBook, selectedWorkId]);

  useEffect(() => {
    if (!loaded || !lastPosition || books.length === 0 || selectedBook) return;
    const book = books.find((b) => b.id === lastPosition.bookId);
    if (book) {
      setSelectedBook(book);
      setSelectedChapter(lastPosition.chapter);
    }
  }, [loaded, lastPosition, books, selectedBook]);

  const pushNavSnapshot = useCallback(() => {
    navBackStack.current.push({ ...navSnapshotRef.current });
    navForwardStack.current = [];
  }, []);

  const navigateBack = useCallback(() => {
    const s = navBackStack.current.pop();
    if (!s) return;
    navForwardStack.current.push({ ...navSnapshotRef.current });
    setActiveView(s.activeView);
    setSelectedBook(s.selectedBook);
    setSelectedChapter(s.selectedChapter);
    setSelectedVerse(s.selectedVerse);
    setSelectedWorkId(s.selectedWorkId);
    setSelectedSectionId(s.selectedSectionId);
    setPrayerFilter(s.prayerFilter);
  }, []);

  const navigateForward = useCallback(() => {
    const s = navForwardStack.current.pop();
    if (!s) return;
    navBackStack.current.push({ ...navSnapshotRef.current });
    setActiveView(s.activeView);
    setSelectedBook(s.selectedBook);
    setSelectedChapter(s.selectedChapter);
    setSelectedVerse(s.selectedVerse);
    setSelectedWorkId(s.selectedWorkId);
    setSelectedSectionId(s.selectedSectionId);
    setPrayerFilter(s.prayerFilter);
  }, []);

  const navigateInTab = useCallback((type: Tab['type'], label: string, extra?: Partial<Tab>) => {
    setTabs((prev) => {
      if (prev.length === 0) return [{ id: type, type, label, ...extra }];
      return prev.map((t) => {
        if (t.id !== activeTabId) return t;
        return {
          ...t,
          type,
          label,
          bookId: type === 'bible' ? (extra?.bookId ?? undefined) : undefined,
          chapterNumber: type === 'bible' ? (extra?.chapterNumber ?? undefined) : undefined,
          workId: type === 'companion-text' ? (extra?.workId ?? undefined) : undefined,
          sectionId: type === 'companion-text' ? (extra?.sectionId ?? undefined) : undefined,
        };
      });
    });
  }, [activeTabId]);

  const handleSelectTab = useCallback((tabId: string) => {
    if (tabId === activeTabId) return;
    const target = tabs.find((t) => t.id === tabId);
    if (!target) return;
    pushNavSnapshot();
    activateTab(target);
  }, [activeTabId, tabs, pushNavSnapshot, activateTab]);

  const handleCloseTab = useCallback((tabId: string) => {
    setTabs((prev) => {
      const idx = prev.findIndex((t) => t.id === tabId);
      if (idx === -1 || prev.length <= 1) return prev;
      const next = prev.filter((t) => t.id !== tabId);
      if (tabId === activeTabId) {
        const switchTo = next[Math.min(idx, next.length - 1)];
        if (switchTo) {
          setTimeout(() => activateTab(switchTo), 0);
        }
      }
      return next;
    });
  }, [activeTabId, activateTab]);

  const handleNewTab = useCallback(() => {
    const id = `dashboard-${Date.now()}`;
    setTabs((prev) => [...prev, { id, type: 'dashboard', label: 'Dashboard' }]);
    setActiveTabId(id);
    pushNavSnapshot();
    setActiveView('dashboard');
    setSelectedBook(null);
    setSelectedChapter(null);
    setSelectedVerse(null);
    setSelectedWorkId(null);
    setSelectedSectionId(null);
    setPrayerFilter({ type: 'all' });
  }, [pushNavSnapshot]);

  const handleSelectBook = useCallback((book: BibleBook) => {
    pushNavSnapshot();
    navigateInTab('bible', book.name, { bookId: book.id });
    setSelectedBook(book);
    setSelectedChapter(null);
    setSelectedVerse(null);
    setActiveView('bible');
    addRecentlyOpened({ id: `bible:${book.id}`, label: book.name, subtitle: book.testament, type: 'bible' });
  }, [pushNavSnapshot, navigateInTab]);

  const handleSelectView = useCallback((view: ActiveView) => {
    pushNavSnapshot();
    navigateInTab(view, view.charAt(0).toUpperCase() + view.slice(1).replace(/-/g, ' '));
    setActiveView(view);
    if (view === 'prayer-journal') {
      setSelectedBook(null);
      setSelectedChapter(null);
      setSelectedVerse(null);
      setSelectedWorkId(null);
    }
  }, [pushNavSnapshot, navigateInTab]);

  const handlePrayerFilter = (filter: PrayerFilter) => {
    setPrayerFilter(filter);
  };

  const handleSelectWork = useCallback((workId: string, sectionId?: string) => {
    pushNavSnapshot();
    if (activeView === 'companion-text' && selectedWorkId && selectedSectionId) {
      setCompanionPositions((prev) => {
        const next = { ...prev, [selectedWorkId]: selectedSectionId };
        persistCompanionPositions(next);
        return next;
      });
    }
    const textService = new TextService();
    const manifest = textService.getManifestEntry(workId);
    const targetSectionId = sectionId ?? companionPositions[workId] ?? null;
    navigateInTab('companion-text', manifest?.name ?? workId, { workId, sectionId: targetSectionId ?? undefined });
    setActiveView('companion-text');
    setSelectedBook(null);
    setSelectedChapter(null);
    setSelectedVerse(null);
    setSelectedWorkId(workId);
    setSelectedSectionId(targetSectionId);
    addRecentlyOpened({ id: `${workId}${targetSectionId ? `:${targetSectionId}` : ''}`, label: manifest?.name ?? workId, subtitle: targetSectionId ?? '', type: 'companion' });
  }, [pushNavSnapshot, activeView, selectedWorkId, selectedSectionId, companionPositions, navigateInTab]);

  const handleSelectChapter = (chapter: number) => {
    pushNavSnapshot();
    setSelectedChapter(chapter);
    setSelectedVerse(null);
    if (selectedBook) {
      void savePosition(selectedBook.id, chapter);
      addRecentlyOpened({ id: `bible:${selectedBook.id}:${chapter}`, label: selectedBook.name, subtitle: `Chapter ${chapter}`, type: 'bible' });
      if (session && !session.endTime) logVisit(selectedBook.id, String(chapter), `${selectedBook.name} ${chapter}`);
    }
    scheduleSync();
  };

  const handleSelectVerse = (verse: VerseRef) => {
    setSelectedVerse(verse);
  };

  const handleNoteSaved = () => {
    setNotesRefreshKey((k) => k + 1);
  };

  const handleNoteDeleted = () => {
    setNotesRefreshKey((k) => k + 1);
  };

  const handleNavigateToBookmark = (sourceReference: string) => {
    const match = sourceReference.match(/^([^:]+):(\d+):(\d+)/);
    if (!match) return;
    const [, bookId, chapterStr, verseStr] = match;
    const book = books.find((b) => b.id === bookId);
    if (!book) return;
    const target: VerseRef = { bookId, chapterNumber: Number.parseInt(chapterStr, 10), verseNumber: Number.parseInt(verseStr, 10) };
    pushNavSnapshot();
    navigateInTab('bible', book.name, { bookId, chapterNumber: target.chapterNumber });
    setSelectedBook(book);
    setSelectedChapter(target.chapterNumber);
    setSelectedVerse(target);
    setPendingNavigation(target);
  };

  const handlePendingNavigationClear = () => {
    setPendingNavigation(null);
  };

  const handleSelectSection = useCallback((sectionId: string) => {
    pushNavSnapshot();
    setSelectedSectionId(sectionId);
    if (selectedWorkId) {
      setCompanionPositions((prev) => {
        const next = { ...prev, [selectedWorkId]: sectionId };
        persistCompanionPositions(next);
        return next;
      });
      const textService = new TextService();
      const manifest = textService.getManifestEntry(selectedWorkId);
      addRecentlyOpened({ id: `${selectedWorkId}:${sectionId}`, label: manifest?.name ?? selectedWorkId, subtitle: sectionId, type: 'companion' });
      if (session && !session.endTime) logVisit(selectedWorkId, sectionId, `${manifest?.name ?? selectedWorkId} - ${sectionId}`);
    }
    scheduleSync();
  }, [pushNavSnapshot, selectedWorkId, session, logVisit, scheduleSync]);

  const handleSelectNote = (noteId: string | null) => {
    setSelectedNoteId(noteId);
  };

  const handleCrossLinkNavigate = (type: string, id: string) => {
    switch (type) {
      case 'note':
        void noteRepository.findById(id).then((n) => { if (n) setViewingNote(n); });
        break;
      case 'prayer':
        pushNavSnapshot();
        setPrayerFilter({ type: 'all' });
        handleSelectView('prayer-journal');
        break;
      case 'collection':
        pushNavSnapshot();
        handleSelectView('collections');
        break;
      case 'passage': {
        const match = id.match(/^([^:]+):(\d+)/);
        if (match) handleSelectWork(match[1], match[2]);
        break;
      }
      case 'bible-passage': {
        handleNavigateToBookmark(id);
        break;
      }
      case 'article': {
        const parts = id.split(':');
        if (parts.length >= 2) handleSelectWork(parts[0], parts[1]);
        break;
      }
    }
  };

  const handleGraphNodeClick = useCallback((type: GraphNodeType, id: string) => {
    const parts = id.split(':');
    const entityId = parts.slice(1).join(':');
    switch (type) {
      case 'passage':
        handleNavigateToBookmark(entityId);
        break;
      case 'note':
        void noteRepository.findById(entityId).then((n) => { if (n) setViewingNote(n); });
        break;
      case 'bookmark':
        handleNavigateToBookmark(entityId);
        break;
      case 'prayer':
        pushNavSnapshot();
        setPrayerFilter({ type: 'all' });
        handleSelectView('prayer-journal');
        break;
      case 'collection':
        pushNavSnapshot();
        handleSelectView('collections');
        break;
      case 'project':
        pushNavSnapshot();
        handleSelectView('projects');
        break;
    }
  }, [pushNavSnapshot, handleSelectView, handleNavigateToBookmark]);

  const handleDeleteSelectedNote = async () => {
    if (!selectedNoteId) return;
    await noteRepository.delete(selectedNoteId);
    setSelectedNoteId(null);
    setNotesRefreshKey((k) => k + 1);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

      if (e.key === '?' && !isInput) {
        setShowShortcutsHelp(true);
        e.preventDefault();
        return;
      }

      if ((e.altKey || e.metaKey) && e.key === 'ArrowLeft' && !isInput) {
        e.preventDefault();
        navigateBack();
        return;
      }

      if ((e.altKey || e.metaKey) && e.key === 'ArrowRight' && !isInput) {
        e.preventDefault();
        navigateForward();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.key === 'k' && !isInput) {
        e.preventDefault();
        setShowGlobalSearch(true);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P' && !isInput) {
        e.preventDefault();
        setShowNewPrayer(true);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C' && !isInput) {
        e.preventDefault();
        setShowNewCollection(true);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key === 'n' && !isInput) {
        e.preventDefault();
        setShowNewNote(true);
        return;
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [navigateBack, navigateForward]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          books={books}
          selectedBook={selectedBook}
          onSelectBook={handleSelectBook}
          activeView={activeView}
          onSelectView={handleSelectView}
          selectedWorkId={selectedWorkId}
          selectedSectionId={selectedSectionId}
          onSelectWork={handleSelectWork}
          prayerFilter={prayerFilter}
          onPrayerFilter={handlePrayerFilter}
          onShowShortcuts={() => setShowShortcutsHelp(true)}
        />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TabBar
            tabs={tabs}
            activeTabId={activeTabId}
            onSelectTab={handleSelectTab}
            onCloseTab={handleCloseTab}
            onNewTab={handleNewTab}
          />
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-auto">
              <div key={activeView} className="animate-slide-in h-full">
                {activeView === 'dashboard' ? (
                <Dashboard
                  books={books}
                  onNavigateToPassage={(bookId, chapter) => {
                    const book = books.find((b) => b.id === bookId);
                    if (book) {
                      pushNavSnapshot();
                      navigateInTab('bible', book.name, { bookId, chapterNumber: chapter });
                      setActiveView('bible');
                      setSelectedBook(book);
                      setSelectedChapter(chapter);
                      setSelectedVerse(null);
                      void savePosition(bookId, chapter);
                    }
                  }}
                  onSelectView={handleSelectView}
                  onNavigateToWork={handleSelectWork}
                />
              ) : activeView === 'graph' ? (
                <KnowledgeGraphView onNodeClick={handleGraphNodeClick} />
              ) : (
                <Reader
                  selectedBook={selectedBook}
                  selectedChapter={selectedChapter}
                  selectedVerse={selectedVerse}
                  onSelectChapter={handleSelectChapter}
                  onSelectVerse={handleSelectVerse}
                  onNoteSaved={handleNoteSaved}
                  pendingNavigation={pendingNavigation}
                  onPendingNavigationClear={handlePendingNavigationClear}
                  activeView={activeView}
                  selectedWorkId={selectedWorkId}
                  selectedSectionId={selectedSectionId}
                  onSelectWork={handleSelectWork}
                  onSelectSection={handleSelectSection}
                  prayerRefreshKey={notesRefreshKey}
                  prayerFilter={prayerFilter}
                  selectedNoteId={selectedNoteId}
                  onSelectNote={handleSelectNote}
                  onDeleteSelectedNote={handleDeleteSelectedNote}
                  onCrossLinkNavigate={handleCrossLinkNavigate}
                  onNavigateToPassage={(bookId, chapter, verse) => {
                    const book = books.find((b) => b.id === bookId);
                    if (book) {
                      pushNavSnapshot();
                      navigateInTab('bible', book.name, { bookId, chapterNumber: chapter });
                      setActiveView('bible');
                      setSelectedBook(book);
                      setSelectedChapter(chapter);
                      if (verse) {
                        const target: VerseRef = { bookId, chapterNumber: chapter, verseNumber: verse };
                        setSelectedVerse(target);
                        setPendingNavigation(target);
                      } else {
                        setSelectedVerse(null);
                      }
                      void savePosition(bookId, chapter);
                    }
                  }}
                />
              )}
            </div>
            </div>
            <RightPanel
              selectedVerse={selectedVerse}
              selectedBook={selectedBook}
              selectedChapter={selectedChapter}
              notes={notes}
              notesLoading={notesLoading}
              books={books}
              refreshKey={notesRefreshKey}
              onNoteDeleted={handleNoteDeleted}
              onNavigateToBookmark={handleNavigateToBookmark}
              onNavigateToNote={handleNavigateToBookmark}
              selectedNoteId={selectedNoteId}
              onSelectNote={handleSelectNote}
              workId={activeView === 'companion-text' ? selectedWorkId : null}
              sectionId={activeView === 'companion-text' ? selectedSectionId : null}
            />
          </div>
        </div>
      </div>

      <StatusBar />

      {viewingNote && (
        <NoteViewer
          note={viewingNote}
          onClose={() => setViewingNote(null)}
          onCrossLinkNavigate={handleCrossLinkNavigate}
        />
      )}

      {showGlobalSearch && (
        <GlobalSearchModal
          onSelectNote={(noteId) => { setViewingNote(null); void noteRepository.findById(noteId).then((n) => { if (n) setViewingNote(n); }); }}
          onClose={() => setShowGlobalSearch(false)}
        />
      )}

      {showShortcutsHelp && (
        <KeyboardShortcutsHelp onClose={() => setShowShortcutsHelp(false)} />
      )}

      {showNewNote && (
        <NoteEditor
          sourceReference=""
          onSave={() => { setShowNewNote(false); handleNoteSaved(); }}
          onCancel={() => setShowNewNote(false)}
        />
      )}

      {showNewPrayer && (
        <PrayerEditor
          onSave={() => { setShowNewPrayer(false); handleNoteSaved(); }}
          onCancel={() => setShowNewPrayer(false)}
        />
      )}

      {showNewCollection && (
        <CollectionEditor
          onSave={() => { setShowNewCollection(false); }}
          onCancel={() => setShowNewCollection(false)}
        />
      )}

      {showNewProject && (
        <ProjectEditor
          onSave={(title, description, status, icon, color) => {
            const repo = new ResearchProjectRepository();
            void repo.create({ id: createId('project'), title, description, status, icon, color, notes: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
            setShowNewProject(false);
          }}
          onCancel={() => setShowNewProject(false)}
        />
      )}

      {booksLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[var(--bg)]">
          <LoadingIndicator message="Opening the library…" />
        </div>
      )}
    </div>
  );
}
