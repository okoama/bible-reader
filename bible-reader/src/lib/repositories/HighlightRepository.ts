import type { Highlight } from '../../../types';
import { db } from '../database/database';

export class HighlightRepository {
  private readonly database = db;

  async getAll(): Promise<Highlight[]> {
    void this.database;
    throw new Error('Not implemented');
  }

  async getById(id: string): Promise<Highlight | undefined> {
    void id;
    throw new Error('Not implemented');
  }

  async create(highlight: Highlight): Promise<string> {
    void highlight;
    throw new Error('Not implemented');
  }

  async update(highlight: Highlight): Promise<void> {
    void highlight;
    throw new Error('Not implemented');
  }

  async delete(id: string): Promise<void> {
    void id;
    throw new Error('Not implemented');
  }
}
