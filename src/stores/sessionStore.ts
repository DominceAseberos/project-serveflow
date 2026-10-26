import { create } from 'zustand';
import type { CashierSession } from '../types';

export type AppView =
  | 'pos'
  | 'admin'
  | 'inventory'
  | 'kitchen'
  | 'tv'
  | 'reports'
  | 'sync'
  | 'settings';

interface SessionState {
  currentCashier: CashierSession;
  activeView: AppView;
  isOnline: boolean;
  pendingSyncCount: number;
  lowStockCount: number;
  sidebarCollapsed: boolean;

  // Actions
  setActiveView: (view: AppView) => void;
  setOnlineStatus: (status: boolean) => void;
  setPendingSyncCount: (count: number) => void;
  setLowStockCount: (count: number) => void;
  toggleSidebar: () => void;
  setCashier: (cashier: CashierSession) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  currentCashier: {
    id: 'staff-001',
    name: 'Domince A.',
    role: 'Head Cashier / Store Admin',
    shiftStart: new Date().toISOString(),
  },
  activeView: 'pos',
  isOnline: navigator.onLine,
  pendingSyncCount: 0,
  lowStockCount: 0,
  sidebarCollapsed: false,

  setActiveView: (view) => set({ activeView: view }),
  setOnlineStatus: (status) => set({ isOnline: status }),
  setPendingSyncCount: (count) => set({ pendingSyncCount: count }),
  setLowStockCount: (count) => set({ lowStockCount: count }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setCashier: (cashier) => set({ currentCashier: cashier }),
}));
