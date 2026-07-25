import type { Note } from '../../types';
import { db } from '../database/database';

export class NoteRepository {
  private readonly database = db;

  async findAll(): Promise<Note[]> {
    return this.database.notes.toArray();
  }

  async findById(id: string): Promise<Note | undefined> {
    return this.database.notes.get(id);
  }

  async create(note: Note): Promise<string> {
    await this.database.notes.put(note);
    return note.id;
  }

  async update(note: Note): Promise<void> {
    await this.database.notes.put(note);
  }

  async delete(id: string): Promise<void> {
    await this.database.notes.delete(id);
  }
}
