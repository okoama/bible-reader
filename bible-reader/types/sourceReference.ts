export type WorkType =
  | "bible"
  | "catechism"
  | "summa"
  | "confessions"
  | "imitation"
  | "devout-life";

export interface SourceReference {
  work: WorkType;

  book?: string;
  chapter?: number;
  verseStart?: number;
  verseEnd?: number;

  paragraph?: number;

  part?: string;
  question?: number;
  article?: number;

  section?: string;
}