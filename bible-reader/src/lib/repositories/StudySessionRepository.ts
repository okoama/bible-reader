import type { StudySession } from '../../types';
import { db } from '../database/database';

export class StudySessionRepository {
  private readonly database = db;

  async findAll(): Promise<StudySession[]> {
    return this.database.sessions.orderBy('startTime').reverse().toArray();
  }

  async findById(id: string): Promise<StudySession | undefined> {
    return this.database.sessions.get(id);
  }

  async findActive(): Promise<StudySession | undefined> {
    const all = await this.database.sessions.toArray();
    return all.find((s) => !s.endTime);
  }

  async save(session: StudySession): Promise<void> {
    await this.database.sessions.put(session);
  }

  async delete(id: string): Promise<void> {
    await this.database.sessions.delete(id);
  }
}
