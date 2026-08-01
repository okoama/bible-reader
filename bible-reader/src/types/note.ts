export interface Note {
  id: string;
  sourceReference: string;
  title: string;
  content: string;
  tags: string[];
  favorite: boolean;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}
