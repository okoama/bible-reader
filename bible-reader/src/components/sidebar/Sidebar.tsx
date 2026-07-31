import { useCallback, useEffect, useRef, useState } from 'react';
import type { BibleBook, PrayerFilter } from '../../types';
import { PRAYER_CATEGORIES } from '../../types';
import type { ActiveView } from '../../layouts/AppLayout';
import { TextService } from '../../features/companion-texts/services/TextService';
import { useWorkspaceSettings } from '../../lib/contexts/WorkspaceSettingsContext';
import SettingsModal from '../../features/settings/components/SettingsModal';
import { HomeIcon, StarIcon, FolderIcon, GraphIcon, TabletIcon } from '../../lib/ui/icons';

const textService = new TextService();

const MIN_WIDTH = 180;
const MAX_WIDTH = 400;

type SidebarProps = {
  books: BibleBook[];
  selectedBook: BibleBook | null;
  onSelectBook: (book: BibleBook) => void;
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  selectedWorkId: string | null;
  selectedSectionId: string | null;
  onSelectWork: (workId: string, sectionId?: string) => void;
  prayerFilter: PrayerFilter;
  onPrayerFilter: (filter: PrayerFilter) => void;
  onShowShortcuts?: () => void;
};

type CollapsibleGroupProps = {
  label: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

function CollapsibleGroup({ label, expanded, onToggle, children }: CollapsibleGroupProps) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm font-medium transition-colors duration-150 hover-bg"
        aria-expanded={expanded}
      >
        <span className={`inline-block text-[10px] transition-transform duration-150 ${expanded ? 'rotate-90' : ''}`}>
          &#9654;
        </span>
        {label}
      </button>
      {expanded && <div className="ml-3 space-y-0.5 border-l pl-2">{children}</div>}
    </div>
  );
}

export default function Sidebar({
  books,
  selectedBook,
  onSelectBook,
  activeView,
  onSelectView,
  selectedWorkId,
  selectedSectionId,
  onSelectWork,
  prayerFilter,
  onPrayerFilter,
  onShowShortcuts,
}: SidebarProps) {
  const { settings, updateSettings } = useWorkspaceSettings();
  const [bibleExpanded, setBibleExpanded] = useState(false);
  const [catechismExpanded, setCatechismExpanded] = useState(false);
  const [summaExpanded, setSummaExpanded] = useState(false);
  const [confessionsExpanded, setConfessionsExpanded] = useState(false);
  const [imitationExpanded, setImitationExpanded] = useState(false);
  const [devoutLifeExpanded, setDevoutLifeExpanded] = useState(false);
  const [prayersExpanded, setPrayersExpanded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(settings.sidebarWidth);

  const catechismEntry = textService.getManifestEntry('catechism');
  const summaWorks = textService.getWorksByGroup('Summa Theologiae');
  const confessionsEntry = textService.getManifestEntry('confessions');
  const imitationWorks = textService.getWorksByGroup('Imitation of Christ');
  const devoutLifeWorks = textService.getWorksByGroup('Devout Life');
  const [showSettings, setShowSettings] = useState(false);
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const currentWidthRef = useRef(sidebarWidth);
  currentWidthRef.current = sidebarWidth;

  useEffect(() => {
    setSidebarWidth(settings.sidebarWidth);
  }, [settings.sidebarWidth]);

  useEffect(() => {
    if (activeView === 'companion-text' && selectedWorkId) {
      if (selectedWorkId === 'catechism') setCatechismExpanded(true);
      if (selectedWorkId === 'confessions') setConfessionsExpanded(true);
      if (selectedWorkId.startsWith('summa-')) setSummaExpanded(true);
      if (selectedWorkId.startsWith('imitation-')) setImitationExpanded(true);
      if (selectedWorkId.startsWith('devout-life-')) setDevoutLifeExpanded(true);
    }
  }, [activeView, selectedWorkId]);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startWidth: currentWidthRef.current };

    const handleDragMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, dragRef.current.startWidth + dx));
      setSidebarWidth(newWidth);
      currentWidthRef.current = newWidth;
    };

    const handleDragEnd = () => {
      if (dragRef.current) {
        updateSettings({ sidebarWidth: currentWidthRef.current });
        dragRef.current = null;
      }
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [updateSettings]);

  return sidebarOpen ? (
    <aside className="relative shrink-0 border-r border-theme bg-sidebar overflow-hidden flex flex-col" style={{ width: sidebarWidth }}>
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide opacity-35">Library</h2>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => onShowShortcuts?.()} className="text-xs opacity-40 hover:opacity-80" title="Keyboard Shortcuts">
            ?
          </button>
          <button type="button" onClick={() => setShowSettings(true)} className="text-sm opacity-60 hover:opacity-100" title="Workspace Settings">
            {'\u2699'}
          </button>
          <button type="button" onClick={() => setSidebarOpen(false)} className="text-xs opacity-40 hover:opacity-80 ml-1" title="Collapse sidebar">
            {'\u2715'}
          </button>
        </div>
      </div>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-1.5">
          {/* Dashboard */}
          <button
            type="button"
            onClick={() => onSelectView('dashboard')}
            className={`flex w-full items-center gap-2 rounded px-3 py-1.5 text-left text-sm transition-colors duration-150 ${
              activeView === 'dashboard' ? 'nav-active' : 'hover-bg'
            }`}
          >
            <HomeIcon size={16} className="shrink-0" /> Study Desk
          </button>
{/* Favorites */}
          <button
            type="button"
            onClick={() => onSelectView('favorites')}
            className={`flex w-full items-center gap-2 rounded px-3 py-1.5 text-left text-sm transition-colors duration-150 ${
              activeView === 'favorites' ? 'nav-active' : 'hover-bg'
            }`}
          >
            <StarIcon size={16} className="shrink-0" /> Favorites
          </button>
{/* Collections */}
          <button
            type="button"
            onClick={() => onSelectView('collections')}
            className={`flex w-full items-center gap-2 rounded px-3 py-1.5 text-left text-sm transition-colors duration-150 ${
              activeView === 'collections' ? 'nav-active' : 'hover-bg'
            }`}
          >
            <FolderIcon size={16} className="shrink-0" /> Collections
          </button>
{/* Knowledge Graph */}
          <button
            type="button"
            onClick={() => onSelectView('graph')}
            className={`flex w-full items-center gap-2 rounded px-3 py-1.5 text-left text-sm transition-colors duration-150 ${
              activeView === 'graph' ? 'nav-active' : 'hover-bg'
            }`}
          >
            <GraphIcon size={16} className="shrink-0" /> Knowledge Graph
          </button>
{/* Projects */}
          <button
            type="button"
            onClick={() => onSelectView('projects')}
            className={`flex w-full items-center gap-2 rounded px-3 py-1.5 text-left text-sm transition-colors duration-150 ${
              activeView === 'projects' ? 'nav-active' : 'hover-bg'
            }`}
          >
            <TabletIcon size={16} className="shrink-0" /> Projects
          </button>
{/* Bible */}
          <CollapsibleGroup
            label="Bible"
            expanded={bibleExpanded}
            onToggle={() => setBibleExpanded((prev) => !prev)}
          >
            {books.map((book) => {
              const isSelected = activeView === 'bible' && selectedBook?.id === book.id;
              return (
                <button
                  key={book.id}
                  type="button"
                  onClick={() => onSelectBook(book)}
                  className={`w-full rounded px-3 py-1 text-left text-sm transition-colors duration-150 ${
                    isSelected ? 'nav-active' : 'hover-bg'
                  }`}
                >
                  {book.name}
                </button>
              );
            })}
          </CollapsibleGroup>
{/* Catechism */}
          {catechismEntry && (
            <CollapsibleGroup
              label="Catechism"
              expanded={catechismExpanded}
              onToggle={() => setCatechismExpanded((prev) => !prev)}
            >
              {catechismEntry.sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => onSelectWork('catechism', section.id)}
                  className={`w-full rounded px-3 py-1 text-left text-xs transition-colors duration-150 ${
                    activeView === 'companion-text' && selectedWorkId === 'catechism' && selectedSectionId === section.id
                      ? 'nav-active'
                      : 'hover-bg'
                  }`}
                >
                  <span className="truncate block">{section.label}</span>
                </button>
              ))}
            </CollapsibleGroup>
          )}
{/* Summa Theologiae */}
          <CollapsibleGroup
            label="Summa Theologiae"
            expanded={summaExpanded}
            onToggle={() => setSummaExpanded((prev) => !prev)}
          >
            {summaWorks.map((work) => (
              <button
                key={work.id}
                type="button"
                onClick={() => onSelectWork(work.id)}
                className={`w-full rounded px-3 py-1 text-left text-xs transition-colors duration-150 ${
                  activeView === 'companion-text' && selectedWorkId === work.id
                    ? 'nav-active'
                    : 'hover-bg'
                }`}
              >
                {work.name}
              </button>
            ))}
          </CollapsibleGroup>
{/* Confessions */}
          {confessionsEntry && (
            <CollapsibleGroup
              label="Confessions"
              expanded={confessionsExpanded}
              onToggle={() => setConfessionsExpanded((prev) => !prev)}
            >
              {confessionsEntry.sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => onSelectWork('confessions', section.id)}
                  className={`w-full rounded px-3 py-1 text-left text-xs transition-colors duration-150 ${
                    activeView === 'companion-text' && selectedWorkId === 'confessions' && selectedSectionId === section.id
                      ? 'nav-active'
                      : 'hover-bg'
                  }`}
                >
                  <span className="truncate block">{section.label}</span>
                </button>
              ))}
            </CollapsibleGroup>
          )}
{/* Imitation of Christ */}
          <CollapsibleGroup
            label="Imitation of Christ"
            expanded={imitationExpanded}
            onToggle={() => setImitationExpanded((prev) => !prev)}
          >
            {imitationWorks.map((work) => (
              <button
                key={work.id}
                type="button"
                onClick={() => onSelectWork(work.id)}
                className={`w-full rounded px-3 py-1 text-left text-xs transition-colors duration-150 ${
                  activeView === 'companion-text' && selectedWorkId === work.id
                    ? 'nav-active'
                    : 'hover-bg'
                }`}
              >
                <span className="truncate block">{work.name}</span>
              </button>
            ))}
          </CollapsibleGroup>
{/* Devout Life */}
          <CollapsibleGroup
            label="Devout Life"
            expanded={devoutLifeExpanded}
            onToggle={() => setDevoutLifeExpanded((prev) => !prev)}
          >
            {devoutLifeWorks.map((work) => (
              <button
                key={work.id}
                type="button"
                onClick={() => onSelectWork(work.id)}
                className={`w-full rounded px-3 py-1 text-left text-xs transition-colors duration-150 ${
                  activeView === 'companion-text' && selectedWorkId === work.id
                    ? 'nav-active'
                    : 'hover-bg'
                }`}
              >
                <span className="truncate block">{work.name}</span>
              </button>
            ))}
          </CollapsibleGroup>
{/* Prayers */}
          <CollapsibleGroup
            label="Prayers"
            expanded={prayersExpanded}
            onToggle={() => setPrayersExpanded((prev) => !prev)}
          >
            <button
              type="button"
              onClick={() => { onPrayerFilter({ type: 'all' }); onSelectView('prayer-journal'); }}
              className={`w-full rounded px-3 py-1 text-left text-xs transition-colors duration-150 ${
                activeView === 'prayer-journal' && prayerFilter.type === 'all'
                  ? 'nav-active' : 'hover-bg'
              }`}
            >
              All Prayers
            </button>
            <button
              type="button"
              onClick={() => { onPrayerFilter({ type: 'favorites' }); onSelectView('prayer-journal'); }}
              className={`w-full rounded px-3 py-1 text-left text-xs transition-colors duration-150 ${
                activeView === 'prayer-journal' && prayerFilter.type === 'favorites'
                  ? 'nav-active' : 'hover-bg'
              }`}
            >
              Favorites
            </button>
            <button
              type="button"
              onClick={() => { onPrayerFilter({ type: 'answered' }); onSelectView('prayer-journal'); }}
              className={`w-full rounded px-3 py-1 text-left text-xs transition-colors duration-150 ${
                activeView === 'prayer-journal' && prayerFilter.type === 'answered'
                  ? 'nav-active' : 'hover-bg'
              }`}
            >
              Answered
            </button>
            <div className="ml-2 mt-1 space-y-0.5">
              {PRAYER_CATEGORIES.filter((c) => c.value !== 'custom').map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => { onPrayerFilter({ type: 'category', category: cat.value }); onSelectView('prayer-journal'); }}
                  className={`w-full rounded px-3 py-1 text-left text-[11px] transition-colors duration-150 ${
                    activeView === 'prayer-journal' && prayerFilter.type === 'category' && prayerFilter.category === cat.value
                      ? 'nav-active' : 'hover-bg'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => { onPrayerFilter({ type: 'recent' }); onSelectView('prayer-journal'); }}
              className={`w-full rounded px-3 py-1 text-left text-xs transition-colors duration-150 ${
                activeView === 'prayer-journal' && prayerFilter.type === 'recent'
                  ? 'nav-active' : 'hover-bg'
              }`}
            >
              Recent
            </button>
            <div className="mt-1 border-t pt-1">
              <button
                type="button"
                onClick={() => { onPrayerFilter({ type: 'traditional' }); onSelectView('prayer-journal'); }}
                className={`w-full rounded px-3 py-1 text-left text-xs transition-colors duration-150 ${
                  activeView === 'prayer-journal' && prayerFilter.type === 'traditional'
                    ? 'nav-active' : 'hover-bg'
                }`}
              >
                Traditional
              </button>
            </div>
          </CollapsibleGroup>
        </div>
      </div>
      <div
        className="absolute right-0 top-0 z-10 h-full w-1 cursor-col-resize transition-colors duration-150 hover:bg-accent-light active:bg-accent-lighter"
        onMouseDown={handleDragStart}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize sidebar"
      />
    </aside>
  ) : (
    <button
      type="button"
      onClick={() => setSidebarOpen(true)}
      className="shrink-0 border-r border-theme bg-sidebar px-1 py-3 text-xs text-muted hover:text-text hover-bg transition-colors duration-150"
      title="Expand sidebar"
      style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
    >
      Library
    </button>
  );
}
