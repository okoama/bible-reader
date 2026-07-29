export type ProjectStatus = 'active' | 'draft' | 'completed' | 'archived';

export interface ResearchProject {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  icon: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export const PROJECT_STATUSES: ProjectStatus[] = ['active', 'draft', 'completed', 'archived'];

export const PROJECT_DEFAULT_ICONS = [
  '\u{1F4D6}', '\u{1F4DA}', '\u{1F4D1}', '\u{1F50D}',
  '\u{1F3EB}', '\u{2697}', '\u{1F9EA}', '\u{1F52C}',
  '\u{1F30D}', '\u{1F4BC}', '\u{1F4CA}', '\u{1F4C4}',
] as const;
