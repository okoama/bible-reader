import { useState } from 'react';
import type { BibleBook, PrayerCategory, PrayerFilter } from '../../types';
import { PRAYER_CATEGORIES } from '../../types';
import type { ActiveView } from '../../layouts/AppLayout';
import { TextService } from '../../features/companion-texts/services/TextService';

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

  return (
    <aside className="w-64 shrink-0 overflow-y-auto border-r p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide opacity-70">
        Library
      </h2>

      <div className="space-y-0.5">
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
                  isSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'
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
                    ? 'bg-blue-50 text-blue-700'
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
                  ? 'bg-blue-50 text-blue-700'
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
                    ? 'bg-blue-50 text-blue-700'
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
                  ? 'bg-blue-50 text-blue-700'
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
                  ? 'bg-blue-50 text-blue-700'
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
                ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'
            }`}
          >
            All Prayers
          </button>
          <button
            type="button"
            onClick={() => { onPrayerFilter({ type: 'favorites' }); onSelectView('prayer-journal'); }}
            className={`w-full rounded px-3 py-1 text-left text-xs transition-colors duration-150 ${
              activeView === 'prayer-journal' && prayerFilter.type === 'favorites'
                ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'
            }`}
          >
            Favorites
          </button>
          <button
            type="button"
            onClick={() => { onPrayerFilter({ type: 'answered' }); onSelectView('prayer-journal'); }}
            className={`w-full rounded px-3 py-1 text-left text-xs transition-colors duration-150 ${
              activeView === 'prayer-journal' && prayerFilter.type === 'answered'
                ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'
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
                    ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'
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
                ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'
            }`}
          >
            Recent
          </button>
        </CollapsibleGroup>
      </div>
    </aside>
  );
}
