import { useCallback, useRef } from 'react';
import type { Tab } from '../../types';

type TabBarProps = {
  tabs: Tab[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
};

const TAB_ICONS: Record<string, string> = {
  dashboard: '\u{1F3E0}',
  bible: '\u{1F4D6}',
  'companion-text': '\u{1F4DA}',
  'prayer-journal': '\u{1F64F}',
  favorites: '\u{2B50}',
  collections: '\u{1F4C1}',
  projects: '\u{1F4CB}',
  graph: '\u{1F4CA}',
  'collection-item': '\u{1F4C1}',
  'project-item': '\u{1F4CB}',
};

export default function TabBar({ tabs, activeTabId, onSelectTab, onCloseTab }: TabBarProps) {
  const tabRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  if (tabs.length <= 1) return null;

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
    <div className="flex items-center bg-gray-100 border-b border-gray-300 overflow-x-auto text-sm select-none" role="tablist" aria-label="Workspace tabs">
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
            onClick={() => onSelectTab(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className={`flex items-center gap-1 px-3 py-1.5 cursor-pointer border-r border-gray-300 whitespace-nowrap min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset ${
              isActive
                ? 'bg-white text-gray-900 shadow-sm'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <span className="text-xs" aria-hidden="true">{TAB_ICONS[tab.type] ?? '\u{1F4C4}'}</span>
            <span className="truncate max-w-36">{tab.label}</span>
            {tabs.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); onCloseTab(tab.id); }}
                className="ml-1 text-gray-400 hover:text-gray-700 hover:bg-gray-300 rounded-sm leading-none px-0.5 text-xs focus-visible:ring-2 focus-visible:ring-accent"
                aria-label={`Close ${tab.label} tab`}
                tabIndex={-1}
              >
                {'\u2715'}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
