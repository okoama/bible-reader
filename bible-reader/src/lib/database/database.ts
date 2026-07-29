import Dexie, { type Table } from 'dexie';
import { DATABASE_NAME } from '../constants';
import type { Bookmark, Collection, Highlight, Note, Prayer, ReadingProgress, ResearchProject, StudySession } from '../../types';

export class BibleReaderDatabase extends Dexie {
  notes!: Table<Note, string>;
  highlights!: Table<Highlight, string>;
  bookmarks!: Table<Bookmark, string>;
  prayers!: Table<Prayer, string>;
  readingProgress!: Table<ReadingProgress, string>;
  collections!: Table<Collection, string>;
  sessions!: Table<StudySession, string>;
  projects!: Table<ResearchProject, string>;

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

    this.version(4).stores({
      notes: 'id, sourceReference, title, createdAt, updatedAt',
      highlights: 'id, sourceReference, color, createdAt',
      bookmarks: 'id, sourceReference, createdAt',
      prayers: 'id, title, category, favorite, answered, *tags, createdAt, updatedAt, lastPrayed',
      readingProgress: 'id, sourceReference, updatedAt',
    }).upgrade(async (tx) => {
      await tx.table('prayers').toCollection().modify((prayer) => {
        prayer.answered = false;
      });
    });

    this.version(5).stores({
      notes: 'id, sourceReference, title, favorite, createdAt, updatedAt',
      highlights: 'id, sourceReference, color, createdAt',
      bookmarks: 'id, sourceReference, favorite, createdAt',
      prayers: 'id, title, category, favorite, answered, *tags, createdAt, updatedAt, lastPrayed',
      readingProgress: 'id, sourceReference, updatedAt',
    }).upgrade(async (tx) => {
      await tx.table('notes').toCollection().modify((note) => { note.favorite = false; });
      await tx.table('bookmarks').toCollection().modify((bm) => { bm.favorite = false; });
    });

    this.version(6).stores({
      notes: 'id, sourceReference, title, favorite, createdAt, updatedAt',
      highlights: 'id, sourceReference, color, createdAt',
      bookmarks: 'id, sourceReference, favorite, createdAt',
      prayers: 'id, title, category, favorite, answered, *tags, createdAt, updatedAt, lastPrayed',
      readingProgress: 'id, sourceReference, updatedAt',
      collections: 'id, name, createdAt, updatedAt',
    });

    this.version(7).stores({
      notes: 'id, sourceReference, title, favorite, createdAt, updatedAt',
      highlights: 'id, sourceReference, color, createdAt',
      bookmarks: 'id, sourceReference, favorite, createdAt',
      prayers: 'id, title, category, favorite, answered, *tags, createdAt, updatedAt, lastPrayed',
      readingProgress: 'id, sourceReference, updatedAt',
      collections: 'id, name, createdAt, updatedAt',
      sessions: 'id, startTime, endTime',
    });

    this.version(8).stores({
      notes: 'id, sourceReference, title, favorite, createdAt, updatedAt',
      highlights: 'id, sourceReference, color, createdAt',
      bookmarks: 'id, sourceReference, favorite, createdAt',
      prayers: 'id, title, category, favorite, answered, *tags, createdAt, updatedAt, lastPrayed',
      readingProgress: 'id, sourceReference, updatedAt',
      collections: 'id, name, createdAt, updatedAt',
      sessions: 'id, startTime, endTime',
      projects: 'id, title, status, createdAt, updatedAt',
    });

    this.version(9).stores({
      notes: 'id, sourceReference, title, favorite, projectId, createdAt, updatedAt',
      highlights: 'id, sourceReference, color, createdAt',
      bookmarks: 'id, sourceReference, favorite, projectId, createdAt',
      prayers: 'id, title, category, favorite, answered, *tags, projectId, createdAt, updatedAt, lastPrayed',
      readingProgress: 'id, sourceReference, updatedAt',
      collections: 'id, name, projectId, createdAt, updatedAt',
      sessions: 'id, startTime, endTime',
      projects: 'id, title, status, createdAt, updatedAt',
    });
  }
}

export const db = new BibleReaderDatabase();
