export interface Tab {
  id: string;
  type: 'dashboard' | 'bible' | 'companion-text' | 'prayer-journal' | 'favorites' | 'collections' | 'projects' | 'graph' | 'collection-item' | 'project-item';
  label: string;
  bookId?: string;
  chapterNumber?: number;
  workId?: string;
  sectionId?: string;
  itemId?: string;
}
