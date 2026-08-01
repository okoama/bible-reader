import type { Bookmark, Collection, Highlight, Note, Prayer, ReadingProgress, ResearchProject, WorkspaceSettings } from './index';

export interface WorkspaceBackup {
  version: number;
  appVersion: string;
  createdAt: string;
  exportedAt?: string;
  data: {
    notes: Note[];
    highlights: Highlight[];
    bookmarks: Bookmark[];
    prayers: Prayer[];
    readingProgress: ReadingProgress[];
    collections: Collection[];
    projects?: ResearchProject[];
    workspaceSettings: WorkspaceSettings | null;
  };
}
