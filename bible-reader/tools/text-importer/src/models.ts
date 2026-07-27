export interface TextBlock {
  id: string;
  number?: number;
  text: string;
  label?: string;
}

export interface TextSection {
  id: string;
  label: string;
  content: TextBlock[];
}

export interface TextWork {
  id: string;
  name: string;
  author?: string;
  workType: string;
  sections: TextSection[];
}
