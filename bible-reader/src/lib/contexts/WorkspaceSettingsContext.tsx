import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { WorkspaceSettings, AccentName, ThemeId } from '../../types';
import { loadSettings, saveSettings, DEFAULT_SETTINGS, THEMES } from '../utils/workspaceSettings';
import { ACCENT_COLORS } from '../utils/accent';

type WorkspaceSettingsContextValue = {
  settings: WorkspaceSettings;
  updateSettings: (patch: Partial<WorkspaceSettings>) => void;
  resetSettings: () => void;
};

const WorkspaceSettingsContext = createContext<WorkspaceSettingsContextValue | null>(null);

function applyAccent(accent: AccentName): void {
  const colors = ACCENT_COLORS[accent];
  const root = document.documentElement;
  root.style.setProperty('--accent', colors.base);
  root.style.setProperty('--accent-hover', colors.hover);
  root.style.setProperty('--accent-light', colors.light);
  root.style.setProperty('--accent-lighter', colors.lighter);
  root.style.setProperty('--accent-ring', colors.ring);
}

function applyFontSize(size: number): void {
  document.documentElement.style.setProperty('--font-size', `${size}px`);
}

function applyReadingWidth(width: number): void {
  document.documentElement.style.setProperty('--reading-width', `${width}px`);
}

function applyTheme(themeId: ThemeId): void {
  const theme = THEMES[themeId];
  if (!theme) return;
  const root = document.documentElement;
  root.style.setProperty('--bg', theme.bg);
  root.style.setProperty('--sidebar-bg', theme.sidebarBg);
  root.style.setProperty('--panel-bg', theme.panelBg);
  root.style.setProperty('--reader-bg', theme.readerBg);
  root.style.setProperty('--card-bg', theme.cardBg);
  root.style.setProperty('--hover', theme.hover);
  root.style.setProperty('--text', theme.text);
  root.style.setProperty('--muted', theme.muted);
  root.style.setProperty('--border', theme.border);
  root.style.setProperty('--secondary', theme.secondary);
  root.style.setProperty('--reader-font', theme.readerFont);
  root.style.setProperty('--ui-font', theme.uiFont);
  root.style.setProperty('--line-height', String(theme.lineHeight));
}

export function WorkspaceSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<WorkspaceSettings>(loadSettings);

  useEffect(() => {
    applyAccent(settings.accent);
    applyFontSize(settings.fontSize);
    applyReadingWidth(settings.readingWidth);
    applyTheme(settings.theme);
  }, []);

  const updateSettings = useCallback((patch: Partial<WorkspaceSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      if (patch.accent) applyAccent(patch.accent);
      if (patch.fontSize) applyFontSize(patch.fontSize);
      if (patch.readingWidth) applyReadingWidth(patch.readingWidth);
      if (patch.theme) applyTheme(patch.theme);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
    applyAccent(DEFAULT_SETTINGS.accent);
    applyFontSize(DEFAULT_SETTINGS.fontSize);
    applyReadingWidth(DEFAULT_SETTINGS.readingWidth);
    applyTheme(DEFAULT_SETTINGS.theme);
  }, []);

  return (
    <WorkspaceSettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </WorkspaceSettingsContext.Provider>
  );
}

export function useWorkspaceSettings(): WorkspaceSettingsContextValue {
  const ctx = useContext(WorkspaceSettingsContext);
  if (!ctx) throw new Error('useWorkspaceSettings must be used within WorkspaceSettingsProvider');
  return ctx;
}
