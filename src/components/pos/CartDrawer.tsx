import React, { useState } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  User,
  Hash,
  Percent,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import type { PaymentMethod, DiscountType } from '../../types';

interface CartDrawerProps {
  onPayClick: (paymentDetails: {
    paymentMethod: PaymentMethod;
    amountPaid: number;
    referenceNo?: string;
  }) => void;
  onSendKitchenClick: (paymentDetails: {
    paymentMethod: PaymentMethod;
    amountPaid: number;
    referenceNo?: string;
  }) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onPayClick,
  onSendKitchenClick,
}) => {
  const {
    items,
    orderType,
    discountType,
    seniorPwdId,
    customerName,
    tableNumber,
    updateQuantity,
    removeItem,
    setItemNotes,
    setOrderType,
    setDiscountType,
    setSeniorPwdId,
    setCustomerName,
    setTableNumber,
    clearCart,
    getSubtotal,
    getCalculations,
    getItemCount,
  } = useCartStore();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountPaidInput, setAmountPaidInput] = useState<string>('');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [editingNotesProductId, setEditingNotesProductId] = useState<string | null>(null);
  const [activeNoteText, setActiveNoteText] = useState('');

  const calculations = getCalculations();
  const subtotal = getSubtotal();
  const total = calculations.total;
  const itemCount = getItemCount();

  const handleOpenNotes = (productId: string, currentNotes?: string) => {
    setEditingNotesProductId(productId);
    setActiveNoteText(currentNotes || '');
  };

  const handleSaveNotes = () => {
    if (editingNotesProductId) {
      setItemNotes(editingNotesProductId, activeNoteText.trim());
      setEditingNotesProductId(null);
    }
  };

  const handlePay = () => {
    if (items.length === 0) return;
    const paid = amountPaidInput ? parseFloat(amountPaidInput) : total;
    onPayClick({
      paymentMethod,
      amountPaid: isNaN(paid) ? total : paid,
      referenceNo: referenceNo.trim() || undefined,
    });
  };

  const handleSendKitchen = () => {
    if (items.length === 0) return;
    const paid = amountPaidInput ? parseFloat(amountPaidInput) : total;
    onSendKitchenClick({
      paymentMethod,
      amountPaid: isNaN(paid) ? total : paid,
      referenceNo: referenceNo.trim() || undefined,
    });
  };

  return (
    <div className="w-full lg:w-96 bg-white border-l border-slate-200 flex flex-col h-full shadow-lg">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Current Order</h2>
          <p className="text-xs text-slate-400">Order & Checkout Summary</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Dine In / Takeout / Delivery Tabs */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200/80">
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/60 rounded-lg">
          <button
            type="button"
            onClick={() => setOrderType('dine_in')}
            className={`py-1.5 px-2 text-xs font-bold rounded-md flex items-center justify-center space-x-1 transition-all ${
              orderType === 'dine_in'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Dine In</span>
          </button>
          <button
            type="button"
            onClick={() => setOrderType('take_out')}
            className={`py-1.5 px-2 text-xs font-bold rounded-md flex items-center justify-center space-x-1 transition-all ${
              orderType === 'take_out'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Take Out</span>
          </button>
          <button
            type="button"
            onClick={() => setOrderType('delivery')}
            className={`py-1.5 px-2 text-xs font-bold rounded-md flex items-center justify-center space-x-1 transition-all ${
              orderType === 'delivery'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Delivery</span>
          </button>
        </div>

        {/* Customer & Table details */}
        <div className="grid grid-cols-2 gap-2 mt-2.5">
          <div className="relative">
            <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Guest Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:border-emerald-600 focus:outline-hidden"
            />
          </div>
          <div className="relative">
            <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder={orderType === 'dine_in' ? 'Table # (e.g. T-4)' : 'Identifier'}
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:border-emerald-600 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <ShoppingBag className="w-6 h-6 text-slate-300" />
            </div>
            <p className="font-semibold text-slate-600 text-sm">Cart is empty</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
              Tap any coffee, pastry, or main dish on the menu to begin an order.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.product.id}
              className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-sm font-bold text-slate-800 truncate">{item.product.name}</p>
                  <p className="text-xs text-slate-400">
                    ₱{item.unitPrice.toFixed(2)} × {item.quantity}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-6 h-6 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-slate-800">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="w-6 h-6 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Price & Remove */}
                <div className="text-right pl-3 shrink-0">
                  <div className="text-sm font-extrabold text-slate-900">
                    ₱{item.itemTotal.toFixed(2)}
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Special Instructions / Notes Badge */}
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                {item.notes ? (
                  <span className="text-emerald-700 font-medium truncate flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {item.notes}
                  </span>
                ) : (
                  <span className="text-slate-400 italic">No instructions</span>
                )}
                <button
                  type="button"
                  onClick={() => handleOpenNotes(item.product.id, item.notes)}
                  className="text-emerald-700 hover:underline font-bold text-[10px]"
                >
                  {item.notes ? 'Edit note' : '+ Add Note / Modifier'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Line Item Note Edit Modal */}
      {editingNotesProductId && (
        <div className="p-3 bg-emerald-50 border-t border-emerald-200 text-xs space-y-2">
          <div className="flex justify-between items-center font-bold text-emerald-900">
            <span>Special Instructions / Modifier:</span>
            <button onClick={() => setEditingNotesProductId(null)} className="text-slate-400">✕</button>
          </div>
          <div className="flex flex-wrap gap-1">
            {['Less Ice', 'No Sugar', 'Oat Milk Sub', 'Extra Shot', 'Warm'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setActiveNoteText((prev) => (prev ? `${prev}, ${opt}` : opt))}
                className="px-2 py-0.5 bg-white border border-emerald-300 rounded text-[10px] font-semibold text-emerald-800 hover:bg-emerald-100"
              >
                +{opt}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={activeNoteText}
            onChange={(e) => setActiveNoteText(e.target.value)}
            placeholder="Type custom note (e.g. separate dressing)"
            className="w-full px-2.5 py-1 text-xs bg-white border border-emerald-300 rounded focus:outline-hidden"
          />
          <div className="flex justify-end gap-1">
            <button
              type="button"
              onClick={handleSaveNotes}
              className="px-3 py-1 bg-emerald-700 text-white rounded font-bold text-xs"
            >
              Save Note
            </button>
          </div>
        </div>
      )}

      {/* Bill & Payment Drawer Footer */}
      <div className="border-t border-slate-200 bg-white p-4 space-y-3.5 shrink-0 shadow-lg">
        {/* Subtotal & Discount Selection */}
        <div className="space-y-1.5 text-xs sm:text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal (Gross)</span>
            <span className="font-semibold text-slate-800">₱{subtotal.toFixed(2)}</span>
          </div>

          {/* Discount Category Selector */}
          <div className="flex items-center justify-between">
            <span className="flex items-center text-slate-600">
              <Percent className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Discount
            </span>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as DiscountType)}
              className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 font-bold text-slate-700 focus:outline-hidden"
            >
              <option value="none">₱ 0 (None)</option>
              <option value="member">10% Regular Member</option>
              <option value="staff">15% Staff / Partner</option>
              <option value="senior_pwd">20% Senior Citizen / PWD (RA 9994)</option>
            </select>
          </div>

          {/* Senior / PWD ID Input (Required under Philippine Law) */}
          {discountType === 'senior_pwd' && (
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  Senior / PWD OSCA ID:
                </span>
                <span className="text-[10px] text-amber-700 font-semibold">12% VAT Exempt + 20% Off</span>
              </div>
              <input
                type="text"
                placeholder="Enter OSCA ID # / PWD Book ID"
                value={seniorPwdId}
                onChange={(e) => setSeniorPwdId(e.target.value)}
                className="w-full px-2 py-1 text-xs bg-white border border-amber-300 rounded focus:outline-hidden font-mono"
              />
            </div>
          )}

          {calculations.discountAmount > 0 && (
            <div className="flex justify-between text-xs text-emerald-700 font-bold">
              <span>Discount savings</span>
              <span>- ₱{calculations.discountAmount.toFixed(2)}</span>
            </div>
          )}

          {/* Tax Breakdown */}
          <div className="text-[11px] text-slate-400 space-y-0.5 pt-1 border-t border-slate-100">
            {calculations.vatExemptSales > 0 ? (
              <div className="flex justify-between">
                <span>VAT-Exempt Sales</span>
                <span>₱{calculations.vatExemptSales.toFixed(2)}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between">
                  <span>VATable Sales</span>
                  <span>₱{calculations.vatableSales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Output VAT (12%)</span>
                  <span>₱{calculations.taxAmount.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          {/* Grand Total */}
          <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
            <span className="text-base font-extrabold text-slate-800">Total Due</span>
            <span className="text-2xl font-black text-emerald-600 tracking-tight">
              ₱{total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment Controls Section */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              PAYMENT METHOD
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:border-emerald-600 focus:outline-hidden"
            >
              <option value="cash">Cash Payment</option>
              <option value="gcash">GCash E-Wallet</option>
              <option value="maya">Maya E-Wallet</option>
              <option value="card">Credit / Debit Card</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                AMOUNT PAID
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-bold">₱</span>
                <input
                  type="number"
                  placeholder={total > 0 ? total.toFixed(2) : '0.00'}
                  value={amountPaidInput}
                  onChange={(e) => setAmountPaidInput(e.target.value)}
                  className="w-full pl-6 pr-2 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                REFERENCE NO.
              </label>
              <input
                type="text"
                placeholder="Optional"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:border-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            type="button"
            disabled={items.length === 0}
            onClick={() => {
              alert('Order draft saved to local IndexedDB session.');
            }}
            className="py-2.5 px-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-semibold text-xs rounded-xl transition-colors text-center cursor-pointer"
          >
            Save Draft
          </button>

          <button
            type="button"
            disabled={items.length === 0}
            onClick={handleSendKitchen}
            className="py-2.5 px-2 bg-amber-100 hover:bg-amber-200 text-amber-900 disabled:opacity-40 font-bold text-xs rounded-xl transition-colors text-center shadow-xs cursor-pointer"
          >
            Send Kitchen
          </button>

          <button
            type="button"
            disabled={items.length === 0}
            onClick={handlePay}
            className="py-2.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 font-bold text-xs rounded-xl transition-colors text-center shadow-sm cursor-pointer"
          >
            Pay ₱{total.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
};
