import React from 'react';
import { Modal } from '../common/Modal';
import { Printer, RefreshCcw } from 'lucide-react';
import type { Order, StoreSettings } from '../../types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  settings: StoreSettings;
  onNewOrder: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
  settings,
  onNewOrder,
}) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const vatableSales = Math.round((order.total / (1 + settings.taxRate)) * 100) / 100;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Order Receipt"
      subtitle={`Order #${order.orderNumber}`}
      maxWidth="md"
      footer={
        <div className="flex items-center justify-between w-full no-print">
          <button
            type="button"
            onClick={onNewOrder}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-700 font-semibold text-xs flex items-center space-x-1.5"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Start New Order</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-bold text-xs flex items-center space-x-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
        </div>
      }
    >
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        {/* Receipt Paper Container (Simulating 80mm thermal receipt) */}
        <div className="bg-white p-6 rounded-lg shadow-xs border border-dashed border-slate-300 font-mono text-xs text-slate-800 max-w-sm mx-auto">
          {/* Header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-300 space-y-1">
            <h2 className="font-bold text-base uppercase tracking-wider">{settings.storeName}</h2>
            <p className="text-[11px] text-slate-500">{settings.tagline}</p>
            <p className="text-[10px] text-slate-500">{settings.address}</p>
            <p className="text-[10px] text-slate-500">TIN: {settings.tin} | Tel: {settings.phone}</p>
          </div>

          {/* Order Metadata */}
          <div className="py-2.5 border-b border-dashed border-slate-300 text-[11px] space-y-0.5">
            <div className="flex justify-between">
              <span>ORDER NO:</span>
              <span className="font-bold">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>DATE/TIME:</span>
              <span>{new Date(order.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>CASHIER:</span>
              <span>{order.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span>TYPE:</span>
              <span className="uppercase font-semibold">
                {order.orderType.replace('_', ' ')} {order.tableNumber ? `(${order.tableNumber})` : ''}
              </span>
            </div>
            {order.customerName && (
              <div className="flex justify-between">
                <span>CUSTOMER:</span>
                <span>{order.customerName}</span>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-2">
            <div className="flex justify-between font-bold text-[11px] text-slate-500 pb-1">
              <span>ITEM</span>
              <span>QTY × PRICE</span>
              <span>AMOUNT</span>
            </div>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-baseline text-[11px]">
                <div className="pr-2 max-w-[150px] truncate">
                  <span className="font-semibold">{item.name}</span>
                </div>
                <div className="text-slate-500">
                  {item.quantity} × {item.unitPrice.toFixed(0)}
                </div>
                <div className="font-bold">₱{item.subtotal.toFixed(2)}</div>
              </div>
            ))}
          </div>

          {/* Calculations */}
          <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>SUBTOTAL:</span>
              <span>₱{order.subtotal.toFixed(2)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>DISCOUNT ({(order.discountRate * 100).toFixed(0)}%):</span>
                <span>- ₱{order.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500 text-[10px]">
              <span>VATable Sales:</span>
              <span>₱{vatableSales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[10px]">
              <span>VAT Amount (12%):</span>
              <span>₱{order.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-slate-200">
              <span>TOTAL DUE:</span>
              <span className="text-base text-emerald-800">₱{order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment breakdown */}
          <div className="py-2.5 border-b border-dashed border-slate-300 text-[11px] space-y-0.5">
            <div className="flex justify-between uppercase">
              <span>PAYMENT ({order.paymentMethod}):</span>
              <span className="font-bold">₱{order.amountPaid.toFixed(2)}</span>
            </div>
            {order.change > 0 && (
              <div className="flex justify-between font-bold text-slate-800">
                <span>CHANGE:</span>
                <span>₱{order.change.toFixed(2)}</span>
              </div>
            )}
            {order.referenceNo && (
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>REF NO:</span>
                <span>{order.referenceNo}</span>
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="pt-3 text-center text-[10px] text-slate-400 space-y-1">
            <p>{settings.receiptFooterMessage}</p>
            <p className="font-semibold text-emerald-800/80">Offline Local-First Dexie Storage</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
