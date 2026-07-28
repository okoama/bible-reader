import Dexie, { type Table } from 'dexie';
import { DATABASE_NAME, DATABASE_VERSION } from '../constants';
import type { Bookmark, Highlight, Note, Prayer, ReadingProgress } from '../../types';

export class BibleReaderDatabase extends Dexie {
  notes!: Table<Note, string>;
  highlights!: Table<Highlight, string>;
  bookmarks!: Table<Bookmark, string>;
  prayers!: Table<Prayer, string>;
  readingProgress!: Table<ReadingProgress, string>;

  constructor() {
    super(DATABASE_NAME);

    this.version(2).stores({
      notes: 'id, sourceReference, title, createdAt, updatedAt',
      highlights: 'id, sourceReference, color, createdAt',
      bookmarks: 'id, sourceReference, createdAt',
      prayers: 'id, title, createdAt, updatedAt',
      readingProgress: 'id, sourceReference, updatedAt',
    });

    this.version(3).stores({
      notes: 'id, sourceReference, title, createdAt, updatedAt',
      highlights: 'id, sourceReference, color, createdAt',
      bookmarks: 'id, sourceReference, createdAt',
      prayers: 'id, title, category, favorite, *tags, createdAt, updatedAt, lastPrayed',
      readingProgress: 'id, sourceReference, updatedAt',
    }).upgrade(async (tx) => {
      await tx.table('prayers').toCollection().modify((prayer) => {
        prayer.category = 'custom';
        prayer.favorite = false;
        prayer.lastPrayed = null;
        prayer.tags = [];
      });
    });
  }
}

export const db = new BibleReaderDatabase();
