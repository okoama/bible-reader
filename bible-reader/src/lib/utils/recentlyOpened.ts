const STORAGE_KEY = 'recently-opened';
const MAX_ITEMS = 20;

export interface RecentlyOpenedItem {
  id: string;
  label: string;
  subtitle: string;
  type: 'bible' | 'companion';
  timestamp: string;
}

export function getRecentlyOpened(): RecentlyOpenedItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

export function addRecentlyOpened(item: Omit<RecentlyOpenedItem, 'timestamp'>): void {
  try {
    const items = getRecentlyOpened().filter((i) => i.id !== item.id);
    items.unshift({ ...item, timestamp: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {}
}
