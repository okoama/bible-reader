import type { BibleVerse } from './bibleVerse.ts';

export interface BibleChapter {
  number: number;
  verses: BibleVerse[];
}
