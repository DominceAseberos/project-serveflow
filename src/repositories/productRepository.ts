import { db } from '../db/database';
import type { Product, Category, CategoryId } from '../types';

export class ProductRepository {
  async getAll(): Promise<Product[]> {
    return await db.products.toArray();
  }

  async getById(id: string): Promise<Product | undefined> {
    return await db.products.get(id);
  }

  async getByCategory(categoryId: CategoryId): Promise<Product[]> {
    if (categoryId === 'ALL') {
      return await db.products.toArray();
    }
    return await db.products.where('categoryId').equals(categoryId).toArray();
  }

  async getCategories(): Promise<Category[]> {
    return await db.categories.orderBy('sortOrder').toArray();
  }

  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.products.add(newProduct);
    return newProduct;
  }

  async update(id: string, updates: Partial<Product>): Promise<void> {
    await db.products.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  async delete(id: string): Promise<void> {
    await db.products.delete(id);
  }

  async updateStock(id: string, delta: number): Promise<number> {
    const product = await db.products.get(id);
    if (!product) throw new Error(`Product ${id} not found.`);
    const newStock = Math.max(0, product.stock + delta);
    await db.products.update(id, {
      stock: newStock,
      updatedAt: new Date().toISOString(),
    });
    return newStock;
  }
}

export const productRepository = new ProductRepository();
