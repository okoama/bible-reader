import type { ReadingProgress } from '../../types';
import { db } from '../database/database';

export class ReadingProgressRepository {
  private readonly database = db;

  async getAll(): Promise<ReadingProgress[]> {
    void this.database;
    throw new Error('Not implemented');
  }

  async getById(id: string): Promise<ReadingProgress | undefined> {
    void id;
    throw new Error('Not implemented');
  }

  async create(progress: ReadingProgress): Promise<string> {
    void progress;
    throw new Error('Not implemented');
  }

  async update(progress: ReadingProgress): Promise<void> {
    void progress;
    throw new Error('Not implemented');
  }

  async delete(id: string): Promise<void> {
    void id;
    throw new Error('Not implemented');
  }
}
