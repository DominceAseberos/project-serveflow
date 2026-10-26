import { db } from '../db/database';
import type { SyncQueueItem, SyncAction, SyncStatus } from '../types';

export class SyncQueueRepository {
  async enqueue(
    entityTable: SyncQueueItem['entityTable'],
    entityId: string,
    action: SyncAction,
    payload: any
  ): Promise<SyncQueueItem> {
    const item: SyncQueueItem = {
      id: `sq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      entityTable,
      entityId,
      action,
      payload: typeof payload === 'string' ? payload : JSON.stringify(payload),
      status: 'pending',
      attempts: 0,
      createdAt: new Date().toISOString(),
    };
    await db.syncQueue.add(item);
    return item;
  }

  async getAll(): Promise<SyncQueueItem[]> {
    return await db.syncQueue.reverse().sortBy('createdAt');
  }

  async getPending(): Promise<SyncQueueItem[]> {
    return await db.syncQueue.where('status').equals('pending').toArray();
  }

  async getPendingCount(): Promise<number> {
    return await db.syncQueue.where('status').equals('pending').count();
  }

  async updateStatus(id: string, status: SyncStatus, error?: string): Promise<void> {
    const item = await db.syncQueue.get(id);
    if (!item) return;

    await db.syncQueue.update(id, {
      status,
      attempts: item.attempts + 1,
      lastAttemptAt: new Date().toISOString(),
      errorMessage: error,
    });
  }

  async delete(id: string): Promise<void> {
    await db.syncQueue.delete(id);
  }

  async clearCompleted(): Promise<void> {
    await db.syncQueue.where('status').equals('synced').delete();
  }
}

export const syncQueueRepository = new SyncQueueRepository();
