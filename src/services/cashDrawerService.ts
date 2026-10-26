import { cashDrawerRepository } from '../repositories/cashDrawerRepository';
import type { CashDrawerMovement, CashDrawerSummary } from '../types';

export const cashDrawerService = {
  async getSummary(): Promise<CashDrawerSummary> {
    return await cashDrawerRepository.getSummary();
  },

  async getAllMovements(): Promise<CashDrawerMovement[]> {
    return await cashDrawerRepository.getAll();
  },

  async setOpeningFloat(
    amount: number,
    cashierId: string,
    cashierName: string,
    reason: string = 'Beginning Register Cash Float'
  ): Promise<CashDrawerMovement> {
    if (amount <= 0) throw new Error('Float amount must be greater than zero.');
    return await cashDrawerRepository.addMovement({
      type: 'opening_float',
      amount,
      reason,
      cashierId,
      cashierName,
    });
  },

  async recordPayIn(
    amount: number,
    reason: string,
    cashierId: string,
    cashierName: string
  ): Promise<CashDrawerMovement> {
    if (amount <= 0) throw new Error('Pay-in amount must be greater than zero.');
    if (!reason.trim()) throw new Error('A reason is required for petty cash pay-in.');
    return await cashDrawerRepository.addMovement({
      type: 'pay_in',
      amount,
      reason: reason.trim(),
      cashierId,
      cashierName,
    });
  },

  async recordPayOut(
    amount: number,
    reason: string,
    cashierId: string,
    cashierName: string
  ): Promise<CashDrawerMovement> {
    if (amount <= 0) throw new Error('Pay-out amount must be greater than zero.');
    if (!reason.trim()) throw new Error('A reason / expense note is required for petty cash pay-out.');
    return await cashDrawerRepository.addMovement({
      type: 'pay_out',
      amount,
      reason: reason.trim(),
      cashierId,
      cashierName,
    });
  },

  async recordCashDrop(
    amount: number,
    cashierId: string,
    cashierName: string,
    reason: string = 'Mid-day Drop to Safe'
  ): Promise<CashDrawerMovement> {
    if (amount <= 0) throw new Error('Drop amount must be greater than zero.');
    return await cashDrawerRepository.addMovement({
      type: 'cash_drop',
      amount,
      reason,
      cashierId,
      cashierName,
    });
  },

  async reconcileDrawer(
    actualCounted: number,
    cashierId: string,
    cashierName: string
  ): Promise<CashDrawerMovement> {
    const summary = await this.getSummary();
    const difference = actualCounted - summary.expectedDrawerCash;
    const diffStatus =
      difference === 0
        ? 'Exact Balanced'
        : difference > 0
          ? `Cash Overage (+₱${difference.toFixed(2)})`
          : `Cash Shortage (-₱${Math.abs(difference).toFixed(2)})`;

    return await cashDrawerRepository.addMovement({
      type: 'closing_reconciliation',
      amount: actualCounted,
      reason: `Shift Drawer Reconciliation: ${diffStatus}`,
      cashierId,
      cashierName,
      expectedAmount: summary.expectedDrawerCash,
      actualCounted,
      difference,
    });
  },
};
