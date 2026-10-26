import Dexie, { type EntityTable } from 'dexie';
import type {
  Product,
  Category,
  Order,
  InventoryMovement,
  SyncQueueItem,
} from '../types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_SETTINGS } from './seedData';

export interface SettingRecord {
  key: string;
  value: any;
}

export class ServeFlowDatabase extends Dexie {
  products!: EntityTable<Product, 'id'>;
  categories!: EntityTable<Category, 'id'>;
  orders!: EntityTable<Order, 'id'>;
  inventoryMovements!: EntityTable<InventoryMovement, 'id'>;
  syncQueue!: EntityTable<SyncQueueItem, 'id'>;
  settings!: EntityTable<SettingRecord, 'key'>;

  constructor() {
    super('ServeFlowPOS_DB');

    this.version(1).stores({
      products: 'id, categoryId, name, price, stock, sku, isAvailable',
      categories: 'id, sortOrder',
      orders: 'id, orderNumber, cashierId, status, paymentStatus, paymentMethod, createdAt, synced',
      inventoryMovements: 'id, productId, type, createdAt',
      syncQueue: 'id, entityTable, entityId, action, status, createdAt',
      settings: 'key',
    });
  }

  /**
   * Automatically initializes seed data if tables are fresh/empty
   */
  async seedIfEmpty(): Promise<void> {
    const productCount = await this.products.count();
    if (productCount === 0) {
      console.info('[ServeFlow DB] Seeding initial products and categories...');
      await this.categories.bulkAdd(INITIAL_CATEGORIES);
      await this.products.bulkAdd(INITIAL_PRODUCTS);

      // Seed initial settings
      await this.settings.put({ key: 'store_settings', value: INITIAL_SETTINGS });

      // Seed a few initial completed sample orders to populate AdminLTE dashboard immediately
      const now = new Date();
      const sampleOrders: Order[] = [
        {
          id: 'ord-seed-01',
          orderNumber: 'SF-2026-0001',
          cashierId: 'staff-001',
          cashierName: 'Domince A.',
          customerName: 'Maria Santos',
          tableNumber: 'T-04',
          orderType: 'dine_in',
          items: [
            {
              productId: 'prod-coffee-01',
              name: 'Spanish Latte',
              categoryId: 'CAT-COFFEE',
              unitPrice: 145,
              quantity: 2,
              subtotal: 290,
            },
            {
              productId: 'prod-pastry-01',
              name: 'Banana Loaf Slice',
              categoryId: 'CAT-PASTRY',
              unitPrice: 85,
              quantity: 1,
              subtotal: 85,
            },
          ],
          subtotal: 375,
          discountRate: 0,
          discountAmount: 0,
          taxAmount: 40.18,
          total: 375,
          paymentMethod: 'cash',
          amountPaid: 500,
          change: 125,
          status: 'completed',
          paymentStatus: 'paid',
          createdAt: new Date(now.getTime() - 1000 * 60 * 95).toISOString(),
          updatedAt: new Date(now.getTime() - 1000 * 60 * 95).toISOString(),
          synced: true,
        },
        {
          id: 'ord-seed-02',
          orderNumber: 'SF-2026-0002',
          cashierId: 'staff-001',
          cashierName: 'Domince A.',
          customerName: 'Carlos D.',
          tableNumber: 'Takeout',
          orderType: 'take_out',
          items: [
            {
              productId: 'prod-meal-01',
              name: 'Chicken Pesto Pasta',
              categoryId: 'CAT-MEALS',
              unitPrice: 220,
              quantity: 1,
              subtotal: 220,
            },
            {
              productId: 'prod-coffee-02',
              name: 'Caramel Macchiato',
              categoryId: 'CAT-COFFEE',
              unitPrice: 160,
              quantity: 1,
              subtotal: 160,
            },
          ],
          subtotal: 380,
          discountRate: 0.1,
          discountAmount: 38,
          taxAmount: 36.64,
          total: 342,
          paymentMethod: 'gcash',
          amountPaid: 342,
          change: 0,
          referenceNo: 'GC-9938102',
          status: 'completed',
          paymentStatus: 'paid',
          createdAt: new Date(now.getTime() - 1000 * 60 * 42).toISOString(),
          updatedAt: new Date(now.getTime() - 1000 * 60 * 42).toISOString(),
          synced: true,
        },
        {
          id: 'ord-seed-03',
          orderNumber: 'SF-2026-0003',
          cashierId: 'staff-001',
          cashierName: 'Domince A.',
          customerName: 'Table 7 Guests',
          tableNumber: 'T-07',
          orderType: 'dine_in',
          items: [
            {
              productId: 'prod-meal-02',
              name: 'Truffle Mushroom Melt',
              categoryId: 'CAT-MEALS',
              unitPrice: 245,
              quantity: 2,
              subtotal: 490,
            },
            {
              productId: 'prod-coffee-03',
              name: 'Single Origin Cold Brew',
              categoryId: 'CAT-COFFEE',
              unitPrice: 130,
              quantity: 2,
              subtotal: 260,
            },
          ],
          subtotal: 750,
          discountRate: 0,
          discountAmount: 0,
          taxAmount: 80.36,
          total: 750,
          paymentMethod: 'card',
          amountPaid: 750,
          change: 0,
          referenceNo: 'VISA-4421',
          status: 'kitchen_pending', // In kitchen queue for testing KDS!
          paymentStatus: 'paid',
          createdAt: new Date(now.getTime() - 1000 * 60 * 12).toISOString(),
          updatedAt: new Date(now.getTime() - 1000 * 60 * 12).toISOString(),
          synced: false,
        },
      ];

      await this.orders.bulkAdd(sampleOrders);

      // Seed initial offline sync queue item
      await this.syncQueue.add({
        id: 'sync-seed-01',
        entityTable: 'orders',
        entityId: 'ord-seed-03',
        action: 'INSERT',
        payload: JSON.stringify(sampleOrders[2]),
        status: 'pending',
        attempts: 0,
        createdAt: new Date().toISOString(),
      });
    }
  }
}

export const db = new ServeFlowDatabase();
