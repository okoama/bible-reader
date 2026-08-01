import type { ResearchProject } from '../../types';
import { db } from '../database/database';

export class ResearchProjectRepository {
  async findAll(limit?: number): Promise<ResearchProject[]> {
    let collection = db.projects.orderBy('updatedAt').reverse();
    if (limit !== undefined) collection = collection.limit(limit);
    return collection.toArray();
  }

  async findById(id: string): Promise<ResearchProject | undefined> {
    return db.projects.get(id);
  }

  async findActive(): Promise<ResearchProject[]> {
    return db.projects.where('status').equals('active').toArray();
  }

  async create(project: ResearchProject): Promise<string> {
    await db.projects.put(project);
    return project.id;
  }

  async delete(id: string): Promise<void> {
    await db.projects.delete(id);
  }
}
