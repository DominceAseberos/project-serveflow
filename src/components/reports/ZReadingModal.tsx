import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Printer, ShieldCheck } from 'lucide-react';
import type { SalesReport } from '../../services/reportService';
import type { AccountingSummary, CashDrawerSummary, StoreSettings } from '../../types';

interface ZReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: SalesReport;
  accounting: AccountingSummary;
  cashDrawer: CashDrawerSummary;
  settings: StoreSettings;
}

export const ZReadingModal: React.FC<ZReadingModalProps> = ({
  isOpen,
  onClose,
  report,
  accounting,
  cashDrawer,
  settings,
}) => {
  const [paperWidth, setPaperWidth] = useState<'80mm' | '58mm'>('80mm');

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

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currency = settings.currencySymbol;
  const sortedOrders = [...report.orders].sort((a, b) => a.orderNumber.localeCompare(b.orderNumber));
  const beginningInv = sortedOrders.length > 0 ? `#${sortedOrders[0].orderNumber}` : 'N/A';
  const endingInv = sortedOrders.length > 0 ? `#${sortedOrders[sortedOrders.length - 1].orderNumber}` : 'N/A';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Z-Reading Thermal Slip"
      subtitle={`End-of-Day Financial Audit & BIR Tax Reconciliation (${paperWidth})`}
      maxWidth="md"
      footer={
        <div className="flex items-center justify-between w-full no-print">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-700 font-semibold text-xs cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-lg font-bold text-xs flex items-center space-x-1.5 shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print {paperWidth} Z-Reading</span>
          </button>
        </div>
      }
    >
      <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 space-y-3">
        {/* Paper Toggle (hidden on print) */}
        <div className="no-print flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200 text-xs">
          <span className="font-bold text-slate-600">Thermal Roll Size:</span>
          <div className="inline-flex rounded-md shadow-xs">
            <button
              type="button"
              onClick={() => setPaperWidth('80mm')}
              className={`px-3 py-1 text-xs font-bold rounded-l-md border ${
                paperWidth === '80mm'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              80mm (Standard POS)
            </button>
            <button
              type="button"
              onClick={() => setPaperWidth('58mm')}
              className={`px-3 py-1 text-xs font-bold rounded-r-md border-t border-b border-r ${
                paperWidth === '58mm'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              58mm (Mobile POS)
            </button>
          </div>
        </div>

        {/* ========================================================
            DEDICATED THERMAL RECEIPT CONTAINER FOR Z-READING
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
            <p className="text-[10px] text-slate-800">{settings.address}</p>
            <p className="text-[10px] font-semibold text-slate-800">TIN: {settings.tin}</p>
            {settings.machineIdentificationNumber && (
              <p className="text-[9px] text-slate-700">MIN: {settings.machineIdentificationNumber}</p>
            )}
            {settings.serialNumber && (
              <p className="text-[9px] text-slate-700">Serial No: {settings.serialNumber}</p>
            )}
            <div className="pt-1">
              <span className="font-extrabold text-[11px] block border border-slate-900 px-2 py-0.5">
                *** OFFICIAL Z-READING (END-OF-DAY) ***
              </span>
            </div>
          </div>

          {/* Audit Metadata */}
          <div className="py-2 border-b border-dashed border-slate-900 text-[11px] space-y-0.5">
            <div className="flex justify-between">
              <span>Z-REPORT NO:</span>
              <span className="font-bold">Z-2026-0042</span>
            </div>
            <div className="flex justify-between">
              <span>DATE/TIME:</span>
              <span>{new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
            </div>
            <div className="flex justify-between">
              <span>BEG INVOICE:</span>
              <span>{beginningInv}</span>
            </div>
            <div className="flex justify-between">
              <span>END INVOICE:</span>
              <span>{endingInv}</span>
            </div>
            <div className="flex justify-between">
              <span>TOTAL TRANSACTIONS:</span>
              <span className="font-bold">{accounting.totalOrders}</span>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="py-2 border-b border-dashed border-slate-900 text-[11px] space-y-0.5">
            <div className="font-bold text-[10px] uppercase text-slate-700 pb-0.5">Sales Reconciliation</div>
            <div className="flex justify-between">
              <span>GROSS SALES:</span>
              <span className="font-bold">{currency}{accounting.grossSales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>LESS DISCOUNTS:</span>
              <span>-{currency}{accounting.discounts.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-slate-900 pt-1 border-t border-dotted border-slate-400">
              <span>NET REVENUE:</span>
              <span>{currency}{accounting.netSales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>LESS COGS (FOOD COST):</span>
              <span>-{currency}{accounting.cogs.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-black pt-1 border-t border-dotted border-slate-400">
              <span>GROSS PROFIT:</span>
              <span>{currency}{accounting.grossProfit.toFixed(2)} ({accounting.grossMarginPercent}%)</span>
            </div>
          </div>

          {/* BIR Tax Breakdown */}
          <div className="py-2 border-b border-dashed border-slate-900 text-[11px] space-y-0.5">
            <div className="font-bold text-[10px] uppercase text-slate-700 pb-0.5">Official Tax Ledger</div>
            <div className="flex justify-between">
              <span>VATable Sales (12%):</span>
              <span>{currency}{accounting.vatableSales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>VAT-Exempt Sales (SC/PWD):</span>
              <span>{currency}{accounting.vatExemptSales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Zero-Rated Sales:</span>
              <span>{currency}0.00</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>12% Output VAT:</span>
              <span>{currency}{accounting.vatAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Tender Settlement */}
          <div className="py-2 border-b border-dashed border-slate-900 text-[11px] space-y-0.5">
            <div className="font-bold text-[10px] uppercase text-slate-700 pb-0.5">Tender Summary</div>
            <div className="flex justify-between">
              <span>CASH PAYMENTS:</span>
              <span className="font-bold">{currency}{accounting.cashSales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GCASH EWALLET:</span>
              <span>{currency}{accounting.gcashSales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>MAYA EWALLET:</span>
              <span>{currency}{accounting.mayaSales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>CREDIT / DEBIT CARDS:</span>
              <span>{currency}{accounting.cardSales.toFixed(2)}</span>
            </div>
          </div>

          {/* Drawer Audit */}
          <div className="py-2 border-b border-dashed border-slate-900 text-[11px] space-y-0.5">
            <div className="font-bold text-[10px] uppercase text-slate-700 pb-0.5">Drawer Reconciliation</div>
            <div className="flex justify-between">
              <span>Opening Float:</span>
              <span>{currency}{cashDrawer.openingFloat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>+ Cash Sales Receipts:</span>
              <span>+{currency}{cashDrawer.totalCashSales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>+ Paid-In (Petty):</span>
              <span>+{currency}{cashDrawer.totalPayIns.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>- Paid-Out (Expenses):</span>
              <span>-{currency}{cashDrawer.totalPayOuts.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>- Safe Drops:</span>
              <span>-{currency}{cashDrawer.totalCashDrops.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold pt-1 border-t border-dotted border-slate-400">
              <span>Expected Cash in Register:</span>
              <span>{currency}{cashDrawer.expectedDrawerCash.toFixed(2)}</span>
            </div>
            {cashDrawer.lastCountedCash !== undefined && (
              <>
                <div className="flex justify-between">
                  <span>Actual Cash Counted:</span>
                  <span>{currency}{cashDrawer.lastCountedCash.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black">
                  <span>Over / (Short):</span>
                  <span>
                    {cashDrawer.lastDifference! >= 0 ? '+' : ''}{currency}
                    {cashDrawer.lastDifference!.toFixed(2)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Signatures & Certification */}
          <div className="pt-4 text-[10px] space-y-4 text-slate-800">
            <div className="pt-2">
              <div className="border-b border-slate-900 w-3/4 mx-auto mb-1" />
              <div className="text-center font-bold">Cashier / Shift In-Charge</div>
            </div>
            <div className="pt-2">
              <div className="border-b border-slate-900 w-3/4 mx-auto mb-1" />
              <div className="text-center font-bold">Store Manager / Auditor</div>
            </div>
            <div className="pt-2 text-center text-[9px] text-slate-600 space-y-0.5">
              <div className="flex items-center justify-center space-x-1 font-bold">
                <ShieldCheck className="w-3 h-3" />
                <span>Certified End-of-Day Closure</span>
              </div>
              <p>ServeFlow POS Engine • 100% Offline IndexedDB</p>
            </div>
            {/* Blank Paper Feed for Hardware Auto-Cutter Clearance */}
            <div className="h-6" aria-hidden="true" />
          </div>
        </div>
      </div>
    </Modal>
  );
};
