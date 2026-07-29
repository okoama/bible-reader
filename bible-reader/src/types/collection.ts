export type CollectionItemType = 'note' | 'bookmark' | 'prayer' | 'passage';

export interface CollectionItem {
  id: string;
  type: CollectionItemType;
  sourceReference?: string;
  itemId?: string;
  label: string;
  addedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  items: CollectionItem[];
  createdAt: string;
  updatedAt: string;
}
