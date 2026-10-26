import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { productRepository } from '../repositories/productRepository';
import { settingsRepository } from '../repositories/settingsRepository';
import { orderService } from '../services/orderService';
import { useCartStore } from '../stores/cartStore';
import { useSessionStore } from '../stores/sessionStore';
import { ProductCard } from '../components/pos/ProductCard';
import { CartDrawer } from '../components/pos/CartDrawer';
import { PaymentModal } from '../components/pos/PaymentModal';
import { ReceiptModal } from '../components/pos/ReceiptModal';
import type { Product, Category, CategoryId, Order, StoreSettings, PaymentMethod } from '../types';

export const PosView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [pendingPaymentParams, setPendingPaymentParams] = useState<{
    method: PaymentMethod;
    paid: number;
    ref?: string;
    isKitchen?: boolean;
  }>({ method: 'cash', paid: 0 });

  const { items, orderType, discountRate, customerName, tableNumber, addItem, clearCart, getTotal } =
    useCartStore();
  const { currentCashier, setLowStockCount } = useSessionStore();

  const loadData = async () => {
    const allProducts = await productRepository.getAll();
    const allCats = await productRepository.getCategories();
    const storeSettings = await settingsRepository.getSettings();

    setProducts(allProducts);
    setCategories(allCats);
    setSettings(storeSettings);

    const lowStock = allProducts.filter((p) => p.stock <= p.lowStockThreshold).length;
    setLowStockCount(lowStock);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter products by category & search query
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handlePayClick = (details: { paymentMethod: PaymentMethod; amountPaid: number; referenceNo?: string }) => {
    setPendingPaymentParams({
      method: details.paymentMethod,
      paid: details.amountPaid,
      ref: details.referenceNo,
      isKitchen: false,
    });
    setIsPaymentModalOpen(true);
  };

  const handleSendKitchenClick = async (details: {
    paymentMethod: PaymentMethod;
    amountPaid: number;
    referenceNo?: string;
  }) => {
    try {
      const order = await orderService.processCheckout({
        items,
        orderType,
        discountRate,
        paymentMethod: details.paymentMethod,
        amountPaid: details.amountPaid,
        cashierId: currentCashier.id,
        cashierName: currentCashier.name,
        customerName,
        tableNumber,
        referenceNo: details.referenceNo,
        isKitchenOrder: true,
      });

      setCompletedOrder(order);
      clearCart();
      await loadData();
      setIsReceiptModalOpen(true);
    } catch (err: any) {
      alert(`Order error: ${err.message}`);
    }
  };

  const handleConfirmPayment = async (details: {
    paymentMethod: PaymentMethod;
    amountPaid: number;
    change: number;
    referenceNo?: string;
  }) => {
    try {
      const order = await orderService.processCheckout({
        items,
        orderType,
        discountRate,
        paymentMethod: details.paymentMethod,
        amountPaid: details.amountPaid,
        cashierId: currentCashier.id,
        cashierName: currentCashier.name,
        customerName,
        tableNumber,
        referenceNo: details.referenceNo,
        isKitchenOrder: false,
      });

      setIsPaymentModalOpen(false);
      setCompletedOrder(order);
      clearCart();
      await loadData();
      setIsReceiptModalOpen(true);
    } catch (err: any) {
      alert(`Payment failed: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row flex-1 h-[calc(100vh-3.5rem)] overflow-hidden bg-[#f8faf8]">
      {/* Left / Center: Cashier Workspace (Matches desktop.png) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden p-6">
        {/* Workspace Title Header */}
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="block text-[11px] font-bold tracking-widest text-slate-400 uppercase">
              CASHIER WORKSPACE
            </span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
              New Order
            </h1>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search coffee, mains, pastry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold focus:border-emerald-600 focus:outline-hidden shadow-2xs"
            />
          </div>
        </div>

        {/* Category Pills Filter Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                selectedCategory === cat.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Grid (Matches cards in desktop.png) */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Filter className="w-10 h-10 text-slate-300 mb-2" />
              <p className="font-bold text-slate-700">No menu items found</p>
              <p className="text-xs text-slate-400 mt-1">Try clearing your search query or selecting a different category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-12">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={(p) => addItem(p)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Drawer: Cart & Payment */}
      <CartDrawer
        onPayClick={handlePayClick}
        onSendKitchenClick={handleSendKitchenClick}
      />

      {/* Payment Calculator Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        total={getTotal()}
        initialMethod={pendingPaymentParams.method}
        initialPaid={pendingPaymentParams.paid}
        initialReference={pendingPaymentParams.ref}
        onConfirmPayment={handleConfirmPayment}
      />

      {/* Printable Thermal Receipt Modal */}
      {settings && (
        <ReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          order={completedOrder}
          settings={settings}
          onNewOrder={() => {
            setIsReceiptModalOpen(false);
            setCompletedOrder(null);
            clearCart();
          }}
        />
      )}
    </div>
  );
};
