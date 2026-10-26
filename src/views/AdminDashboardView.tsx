import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  RefreshCw,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { ContentHeader } from '../components/layout/ContentHeader';
import { InfoBox } from '../components/common/InfoBox';
import { Card } from '../components/common/Card';
import { reportService, type SalesReport } from '../services/reportService';
import { inventoryService } from '../services/inventoryService';
import { syncQueueRepository } from '../repositories/syncQueueRepository';
import { settingsRepository } from '../repositories/settingsRepository';
import { ReceiptModal } from '../components/pos/ReceiptModal';
import { useSessionStore } from '../stores/sessionStore';
import type { Order, Product, StoreSettings } from '../types';

export const AdminDashboardView: React.FC = () => {
  const [report, setReport] = useState<SalesReport | null>(null);
  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { setActiveView, currentCashier } = useSessionStore();

  const loadDashboardData = async () => {
    setIsLoading(true);
    const daily = await reportService.getDailyReport();
    const lowStock = await inventoryService.getLowStockProducts();
    const pending = await syncQueueRepository.getPendingCount();
    const storeSettings = await settingsRepository.getSettings();

    setReport(daily);
    setLowStockItems(lowStock);
    setPendingSyncCount(pending);
    setSettings(storeSettings);
    setIsLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (isLoading || !report) {
    return (
      <div className="p-8 flex items-center justify-center text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Loading AdminLTE dashboard...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Content Header & Breadcrumbs */}
      <ContentHeader
        title="Admin Dashboard"
        subtitle="Real-time sales, offline database status, and operational metrics"
        breadcrumbs={[
          { label: 'Home' },
          { label: 'Dashboard', active: true },
        ]}
        actions={
          <button
            onClick={loadDashboardData}
            className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        }
      />

      {/* Top 4 AdminLTE InfoBoxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoBox
          icon={<DollarSign className="w-7 h-7" />}
          title="Today's Sales"
          value={`₱${report.netSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          bgVariant="emerald"
          footerText={`From ${report.totalOrders} completed orders`}
          onClick={() => setActiveView('reports')}
        />

        <InfoBox
          icon={<ShoppingBag className="w-7 h-7" />}
          title="Completed Orders"
          value={report.totalOrders}
          bgVariant="blue"
          footerText={`Avg ticket: ₱${report.averageOrderValue}`}
          onClick={() => setActiveView('reports')}
        />

        <InfoBox
          icon={<AlertTriangle className="w-7 h-7" />}
          title="Low Stock Alerts"
          value={lowStockItems.length}
          bgVariant="rose"
          footerText={
            lowStockItems.length > 0
              ? `${lowStockItems[0]?.name} is low`
              : 'All inventory healthy'
          }
          onClick={() => setActiveView('inventory')}
        />

        <InfoBox
          icon={<RefreshCw className="w-7 h-7" />}
          title="Offline Sync Queue"
          value={pendingSyncCount}
          bgVariant="amber"
          footerText="Durable IndexedDB Queue"
          onClick={() => setActiveView('sync')}
        />
      </div>

      {/* Middle Row: Payment Methods & Shift Register Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Methods Breakdown */}
        <div className="lg:col-span-2">
          <Card
            title="Sales by Payment Method"
            subtitle="Breakdown of processed transactions today"
            variant="primary"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cash</span>
                <p className="text-xl font-black text-slate-800 mt-1">
                  ₱{report.byPaymentMethod.cash.toFixed(2)}
                </p>
                <span className="text-[11px] text-slate-500">Over-the-counter</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-500">GCash</span>
                <p className="text-xl font-black text-slate-800 mt-1">
                  ₱{report.byPaymentMethod.gcash.toFixed(2)}
                </p>
                <span className="text-[11px] text-slate-500">E-Wallet Direct</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Maya</span>
                <p className="text-xl font-black text-slate-800 mt-1">
                  ₱{report.byPaymentMethod.maya.toFixed(2)}
                </p>
                <span className="text-[11px] text-slate-500">QR Ph / E-Wallet</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Cards</span>
                <p className="text-xl font-black text-slate-800 mt-1">
                  ₱{report.byPaymentMethod.card.toFixed(2)}
                </p>
                <span className="text-[11px] text-slate-500">Debit / Credit POS</span>
              </div>
            </div>

            {/* Hourly sales progress visual */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 block">
                Peak Operating Hours (Today)
              </span>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 items-end h-28">
                {report.hourlySales.slice(1, 13).map((hourData, idx) => {
                  const maxSale = Math.max(...report.hourlySales.map((h) => h.total), 500);
                  const heightPercent = Math.min(100, Math.max(10, (hourData.total / maxSale) * 100));
                  return (
                    <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end group">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t transition-all ${
                          hourData.total > 0
                            ? 'bg-emerald-600 group-hover:bg-emerald-700'
                            : 'bg-slate-100'
                        }`}
                        title={`${hourData.hour}: ₱${hourData.total.toFixed(0)} (${hourData.count} orders)`}
                      ></div>
                      <span className="text-[9px] text-slate-400 mt-1 truncate">{hourData.hour.slice(0, 2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* Register Shift & System Health Card */}
        <div>
          <Card title="Current Register Shift" subtitle="Session and local database state" variant="dark">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-sm">
                  {currentCashier.name.slice(0, 2)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{currentCashier.name}</h4>
                  <p className="text-xs text-slate-500">{currentCashier.role}</p>
                </div>
              </div>

              <div className="text-xs space-y-2 border-y border-slate-100 py-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Terminal:</span>
                  <span className="font-semibold text-slate-800">POS-TERMINAL-01</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Shift Started:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(currentCashier.shiftStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">IndexedDB Storage:</span>
                  <span className="font-bold text-emerald-700 flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    IndexedDB / Dexie OK
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Queue Persistence:</span>
                  <span className="font-semibold text-slate-800">{pendingSyncCount} pending events</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveView('pos')}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Resume Cashier Checkout</span>
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Card: Recent Transactions Table (AdminLTE DataTable aesthetic) */}
      <Card
        title="Recent Transactions"
        subtitle="Latest customer orders processed through local storage"
        variant="outline"
        tools={
          <button
            onClick={() => setActiveView('reports')}
            className="text-xs text-emerald-800 hover:underline font-bold"
          >
            View All Reports →
          </button>
        }
      >
        <div className="overflow-x-auto -mx-5 -my-5">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Order Number</th>
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3">Customer / Table</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Total Amount</th>
                <th className="px-5 py-3">Method</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {report.orders.slice(0, 10).map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{order.orderNumber}</td>
                  <td className="px-5 py-3.5 text-slate-500">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-slate-800">{order.customerName}</span>
                    <span className="text-[11px] text-slate-400 block">{order.tableNumber}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {order.items.reduce((sum, i) => sum + i.quantity, 0)} items
                  </td>
                  <td className="px-5 py-3.5 font-bold text-slate-900">₱{order.total.toFixed(2)}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        order.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'kitchen_pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedReceiptOrder(order)}
                      className="p-1 text-slate-400 hover:text-emerald-700 rounded transition-colors"
                      title="View Receipt"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Receipt inspection modal */}
      {settings && (
        <ReceiptModal
          isOpen={!!selectedReceiptOrder}
          onClose={() => setSelectedReceiptOrder(null)}
          order={selectedReceiptOrder}
          settings={settings}
          onNewOrder={() => setSelectedReceiptOrder(null)}
        />
      )}
    </div>
  );
};
