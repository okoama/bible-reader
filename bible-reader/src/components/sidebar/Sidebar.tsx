import { useState } from 'react';
import type { BibleBook, PrayerFilter } from '../../types';
import { PRAYER_CATEGORIES } from '../../types';
import type { ActiveView } from '../../layouts/AppLayout';
import { TextService } from '../../features/companion-texts/services/TextService';
import { useWorkspaceSettings } from '../../lib/contexts/WorkspaceSettingsContext';
import SettingsModal from '../settings/SettingsModal';

const textService = new TextService();

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
        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm font-medium transition-colors duration-150 hover:bg-gray-100"
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
  const [bibleExpanded, setBibleExpanded] = useState(true);
  const [catechismExpanded, setCatechismExpanded] = useState(false);
  const [summaExpanded, setSummaExpanded] = useState(false);
  const [confessionsExpanded, setConfessionsExpanded] = useState(false);
  const [imitationExpanded, setImitationExpanded] = useState(false);
  const [devoutLifeExpanded, setDevoutLifeExpanded] = useState(false);
  const [prayersExpanded, setPrayersExpanded] = useState(true);

  const catechismEntry = textService.getManifestEntry('catechism');
  const summaWorks = textService.getWorksByGroup('Summa Theologiae');
  const confessionsEntry = textService.getManifestEntry('confessions');
  const imitationWorks = textService.getWorksByGroup('Imitation of Christ');
  const devoutLifeWorks = textService.getWorksByGroup('Devout Life');
  const { settings } = useWorkspaceSettings();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <aside className="shrink-0 overflow-y-auto border-r p-4" style={{ width: settings.sidebarWidth }}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide opacity-70">Library</h2>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => onShowShortcuts?.()} className="text-xs opacity-40 hover:opacity-80" title="Keyboard Shortcuts">
            ?
          </button>
          <button type="button" onClick={() => setShowSettings(true)} className="text-sm opacity-60 hover:opacity-100" title="Workspace Settings">
            {'\u2699'}
          </button>
        </div>
      </div>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      <div className="space-y-0.5">
        {/* Dashboard */}
        <button
          type="button"
          onClick={() => onSelectView('dashboard')}
          className={`w-full rounded px-3 py-1.5 text-left text-sm transition-colors duration-150 ${
            activeView === 'dashboard' ? 'bg-accent-light text-accent font-medium' : 'hover:bg-gray-100'
          }`}
        >
          {'\u{1F3E0}'} Study Desk
        </button>

        {/* Favorites */}
        <button
          type="button"
          onClick={() => onSelectView('favorites')}
          className={`w-full rounded px-3 py-1.5 text-left text-sm transition-colors duration-150 ${
            activeView === 'favorites' ? 'bg-accent-light text-accent font-medium' : 'hover:bg-gray-100'
          }`}
        >
          {'\u2605'} Favorites
        </button>

        {/* Collections */}
        <button
          type="button"
          onClick={() => onSelectView('collections')}
          className={`w-full rounded px-3 py-1.5 text-left text-sm transition-colors duration-150 ${
            activeView === 'collections' ? 'bg-accent-light text-accent font-medium' : 'hover:bg-gray-100'
          }`}
        >
          {'\u{1F4C1}'} Collections
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
                  isSelected ? 'bg-accent-light text-accent' : 'hover:bg-gray-100'
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
                    ? 'bg-accent-light text-accent'
                    : 'hover:bg-gray-100'
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
                  ? 'bg-accent-light text-accent'
                  : 'hover:bg-gray-100'
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
                    ? 'bg-accent-light text-accent'
                    : 'hover:bg-gray-100'
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
                  ? 'bg-accent-light text-accent'
                  : 'hover:bg-gray-100'
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
                  ? 'bg-accent-light text-accent'
                  : 'hover:bg-gray-100'
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
                ? 'bg-accent-light text-accent' : 'hover:bg-gray-100'
            }`}
          >
            All Prayers
          </button>
          <button
            type="button"
            onClick={() => { onPrayerFilter({ type: 'favorites' }); onSelectView('prayer-journal'); }}
            className={`w-full rounded px-3 py-1 text-left text-xs transition-colors duration-150 ${
              activeView === 'prayer-journal' && prayerFilter.type === 'favorites'
                ? 'bg-accent-light text-accent' : 'hover:bg-gray-100'
            }`}
          >
            Favorites
          </button>
          <button
            type="button"
            onClick={() => { onPrayerFilter({ type: 'answered' }); onSelectView('prayer-journal'); }}
            className={`w-full rounded px-3 py-1 text-left text-xs transition-colors duration-150 ${
              activeView === 'prayer-journal' && prayerFilter.type === 'answered'
                ? 'bg-accent-light text-accent' : 'hover:bg-gray-100'
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
                    ? 'bg-accent-light text-accent' : 'hover:bg-gray-100'
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
                ? 'bg-accent-light text-accent' : 'hover:bg-gray-100'
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
                  ? 'bg-accent-light text-accent' : 'hover:bg-gray-100'
              }`}
            >
              Traditional
            </button>
          </div>
        </CollapsibleGroup>
      </div>
    </aside>
  );
}
