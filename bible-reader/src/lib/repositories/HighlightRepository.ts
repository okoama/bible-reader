import type { Highlight } from '../../types';
import { db } from '../database/database';

export class HighlightRepository {
  private readonly database = db;

  async findAll(): Promise<Highlight[]> {
    return this.database.highlights.toArray();
  }

  async count(): Promise<number> {
    return this.database.highlights.count();
  }

  async findBySection(bookId: string, section: string): Promise<Highlight[]> {
    return this.database.highlights
      .where('sourceReference')
      .startsWith(`${bookId}:${section}:`)
      .toArray();
  }

  async findByProjectId(projectId: string): Promise<Highlight[]> {
    return this.database.highlights.where('projectId').equals(projectId).toArray();
  }

  async create(highlight: Highlight): Promise<string> {
    await this.database.highlights.put(highlight);
    return highlight.id;
  }

  async update(highlight: Highlight): Promise<void> {
    await this.database.highlights.put(highlight);
  }

  async delete(id: string): Promise<void> {
    await this.database.highlights.delete(id);
  }
}
