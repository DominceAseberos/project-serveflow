import React, { useState, useEffect } from 'react';
import { orderRepository } from '../repositories/orderRepository';
import type { Order } from '../types';
import { ChefHat, Bell, CheckCircle2 } from 'lucide-react';

export const TvDisplayView: React.FC = () => {
  const [preparingOrders, setPreparingOrders] = useState<Order[]>([]);
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const loadData = async () => {
    const all = await orderRepository.getAll();
    setPreparingOrders(
      all.filter((o) => o.status === 'kitchen_pending' || o.status === 'preparing').slice(0, 8)
    );
    setReadyOrders(all.filter((o) => o.status === 'ready').slice(0, 8));
  };

  useEffect(() => {
    loadData();
    const orderInterval = setInterval(loadData, 4000);
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(orderInterval);
      clearInterval(clockInterval);
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#0d1512] text-white p-6 sm:p-10 flex flex-col justify-between">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-6 border-b border-emerald-950/80">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 flex items-center justify-center font-black text-xl shadow-lg">
            SF
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              SERVEFLOW ORDER STATUS
            </h1>
            <p className="text-xs sm:text-sm text-emerald-400 font-semibold tracking-wide">
              Please watch for your order number below
            </p>
          </div>
        </div>

        {/* Live Clock */}
        <div className="text-right">
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-300">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Main Split Screen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8 flex-1">
        {/* Left: Preparing */}
        <div className="bg-[#13201a] rounded-3xl p-6 sm:p-8 border border-emerald-900/40 flex flex-col shadow-xl">
          <div className="flex items-center space-x-3 pb-5 mb-5 border-b border-emerald-900/50">
            <ChefHat className="w-7 h-7 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-amber-300">
              Now Preparing
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 flex-1 content-start">
            {preparingOrders.length === 0 ? (
              <div className="col-span-2 py-16 text-center text-slate-500 font-medium text-sm">
                No orders currently in the kitchen queue.
              </div>
            ) : (
              preparingOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-[#1a2d24] rounded-2xl p-4 border border-amber-500/30 text-center animate-pulse"
                >
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono block">
                    {ord.orderNumber.replace('SF-2026-', '#')}
                  </span>
                  <span className="text-xs text-amber-300/80 font-semibold truncate block mt-1">
                    {ord.customerName}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Ready for Pickup */}
        <div className="bg-[#0f2d1e] rounded-3xl p-6 sm:p-8 border border-emerald-500/50 flex flex-col shadow-2xl">
          <div className="flex items-center space-x-3 pb-5 mb-5 border-b border-emerald-700/60">
            <Bell className="w-7 h-7 text-emerald-400 animate-bounce" />
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-emerald-300">
              Ready for Pickup
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 flex-1 content-start">
            {readyOrders.length === 0 ? (
              <div className="col-span-2 py-16 text-center text-emerald-700/60 font-medium text-sm">
                All ready orders have been collected.
              </div>
            ) : (
              readyOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-emerald-800/80 rounded-2xl p-5 border-2 border-emerald-400 text-center shadow-lg"
                >
                  <span className="text-3xl sm:text-4xl font-black text-white font-mono block tracking-wider">
                    {ord.orderNumber.replace('SF-2026-', '#')}
                  </span>
                  <span className="text-sm font-bold text-emerald-200 truncate block mt-1">
                    {ord.customerName}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="pt-4 border-t border-emerald-950/80 flex items-center justify-between text-xs text-emerald-500/70">
        <span className="flex items-center">
          <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-400" />
          Offline-First Dexie Local Sync
        </span>
        <span>ServeFlow POS TV Kiosk Mode</span>
      </div>
    </div>
  );
};
