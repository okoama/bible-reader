import type { BibleBook, BibleChapter, BibleVerse } from '../../../types';

interface BookData {
  id: string;
  name: string;
  abbreviation: string;
  testament: string;
  chapters: Array<{
    number: number;
    verses: Array<{ number: number; text: string }>;
  }>;
}

const BOOK_MANIFEST: Array<{ id: string; name: string; testament: string; order: number }> = [
  { id: 'genesis', name: 'Genesis', testament: 'Old Testament', order: 1 },
  { id: 'exodus', name: 'Exodus', testament: 'Old Testament', order: 2 },
  { id: 'leviticus', name: 'Leviticus', testament: 'Old Testament', order: 3 },
  { id: 'numbers', name: 'Numbers', testament: 'Old Testament', order: 4 },
  { id: 'deuteronomy', name: 'Deuteronomy', testament: 'Old Testament', order: 5 },
  { id: 'joshua', name: 'Joshua', testament: 'Old Testament', order: 6 },
  { id: 'judges', name: 'Judges', testament: 'Old Testament', order: 7 },
  { id: 'ruth', name: 'Ruth', testament: 'Old Testament', order: 8 },
  { id: '1-samuel', name: '1 Samuel', testament: 'Old Testament', order: 9 },
  { id: '2-samuel', name: '2 Samuel', testament: 'Old Testament', order: 10 },
  { id: '1-kings', name: '1 Kings', testament: 'Old Testament', order: 11 },
  { id: '2-kings', name: '2 Kings', testament: 'Old Testament', order: 12 },
  { id: '1-chronicles', name: '1 Chronicles', testament: 'Old Testament', order: 13 },
  { id: '2-chronicles', name: '2 Chronicles', testament: 'Old Testament', order: 14 },
  { id: 'ezra', name: 'Ezra', testament: 'Old Testament', order: 15 },
  { id: 'nehemiah', name: 'Nehemiah', testament: 'Old Testament', order: 16 },
  { id: 'tobit', name: 'Tobit', testament: 'Deuterocanonical', order: 17 },
  { id: 'judith', name: 'Judith', testament: 'Deuterocanonical', order: 18 },
  { id: 'esther', name: 'Esther', testament: 'Old Testament', order: 19 },
  { id: '1-maccabees', name: '1 Maccabees', testament: 'Deuterocanonical', order: 20 },
  { id: '2-maccabees', name: '2 Maccabees', testament: 'Deuterocanonical', order: 21 },
  { id: 'job', name: 'Job', testament: 'Old Testament', order: 22 },
  { id: 'psalms', name: 'Psalms', testament: 'Old Testament', order: 23 },
  { id: 'proverbs', name: 'Proverbs', testament: 'Old Testament', order: 24 },
  { id: 'ecclesiastes', name: 'Ecclesiastes', testament: 'Old Testament', order: 25 },
  { id: 'song-of-solomon', name: 'Song of Solomon', testament: 'Old Testament', order: 26 },
  { id: 'wisdom', name: 'Wisdom', testament: 'Deuterocanonical', order: 27 },
  { id: 'sirach', name: 'Sirach', testament: 'Deuterocanonical', order: 28 },
  { id: 'isaiah', name: 'Isaiah', testament: 'Old Testament', order: 29 },
  { id: 'jeremiah', name: 'Jeremiah', testament: 'Old Testament', order: 30 },
  { id: 'lamentations', name: 'Lamentations', testament: 'Old Testament', order: 31 },
  { id: 'baruch', name: 'Baruch', testament: 'Deuterocanonical', order: 32 },
  { id: 'ezekiel', name: 'Ezekiel', testament: 'Old Testament', order: 33 },
  { id: 'daniel', name: 'Daniel', testament: 'Old Testament', order: 34 },
  { id: 'hosea', name: 'Hosea', testament: 'Old Testament', order: 35 },
  { id: 'joel', name: 'Joel', testament: 'Old Testament', order: 36 },
  { id: 'amos', name: 'Amos', testament: 'Old Testament', order: 37 },
  { id: 'obadiah', name: 'Obadiah', testament: 'Old Testament', order: 38 },
  { id: 'jonah', name: 'Jonah', testament: 'Old Testament', order: 39 },
  { id: 'micah', name: 'Micah', testament: 'Old Testament', order: 40 },
  { id: 'nahum', name: 'Nahum', testament: 'Old Testament', order: 41 },
  { id: 'habakkuk', name: 'Habakkuk', testament: 'Old Testament', order: 42 },
  { id: 'zephaniah', name: 'Zephaniah', testament: 'Old Testament', order: 43 },
  { id: 'haggai', name: 'Haggai', testament: 'Old Testament', order: 44 },
  { id: 'zechariah', name: 'Zechariah', testament: 'Old Testament', order: 45 },
  { id: 'malachi', name: 'Malachi', testament: 'Old Testament', order: 46 },
  { id: 'matthew', name: 'Matthew', testament: 'New Testament', order: 47 },
  { id: 'mark', name: 'Mark', testament: 'New Testament', order: 48 },
  { id: 'luke', name: 'Luke', testament: 'New Testament', order: 49 },
  { id: 'john', name: 'John', testament: 'New Testament', order: 50 },
  { id: 'acts', name: 'Acts', testament: 'New Testament', order: 51 },
  { id: 'romans', name: 'Romans', testament: 'New Testament', order: 52 },
  { id: '1-corinthians', name: '1 Corinthians', testament: 'New Testament', order: 53 },
  { id: '2-corinthians', name: '2 Corinthians', testament: 'New Testament', order: 54 },
  { id: 'galatians', name: 'Galatians', testament: 'New Testament', order: 55 },
  { id: 'ephesians', name: 'Ephesians', testament: 'New Testament', order: 56 },
  { id: 'philippians', name: 'Philippians', testament: 'New Testament', order: 57 },
  { id: 'colossians', name: 'Colossians', testament: 'New Testament', order: 58 },
  { id: '1-thessalonians', name: '1 Thessalonians', testament: 'New Testament', order: 59 },
  { id: '2-thessalonians', name: '2 Thessalonians', testament: 'New Testament', order: 60 },
  { id: '1-timothy', name: '1 Timothy', testament: 'New Testament', order: 61 },
  { id: '2-timothy', name: '2 Timothy', testament: 'New Testament', order: 62 },
  { id: 'titus', name: 'Titus', testament: 'New Testament', order: 63 },
  { id: 'philemon', name: 'Philemon', testament: 'New Testament', order: 64 },
  { id: 'hebrews', name: 'Hebrews', testament: 'New Testament', order: 65 },
  { id: 'james', name: 'James', testament: 'New Testament', order: 66 },
  { id: '1-peter', name: '1 Peter', testament: 'New Testament', order: 67 },
  { id: '2-peter', name: '2 Peter', testament: 'New Testament', order: 68 },
  { id: '1-john', name: '1 John', testament: 'New Testament', order: 69 },
  { id: '2-john', name: '2 John', testament: 'New Testament', order: 70 },
  { id: '3-john', name: '3 John', testament: 'New Testament', order: 71 },
  { id: 'jude', name: 'Jude', testament: 'New Testament', order: 72 },
  { id: 'revelation', name: 'Revelation', testament: 'New Testament', order: 73 },
];

export class BibleService {
  private cache = new Map<string, BookData>();

  async loadBooks(): Promise<BibleBook[]> {
    return BOOK_MANIFEST.map((meta) => ({
      id: meta.id,
      name: meta.name,
      testament: meta.testament,
      order: meta.order,
      chapters: [],
    }));
  }

  async loadChapters(bookId: string): Promise<BibleChapter[]> {
    const data = await this.fetchBook(bookId);
    return data.chapters.map((ch) => ({
      chapterNumber: ch.number,
      verses: ch.verses.map((v) => ({ verseNumber: v.number, text: '' })),
    }));
  }

  async loadVerses(bookId: string, chapterNumber: number): Promise<BibleVerse[]> {
    const data = await this.fetchBook(bookId);
    const chapter = data.chapters.find((ch) => ch.number === chapterNumber);
    if (!chapter) {
      return [];
    }
    return chapter.verses.map((v) => ({ verseNumber: v.number, text: v.text }));
  }

  private async fetchBook(bookId: string): Promise<BookData> {
    const cached = this.cache.get(bookId);
    if (cached) {
      return cached;
    }

    const baseUrl = import.meta.env.BASE_URL ?? '/';
    const url = `${baseUrl.replace(/\/$/, '')}/data/bible/${bookId}.json`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load book: ${bookId}`);
    }

    const data: BookData = await response.json();
    this.cache.set(bookId, data);
    return data;
  }
}
