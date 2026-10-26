import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { CreditCard, Banknote, Smartphone, Check, AlertCircle, Delete, RotateCcw } from 'lucide-react';
import type { PaymentMethod } from '../../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  initialMethod?: PaymentMethod;
  initialPaid?: number;
  initialReference?: string;
  onConfirmPayment: (paymentDetails: {
    paymentMethod: PaymentMethod;
    amountPaid: number;
    change: number;
    referenceNo?: string;
  }) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  total,
  initialMethod = 'cash',
  initialPaid,
  initialReference = '',
  onConfirmPayment,
}) => {
  const [method, setMethod] = useState<PaymentMethod>(initialMethod);
  const [tenderedStr, setTenderedStr] = useState<string>('');
  const [reference, setReference] = useState<string>(initialReference);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMethod(initialMethod);
      setTenderedStr(initialPaid ? initialPaid.toString() : total > 0 ? total.toFixed(2) : '0');
      setReference(initialReference);
      setError(null);
    }
  }, [isOpen, initialMethod, initialPaid, total, initialReference]);

  const tendered = parseFloat(tenderedStr) || 0;
  const change = method === 'cash' ? Math.max(0, tendered - total) : 0;
  const isSufficient = method !== 'cash' || tendered >= total;

  // Bill accumulator: adds bill value to current cash tendered
  const handleAddBill = (billValue: number) => {
    const current = parseFloat(tenderedStr) || 0;
    // If current is equal to total or 0, start from billValue, otherwise add
    const nextVal = current === total || current === 0 ? billValue : current + billValue;
    setTenderedStr(nextVal.toString());
  };

  // Set exact amount
  const handleExactCash = () => {
    setTenderedStr(total.toFixed(2));
  };

  // Numpad key input
  const handleNumpad = (char: string) => {
    if (char === 'C') {
      setTenderedStr('0');
      return;
    }
    if (char === 'BACK') {
      setTenderedStr((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
      return;
    }
    if (char === '.') {
      if (!tenderedStr.includes('.')) {
        setTenderedStr((prev) => prev + '.');
      }
      return;
    }
    setTenderedStr((prev) => (prev === '0' || prev === total.toFixed(2) ? char : prev + char));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isSufficient) {
      setError(`Tendered amount (₱${tendered.toFixed(2)}) is less than total due (₱${total.toFixed(2)}).`);
      return;
    }

    onConfirmPayment({
      paymentMethod: method,
      amountPaid: method === 'cash' ? tendered : total,
      change,
      referenceNo: reference.trim() || undefined,
    });
  };

  const pesoBills = [
    { value: 20, label: '₱20', color: 'bg-amber-600 hover:bg-amber-700 text-white' },
    { value: 50, label: '₱50', color: 'bg-rose-600 hover:bg-rose-700 text-white' },
    { value: 100, label: '₱100', color: 'bg-violet-600 hover:bg-violet-700 text-white' },
    { value: 200, label: '₱200', color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
    { value: 500, label: '₱500', color: 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black' },
    { value: 1000, label: '₱1,000', color: 'bg-sky-600 hover:bg-sky-700 text-white font-black' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Payment"
      subtitle="Finalize order and issue receipt"
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={!isSufficient}
            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg font-bold text-sm flex items-center space-x-2 shadow-sm transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Complete Order (₱{total.toFixed(2)})</span>
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Total & Change Banner */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
              TOTAL AMOUNT DUE
            </span>
            <div className="text-3xl font-black text-emerald-400 tracking-tight">
              ₱{total.toFixed(2)}
            </div>
          </div>
          {method === 'cash' && (
            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
                CUSTOMER CHANGE
              </span>
              <div className={`text-2xl font-black tracking-tight ${change > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                ₱{change.toFixed(2)}
              </div>
            </div>
          )}
        </div>

        {/* Payment Tender Method Tabs */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Payment Method
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'cash', label: 'Cash', icon: <Banknote className="w-4 h-4" /> },
              { id: 'gcash', label: 'GCash', icon: <Smartphone className="w-4 h-4" /> },
              { id: 'maya', label: 'Maya', icon: <Smartphone className="w-4 h-4" /> },
              { id: 'card', label: 'Card / POS', icon: <CreditCard className="w-4 h-4" /> },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id as PaymentMethod)}
                className={`py-2.5 px-3 rounded-xl border flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs font-bold transition-all ${
                  method === m.id
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs ring-1 ring-emerald-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cash Tender: Bills Accumulator & Touch Numpad */}
        {method === 'cash' ? (
          <div className="space-y-3">
            {/* Tender Input Display */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Cash Tendered
                </label>
                <button
                  type="button"
                  onClick={handleExactCash}
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  Exact (₱{total.toFixed(2)})
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-lg font-black text-slate-400">₱</span>
                <input
                  type="text"
                  value={tenderedStr}
                  onChange={(e) => setTenderedStr(e.target.value)}
                  className="w-full pl-9 pr-12 py-2 text-2xl font-black text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setTenderedStr('0')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  title="Clear input"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Philippine Peso Bill Quick Tenders */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Quick Peso Bills (Tap to Accumulate)
              </span>
              <div className="grid grid-cols-6 gap-1.5">
                {pesoBills.map((bill) => (
                  <button
                    key={bill.value}
                    type="button"
                    onClick={() => handleAddBill(bill.value)}
                    className={`py-2 px-1 text-xs font-extrabold rounded-lg shadow-xs transition-transform active:scale-95 text-center ${bill.color}`}
                  >
                    {bill.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Touchscreen Numeric Keypad */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '00'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleNumpad(key)}
                    className="h-10 rounded-lg bg-white border border-slate-200 text-base font-bold text-slate-800 hover:bg-slate-100 active:bg-slate-200 shadow-xs transition-colors"
                  >
                    {key}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleNumpad('C')}
                  className="h-9 rounded-lg bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-100"
                >
                  Clear (C)
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpad('BACK')}
                  className="h-9 rounded-lg bg-slate-200 hover:bg-slate-300 text-xs font-bold text-slate-700 flex items-center justify-center gap-1"
                >
                  <Delete className="w-4 h-4" />
                  <span>Backspace</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Reference Number for E-Wallets and Cards */
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Transaction / Reference / Approval Code
              </label>
              <input
                type="text"
                placeholder="e.g. GCash Ref # 10029348, Maya trace, Card terminal approval code"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-hidden font-mono"
                autoFocus
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Required for daily drawer reconciliation and digital audit trail.
              </p>
            </div>
          </div>
        )}

        {/* Validation Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center space-x-2 text-rose-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </form>
    </Modal>
  );
};
