import type { Highlight } from '../../types';
import { db } from '../database/database';

export class HighlightRepository {
  private readonly database = db;

  async findAll(): Promise<Highlight[]> {
    return this.database.highlights.toArray();
  }

  async findByPassage(sourceReference: string): Promise<Highlight[]> {
    return this.database.highlights
      .where('sourceReference')
      .equals(sourceReference)
      .toArray();
  }

  async create(highlight: Highlight): Promise<string> {
    await this.database.highlights.put(highlight);
    return highlight.id;
  }

  async delete(id: string): Promise<void> {
    await this.database.highlights.delete(id);
  }
}
