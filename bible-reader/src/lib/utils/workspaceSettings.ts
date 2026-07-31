import type { WorkspaceSettings, Theme, ThemeId } from '../../types';

const STORAGE_KEY = 'workspace-settings';

export const THEMES: Record<ThemeId, Theme> = {
  scriptorium: {
    id: 'scriptorium',
    label: 'Scriptorium',
    description: 'Warm parchment with crimson accents',
    bg: '#f5f0e8',
    sidebarBg: '#efe8dc',
    panelBg: '#e8dfd0',
    readerBg: '#faf5ec',
    cardBg: '#ffffff',
    hover: '#e8dfd0',
    text: '#3a2c1b',
    muted: '#8b7d6b',
    border: '#d4c9b8',
    accent: 'crimson',
    secondary: '#ca8a04',
    readerFont: '"EB Garamond", Georgia, serif',
    uiFont: 'Geist, system-ui, sans-serif',
    lineHeight: 1.85,
  },
  cathedral: {
    id: 'cathedral',
    label: 'Cathedral',
    description: 'Deep sapphire with gold accents',
    bg: '#0e1117',
    sidebarBg: '#171c25',
    panelBg: '#1e2430',
    readerBg: '#252d3b',
    cardBg: '#2c3444',
    hover: '#283040',
    text: '#e8e8e2',
    muted: '#8896a6',
    border: '#2a3342',
    accent: 'sapphire',
    secondary: '#D4AF37',
    readerFont: '"EB Garamond", Georgia, serif',
    uiFont: 'Geist, system-ui, sans-serif',
    lineHeight: 1.8,
  },
  cloister: {
    id: 'cloister',
    label: 'Cloister',
    description: 'Quiet sage with forest green',
    bg: '#f0f4ef',
    sidebarBg: '#e6ece4',
    panelBg: '#dce4d8',
    readerBg: '#f5f8f3',
    cardBg: '#ffffff',
    hover: '#dce4d8',
    text: '#1a2e22',
    muted: '#5c7a66',
    border: '#c8d6c2',
    accent: 'emerald',
    secondary: '#94a06e',
    readerFont: '"EB Garamond", Georgia, serif',
    uiFont: 'Geist, system-ui, sans-serif',
    lineHeight: 1.95,
  },
  chancery: {
    id: 'chancery',
    label: 'Chancery',
    description: 'Clean white with royal blue',
    bg: '#fafafa',
    sidebarBg: '#f1f5f9',
    panelBg: '#e8ecf0',
    readerBg: '#ffffff',
    cardBg: '#ffffff',
    hover: '#e8ecf0',
    text: '#0f172a',
    muted: '#64748b',
    border: '#e2e8f0',
    accent: 'blue',
    secondary: '#475569',
    readerFont: '"EB Garamond", Georgia, serif',
    uiFont: 'Geist, system-ui, sans-serif',
    lineHeight: 1.75,
  },
  candlelight: {
    id: 'candlelight',
    label: 'Candlelight',
    description: 'Warm sepia with amber glow',
    bg: '#fbf1d3',
    sidebarBg: '#f5e6b8',
    panelBg: '#efe0ae',
    readerBg: '#fef7e6',
    cardBg: '#fff9e8',
    hover: '#efe0ae',
    text: '#433422',
    muted: '#8b7a5e',
    border: '#e3d5a8',
    accent: 'amber',
    secondary: '#b8860b',
    readerFont: '"EB Garamond", Georgia, serif',
    uiFont: 'Geist, system-ui, sans-serif',
    lineHeight: 1.85,
  },
  scripture: {
    id: 'scripture',
    label: 'Scripture',
    description: 'Soft cream with crimson-red',
    bg: '#fdfbf7',
    sidebarBg: '#f3f0eb',
    panelBg: '#ece6dc',
    readerBg: '#ffffff',
    cardBg: '#ffffff',
    hover: '#ece6dc',
    text: '#1c1917',
    muted: '#78716c',
    border: '#e7e2d8',
    accent: 'rose',
    secondary: '#b91c1c',
    readerFont: '"EB Garamond", Georgia, serif',
    uiFont: 'Geist, system-ui, sans-serif',
    lineHeight: 1.9,
  },
};

export const DEFAULT_SETTINGS: WorkspaceSettings = {
  sidebarWidth: 256,
  rightPanelWidth: 320,
  fontSize: 16,
  readingWidth: 768,
  accent: 'sapphire',
  theme: 'cathedral',
  lineHeight: 1.8,
};

export function loadSettings(): WorkspaceSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored), theme: 'cathedral' };
  } catch {}
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: WorkspaceSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}
