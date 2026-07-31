import type { ReadingProgress } from '../../types';
import { db } from '../database/database';

export class ReadingProgressRepository {
  private readonly database = db;

  async findAll(): Promise<ReadingProgress[]> {
    return this.database.readingProgress.toArray();
  }

  async findById(id: string): Promise<ReadingProgress | undefined> {
    return this.database.readingProgress.get(id);
  }

  async findLastPosition(workId: string): Promise<ReadingProgress | undefined> {
    return this.database.readingProgress.get(`last:${workId}`);
  }

  async create(progress: ReadingProgress): Promise<string> {
    await this.database.readingProgress.put(progress);
    return progress.id;
  }

  async findRecentHistory(limit: number): Promise<ReadingProgress[]> {
    return this.database.readingProgress
      .orderBy('updatedAt')
      .reverse()
      .filter((r) => !r.id.startsWith('last:'))
      .limit(limit)
      .toArray();
  }

  async delete(id: string): Promise<void> {
    await this.database.readingProgress.delete(id);
  }
}
