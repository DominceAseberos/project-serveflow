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
} from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import type { PaymentMethod } from '../../types';

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
    discountRate,
    customerName,
    tableNumber,
    updateQuantity,
    removeItem,
    setOrderType,
    setDiscountRate,
    setCustomerName,
    setTableNumber,
    clearCart,
    getSubtotal,
    getDiscountAmount,
    getTotal,
    getItemCount,
  } = useCartStore();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountPaidInput, setAmountPaidInput] = useState<string>('');
  const [referenceNo, setReferenceNo] = useState<string>('');

  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const total = getTotal();
  const itemCount = getItemCount();

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
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
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
          ))
        )}
      </div>

      {/* Bill & Payment Drawer Footer */}
      <div className="border-t border-slate-200 bg-white p-4 space-y-3.5 shrink-0 shadow-lg">
        {/* Subtotal & Discount Selection */}
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-800">₱{subtotal.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center text-slate-600">
              <Percent className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Discount
            </span>
            <select
              value={discountRate}
              onChange={(e) => setDiscountRate(parseFloat(e.target.value))}
              className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="0">₱ 0 (None)</option>
              <option value="0.05">5% Promo</option>
              <option value="0.10">10% Member</option>
              <option value="0.20">20% Senior / PWD</option>
            </select>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-xs text-emerald-700 font-medium">
              <span>Discount savings</span>
              <span>- ₱{discountAmount.toFixed(2)}</span>
            </div>
          )}

          {/* Grand Total */}
          <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
            <span className="text-base font-extrabold text-slate-800">Total</span>
            <span className="text-2xl font-black text-emerald-600 tracking-tight">
              ₱{total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment Controls Section (Matches desktop.png) */}
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

        {/* Action Buttons (Matches desktop.png bottom buttons: Save Draft, Send Kitchen, Pay) */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            type="button"
            disabled={items.length === 0}
            onClick={() => {
              alert('Order draft saved to local IndexedDB session.');
            }}
            className="py-2.5 px-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-semibold text-xs rounded-xl transition-colors text-center"
          >
            Save Draft
          </button>

          <button
            type="button"
            disabled={items.length === 0}
            onClick={handleSendKitchen}
            className="py-2.5 px-2 bg-amber-100 hover:bg-amber-200 text-amber-900 disabled:opacity-40 font-bold text-xs rounded-xl transition-colors text-center shadow-xs"
          >
            Send Kitchen
          </button>

          <button
            type="button"
            disabled={items.length === 0}
            onClick={handlePay}
            className="py-2.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 font-bold text-xs rounded-xl transition-colors text-center shadow-sm"
          >
            Pay ₱{total.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
};
