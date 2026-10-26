// Core domain types for ServeFlow POS (AdminLTE edition)

export type CategoryId = 'CAT-COFFEE' | 'CAT-MEALS' | 'CAT-PASTRY' | 'CAT-DRINKS' | 'CAT-MERCH' | string;

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  categoryId: CategoryId;
  price: number;
  cost?: number;
  stock: number;
  lowStockThreshold: number;
  sku: string;
  barcode?: string;
  description?: string;
  image?: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  notes?: string;
  itemTotal: number;
}

export type OrderType = 'dine_in' | 'take_out' | 'delivery';
export type PaymentMethod = 'cash' | 'card' | 'gcash' | 'maya';
export type OrderStatus = 'draft' | 'kitchen_pending' | 'preparing' | 'ready' | 'completed' | 'voided';
export type PaymentStatus = 'paid' | 'pending' | 'refunded';

export interface OrderItem {
  productId: string;
  name: string;
  categoryId: CategoryId;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g., SF-2026-1001
  cashierId: string;
  cashierName: string;
  customerName?: string;
  tableNumber?: string;
  orderType: OrderType;
  items: OrderItem[];
  subtotal: number;
  discountRate: number; // e.g. 0.10 for 10%
  discountAmount: number;
  taxAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  referenceNo?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
}

export type InventoryMovementType = 'sale' | 'restock' | 'adjustment' | 'waste' | 'initial';

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: InventoryMovementType;
  quantityChanged: number;
  previousStock: number;
  newStock: number;
  referenceId?: string; // Order ID or purchase receipt ID
  notes?: string;
  createdAt: string;
}

export type SyncAction = 'INSERT' | 'UPDATE' | 'DELETE' | 'PAY' | 'VOID';
export type SyncStatus = 'pending' | 'synced' | 'failed';

export interface SyncQueueItem {
  id: string;
  entityTable: 'orders' | 'products' | 'inventory_movements';
  entityId: string;
  action: SyncAction;
  payload: string; // Serialized JSON
  status: SyncStatus;
  attempts: number;
  lastAttemptAt?: string;
  errorMessage?: string;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  address: string;
  tin: string;
  phone: string;
  taxRate: number; // e.g. 0.12 (12% VAT in Philippines)
  currencySymbol: string;
  receiptFooterMessage: string;
  autoPrintReceipt: boolean;
  cloudSyncUrl: string;
}

export interface CashierSession {
  id: string;
  name: string;
  role: string;
  shiftStart: string;
}
