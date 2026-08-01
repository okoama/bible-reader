export interface Bookmark {
  id: string;
  sourceReference: string;
  title?: string;
  favorite: boolean;
  projectId?: string;
  createdAt: string;
}
