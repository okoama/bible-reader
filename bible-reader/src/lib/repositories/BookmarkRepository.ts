import type { Bookmark } from '../../../types';
import { db } from '../database/database';

export class BookmarkRepository {
  private readonly database = db;

  async getAll(): Promise<Bookmark[]> {
    void this.database;
    throw new Error('Not implemented');
  }

  async getById(id: string): Promise<Bookmark | undefined> {
    void id;
    throw new Error('Not implemented');
  }

  async create(bookmark: Bookmark): Promise<string> {
    void bookmark;
    throw new Error('Not implemented');
  }

  async update(bookmark: Bookmark): Promise<void> {
    void bookmark;
    throw new Error('Not implemented');
  }

  async delete(id: string): Promise<void> {
    void id;
    throw new Error('Not implemented');
  }
}
