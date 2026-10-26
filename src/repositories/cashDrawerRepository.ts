import { db } from '../db/database';
import type { CashDrawerMovement, CashDrawerSummary, CashMovementType } from '../types';

export const cashDrawerRepository = {
  async getAll(): Promise<CashDrawerMovement[]> {
    return await db.cashDrawerMovements.orderBy('timestamp').reverse().toArray();
  },

  async addMovement(data: {
    type: CashMovementType;
    amount: number;
    reason: string;
    cashierId: string;
    cashierName: string;
    expectedAmount?: number;
    actualCounted?: number;
    difference?: number;
  }): Promise<CashDrawerMovement> {
    const movement: CashDrawerMovement = {
      id: `cash-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: data.type,
      amount: Math.abs(data.amount),
      reason: data.reason,
      cashierId: data.cashierId,
      cashierName: data.cashierName,
      timestamp: new Date().toISOString(),
      expectedAmount: data.expectedAmount,
      actualCounted: data.actualCounted,
      difference: data.difference,
    };

    await db.cashDrawerMovements.add(movement);
    return movement;
  },

  async getSummary(): Promise<CashDrawerSummary> {
    const movements = await this.getAll();
    const orders = await db.orders.where('paymentStatus').equals('paid').toArray();

    // Compute cash sales
    const totalCashSales = orders
      .filter((o) => o.paymentMethod === 'cash')
      .reduce((sum, o) => sum + o.total, 0);

    let openingFloat = 0;
    let totalPayIns = 0;
    let totalPayOuts = 0;
    let totalCashDrops = 0;
    let lastCountedCash: number | undefined;
    let lastDifference: number | undefined;

    for (const m of movements) {
      if (m.type === 'opening_float') {
        openingFloat += m.amount;
      } else if (m.type === 'pay_in') {
        totalPayIns += m.amount;
      } else if (m.type === 'pay_out') {
        totalPayOuts += m.amount;
      } else if (m.type === 'cash_drop') {
        totalCashDrops += m.amount;
      } else if (m.type === 'closing_reconciliation') {
        if (lastCountedCash === undefined) {
          lastCountedCash = m.actualCounted;
          lastDifference = m.difference;
        }
      }
    }

    const expectedDrawerCash =
      openingFloat + totalCashSales + totalPayIns - totalPayOuts - totalCashDrops;

    return {
      openingFloat,
      totalCashSales,
      totalPayIns,
      totalPayOuts,
      totalCashDrops,
      expectedDrawerCash: Math.max(0, expectedDrawerCash),
      lastCountedCash,
      lastDifference,
    };
  },
};
