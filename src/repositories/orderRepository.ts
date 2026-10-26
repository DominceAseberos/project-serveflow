import { db } from '../db/database';
import type { Order, OrderStatus } from '../types';

export class OrderRepository {
  async getAll(): Promise<Order[]> {
    return await db.orders.reverse().sortBy('createdAt');
  }

  async getById(id: string): Promise<Order | undefined> {
    return await db.orders.get(id);
  }

  async getKitchenQueue(): Promise<Order[]> {
    return await db.orders
      .filter((ord) => ord.status === 'kitchen_pending' || ord.status === 'preparing')
      .toArray();
  }

  async getReadyQueue(): Promise<Order[]> {
    return await db.orders.filter((ord) => ord.status === 'ready').toArray();
  }

  async create(order: Order): Promise<Order> {
    await db.orders.add(order);
    return order;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<void> {
    await db.orders.update(id, {
      status,
      updatedAt: new Date().toISOString(),
      synced: false,
    });
  }

  async voidOrder(id: string): Promise<void> {
    await db.orders.update(id, {
      status: 'voided',
      paymentStatus: 'refunded',
      updatedAt: new Date().toISOString(),
      synced: false,
    });
  }

  async markSynced(id: string): Promise<void> {
    await db.orders.update(id, { synced: true });
  }

  async getTodaysOrders(): Promise<Order[]> {
    const today = new Date().toISOString().slice(0, 10);
    return await db.orders
      .filter((o) => o.createdAt.startsWith(today) && o.status !== 'voided')
      .toArray();
  }
}

export const orderRepository = new OrderRepository();
