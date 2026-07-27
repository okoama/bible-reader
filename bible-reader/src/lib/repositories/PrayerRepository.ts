import type { Prayer } from '../../types';
import { db } from '../database/database';

export class PrayerRepository {
  private readonly database = db;

  async findAll(): Promise<Prayer[]> {
    return this.database.prayers.toArray();
  }

  async findById(id: string): Promise<Prayer | undefined> {
    return this.database.prayers.get(id);
  }

  async create(prayer: Prayer): Promise<string> {
    await this.database.prayers.put(prayer);
    return prayer.id;
  }

  async update(prayer: Prayer): Promise<void> {
    await this.database.prayers.put(prayer);
  }

  async delete(id: string): Promise<void> {
    await this.database.prayers.delete(id);
  }
}
