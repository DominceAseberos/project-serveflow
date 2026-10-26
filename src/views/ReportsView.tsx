import React, { useState, useEffect } from 'react';
import { ContentHeader } from '../components/layout/ContentHeader';
import { Card } from '../components/common/Card';
import { reportService, type SalesReport } from '../services/reportService';
import { orderRepository } from '../repositories/orderRepository';
import { settingsRepository } from '../repositories/settingsRepository';
import { ReceiptModal } from '../components/pos/ReceiptModal';
import { Printer } from 'lucide-react';
import type { Order, StoreSettings } from '../types';

export const ReportsView: React.FC = () => {
  const [report, setReport] = useState<SalesReport | null>(null);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Order | null>(null);

  const loadReport = async () => {
    const daily = await reportService.getDailyReport();
    const storeSettings = await settingsRepository.getSettings();
    setReport(daily);
    setSettings(storeSettings);
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handleVoidOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to VOID this order? This will mark it void and refund.')) {
      return;
    }
    await orderRepository.voidOrder(orderId);
    await loadReport();
  };

  if (!report || !settings) {
    return <div className="p-8 text-center text-slate-500">Loading sales reports...</div>;
  }

  const vatableSales = Math.round((report.netSales / (1 + settings.taxRate)) * 100) / 100;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <ContentHeader
        title="Sales Reports & Z-Reading"
        subtitle="End-of-day revenue reconciliation, tax reports, and transaction ledger"
        breadcrumbs={[{ label: 'Home' }, { label: 'Reports', active: true }]}
        actions={
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print End-of-Day Z-Reading</span>
          </button>
        }
      />

      {/* Summary Z-Reading Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Today's Revenue Summary" variant="primary">
          <div className="space-y-3 text-xs">
            <div className="flex justify-between pb-1 border-b border-slate-100">
              <span className="text-slate-500">Total Transactions:</span>
              <span className="font-bold text-slate-900">{report.totalOrders}</span>
            </div>
            <div className="flex justify-between pb-1 border-b border-slate-100">
              <span className="text-slate-500">Gross Sales:</span>
              <span className="font-bold text-slate-900">₱{report.grossSales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pb-1 border-b border-slate-100 text-rose-600">
              <span>Discounts Granted:</span>
              <span className="font-bold">- ₱{report.totalDiscount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pb-1 border-b border-slate-100 text-slate-500">
              <span>VATable Sales (Net):</span>
              <span className="font-semibold text-slate-800">₱{vatableSales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pb-1 border-b border-slate-100 text-slate-500">
              <span>12% VAT Collected:</span>
              <span className="font-semibold text-slate-800">₱{report.totalTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 text-base font-extrabold text-emerald-800">
              <span>Net Sales:</span>
              <span>₱{report.netSales.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        <Card title="Tender Breakdown (Payment Channels)" variant="success">
          <div className="space-y-3 text-xs">
            <div className="flex justify-between pb-1 border-b border-slate-100">
              <span className="text-slate-600 font-medium">Cash in Register:</span>
              <span className="font-bold text-slate-900">₱{report.byPaymentMethod.cash.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pb-1 border-b border-slate-100">
              <span className="text-blue-600 font-medium">GCash Settlements:</span>
              <span className="font-bold text-slate-900">₱{report.byPaymentMethod.gcash.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pb-1 border-b border-slate-100">
              <span className="text-emerald-600 font-medium">Maya Settlements:</span>
              <span className="font-bold text-slate-900">₱{report.byPaymentMethod.maya.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pb-1 border-b border-slate-100">
              <span className="text-indigo-600 font-medium">Card Processing:</span>
              <span className="font-bold text-slate-900">₱{report.byPaymentMethod.card.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 text-sm font-bold text-slate-800">
              <span>Total Tendered:</span>
              <span>₱{report.netSales.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        <Card title="Category Revenue Performance" variant="dark">
          <div className="space-y-2 text-xs">
            {Object.entries(report.byCategory).map(([catId, data]) => (
              <div key={catId} className="flex justify-between items-center py-1 border-b border-slate-100">
                <div>
                  <span className="font-bold text-slate-800 block">{catId}</span>
                  <span className="text-[10px] text-slate-400">{data.count} units sold</span>
                </div>
                <span className="font-extrabold text-slate-900">₱{data.total.toFixed(2)}</span>
              </div>
            ))}
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
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {report.orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3 font-bold text-slate-900">{order.orderNumber}</td>
                  <td className="px-5 py-3 text-slate-500">{new Date(order.createdAt).toLocaleString()}</td>
                  <td className="px-5 py-3">{order.customerName}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-bold text-slate-900">₱{order.total.toFixed(2)}</td>
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
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-bold"
                    >
                      Receipt
                    </button>
                    {order.status !== 'voided' && (
                      <button
                        type="button"
                        onClick={() => handleVoidOrder(order.id)}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded font-bold"
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
