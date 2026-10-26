import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { CreditCard, Banknote, Smartphone, Check, AlertCircle } from 'lucide-react';
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
  const [tendered, setTendered] = useState<number>(initialPaid || total);
  const [reference, setReference] = useState<string>(initialReference);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMethod(initialMethod);
      setTendered(initialPaid || total);
      setReference(initialReference);
      setError(null);
    }
  }, [isOpen, initialMethod, initialPaid, total, initialReference]);

  const change = method === 'cash' ? Math.max(0, tendered - total) : 0;
  const isSufficient = method !== 'cash' || tendered >= total;

  const handleQuickCash = (amount: number) => {
    setTendered(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSufficient) {
      setError(`Tendered amount (₱${tendered}) is less than total due (₱${total}).`);
      return;
    }

    onConfirmPayment({
      paymentMethod: method,
      amountPaid: method === 'cash' ? tendered : total,
      change,
      referenceNo: reference.trim() || undefined,
    });
  };

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
            onClick={handleSubmit}
            disabled={!isSufficient}
            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg font-bold text-sm flex items-center space-x-2 shadow-sm transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Complete Order (₱{total.toFixed(2)})</span>
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Total Banner */}
        <div className="bg-slate-900 text-white p-5 rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Total Amount Due
            </span>
            <div className="text-3xl font-black text-emerald-400 tracking-tight">
              ₱{total.toFixed(2)}
            </div>
          </div>
          {method === 'cash' && tendered > total && (
            <div className="text-right">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Customer Change
              </span>
              <div className="text-2xl font-bold text-amber-300">
                ₱{change.toFixed(2)}
              </div>
            </div>
          )}
        </div>

        {/* Payment Method Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Select Payment Method
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'cash', label: 'Cash', icon: <Banknote className="w-5 h-5" /> },
              { id: 'gcash', label: 'GCash', icon: <Smartphone className="w-5 h-5 text-blue-500" /> },
              { id: 'maya', label: 'Maya', icon: <Smartphone className="w-5 h-5 text-emerald-500" /> },
              { id: 'card', label: 'Card', icon: <CreditCard className="w-5 h-5 text-indigo-500" /> },
            ].map((pm) => (
              <button
                key={pm.id}
                type="button"
                onClick={() => {
                  setMethod(pm.id as PaymentMethod);
                  if (pm.id !== 'cash') setTendered(total);
                }}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                  method === pm.id
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                {pm.icon}
                <span className="text-xs">{pm.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cash Tendered & Quick Buttons */}
        {method === 'cash' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Cash Tendered
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-base font-bold text-slate-400">
                  ₱
                </span>
                <input
                  type="number"
                  step="any"
                  value={tendered || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setTendered(isNaN(val) ? 0 : val);
                  }}
                  className="w-full pl-8 pr-4 py-2 text-lg font-bold bg-white border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-hidden"
                  autoFocus
                />
              </div>
            </div>

            {/* Quick Denominations */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickCash(total)}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800"
              >
                Exact (₱{total.toFixed(2)})
              </button>
              {[100, 200, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickCash(amt)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800"
                >
                  ₱{amt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reference Number for E-Wallets and Cards */}
        {method !== 'cash' && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Transaction / Reference Number
            </label>
            <input
              type="text"
              placeholder="e.g. Approval code, GCash Ref #, Trace #"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-hidden"
              autoFocus
            />
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
