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
  if (tabs.length <= 1) return null;

  return (
    <div className="flex items-center bg-gray-100 border-b border-gray-300 overflow-x-auto text-sm select-none">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const closable = tabs.length > 1;
        return (
          <div
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex items-center gap-1 px-3 py-1.5 cursor-pointer border-r border-gray-300 whitespace-nowrap min-w-0 ${
              isActive
                ? 'bg-white text-gray-900 shadow-sm'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <span className="text-xs">{TAB_ICONS[tab.type] ?? '\u{1F4C4}'}</span>
            <span className="truncate max-w-36">{tab.label}</span>
            {closable && (
              <button
                onClick={(e) => { e.stopPropagation(); onCloseTab(tab.id); }}
                className="ml-1 text-gray-400 hover:text-gray-700 hover:bg-gray-300 rounded-sm leading-none px-0.5 text-xs"
                title="Close tab"
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
