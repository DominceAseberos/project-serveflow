import { productRepository } from '../repositories/productRepository';
import { inventoryRepository } from '../repositories/inventoryRepository';
import { syncQueueRepository } from '../repositories/syncQueueRepository';
import type { Product, InventoryMovementType } from '../types';

export class InventoryService {
  async getLowStockProducts(): Promise<Product[]> {
    const all = await productRepository.getAll();
    return all.filter((p) => p.stock <= p.lowStockThreshold);
  }

  async adjustStock(
    productId: string,
    quantityDelta: number,
    type: InventoryMovementType,
    notes?: string
  ): Promise<Product> {
    const product = await productRepository.getById(productId);
    if (!product) throw new Error(`Product ${productId} not found.`);

    const previousStock = product.stock;
    const newStock = await productRepository.updateStock(productId, quantityDelta);

    await inventoryRepository.logMovement(
      productId,
      product.name,
      type,
      quantityDelta,
      previousStock,
      newStock,
      undefined,
      notes || `Manual ${type}`
    );

    await syncQueueRepository.enqueue('products', productId, 'UPDATE', {
      id: productId,
      stock: newStock,
      updatedAt: new Date().toISOString(),
    });

    return { ...product, stock: newStock };
  }
}

export const inventoryService = new InventoryService();
