import { syncQueueRepository } from '../repositories/syncQueueRepository';
import { orderRepository } from '../repositories/orderRepository';
import type { SyncQueueItem } from '../types';

export class SyncService {
  private isSyncing = false;

  async processQueue(): Promise<{ processed: number; failed: number }> {
    if (this.isSyncing) return { processed: 0, failed: 0 };
    if (!navigator.onLine) {
      console.warn('[Sync Service] Offline: Queue retained locally.');
      return { processed: 0, failed: 0 };
    }

    this.isSyncing = true;
    let processed = 0;
    let failed = 0;

    try {
      const pending = await syncQueueRepository.getPending();

      for (const item of pending) {
        try {
          // Simulate or perform sync to remote boundary
          await this.syncItem(item);
          await syncQueueRepository.updateStatus(item.id, 'synced');

          if (item.entityTable === 'orders') {
            await orderRepository.markSynced(item.entityId);
          }
          processed++;
        } catch (err: any) {
          failed++;
          await syncQueueRepository.updateStatus(
            item.id,
            'failed',
            err?.message || 'Remote sync failed'
          );
        }
      }
    } finally {
      this.isSyncing = false;
    }

    return { processed, failed };
  }

  private async syncItem(_item: SyncQueueItem): Promise<void> {
    // In production, this posts to a Supabase or REST endpoint.
    // Here we simulate network roundtrip:
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
}

export const syncService = new SyncService();
