import type { Bookmark } from '../../types';
import { db } from '../database/database';

export class BookmarkRepository {
  private readonly database = db;

  async findAll(): Promise<Bookmark[]> {
    return this.database.bookmarks.toArray();
  }

  async count(): Promise<number> {
    return this.database.bookmarks.count();
  }

  async findFavorites(): Promise<Bookmark[]> {
    return this.database.bookmarks.toCollection().filter((b) => b.favorite).toArray();
  }

  async findBySection(bookId: string, section: string): Promise<Bookmark[]> {
    return this.database.bookmarks
      .where('sourceReference')
      .startsWith(`${bookId}:${section}:`)
      .toArray();
  }

  async create(bookmark: Bookmark): Promise<string> {
    await this.database.bookmarks.put(bookmark);
    return bookmark.id;
  }

  async update(bookmark: Bookmark): Promise<void> {
    await this.database.bookmarks.put(bookmark);
  }

  async delete(id: string): Promise<void> {
    await this.database.bookmarks.delete(id);
  }

  async findByProjectId(projectId: string): Promise<Bookmark[]> {
    return this.database.bookmarks.where('projectId').equals(projectId).toArray();
  }
}
