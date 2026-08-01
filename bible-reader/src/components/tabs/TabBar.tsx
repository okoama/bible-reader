import { useCallback, useRef } from 'react';
import type { Tab } from '../../types';
import { HomeIcon, BibleIcon, BooksIcon, StarIcon, FolderIcon, TabletIcon, GraphIcon, CandleIcon } from '../../lib/ui/icons';

type TabBarProps = {
  tabs: Tab[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onNewTab: () => void;
};

export default function TabBar({ tabs, activeTabId, onSelectTab, onCloseTab, onNewTab }: TabBarProps) {
  const tabRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const focusTab = useCallback((tabId: string) => {
    tabRefs.current.get(tabId)?.focus();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    const len = tabs.length;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (index - 1 + len) % len;
      onSelectTab(tabs[prev].id);
      focusTab(tabs[prev].id);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (index + 1) % len;
      onSelectTab(tabs[next].id);
      focusTab(tabs[next].id);
    } else if (e.key === 'Home') {
      e.preventDefault();
      onSelectTab(tabs[0].id);
      focusTab(tabs[0].id);
    } else if (e.key === 'End') {
      e.preventDefault();
      onSelectTab(tabs[len - 1].id);
      focusTab(tabs[len - 1].id);
    }
  }, [tabs, onSelectTab, focusTab]);

  return (
    <div className="flex items-center bg-panel border-b border-theme overflow-x-auto text-sm select-none" role="tablist" aria-label="Workspace tabs">
      {tabs.map((tab, i) => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            ref={(el) => { if (el) tabRefs.current.set(tab.id, el); else tabRefs.current.delete(tab.id); }}
            role="tab"
            tabIndex={isActive ? 0 : -1}
            aria-selected={isActive}
            aria-label={`${tab.label} tab`}
            id={`tab-${tab.id}`}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => onSelectTab(tab.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectTab(tab.id);
                return;
              }
              handleKeyDown(e, i);
            }}
            className={`group flex items-center gap-1.5 px-4 py-2 cursor-pointer whitespace-nowrap min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset transition-all duration-150 ${
              isActive
                ? 'tab-active text-accent' : 'opacity-40 hover:opacity-70 hover-bg'
            }`}
          >
            <span className="shrink-0" aria-hidden="true">
              {tab.type === 'dashboard' ? <HomeIcon size={14} /> :
               tab.type === 'bible' ? <BibleIcon size={14} /> :
               tab.type === 'companion-text' ? <BooksIcon size={14} /> :
               tab.type === 'prayer-journal' ? <CandleIcon size={14} /> :
               tab.type === 'favorites' ? <StarIcon size={14} /> :
               tab.type === 'collections' || tab.type === 'collection-item' ? <FolderIcon size={14} /> :
               tab.type === 'projects' || tab.type === 'project-item' ? <TabletIcon size={14} /> :
               tab.type === 'graph' ? <GraphIcon size={14} /> :
               <HomeIcon size={14} />}
            </span>
            <span className="truncate max-w-36 text-xs uppercase tracking-wider">{tab.label}</span>
            {tabs.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); onCloseTab(tab.id); }}
                className="ml-1 opacity-0 group-hover:opacity-60 hover:opacity-100 text-muted hover:text-text rounded-sm leading-none px-0.5 text-xs transition-opacity duration-150 focus-visible:ring-2 focus-visible:ring-accent"
                aria-label={`Close ${tab.label} tab`}
                tabIndex={-1}
              >
                {'\u2715'}
              </button>
            )}
          </div>
        );
      })}
      <button
        onClick={onNewTab}
        className="flex items-center px-3 py-2 opacity-40 hover:opacity-70 hover-bg focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset transition-opacity duration-150"
        aria-label="New tab"
        title="New tab"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
