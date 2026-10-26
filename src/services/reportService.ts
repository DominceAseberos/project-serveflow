import { orderRepository } from '../repositories/orderRepository';
import type { Order, PaymentMethod } from '../types';

export interface SalesReport {
  totalOrders: number;
  grossSales: number;
  totalDiscount: number;
  netSales: number;
  totalTax: number;
  averageOrderValue: number;
  byPaymentMethod: Record<PaymentMethod, number>;
  byCategory: Record<string, { count: number; total: number }>;
  hourlySales: { hour: string; total: number; count: number }[];
  orders: Order[];
}

export class ReportService {
  async getDailyReport(targetDate?: string): Promise<SalesReport> {
    const datePrefix = targetDate || new Date().toISOString().slice(0, 10);
    const all = await orderRepository.getAll();
    const orders = all.filter(
      (o) => o.createdAt.startsWith(datePrefix) && o.status !== 'voided' && o.status !== 'draft'
    );

    let grossSales = 0;
    let totalDiscount = 0;
    let netSales = 0;
    let totalTax = 0;

    const byPaymentMethod: Record<PaymentMethod, number> = {
      cash: 0,
      card: 0,
      gcash: 0,
      maya: 0,
    };

    const byCategory: Record<string, { count: number; total: number }> = {};
    const hourlyMap: Record<number, { total: number; count: number }> = {};

    for (let h = 7; h <= 21; h++) {
      hourlyMap[h] = { total: 0, count: 0 };
    }

    for (const order of orders) {
      grossSales += order.subtotal;
      totalDiscount += order.discountAmount;
      netSales += order.total;
      totalTax += order.taxAmount;

      if (byPaymentMethod[order.paymentMethod] !== undefined) {
        byPaymentMethod[order.paymentMethod] += order.total;
      }

      const orderHour = new Date(order.createdAt).getHours();
      if (hourlyMap[orderHour]) {
        hourlyMap[orderHour].total += order.total;
        hourlyMap[orderHour].count += 1;
      }

      for (const item of order.items) {
        if (!byCategory[item.categoryId]) {
          byCategory[item.categoryId] = { count: 0, total: 0 };
        }
        byCategory[item.categoryId].count += item.quantity;
        byCategory[item.categoryId].total += item.subtotal;
      }
    }

    const hourlySales = Object.entries(hourlyMap).map(([h, data]) => ({
      hour: `${h.padStart(2, '0')}:00`,
      total: data.total,
      count: data.count,
    }));

    return {
      totalOrders: orders.length,
      grossSales,
      totalDiscount,
      netSales,
      totalTax,
      averageOrderValue: orders.length ? Math.round(netSales / orders.length) : 0,
      byPaymentMethod,
      byCategory,
      hourlySales,
      orders,
    };
  }
}

export const reportService = new ReportService();
