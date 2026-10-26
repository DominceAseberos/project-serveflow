import { orderRepository } from '../repositories/orderRepository';
import { productRepository } from '../repositories/productRepository';
import { inventoryRepository } from '../repositories/inventoryRepository';
import { syncQueueRepository } from '../repositories/syncQueueRepository';
import { settingsRepository } from '../repositories/settingsRepository';
import type { CartItem, Order, OrderType, PaymentMethod } from '../types';

export interface CheckoutInput {
  items: CartItem[];
  orderType: OrderType;
  discountRate: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  cashierId: string;
  cashierName: string;
  customerName?: string;
  tableNumber?: string;
  referenceNo?: string;
  isKitchenOrder?: boolean;
}

export class OrderService {
  async processCheckout(input: CheckoutInput): Promise<Order> {
    if (!input.items || input.items.length === 0) {
      throw new Error('Cannot checkout an empty cart.');
    }

    const settings = await settingsRepository.getSettings();

    // 1. Verify and deduct inventory for each item
    for (const item of input.items) {
      const prod = await productRepository.getById(item.product.id);
      if (!prod) {
        throw new Error(`Product ${item.product.name} is no longer available.`);
      }
      if (prod.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${prod.name} (Available: ${prod.stock}, Requested: ${item.quantity}).`);
      }
    }

    // 2. Calculate subtotal, discount, tax, total
    const subtotal = input.items.reduce((acc, item) => acc + item.itemTotal, 0);
    const discountAmount = Math.round(subtotal * input.discountRate * 100) / 100;
    const netAmount = subtotal - discountAmount;
    const taxAmount = Math.round((netAmount * settings.taxRate / (1 + settings.taxRate)) * 100) / 100;
    const total = Math.max(0, netAmount);

    if (input.paymentMethod === 'cash' && input.amountPaid < total) {
      throw new Error(`Amount paid (₱${input.amountPaid}) cannot be less than total (₱${total}).`);
    }

    const change = input.paymentMethod === 'cash' ? Math.max(0, input.amountPaid - total) : 0;
    const count = (await orderRepository.getAll()).length + 1;
    const orderNumber = `SF-${new Date().getFullYear()}-${count.toString().padStart(4, '0')}`;

    // 3. Assemble order entity
    const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newOrder: Order = {
      id: orderId,
      orderNumber,
      cashierId: input.cashierId,
      cashierName: input.cashierName,
      customerName: input.customerName || 'Walk-in Customer',
      tableNumber: input.tableNumber || (input.orderType === 'dine_in' ? 'Counter' : 'Takeout'),
      orderType: input.orderType,
      items: input.items.map((i) => ({
        productId: i.product.id,
        name: i.product.name,
        categoryId: i.product.categoryId,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        subtotal: i.itemTotal,
        notes: i.notes,
      })),
      subtotal,
      discountRate: input.discountRate,
      discountAmount,
      taxAmount,
      total,
      paymentMethod: input.paymentMethod,
      amountPaid: input.amountPaid,
      change,
      referenceNo: input.referenceNo,
      status: input.isKitchenOrder ? 'kitchen_pending' : 'completed',
      paymentStatus: 'paid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      synced: false,
    };

    // 4. Save order to IndexedDB
    await orderRepository.create(newOrder);

    // 5. Deduct inventory & record movement logs
    for (const item of input.items) {
      const prevStock = item.product.stock;
      const newStock = await productRepository.updateStock(item.product.id, -item.quantity);
      await inventoryRepository.logMovement(
        item.product.id,
        item.product.name,
        'sale',
        -item.quantity,
        prevStock,
        newStock,
        newOrder.id,
        `POS Order ${orderNumber}`
      );
    }

    // 6. Enqueue durable offline synchronization mutation
    await syncQueueRepository.enqueue('orders', newOrder.id, 'INSERT', newOrder);

    return newOrder;
  }
}

export const orderService = new OrderService();
