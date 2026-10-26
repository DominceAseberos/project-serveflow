import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import {
  Banknote,
  ArrowUpRight,
  AlertTriangle,
  History,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { cashDrawerService } from '../../services/cashDrawerService';
import type { CashDrawerMovement, CashDrawerSummary, CashMovementType } from '../../types';

interface CashFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  cashierId: string;
  cashierName: string;
}

export const CashFlowModal: React.FC<CashFlowModalProps> = ({
  isOpen,
  onClose,
  cashierId,
  cashierName,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'action' | 'history'>('status');
  const [summary, setSummary] = useState<CashDrawerSummary | null>(null);
  const [movements, setMovements] = useState<CashDrawerMovement[]>([]);

  // Action form
  const [actionType, setActionType] = useState<CashMovementType>('pay_in');
  const [actionAmount, setActionAmount] = useState<string>('');
  const [actionReason, setActionReason] = useState<string>('');
  const [actionError, setActionError] = useState<string | null>(null);

  // Reconciliation form
  const [countedCash, setCountedCash] = useState<string>('');
  const [reconcileSuccess, setReconcileSuccess] = useState<string | null>(null);

  const loadData = async () => {
    const s = await cashDrawerService.getSummary();
    const m = await cashDrawerService.getAllMovements();
    setSummary(s);
    setMovements(m);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setActionError(null);
      setReconcileSuccess(null);
    }
  }, [isOpen]);

  const handleExecuteAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    const amt = parseFloat(actionAmount);
    if (isNaN(amt) || amt <= 0) {
      setActionError('Please enter a valid amount greater than zero.');
      return;
    }
    if (!actionReason.trim()) {
      setActionError('Please specify a reason or reference for this cash movement.');
      return;
    }

    try {
      if (actionType === 'pay_in') {
        await cashDrawerService.recordPayIn(amt, actionReason, cashierId, cashierName);
      } else if (actionType === 'pay_out') {
        await cashDrawerService.recordPayOut(amt, actionReason, cashierId, cashierName);
      } else if (actionType === 'cash_drop') {
        await cashDrawerService.recordCashDrop(amt, cashierId, cashierName, actionReason);
      } else if (actionType === 'opening_float') {
        await cashDrawerService.setOpeningFloat(amt, cashierId, cashierName, actionReason);
      }

      setActionAmount('');
      setActionReason('');
      await loadData();
      setActiveTab('status');
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleReconcileShift = async (e: React.FormEvent) => {
    e.preventDefault();
    const actual = parseFloat(countedCash);
    if (isNaN(actual) || actual < 0) {
      alert('Please enter a valid cash count.');
      return;
    }

    try {
      const result = await cashDrawerService.reconcileDrawer(actual, cashierId, cashierName);
      setReconcileSuccess(`Reconciliation saved: ${result.reason}`);
      setCountedCash('');
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const expected = summary?.expectedDrawerCash || 0;
  const countedNum = parseFloat(countedCash) || 0;
  const diff = countedCash ? countedNum - expected : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cash Flow & Drawer Management"
      subtitle="Shift opening float, petty cash, safe drops, and drawer reconciliation"
      maxWidth="xl"
      footer={
        <div className="flex justify-end w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg shadow-sm"
          >
            Close
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'status'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Banknote className="w-4 h-4" />
            <span>Drawer Status & Reconciliation</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('action')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'action'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Record Movement (Pay-In / Pay-Out / Drop)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Movement History ({movements.length})</span>
          </button>
        </div>

        {/* Tab 1: Status & End-of-Shift Reconciliation */}
        {activeTab === 'status' && (
          <div className="space-y-4">
            {/* Live Drawer Accounting Card */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                LIVE CASH IN DRAWER (ESTIMATED)
              </span>
              <div className="text-3xl font-black text-emerald-400 tracking-tight">
                ₱{expected.toFixed(2)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Reflects opening float + cash receipts - recorded expenses & drops.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 mt-4 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Opening Float</span>
                  <span className="font-bold text-white">₱{summary?.openingFloat.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">+ Cash Sales</span>
                  <span className="font-bold text-emerald-400">
                    +₱{summary?.totalCashSales.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">+ Pay-Ins</span>
                  <span className="font-bold text-sky-400">
                    +₱{summary?.totalPayIns.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">- Pay-Outs & Drops</span>
                  <span className="font-bold text-rose-400">
                    -₱{((summary?.totalPayOuts || 0) + (summary?.totalCashDrops || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Shift Drawer Reconciliation Form */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-slate-600" />
                    End-of-Shift Physical Cash Count
                  </h4>
                  <p className="text-xs text-slate-500">
                    Count bills and coins physically in drawer to verify balance.
                  </p>
                </div>
              </div>

              {reconcileSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{reconcileSuccess}</span>
                </div>
              )}

              <form onSubmit={handleReconcileShift} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Actual Physical Counted Cash
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">₱</span>
                      <input
                        type="number"
                        step="any"
                        placeholder="0.00"
                        value={countedCash}
                        onChange={(e) => setCountedCash(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 text-base font-bold bg-white border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!countedCash}
                    className="py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    Commit Drawer Reconciliation
                  </button>
                </div>

                {countedCash && (
                  <div
                    className={`p-3 rounded-lg border text-xs font-bold flex items-center justify-between ${
                      diff === 0
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : diff > 0
                          ? 'bg-sky-50 border-sky-200 text-sky-800'
                          : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    <span>
                      {diff === 0
                        ? '✓ Exact Drawer Balance'
                        : diff > 0
                          ? `Cash Overage Detected (+₱${diff.toFixed(2)})`
                          : `Cash Shortage Detected (-₱${Math.abs(diff).toFixed(2)})`}
                    </span>
                    <span className="font-mono">
                      Expected: ₱{expected.toFixed(2)} | Actual: ₱{countedNum.toFixed(2)}
                    </span>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Tab 2: Record Movement Form */}
        {activeTab === 'action' && (
          <form onSubmit={handleExecuteAction} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Movement Action Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    id: 'pay_in',
                    label: 'Petty Cash In',
                    desc: 'Replenish change / add float',
                    color: 'hover:border-emerald-600',
                  },
                  {
                    id: 'pay_out',
                    label: 'Petty Cash Expense',
                    desc: 'Ice delivery, emergency supplies',
                    color: 'hover:border-rose-600',
                  },
                  {
                    id: 'cash_drop',
                    label: 'Safe Cash Drop',
                    desc: 'Deposit excess cash to safe',
                    color: 'hover:border-amber-600',
                  },
                ].map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setActionType(act.id as CashMovementType)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      actionType === act.id
                        ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-bold text-xs text-slate-900 block">{act.label}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{act.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Amount (PHP)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">₱</span>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={actionAmount}
                  onChange={(e) => setActionAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 text-base font-bold bg-white border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-hidden"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Reason / Expense Invoice / Memo
              </label>
              <input
                type="text"
                placeholder="e.g. 5 bags of ice from vendor, change fund addition, safe transfer"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-hidden"
                required
              />
            </div>

            {actionError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-lg shadow-sm"
              >
                Record Movement
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: History Ledger */}
        {activeTab === 'history' && (
          <div className="max-h-80 overflow-y-auto space-y-2">
            {movements.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No cash drawer transactions recorded yet.
              </div>
            ) : (
              movements.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          m.type === 'opening_float'
                            ? 'bg-emerald-100 text-emerald-800'
                            : m.type === 'pay_in'
                              ? 'bg-sky-100 text-sky-800'
                              : m.type === 'pay_out'
                                ? 'bg-rose-100 text-rose-800'
                                : m.type === 'cash_drop'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {m.type.replace('_', ' ')}
                      </span>
                      <span className="font-semibold text-slate-800">{m.reason}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                      • Logged by {m.cashierName}
                    </span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-sm font-black font-mono ${
                        m.type === 'pay_out' || m.type === 'cash_drop'
                          ? 'text-rose-600'
                          : 'text-emerald-700'
                      }`}
                    >
                      {m.type === 'pay_out' || m.type === 'cash_drop' ? '-' : '+'}₱
                      {m.amount.toFixed(2)}
                    </span>
                    {m.difference !== undefined && (
                      <span className="block text-[10px] font-bold text-slate-500">
                        Diff: ₱{m.difference.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
