import { db } from '../db/database';
import type { InventoryMovement, InventoryMovementType } from '../types';

export class InventoryRepository {
  async logMovement(
    productId: string,
    productName: string,
    type: InventoryMovementType,
    quantityChanged: number,
    previousStock: number,
    newStock: number,
    referenceId?: string,
    notes?: string
  ): Promise<InventoryMovement> {
    const movement: InventoryMovement = {
      id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId,
      productName,
      type,
      quantityChanged,
      previousStock,
      newStock,
      referenceId,
      notes,
      createdAt: new Date().toISOString(),
    };
    await db.inventoryMovements.add(movement);
    return movement;
  }

  async getRecent(limit = 50): Promise<InventoryMovement[]> {
    return await db.inventoryMovements.reverse().sortBy('createdAt').then((m) => m.slice(0, limit));
  }

  async getMovementsByProduct(productId: string): Promise<InventoryMovement[]> {
    return await db.inventoryMovements.where('productId').equals(productId).reverse().sortBy('createdAt');
  }
}

export const inventoryRepository = new InventoryRepository();
