import React, { useState, useEffect } from 'react';
import { ContentHeader } from '../components/layout/ContentHeader';
import { Card } from '../components/common/Card';
import { reportService, type SalesReport } from '../services/reportService';
import { accountingService } from '../services/accountingService';
import { cashDrawerService } from '../services/cashDrawerService';
import { orderRepository } from '../repositories/orderRepository';
import { settingsRepository } from '../repositories/settingsRepository';
import { ReceiptModal } from '../components/pos/ReceiptModal';
import { Printer, TrendingUp, DollarSign, Wallet, FileText } from 'lucide-react';
import type { Order, StoreSettings, AccountingSummary, CashDrawerSummary } from '../types';

export const ReportsView: React.FC = () => {
  const [report, setReport] = useState<SalesReport | null>(null);
  const [accounting, setAccounting] = useState<AccountingSummary | null>(null);
  const [cashDrawer, setCashDrawer] = useState<CashDrawerSummary | null>(null);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Order | null>(null);

  const loadAllReports = async () => {
    const daily = await reportService.getDailyReport();
    const acct = await accountingService.getAccountingSummary();
    const drawer = await cashDrawerService.getSummary();
    const storeSettings = await settingsRepository.getSettings();

    setReport(daily);
    setAccounting(acct);
    setCashDrawer(drawer);
    setSettings(storeSettings);
  };

  useEffect(() => {
    loadAllReports();
  }, []);

  const handleVoidOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to VOID this order? This will mark it void and reverse revenue.')) {
      return;
    }
    await orderRepository.voidOrder(orderId);
    await loadAllReports();
  };

  if (!report || !accounting || !cashDrawer || !settings) {
    return <div className="p-8 text-center text-slate-500">Loading comprehensive sales & accounting reports...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <ContentHeader
        title="Sales, Accounting & Cashflow Reports"
        subtitle="End-of-day revenue reconciliation, Cost of Goods Sold (COGS), P&L statement, and drawer audit"
        breadcrumbs={[{ label: 'Home' }, { label: 'Reports', active: true }]}
        actions={
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Z-Reading</span>
          </button>
        }
      />

      {/* Row 1: Key Executive Metric Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Net Sales (Revenue)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">₱{accounting.netSales.toFixed(2)}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Gross: ₱{accounting.grossSales.toFixed(2)}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Gross Profit</span>
            <TrendingUp className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">₱{accounting.grossProfit.toFixed(2)}</div>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 block">
            {accounting.grossMarginPercent}% Profit Margin
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>COGS (Food Cost)</span>
            <FileText className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">₱{accounting.cogs.toFixed(2)}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {accounting.netSales > 0 ? ((accounting.cogs / accounting.netSales) * 100).toFixed(1) : 0}% of revenue
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Cash in Register</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">₱{cashDrawer.expectedDrawerCash.toFixed(2)}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Float + Cash Sales - Drops</span>
        </div>
      </div>

      {/* Row 2: Comprehensive Accounting & Cashflow Statements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Profit & Loss Statement */}
        <Card title="Profit & Loss (P&L) Statement" variant="primary">
          <div className="space-y-3 text-xs">
            <div className="flex justify-between pb-1 border-b border-slate-100">
              <span className="text-slate-600 font-medium">Gross Menu Sales:</span>
              <span className="font-bold text-slate-900">₱{accounting.grossSales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pb-1 border-b border-slate-100 text-rose-600">
              <span>Less: Discounts Granted:</span>
              <span className="font-bold">- ₱{accounting.discounts.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pb-1 border-b border-slate-200 font-bold text-slate-800">
              <span>Net Revenue:</span>
              <span className="text-emerald-700">₱{accounting.netSales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pb-1 border-b border-slate-100 text-amber-800">
              <span>Less: Cost of Goods Sold (COGS):</span>
              <span className="font-bold">- ₱{accounting.cogs.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 text-base font-extrabold text-emerald-800">
              <span>Gross Profit:</span>
              <span>₱{accounting.grossProfit.toFixed(2)}</span>
            </div>
            <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-800 font-bold text-[11px] flex justify-between">
              <span>Gross Profit Margin:</span>
              <span>{accounting.grossMarginPercent}%</span>
            </div>
          </div>
        </Card>

        {/* Card 2: Cash Drawer Flow & Audit */}
        <Card title="Cashflow & Drawer Reconciliation" variant="success">
          <div className="space-y-3 text-xs">
            <div className="flex justify-between pb-1 border-b border-slate-100">
              <span className="text-slate-500">Morning Float:</span>
              <span className="font-bold text-slate-900">₱{cashDrawer.openingFloat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pb-1 border-b border-slate-100 text-emerald-700">
              <span>+ Cash Sales Receipts:</span>
              <span className="font-bold">+ ₱{cashDrawer.totalCashSales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pb-1 border-b border-slate-100 text-sky-700">
              <span>+ Petty Cash In (Pay-Ins):</span>
              <span className="font-bold">+ ₱{cashDrawer.totalPayIns.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pb-1 border-b border-slate-100 text-rose-600">
              <span>- Petty Cash Expenses (Pay-Outs):</span>
              <span className="font-bold">- ₱{cashDrawer.totalPayOuts.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pb-1 border-b border-slate-100 text-amber-700">
              <span>- Safe Drops:</span>
              <span className="font-bold">- ₱{cashDrawer.totalCashDrops.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 text-sm font-black text-slate-900">
              <span>Expected Drawer Cash:</span>
              <span className="text-emerald-700">₱{cashDrawer.expectedDrawerCash.toFixed(2)}</span>
            </div>
            {cashDrawer.lastCountedCash !== undefined && (
              <div
                className={`p-2 rounded text-[11px] font-bold flex justify-between ${
                  cashDrawer.lastDifference === 0
                    ? 'bg-emerald-50 text-emerald-800'
                    : cashDrawer.lastDifference! > 0
                      ? 'bg-sky-50 text-sky-800'
                      : 'bg-rose-50 text-rose-800'
                }`}
              >
                <span>Last Count: ₱{cashDrawer.lastCountedCash.toFixed(2)}</span>
                <span>
                  Diff: {cashDrawer.lastDifference! >= 0 ? '+' : ''}₱
                  {cashDrawer.lastDifference!.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Card 3: Tax & Tender Breakdown */}
        <Card title="Official BIR Tax & Tender Breakdown" variant="dark">
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between pb-1 border-b border-slate-100">
              <span className="text-slate-500">VATable Sales (12%):</span>
              <span className="font-bold text-slate-900">₱{accounting.vatableSales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pb-1 border-b border-slate-100">
              <span className="text-slate-500">VAT-Exempt Sales (SC/PWD):</span>
              <span className="font-bold text-slate-900">₱{accounting.vatExemptSales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pb-1 border-b border-slate-100">
              <span className="text-slate-500">12% Output VAT:</span>
              <span className="font-bold text-slate-900">₱{accounting.vatAmount.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Settlements by Channel
              </span>
              <div className="flex justify-between">
                <span>Cash:</span>
                <span className="font-bold">₱{accounting.cashSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GCash:</span>
                <span className="font-bold text-blue-600">₱{accounting.gcashSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Maya:</span>
                <span className="font-bold text-emerald-600">₱{accounting.mayaSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Credit/Debit Card:</span>
                <span className="font-bold text-indigo-600">₱{accounting.cardSales.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Transaction History Ledger */}
      <Card title="Transaction History Ledger" variant="outline">
        <div className="overflow-x-auto -mx-5 -my-5">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Order #</th>
                <th className="px-5 py-3">Date / Time</th>
                <th className="px-5 py-3">Customer / Table</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Subtotal</th>
                <th className="px-5 py-3">Discount</th>
                <th className="px-5 py-3">Total Paid</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {report.orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3 font-bold text-slate-900">{order.orderNumber}</td>
                  <td className="px-5 py-3 text-slate-500">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-bold text-slate-800">{order.customerName}</span>
                    <span className="text-[10px] text-slate-400 block">{order.tableNumber}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">₱{order.subtotal.toFixed(2)}</td>
                  <td className="px-5 py-3 text-rose-600">
                    {order.discountAmount > 0 ? `-₱${order.discountAmount.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-5 py-3 font-black text-slate-900">₱{order.total.toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        order.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'voided'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => setSelectedReceipt(order)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-bold cursor-pointer"
                    >
                      Receipt
                    </button>
                    {order.status !== 'voided' && (
                      <button
                        type="button"
                        onClick={() => handleVoidOrder(order.id)}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded font-bold cursor-pointer"
                      >
                        Void
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          order={selectedReceipt}
          settings={settings}
          onNewOrder={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
};
