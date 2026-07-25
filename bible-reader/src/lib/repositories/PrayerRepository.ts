import type { Prayer } from '../../../types';
import { db } from '../database/database';

export class PrayerRepository {
  private readonly database = db;

  async getAll(): Promise<Prayer[]> {
    void this.database;
    throw new Error('Not implemented');
  }

  async getById(id: string): Promise<Prayer | undefined> {
    void id;
    throw new Error('Not implemented');
  }

  async create(prayer: Prayer): Promise<string> {
    void prayer;
    throw new Error('Not implemented');
  }

  async update(prayer: Prayer): Promise<void> {
    void prayer;
    throw new Error('Not implemented');
  }

  async delete(id: string): Promise<void> {
    void id;
    throw new Error('Not implemented');
  }
}
