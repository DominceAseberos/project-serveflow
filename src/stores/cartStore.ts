import { create } from 'zustand';
import type { CartItem, Product, OrderType } from '../types';

interface CartState {
  items: CartItem[];
  orderType: OrderType;
  discountRate: number; // e.g., 0.10 for 10%
  customerName: string;
  tableNumber: string;
  notes: string;

  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setOrderType: (type: OrderType) => void;
  setDiscountRate: (rate: number) => void;
  setCustomerName: (name: string) => void;
  setTableNumber: (table: string) => void;
  setNotes: (notes: string) => void;
  clearCart: () => void;

  // Getters
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  orderType: 'dine_in',
  discountRate: 0,
  customerName: '',
  tableNumber: '',
  notes: '',

  addItem: (product: Product, quantity = 1) => {
    set((state) => {
      const existingIndex = state.items.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const nextItems = [...state.items];
        const existing = nextItems[existingIndex];
        const newQty = existing.quantity + quantity;
        nextItems[existingIndex] = {
          ...existing,
          quantity: newQty,
          itemTotal: newQty * existing.unitPrice,
        };
        return { items: nextItems };
      }

      const newItem: CartItem = {
        product,
        quantity,
        unitPrice: product.price,
        itemTotal: product.price * quantity,
      };
      return { items: [...state.items, newItem] };
    });
  },

  removeItem: (productId: string) => {
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    }));
  },

  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set((state) => ({
      items: state.items.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity,
              itemTotal: quantity * item.unitPrice,
            }
          : item
      ),
    }));
  },

  setOrderType: (type: OrderType) => set({ orderType: type }),
  setDiscountRate: (rate: number) => set({ discountRate: rate }),
  setCustomerName: (name: string) => set({ customerName: name }),
  setTableNumber: (table: string) => set({ tableNumber: table }),
  setNotes: (notes: string) => set({ notes }),

  clearCart: () =>
    set({
      items: [],
      discountRate: 0,
      customerName: '',
      tableNumber: '',
      notes: '',
    }),

  getSubtotal: () => {
    return get().items.reduce((acc, item) => acc + item.itemTotal, 0);
  },

  getDiscountAmount: () => {
    const subtotal = get().getSubtotal();
    return Math.round(subtotal * get().discountRate * 100) / 100;
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscountAmount();
    return Math.max(0, subtotal - discount);
  },

  getItemCount: () => {
    return get().items.reduce((acc, item) => acc + item.quantity, 0);
  },
}));
