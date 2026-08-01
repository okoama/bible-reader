import type { Bookmark } from '../../types';
import { db } from '../database/database';

export class BookmarkRepository {
  private readonly database = db;

  async findAll(): Promise<Bookmark[]> {
    return this.database.bookmarks.toArray();
  }

  async findByBook(bookId: string): Promise<Bookmark[]> {
    return this.database.bookmarks
      .where('sourceReference')
      .startsWith(`${bookId}:`)
      .toArray();
  }

  async create(bookmark: Bookmark): Promise<string> {
    await this.database.bookmarks.put(bookmark);
    return bookmark.id;
  }

  async delete(id: string): Promise<void> {
    await this.database.bookmarks.delete(id);
  }
}
