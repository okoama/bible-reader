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
    const latest = await this.database.sessions.orderBy('startTime').reverse().first();
    return latest && !latest.endTime ? latest : undefined;
  }

  async findRecentCompleted(limit: number): Promise<StudySession[]> {
    return this.database.sessions.orderBy('startTime').reverse().filter((s) => Boolean(s.endTime)).limit(limit).toArray();
  }

  async create(session: StudySession): Promise<string> {
    await this.database.sessions.put(session);
    return session.id;
  }

  async delete(id: string): Promise<void> {
    await this.database.sessions.delete(id);
  }
}
