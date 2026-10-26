import React from 'react';
import {
  Store,
  LayoutDashboard,
  PackageCheck,
  ChefHat,
  Tv,
  BarChart3,
  RefreshCw,
  Settings,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { useSessionStore, type AppView } from '../../stores/sessionStore';
import { useCartStore } from '../../stores/cartStore';

export const AdminSidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    sidebarCollapsed,
    pendingSyncCount,
    lowStockCount,
    currentCashier,
  } = useSessionStore();

  const cartItemCount = useCartStore((s) => s.getItemCount());

  const navItems: {
    id: AppView;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    badgeColor?: string;
  }[] = [
    {
      id: 'pos',
      label: 'POS',
      icon: <Store className="w-5 h-5 shrink-0" />,
      badge: cartItemCount > 0 ? `${cartItemCount} items` : undefined,
      badgeColor: 'bg-emerald-500 text-white',
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: <PackageCheck className="w-5 h-5 shrink-0" />,
      badge: lowStockCount > 0 ? `${lowStockCount} low` : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'kitchen',
      label: 'Kitchen',
      icon: <ChefHat className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'tv',
      label: 'TV Display',
      icon: <Tv className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <BarChart3 className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'sync',
      label: 'Sync Queue',
      icon: <RefreshCw className="w-5 h-5 shrink-0" />,
      badge: pendingSyncCount > 0 ? pendingSyncCount : undefined,
      badgeColor: 'bg-amber-500 text-slate-900 font-bold',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5 shrink-0" />,
    },
  ];

  return (
    <aside
      className={`bg-[#13221b] text-slate-200 flex flex-col shrink-0 transition-all duration-300 z-40 border-r border-[#1e342a] ${
        sidebarCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-[#1e342a]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-extrabold text-lg shadow-md shrink-0">
            SF
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                OFFLINE-FIRST POS
              </span>
              <span className="block font-bold text-lg text-white tracking-tight leading-tight">
                ServeFlow
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Cashier Mini Profile */}
      {!sidebarCollapsed && (
        <div className="px-4 py-3 bg-[#0d1813]/60 border-b border-[#1e342a] flex items-center space-x-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-emerald-100 flex items-center justify-center font-bold text-xs">
              {currentCashier.name.slice(0, 2)}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#0d1813]"></span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{currentCashier.name}</p>
            <p className="text-[11px] text-emerald-400/80 truncate">Active Register #01</p>
          </div>
        </div>
      )}

      {/* Navigation Tree */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              title={sidebarCollapsed ? item.label : undefined}
              className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-xs font-semibold'
                  : 'text-slate-300 hover:bg-[#1a2e24] hover:text-white'
              } ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <span className={isActive ? 'text-white' : 'text-emerald-400'}>{item.icon}</span>
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!sidebarCollapsed && item.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 text-[11px] rounded-full font-medium ${item.badgeColor || 'bg-slate-700 text-slate-200'}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Offline Ready Badge (Exact match to desktop.png) */}
      <div className="p-3 border-t border-[#1e342a] bg-[#0c1611]">
        <div
          className={`rounded-lg bg-[#182a21] border border-[#233d30] p-3 flex items-center ${
            sidebarCollapsed ? 'justify-center' : 'space-x-3'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <span className="block text-[11px] text-slate-400 font-medium">Local database</span>
              <span className="flex items-center text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Ready offline
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
