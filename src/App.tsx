import React, { useEffect, useState } from 'react';
import { db } from './db/database';
import { useSessionStore } from './stores/sessionStore';
import { syncQueueRepository } from './repositories/syncQueueRepository';
import { inventoryService } from './services/inventoryService';

import { AdminHeader } from './components/layout/AdminHeader';
import { AdminSidebar } from './components/layout/AdminSidebar';

import { PosView } from './views/PosView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { InventoryView } from './views/InventoryView';
import { KitchenDisplayView } from './views/KitchenDisplayView';
import { TvDisplayView } from './views/TvDisplayView';
import { ReportsView } from './views/ReportsView';
import { SyncQueueView } from './views/SyncQueueView';
import { SettingsView } from './views/SettingsView';

export const App: React.FC = () => {
  const [isDbReady, setIsDbReady] = useState(false);
  const {
    activeView,
    setOnlineStatus,
    setPendingSyncCount,
    setLowStockCount,
  } = useSessionStore();

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await db.seedIfEmpty();
        const pending = await syncQueueRepository.getPendingCount();
        const lowStock = (await inventoryService.getLowStockProducts()).length;
        setPendingSyncCount(pending);
        setLowStockCount(lowStock);
      } catch (err) {
        console.error('Failed to initialize local IndexedDB:', err);
      } finally {
        setIsDbReady(true);
      }
    };

    initializeDatabase();

    // Setup network listeners
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus, setPendingSyncCount, setLowStockCount]);

  if (!isDbReady) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#13221b] text-white">
        <div className="w-16 h-16 rounded-2xl bg-emerald-700 flex items-center justify-center font-black text-2xl shadow-xl animate-pulse mb-4">
          SF
        </div>
        <h2 className="text-xl font-bold tracking-tight">Initializing ServeFlow POS</h2>
        <p className="text-xs text-emerald-400 mt-1">Mounting offline Dexie IndexedDB repository...</p>
      </div>
    );
  }

  // Standalone TV Kiosk Mode (When opened via ?view=tv on a Smart TV, Chromecast, or Second Monitor)
  const isStandaloneTv =
    new URLSearchParams(window.location.search).get('view') === 'tv' ||
    window.location.hash === '#tv';

  if (isStandaloneTv) {
    return <TvDisplayView standalone />;
  }

  // Full-screen Kiosk mode for TV Display within main cashier app
  if (activeView === 'tv') {
    return (
      <div className="min-h-screen flex flex-col">
        <AdminHeader />
        <main className="flex-1">
          <TvDisplayView />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#f4f6f9] text-slate-800 antialiased font-sans">
      {/* AdminLTE Main Navigation Sidebar */}
      <AdminSidebar />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto">
          {activeView === 'pos' && <PosView />}
          {activeView === 'admin' && <AdminDashboardView />}
          {activeView === 'inventory' && <InventoryView />}
          {activeView === 'kitchen' && <KitchenDisplayView />}
          {activeView === 'reports' && <ReportsView />}
          {activeView === 'sync' && <SyncQueueView />}
          {activeView === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
};

export default App;
