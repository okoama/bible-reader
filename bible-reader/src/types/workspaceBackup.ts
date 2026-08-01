import type { Bookmark, Collection, Highlight, Note, Prayer, ReadingProgress, WorkspaceSettings } from './index';

export interface WorkspaceBackup {
  version: 1;
  exportedAt: string;
  data: {
    notes: Note[];
    highlights: Highlight[];
    bookmarks: Bookmark[];
    prayers: Prayer[];
    readingProgress: ReadingProgress[];
    collections: Collection[];
    workspaceSettings: WorkspaceSettings | null;
  };
}
