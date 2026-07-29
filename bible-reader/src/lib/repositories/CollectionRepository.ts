import type { Collection, CollectionItem } from '../../types';
import { createId } from '../utils/id';
import { db } from '../database/database';

export class CollectionRepository {
  private readonly database = db;

  async findAll(): Promise<Collection[]> {
    return this.database.collections.toArray();
  }

  async findById(id: string): Promise<Collection | undefined> {
    return this.database.collections.get(id);
  }

  async create(name: string, description?: string, projectId?: string): Promise<string> {
    const now = new Date().toISOString();
    const collection: Collection = {
      id: createId('col'),
      name,
      description,
      items: [],
      projectId,
      createdAt: now,
      updatedAt: now,
    };
    await this.database.collections.put(collection);
    return collection.id;
  }

  async update(collection: Collection): Promise<void> {
    collection.updatedAt = new Date().toISOString();
    await this.database.collections.put(collection);
  }

  async delete(id: string): Promise<void> {
    await this.database.collections.delete(id);
  }

  async addItem(collectionId: string, item: CollectionItem): Promise<void> {
    const collection = await this.database.collections.get(collectionId);
    if (!collection) return;
    collection.items.push(item);
    collection.updatedAt = new Date().toISOString();
    await this.database.collections.put(collection);
  }

  async removeItem(collectionId: string, itemId: string): Promise<void> {
    const collection = await this.database.collections.get(collectionId);
    if (!collection) return;
    collection.items = collection.items.filter((i) => i.id !== itemId);
    collection.updatedAt = new Date().toISOString();
    await this.database.collections.put(collection);
  }

  async findByProjectId(projectId: string): Promise<Collection[]> {
    return this.database.collections.where('projectId').equals(projectId).toArray();
  }
}
