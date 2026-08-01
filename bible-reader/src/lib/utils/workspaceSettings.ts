import type { WorkspaceSettings } from '../../types';

const STORAGE_KEY = 'workspace-settings';

export const DEFAULT_SETTINGS: WorkspaceSettings = {
  sidebarWidth: 256,
  rightPanelWidth: 320,
  fontSize: 16,
  readingWidth: 768,
  accent: 'blue',
};

export function loadSettings(): WorkspaceSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {}
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: WorkspaceSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}
