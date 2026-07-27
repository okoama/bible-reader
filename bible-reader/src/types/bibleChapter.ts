import type { BibleVerse } from './bibleVerse.ts';

export interface BibleChapter {
  chapterNumber: number;
  verses: BibleVerse[];
}
