import type { Note } from '../../types';
import { db } from '../database/database';

export class NoteRepository {
  private readonly database = db;

  async findAll(): Promise<Note[]> {
    return this.database.notes.toArray();
  }

  async count(): Promise<number> {
    return this.database.notes.count();
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

  async findByPassage(sourceReference: string): Promise<Note[]> {
    return this.database.notes
      .where('sourceReference')
      .equals(sourceReference)
      .toArray();
  }

  async findFavorites(): Promise<Note[]> {
    return this.database.notes.toCollection().filter((n) => n.favorite).toArray();
  }

  async findByBook(bookId: string): Promise<Note[]> {
    return this.database.notes
      .where('sourceReference')
      .startsWith(`${bookId}:`)
      .toArray();
  }

  async findAllTags(): Promise<string[]> {
    const notes = await this.database.notes.toArray();
    const tags = new Set<string>();
    for (const note of notes) {
      for (const tag of note.tags) {
        tags.add(tag);
      }
    }
    return [...tags].sort();
  }

  async findRecent(limit = 10): Promise<Note[]> {
    return this.database.notes.orderBy('updatedAt').reverse().limit(limit).toArray();
  }

  async findByProjectId(projectId: string): Promise<Note[]> {
    return this.database.notes.where('projectId').equals(projectId).toArray();
  }

  async delete(id: string): Promise<void> {
    await this.database.notes.delete(id);
  }
}
