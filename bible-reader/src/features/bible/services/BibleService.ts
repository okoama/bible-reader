import type { BibleBook, BibleChapter, BibleVerse } from '../../../types';

export class BibleService {
  async loadBooks(): Promise<BibleBook[]> {
    return [];
  }

  async loadChapters(bookId: string): Promise<BibleChapter[]> {
    void bookId;
    return [];
  }

  async loadVerses(bookId: string, chapterNumber: number): Promise<BibleVerse[]> {
    void bookId;
    void chapterNumber;
    return [];
  }
}
