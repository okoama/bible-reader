import type { BibleChapter } from './bibleChapter.ts';

export interface BibleBook {
  id: string;
  name: string;
  testament: string;
  order: number;
  chapters: BibleChapter[];
}
