import type { Note } from '../../../types';
import { db } from '../database/database';

export class NoteRepository {
  private readonly database = db;

  async getAll(): Promise<Note[]> {
    void this.database;
    throw new Error('Not implemented');
  }

  async getById(id: string): Promise<Note | undefined> {
    void id;
    throw new Error('Not implemented');
  }

  async create(note: Note): Promise<string> {
    void note;
    throw new Error('Not implemented');
  }

  async update(note: Note): Promise<void> {
    void note;
    throw new Error('Not implemented');
  }

  async delete(id: string): Promise<void> {
    void id;
    throw new Error('Not implemented');
  }
}
