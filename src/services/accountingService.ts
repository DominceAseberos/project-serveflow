import { orderRepository } from '../repositories/orderRepository';
import type { AccountingSummary, DiscountType, Order } from '../types';

export const accountingService = {
  /**
   * Computes legal Philippine tax and discount breakdown.
   * Under RA 9994 / RA 10754:
   * 1. Remove 12% VAT: Net = Gross / 1.12
   * 2. Apply 20% Discount on Net: Final = Net * 0.80
   * 3. Total Discount = Gross - Final
   * 4. Tax = 0 (VAT Exempt)
   */
  calculateTotals(
    subtotal: number,
    discountType: DiscountType,
    customRate: number = 0,
    taxRate: number = 0.12
  ) {
    if (subtotal <= 0) {
      return {
        subtotal: 0,
        discountAmount: 0,
        discountRate: 0,
        vatableSales: 0,
        vatExemptSales: 0,
        taxAmount: 0,
        total: 0,
      };
    }

    if (discountType === 'senior_pwd') {
      // Legal RA 9994 / RA 10754 formula
      const netVatExempt = subtotal / (1 + taxRate);
      const discountedAmount = netVatExempt * 0.8;
      const discountAmount = Math.round((subtotal - discountedAmount) * 100) / 100;
      const total = Math.round(discountedAmount * 100) / 100;

      return {
        subtotal,
        discountAmount,
        discountRate: 0.2,
        vatableSales: 0,
        vatExemptSales: total,
        taxAmount: 0, // VAT Exempt
        total,
      };
    }

    // Standard discount (Member, Staff, or Custom)
    let rate = 0;
    if (discountType === 'member') rate = 0.1;
    else if (discountType === 'staff') rate = 0.15;
    else if (discountType === 'custom') rate = Math.min(1, Math.max(0, customRate));

    const discountAmount = Math.round(subtotal * rate * 100) / 100;
    const discountedTotal = Math.max(0, subtotal - discountAmount);

    // Standard 12% VAT breakdown
    const vatableSales = Math.round((discountedTotal / (1 + taxRate)) * 100) / 100;
    const taxAmount = Math.round((discountedTotal - vatableSales) * 100) / 100;

    return {
      subtotal,
      discountAmount,
      discountRate: rate,
      vatableSales,
      vatExemptSales: 0,
      taxAmount,
      total: discountedTotal,
    };
  },

  /**
   * Generates a comprehensive P&L, COGS, and sales accounting report
   */
  async getAccountingSummary(ordersList?: Order[]): Promise<AccountingSummary> {
    const orders = ordersList || (await orderRepository.getAll());
    const paidOrders = orders.filter((o) => o.paymentStatus === 'paid' && o.status !== 'voided');

    let grossSales = 0;
    let discounts = 0;
    let netSales = 0;
    let cogs = 0;
    let vatableSales = 0;
    let vatExemptSales = 0;
    let vatAmount = 0;
    let cashSales = 0;
    let cardSales = 0;
    let gcashSales = 0;
    let mayaSales = 0;

    for (const ord of paidOrders) {
      grossSales += ord.subtotal;
      discounts += ord.discountAmount;
      netSales += ord.total;
      vatAmount += ord.taxAmount;

      if (ord.vatableSales !== undefined) {
        vatableSales += ord.vatableSales;
      } else {
        vatableSales += ord.total / 1.12;
      }

      if (ord.vatExemptSales !== undefined) {
        vatExemptSales += ord.vatExemptSales;
      }

      // Compute COGS for each order item
      let orderCogs = 0;
      for (const item of ord.items) {
        const itemCost = item.cost || (item.unitPrice * 0.35); // Default 35% food cost if missing
        orderCogs += itemCost * item.quantity;
      }
      cogs += ord.cogsTotal || orderCogs;

      // Tender breakdown
      if (ord.paymentMethod === 'cash') cashSales += ord.total;
      else if (ord.paymentMethod === 'card') cardSales += ord.total;
      else if (ord.paymentMethod === 'gcash') gcashSales += ord.total;
      else if (ord.paymentMethod === 'maya') mayaSales += ord.total;
    }

    const grossProfit = netSales - cogs;
    const grossMarginPercent = netSales > 0 ? (grossProfit / netSales) * 100 : 0;
    const averageTicket = paidOrders.length > 0 ? netSales / paidOrders.length : 0;

    return {
      grossSales: Math.round(grossSales * 100) / 100,
      discounts: Math.round(discounts * 100) / 100,
      netSales: Math.round(netSales * 100) / 100,
      cogs: Math.round(cogs * 100) / 100,
      grossProfit: Math.round(grossProfit * 100) / 100,
      grossMarginPercent: Math.round(grossMarginPercent * 10) / 10,
      vatableSales: Math.round(vatableSales * 100) / 100,
      vatExemptSales: Math.round(vatExemptSales * 100) / 100,
      vatAmount: Math.round(vatAmount * 100) / 100,
      totalOrders: paidOrders.length,
      averageTicket: Math.round(averageTicket * 100) / 100,
      cashSales: Math.round(cashSales * 100) / 100,
      cardSales: Math.round(cardSales * 100) / 100,
      gcashSales: Math.round(gcashSales * 100) / 100,
      mayaSales: Math.round(mayaSales * 100) / 100,
    };
  },
};
