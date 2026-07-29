export const ACCENT_NAMES = ['blue', 'emerald', 'violet', 'amber', 'rose'] as const;
export type AccentName = typeof ACCENT_NAMES[number];

export interface WorkspaceSettings {
  sidebarWidth: number;
  rightPanelWidth: number;
  fontSize: number;
  readingWidth: number;
  accent: AccentName;
}
