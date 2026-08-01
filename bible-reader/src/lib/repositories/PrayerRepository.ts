import type { Prayer, PrayerCategory } from '../../types';
import { db } from '../database/database';

export class PrayerRepository {
  private readonly database = db;

  async findAll(): Promise<Prayer[]> {
    return this.database.prayers.toArray();
  }

  async findById(id: string): Promise<Prayer | undefined> {
    return this.database.prayers.get(id);
  }

  async findByCategory(category: PrayerCategory): Promise<Prayer[]> {
    return this.database.prayers.where('category').equals(category).toArray();
  }

  async findFavorites(): Promise<Prayer[]> {
    return this.database.prayers.toCollection().filter((p) => p.favorite).toArray();
  }

  async findAnswered(): Promise<Prayer[]> {
    return this.database.prayers.toCollection().filter((p) => p.answered).toArray();
  }

  async findByTag(tag: string): Promise<Prayer[]> {
    return this.database.prayers.where('tags').equals(tag).toArray();
  }

  async create(prayer: Prayer): Promise<string> {
    await this.database.prayers.put(prayer);
    return prayer.id;
  }

  async update(prayer: Prayer): Promise<void> {
    await this.database.prayers.put(prayer);
  }

  async markPrayed(id: string): Promise<void> {
    const prayer = await this.findById(id);
    if (prayer) {
      prayer.lastPrayed = new Date().toISOString();
      prayer.updatedAt = prayer.lastPrayed;
      await this.update(prayer);
    }
  }

  async findRecentPrayed(limit = 10): Promise<Prayer[]> {
    return this.database.prayers.orderBy('lastPrayed').reverse().limit(limit).toArray();
  }

  async delete(id: string): Promise<void> {
    await this.database.prayers.delete(id);
  }

  async findByProjectId(projectId: string): Promise<Prayer[]> {
    return this.database.prayers.where('projectId').equals(projectId).toArray();
  }
}
