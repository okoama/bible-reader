export type CrossLinkType = 'note' | 'prayer' | 'collection' | 'passage' | 'article';

export interface CrossLink {
  type: CrossLinkType;
  id: string;
  label: string;
  raw: string;
}
