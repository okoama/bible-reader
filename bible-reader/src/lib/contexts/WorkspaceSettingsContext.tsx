import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { WorkspaceSettings, AccentName } from '../../types';
import { loadSettings, saveSettings, DEFAULT_SETTINGS } from '../utils/workspaceSettings';
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

export function WorkspaceSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<WorkspaceSettings>(loadSettings);

  useEffect(() => {
    applyAccent(settings.accent);
    applyFontSize(settings.fontSize);
    applyReadingWidth(settings.readingWidth);
  }, []);

  const updateSettings = useCallback((patch: Partial<WorkspaceSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      if (patch.accent) applyAccent(patch.accent);
      if (patch.fontSize) applyFontSize(patch.fontSize);
      if (patch.readingWidth) applyReadingWidth(patch.readingWidth);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
    applyAccent(DEFAULT_SETTINGS.accent);
    applyFontSize(DEFAULT_SETTINGS.fontSize);
    applyReadingWidth(DEFAULT_SETTINGS.readingWidth);
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
