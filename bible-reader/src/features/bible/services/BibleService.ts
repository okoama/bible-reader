import type { BibleBook, BibleChapter, BibleVerse } from '../../../types';

export class BibleService {
  async loadBooks(): Promise<BibleBook[]> {
    return [
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
      { id: 'esther', name: 'Esther', testament: 'Old Testament', order: 17 },
      { id: 'job', name: 'Job', testament: 'Old Testament', order: 18 },
      { id: 'psalms', name: 'Psalms', testament: 'Old Testament', order: 19 },
      { id: 'proverbs', name: 'Proverbs', testament: 'Old Testament', order: 20 },
      { id: 'ecclesiastes', name: 'Ecclesiastes', testament: 'Old Testament', order: 21 },
      { id: 'song-of-solomon', name: 'Song of Solomon', testament: 'Old Testament', order: 22 },
      { id: 'isaiah', name: 'Isaiah', testament: 'Old Testament', order: 23 },
      { id: 'jeremiah', name: 'Jeremiah', testament: 'Old Testament', order: 24 },
      { id: 'lamentations', name: 'Lamentations', testament: 'Old Testament', order: 25 },
      { id: 'ezekiel', name: 'Ezekiel', testament: 'Old Testament', order: 26 },
      { id: 'daniel', name: 'Daniel', testament: 'Old Testament', order: 27 },
      { id: 'hosea', name: 'Hosea', testament: 'Old Testament', order: 28 },
      { id: 'joel', name: 'Joel', testament: 'Old Testament', order: 29 },
      { id: 'amos', name: 'Amos', testament: 'Old Testament', order: 30 },
      { id: 'obadiah', name: 'Obadiah', testament: 'Old Testament', order: 31 },
      { id: 'jonah', name: 'Jonah', testament: 'Old Testament', order: 32 },
      { id: 'micah', name: 'Micah', testament: 'Old Testament', order: 33 },
      { id: 'nahum', name: 'Nahum', testament: 'Old Testament', order: 34 },
      { id: 'habakkuk', name: 'Habakkuk', testament: 'Old Testament', order: 35 },
      { id: 'zephaniah', name: 'Zephaniah', testament: 'Old Testament', order: 36 },
      { id: 'haggai', name: 'Haggai', testament: 'Old Testament', order: 37 },
      { id: 'zechariah', name: 'Zechariah', testament: 'Old Testament', order: 38 },
      { id: 'malachi', name: 'Malachi', testament: 'Old Testament', order: 39 },
      { id: 'tobit', name: 'Tobit', testament: 'Deuterocanonical', order: 40 },
      { id: 'judith', name: 'Judith', testament: 'Deuterocanonical', order: 41 },
      { id: 'wisdom', name: 'Wisdom', testament: 'Deuterocanonical', order: 42 },
      { id: 'sirach', name: 'Sirach', testament: 'Deuterocanonical', order: 43 },
      { id: 'baruch', name: 'Baruch', testament: 'Deuterocanonical', order: 44 },
      { id: '1-maccabees', name: '1 Maccabees', testament: 'Deuterocanonical', order: 45 },
      { id: '2-maccabees', name: '2 Maccabees', testament: 'Deuterocanonical', order: 46 },
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
