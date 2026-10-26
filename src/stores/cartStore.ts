import { create } from 'zustand';
import type { CartItem, Product, OrderType, DiscountType } from '../types';
import { accountingService } from '../services/accountingService';

interface CartState {
  items: CartItem[];
  orderType: OrderType;
  discountType: DiscountType;
  discountRate: number; // For custom rate
  seniorPwdId: string;
  customerName: string;
  tableNumber: string;
  notes: string;

  // Actions
  addItem: (product: Product, quantity?: number, modifiers?: string[]) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setItemNotes: (productId: string, notes: string) => void;
  setItemModifiers: (productId: string, modifiers: string[]) => void;
  setOrderType: (type: OrderType) => void;
  setDiscountType: (type: DiscountType) => void;
  setDiscountRate: (rate: number) => void;
  setSeniorPwdId: (id: string) => void;
  setCustomerName: (name: string) => void;
  setTableNumber: (table: string) => void;
  setNotes: (notes: string) => void;
  clearCart: () => void;

  // Getters
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTotal: () => number;
  getItemCount: () => number;
  getCalculations: () => ReturnType<typeof accountingService.calculateTotals>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  orderType: 'dine_in',
  discountType: 'none',
  discountRate: 0,
  seniorPwdId: '',
  customerName: '',
  tableNumber: '',
  notes: '',

  addItem: (product: Product, quantity = 1, modifiers = []) => {
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

      const unitCost = product.cost || Math.round(product.price * 0.35);
      const newItem: CartItem = {
        product,
        quantity,
        unitPrice: product.price,
        cost: unitCost,
        modifiers,
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

  setItemNotes: (productId: string, notes: string) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.product.id === productId ? { ...item, notes } : item
      ),
    }));
  },

  setItemModifiers: (productId: string, modifiers: string[]) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.product.id === productId ? { ...item, modifiers } : item
      ),
    }));
  },

  setOrderType: (type: OrderType) => set({ orderType: type }),
  setDiscountType: (type: DiscountType) => set({ discountType: type }),
  setDiscountRate: (rate: number) => set({ discountRate: rate }),
  setSeniorPwdId: (id: string) => set({ seniorPwdId: id }),
  setCustomerName: (name: string) => set({ customerName: name }),
  setTableNumber: (table: string) => set({ tableNumber: table }),
  setNotes: (notes: string) => set({ notes }),

  clearCart: () =>
    set({
      items: [],
      discountType: 'none',
      discountRate: 0,
      seniorPwdId: '',
      customerName: '',
      tableNumber: '',
      notes: '',
    }),

  getSubtotal: () => {
    return get().items.reduce((acc, item) => acc + item.itemTotal, 0);
  },

  getCalculations: () => {
    const { getSubtotal, discountType, discountRate } = get();
    const subtotal = getSubtotal();
    return accountingService.calculateTotals(subtotal, discountType, discountRate);
  },

  getDiscountAmount: () => {
    return get().getCalculations().discountAmount;
  },

  getTotal: () => {
    return get().getCalculations().total;
  },

  getItemCount: () => {
    return get().items.reduce((acc, item) => acc + item.quantity, 0);
  },
}));
