import React, { useState } from 'react';
import {
  Menu,
  Wifi,
  WifiOff,
  Bell,
  RefreshCw,
  ShoppingBag,
  ChefHat,
  LayoutDashboard,
  Banknote,
  Cast,
} from 'lucide-react';
import { useSessionStore } from '../../stores/sessionStore';
import { useCartStore } from '../../stores/cartStore';
import { CashFlowModal } from '../cashflow/CashFlowModal';
import { TvConnectModal } from '../tv/TvConnectModal';

export const AdminHeader: React.FC = () => {
  const [isCashFlowOpen, setIsCashFlowOpen] = useState(false);
  const [isTvConnectOpen, setIsTvConnectOpen] = useState(false);
  const {
    currentCashier,
    isOnline,
    pendingSyncCount,
    lowStockCount,
    toggleSidebar,
    activeView,
    setActiveView,
    setOnlineStatus,
  } = useSessionStore();

  const cartItemCount = useCartStore((s) => s.getItemCount());

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Hamburger & View Quick Links */}
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleSidebar}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          title="Toggle Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
          <button
            onClick={() => setActiveView('pos')}
            className={`px-3 py-1.5 rounded-md flex items-center space-x-1.5 transition-colors ${
              activeView === 'pos'
                ? 'bg-emerald-800 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>POS Workspace</span>
            {cartItemCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-emerald-600 text-white rounded-full">
                {cartItemCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('admin')}
            className={`px-3 py-1.5 rounded-md flex items-center space-x-1.5 transition-colors ${
              activeView === 'admin'
                ? 'bg-emerald-800 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Admin</span>
          </button>

          <button
            onClick={() => setActiveView('kitchen')}
            className={`px-3 py-1.5 rounded-md flex items-center space-x-1.5 transition-colors ${
              activeView === 'kitchen'
                ? 'bg-emerald-800 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Kitchen KDS</span>
          </button>
        </nav>
      </div>

      {/* Right: Offline Status, Sync Heartbeat, Alerts & Profile */}
      <div className="flex items-center space-x-3">
        {/* Cash Drawer & Shift Reconciliation Button */}
        <button
          onClick={() => setIsCashFlowOpen(true)}
          title="Open Cash Drawer & Shift Float Management"
          className="px-3 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-200 text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Banknote className="w-3.5 h-3.5 text-emerald-400" />
          <span>Cash Drawer</span>
        </button>

        {/* Connect / Cast to TV Button */}
        <button
          onClick={() => setIsTvConnectOpen(true)}
          title="Connect or Cast to Customer TV Display"
          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer border border-slate-300"
        >
          <Cast className="w-3.5 h-3.5 text-emerald-700" />
          <span className="hidden sm:inline">Cast TV</span>
        </button>

        {/* Network & Offline Status Toggle */}
        <button
          onClick={() => setOnlineStatus(!isOnline)}
          title={`Click to simulate ${isOnline ? 'Offline' : 'Online'} mode`}
          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
            isOnline
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
              <span>Offline (Dexie Mode)</span>
            </>
          )}
        </button>

        {/* Sync Queue Button */}
        <button
          onClick={() => setActiveView('sync')}
          className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          title="Offline Sync Queue"
        >
          <RefreshCw className="w-4 h-4" />
          {pendingSyncCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white"></span>
          )}
        </button>

        {/* Low Stock Notification */}
        {lowStockCount > 0 && (
          <button
            onClick={() => setActiveView('inventory')}
            className="relative p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
            title={`${lowStockCount} items low on stock`}
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[10px] font-bold bg-rose-600 text-white rounded-full">
              {lowStockCount}
            </span>
          </button>
        )}

        <div className="h-5 w-px bg-slate-200"></div>

        {/* Cashier Badge */}
        <div className="flex items-center space-x-2.5 pl-1">
          <div className="w-8 h-8 rounded-full bg-emerald-900 text-emerald-200 flex items-center justify-center font-bold text-xs shadow-xs">
            {currentCashier.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-800 leading-tight">
              {currentCashier.name}
            </div>
            <div className="text-[11px] text-slate-500 font-normal">
              {currentCashier.role}
            </div>
          </div>
        </div>
      </div>

      <CashFlowModal
        isOpen={isCashFlowOpen}
        onClose={() => setIsCashFlowOpen(false)}
        cashierId={currentCashier.id}
        cashierName={currentCashier.name}
      />

      <TvConnectModal
        isOpen={isTvConnectOpen}
        onClose={() => setIsTvConnectOpen(false)}
      />
    </header>
  );
};
