import type { BibleVerse } from './bibleVerse';

export interface BibleChapter {
  number: number;
  verses: BibleVerse[];
}
