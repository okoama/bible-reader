export const ACCENT_NAMES = ['blue', 'emerald', 'violet', 'amber', 'rose', 'crimson', 'sapphire'] as const;
export type AccentName = typeof ACCENT_NAMES[number];

export const THEME_NAMES = ['scriptorium', 'cathedral', 'cloister', 'chancery', 'candlelight', 'scripture'] as const;
export type ThemeName = typeof THEME_NAMES[number];

export interface Theme {
  id: ThemeName;
  label: string;
  description: string;
  bg: string;
  sidebarBg: string;
  panelBg: string;
  readerBg: string;
  cardBg: string;
  hover: string;
  text: string;
  muted: string;
  border: string;
  accent: AccentName;
  secondary: string;
  readerFont: string;
  uiFont: string;
  lineHeight: number;
}

export interface WorkspaceSettings {
  sidebarWidth: number;
  rightPanelWidth: number;
  fontSize: number;
  readingWidth: number;
  accent: AccentName;
  theme: ThemeName;
  lineHeight: number;
}
