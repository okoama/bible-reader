import type { VerseFavorite } from '../../types';
import { db } from '../database/database';

export class VerseFavoriteRepository {
  private readonly database = db;

  async findAll(): Promise<VerseFavorite[]> {
    return this.database.verseFavorites.orderBy('createdAt').reverse().toArray();
  }

  async findByBook(bookId: string): Promise<VerseFavorite[]> {
    return this.database.verseFavorites.where('bookId').equals(bookId).toArray();
  }

  async findBySourceReference(sourceReference: string): Promise<VerseFavorite | undefined> {
    return this.database.verseFavorites.where('sourceReference').equals(sourceReference).first();
  }

  async create(favorite: VerseFavorite): Promise<string> {
    await this.database.verseFavorites.put(favorite);
    return favorite.id;
  }

  async delete(id: string): Promise<void> {
    await this.database.verseFavorites.delete(id);
  }
}
