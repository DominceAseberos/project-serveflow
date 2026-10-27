import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Printer, RefreshCcw, Download, Cpu, ShieldCheck } from 'lucide-react';
import type { Order, StoreSettings } from '../../types';
import {
  generateEscPosReceipt,
  downloadEscPosFile,
  printViaWebSerial,
} from '../../utils/escpos';

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
  const [paperWidth, setPaperWidth] = useState<'80mm' | '58mm'>(settings.paperWidth || '80mm');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (paperWidth === '58mm') {
      document.body.classList.add('print-58mm');
    } else {
      document.body.classList.remove('print-58mm');
    }
    return () => {
      document.body.classList.remove('print-58mm');
    };
  }, [paperWidth]);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadEscPos = () => {
    const bytes = generateEscPosReceipt(order, settings, {
      paperWidth,
      kickDrawer: true,
      cutPaper: true,
    });
    downloadEscPosFile(bytes, `receipt-order-${order.orderNumber}.bin`);
    setStatusMsg('Downloaded raw ESC/POS binary (.bin)');
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleSerialPrint = async () => {
    const bytes = generateEscPosReceipt(order, settings, {
      paperWidth,
      kickDrawer: true,
      cutPaper: true,
    });
    setStatusMsg('Opening Serial port connection...');
    const res = await printViaWebSerial(bytes);
    setStatusMsg(res.message);
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const vatableSales = Math.round((order.total / (1 + settings.taxRate)) * 100) / 100;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hardware Receipt"
      subtitle={`Order #${order.orderNumber} • ${paperWidth} ESC/POS Thermal Format`}
      maxWidth="md"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-2 no-print">
          <button
            type="button"
            onClick={onNewOrder}
            className="w-full sm:w-auto px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-700 font-semibold text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Start New Order</span>
          </button>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleDownloadEscPos}
              title="Download raw ESC/POS binary for spooler or CUPS"
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs flex items-center space-x-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ESC/POS</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-bold text-xs flex items-center space-x-1.5 shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print {paperWidth} Receipt</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 space-y-3">
        {/* Hardware Format Controls (hidden on print) */}
        <div className="no-print flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-600">Roll Width:</span>
            <div className="inline-flex rounded-md shadow-xs" role="group">
              <button
                type="button"
                onClick={() => setPaperWidth('80mm')}
                className={`px-3 py-1 text-xs font-bold rounded-l-md border ${
                  paperWidth === '80mm'
                    ? 'bg-emerald-800 text-white border-emerald-800'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                80mm (Standard POS)
              </button>
              <button
                type="button"
                onClick={() => setPaperWidth('58mm')}
                className={`px-3 py-1 text-xs font-bold rounded-r-md border-t border-b border-r ${
                  paperWidth === '58mm'
                    ? 'bg-emerald-800 text-white border-emerald-800'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                58mm (Mobile POS)
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleSerialPrint}
              className="text-[11px] text-slate-600 hover:text-emerald-800 font-semibold flex items-center space-x-1"
            >
              <Cpu className="w-3.5 h-3.5 text-slate-400" />
              <span>WebUSB/Serial</span>
            </button>
          </div>
        </div>

        {statusMsg && (
          <div className="no-print p-2 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200 font-medium text-center">
            {statusMsg}
          </div>
        )}

        {/* ========================================================
            DEDICATED THERMAL RECEIPT CONTAINER
            Targeted strictly by @media print for 80mm/58mm rolls
           ======================================================== */}
        <div
          id="thermal-receipt-printable"
          className={`bg-white p-6 shadow-sm border border-slate-300 font-mono text-xs text-slate-900 mx-auto transition-all ${
            paperWidth === '58mm' ? 'max-w-[260px]' : 'max-w-[340px]'
          }`}
          style={{ letterSpacing: '-0.02em' }}
        >
          {/* Header */}
          <div className="text-center pb-2.5 border-b border-dashed border-slate-900 space-y-0.5">
            <h2 className="font-extrabold text-sm uppercase tracking-wide">{settings.storeName}</h2>
            {settings.tagline && <p className="text-[10px] text-slate-700">{settings.tagline}</p>}
            <p className="text-[10px] text-slate-800">{settings.address}</p>
            <p className="text-[10px] font-semibold text-slate-800">
              TIN: {settings.tin} | Tel: {settings.phone}
            </p>
            {settings.machineIdentificationNumber && (
              <p className="text-[9px] text-slate-600">MIN: {settings.machineIdentificationNumber}</p>
            )}
            {settings.permitNumber && (
              <p className="text-[9px] text-slate-600">Permit No: {settings.permitNumber}</p>
            )}
          </div>

          {/* Order Metadata */}
          <div className="py-2 border-b border-dashed border-slate-900 text-[11px] space-y-0.5">
            <div className="flex justify-between">
              <span>ORDER NO:</span>
              <span className="font-bold">#{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>DATE/TIME:</span>
              <span>{new Date(order.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
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
                <span className="font-bold">{order.customerName}</span>
              </div>
            )}
            {order.seniorPwdId && (
              <div className="flex justify-between font-bold text-slate-900">
                <span>SC / PWD ID:</span>
                <span>{order.seniorPwdId} (RA 9994)</span>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="py-2.5 border-b border-dashed border-slate-900 space-y-1.5">
            <div className="flex justify-between font-bold text-[10px] pb-1 border-b border-dotted border-slate-400">
              <span>ITEM</span>
              <span>QTY × PRICE</span>
              <span>AMOUNT</span>
            </div>
            {order.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5 text-[11px]">
                <div className="flex justify-between items-baseline">
                  <div className="pr-1 flex-1 truncate">
                    <span className="font-semibold">{item.name}</span>
                  </div>
                  <div className="text-slate-700 px-1 whitespace-nowrap text-[10px]">
                    {item.quantity} × {settings.currencySymbol}{item.unitPrice.toFixed(0)}
                  </div>
                  <div className="font-bold whitespace-nowrap">
                    {settings.currencySymbol}{item.subtotal.toFixed(2)}
                  </div>
                </div>
                {item.notes && (
                  <div className="text-[10px] italic pl-2 text-slate-700">
                    * {item.notes}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Calculations */}
          <div className="py-2 border-b border-dashed border-slate-900 space-y-0.5 text-[11px]">
            <div className="flex justify-between">
              <span>SUBTOTAL:</span>
              <span>{settings.currencySymbol}{order.subtotal.toFixed(2)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between font-semibold">
                <span>DISCOUNT ({(order.discountRate * 100).toFixed(0)}%):</span>
                <span>- {settings.currencySymbol}{order.discountAmount.toFixed(2)}</span>
              </div>
            )}
            {order.vatExemptSales && order.vatExemptSales > 0 ? (
              <div className="flex justify-between text-[10px] text-slate-700">
                <span>VAT-Exempt Sales (SC/PWD):</span>
                <span>{settings.currencySymbol}{order.vatExemptSales.toFixed(2)}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between text-[10px] text-slate-700">
                  <span>VATable Sales (12%):</span>
                  <span>{settings.currencySymbol}{(order.vatableSales || vatableSales).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-700">
                  <span>12% Output VAT:</span>
                  <span>{settings.currencySymbol}{order.taxAmount.toFixed(2)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between text-sm font-black pt-1.5 border-t border-slate-900">
              <span>TOTAL DUE:</span>
              <span className="text-base">{settings.currencySymbol}{order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="py-2 border-b border-dashed border-slate-900 text-[11px] space-y-0.5">
            <div className="flex justify-between uppercase">
              <span>PAYMENT ({order.paymentMethod}):</span>
              <span className="font-bold">{settings.currencySymbol}{order.amountPaid.toFixed(2)}</span>
            </div>
            {order.change > 0 && (
              <div className="flex justify-between font-black">
                <span>CHANGE:</span>
                <span>{settings.currencySymbol}{order.change.toFixed(2)}</span>
              </div>
            )}
            {order.referenceNo && (
              <div className="flex justify-between text-[10px] text-slate-700">
                <span>REF NO:</span>
                <span>{order.referenceNo}</span>
              </div>
            )}
          </div>

          {/* Official BIR Footer */}
          <div className="pt-2.5 text-center text-[10px] space-y-1 text-slate-800">
            <div className="flex items-center justify-center space-x-1 font-bold text-[9px] uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3" />
              <span>Official Sales Invoice</span>
            </div>
            {settings.receiptFooterMessage && (
              <p className="text-[9.5px] leading-tight">{settings.receiptFooterMessage}</p>
            )}
            <p className="text-[9px] text-slate-500 pt-1">
              ServeFlow POS v2.0 • Offline IndexedDB
            </p>
            {/* Blank Paper Feed for Hardware Auto-Cutter Clearance */}
            <div className="h-6" aria-hidden="true" />
          </div>
        </div>
      </div>
    </Modal>
  );
};
