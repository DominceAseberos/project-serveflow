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
  cost: number; // Unit cost of goods for COGS and gross margin
  stock: number;
  lowStockThreshold: number;
  sku: string;
  barcode?: string;
  description?: string;
  image?: string; // High-res food/beverage photography URL
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DiscountType = 'none' | 'senior_pwd' | 'member' | 'staff' | 'custom';

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  cost: number;
  modifiers?: string[]; // e.g. ["Extra Espresso Shot", "Oat Milk Sub", "Less Sugar"]
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
  cost: number;
  quantity: number;
  subtotal: number;
  modifiers?: string[];
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
  discountType?: DiscountType;
  discountRate: number; // e.g. 0.20 for 20%
  discountAmount: number;
  seniorPwdId?: string; // Senior Citizen or PWD identification ID
  vatableSales?: number;
  vatExemptSales?: number;
  taxAmount: number;
  cogsTotal?: number; // Total Cost of Goods Sold for this order
  grossProfit?: number; // Total revenue - COGS
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

export type CashMovementType =
  | 'opening_float'
  | 'pay_in'
  | 'pay_out'
  | 'cash_drop'
  | 'closing_reconciliation';

export interface CashDrawerMovement {
  id: string;
  type: CashMovementType;
  amount: number;
  reason: string;
  cashierId: string;
  cashierName: string;
  timestamp: string;
  expectedAmount?: number;
  actualCounted?: number;
  difference?: number; // overage (+) or shortage (-)
}

export interface CashDrawerSummary {
  openingFloat: number;
  totalCashSales: number;
  totalPayIns: number;
  totalPayOuts: number;
  totalCashDrops: number;
  expectedDrawerCash: number;
  lastCountedCash?: number;
  lastDifference?: number;
}

export interface AccountingSummary {
  grossSales: number;
  discounts: number;
  netSales: number;
  cogs: number;
  grossProfit: number;
  grossMarginPercent: number;
  vatableSales: number;
  vatExemptSales: number;
  vatAmount: number;
  totalOrders: number;
  averageTicket: number;
  cashSales: number;
  cardSales: number;
  gcashSales: number;
  mayaSales: number;
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
