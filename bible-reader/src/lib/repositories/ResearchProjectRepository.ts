import type { ResearchProject } from '../../types';
import { db } from '../database/database';

export class ResearchProjectRepository {
  async findAll(): Promise<ResearchProject[]> {
    return db.projects.orderBy('updatedAt').reverse().toArray();
  }

  async findById(id: string): Promise<ResearchProject | undefined> {
    return db.projects.get(id);
  }

  async findActive(): Promise<ResearchProject[]> {
    return db.projects.where('status').equals('active').toArray();
  }

  async save(project: ResearchProject): Promise<void> {
    await db.projects.put(project);
  }

  async delete(id: string): Promise<void> {
    await db.projects.delete(id);
  }
}
