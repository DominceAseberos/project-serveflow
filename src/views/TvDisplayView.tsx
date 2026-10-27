import React, { useState, useEffect } from 'react';
import { orderRepository } from '../repositories/orderRepository';
import { useSessionStore } from '../stores/sessionStore';
import type { Order } from '../types';
import {
  ChefHat,
  Bell,
  CheckCircle2,
  ArrowLeft,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Cast,
} from 'lucide-react';
import { playChime, speakOrderReady } from '../utils/audioAnnouncer';
import { tvBroadcast, type TvBroadcastMessage } from '../utils/tvBroadcast';
import { TvConnectModal } from '../components/tv/TvConnectModal';

interface TvDisplayViewProps {
  standalone?: boolean;
}

export const TvDisplayView: React.FC<TvDisplayViewProps> = ({ standalone = false }) => {
  const { setActiveView } = useSessionStore();
  const [preparingOrders, setPreparingOrders] = useState<Order[]>([]);
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  const loadData = async () => {
    const all = await orderRepository.getAll();
    setPreparingOrders(
      all.filter((o) => o.status === 'kitchen_pending' || o.status === 'preparing').slice(0, 8)
    );
    setReadyOrders(all.filter((o) => o.status === 'ready').slice(0, 8));
  };

  useEffect(() => {
    loadData();
    const orderInterval = setInterval(loadData, 3500);
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);

    // Instant zero-delay cross-tab BroadcastChannel listener
    const unsubscribe = tvBroadcast.subscribe((msg: TvBroadcastMessage) => {
      loadData();
      if (msg.type === 'ORDER_READY' && isSoundEnabled) {
        playChime();
        setTimeout(() => {
          if (msg.orderNumber) {
            speakOrderReady(msg.orderNumber, msg.customerName);
          }
        }, 500);
      }
    });

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      clearInterval(orderInterval);
      clearInterval(clockInterval);
      unsubscribe();
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isSoundEnabled]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div
      className={`bg-[#0a120e] text-white flex flex-col justify-between select-none ${
        standalone ? 'min-h-screen p-6 sm:p-10' : 'min-h-[calc(100vh-3.5rem)] p-6 sm:p-10'
      }`}
    >
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-6 border-b border-emerald-950/80">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-700 flex items-center justify-center font-black text-2xl shadow-xl border border-emerald-500/40">
            SF
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>SERVEFLOW ORDER STATUS</span>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-900/80 text-emerald-300 border border-emerald-600/40">
                Live TV Display
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-400 font-semibold tracking-wide">
              Please watch for your order number to collect at the counter
            </p>
          </div>
        </div>

        {/* Live Controls: Clock, Sound, Cast, Fullscreen & Exit */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Live Digital Clock */}
          <div className="text-right pr-2">
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-300 tracking-wider">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">
              {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>

          {/* Sound / Voice Callout Toggle */}
          <button
            type="button"
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isSoundEnabled
                ? 'bg-emerald-900/60 border-emerald-600/50 text-emerald-300 hover:bg-emerald-800'
                : 'bg-rose-950/60 border-rose-800 text-rose-400 hover:bg-rose-900'
            }`}
            title={isSoundEnabled ? 'Chime & Voice Announcement Enabled' : 'Audio Muted'}
          >
            {isSoundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Connect / Cast to TV Modal Button */}
          <button
            type="button"
            onClick={() => setIsConnectModalOpen(true)}
            className="p-2.5 rounded-xl bg-[#13221b] hover:bg-[#1a3026] border border-emerald-700/50 text-emerald-300 transition-colors shadow-xs cursor-pointer"
            title="Connect / Cast to TV Options"
          >
            <Cast className="w-5 h-5" />
          </button>

          {/* Fullscreen Kiosk Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-[#13221b] hover:bg-[#1a3026] border border-emerald-700/50 text-emerald-300 transition-colors shadow-xs cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Kiosk'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          {/* Exit Kiosk Button (if inside main cashier view) */}
          {!standalone && (
            <button
              onClick={() => setActiveView('pos')}
              className="px-3.5 py-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-xs font-semibold flex items-center space-x-1.5 border border-emerald-700/50 shadow-sm transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit Kiosk</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Split Screen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8 flex-1">
        {/* Left Column: Preparing */}
        <div className="bg-[#111e17] rounded-3xl p-6 sm:p-8 border border-amber-900/40 flex flex-col shadow-xl">
          <div className="flex items-center space-x-3 pb-5 mb-5 border-b border-amber-900/40">
            <ChefHat className="w-8 h-8 text-amber-400" />
            <div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-amber-300">
                Now Preparing
              </h2>
              <p className="text-xs text-amber-400/70 font-semibold">In Kitchen & Espresso Bar</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 flex-1 content-start">
            {preparingOrders.length === 0 ? (
              <div className="col-span-2 py-20 text-center text-slate-500 font-medium text-sm">
                No orders currently in the cooking queue.
              </div>
            ) : (
              preparingOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-[#182b21] rounded-2xl p-5 border border-amber-500/30 text-center shadow-md animate-pulse"
                >
                  <span className="text-3xl sm:text-4xl font-black text-white font-mono block tracking-wider">
                    {ord.orderNumber.replace(/SF-\d+-0*/, '#')}
                  </span>
                  <span className="text-xs text-amber-300/80 font-bold truncate block mt-1.5">
                    {ord.customerName}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Ready for Pickup */}
        <div className="bg-[#0b2418] rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/60 flex flex-col shadow-2xl">
          <div className="flex items-center space-x-3 pb-5 mb-5 border-b border-emerald-700/60">
            <Bell className="w-8 h-8 text-emerald-400 animate-bounce" />
            <div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-emerald-300">
                Ready for Pickup
              </h2>
              <p className="text-xs text-emerald-400/80 font-semibold">Please claim at counter</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 flex-1 content-start">
            {readyOrders.length === 0 ? (
              <div className="col-span-2 py-20 text-center text-emerald-700/60 font-medium text-sm">
                All ready orders have been collected.
              </div>
            ) : (
              readyOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-emerald-800/90 rounded-2xl p-6 border-2 border-emerald-400 text-center shadow-xl transform transition-transform hover:scale-102"
                >
                  <span className="text-4xl sm:text-5xl font-black text-white font-mono block tracking-wider">
                    {ord.orderNumber.replace(/SF-\d+-0*/, '#')}
                  </span>
                  <span className="text-sm font-extrabold text-emerald-200 truncate block mt-2">
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
          Offline-First Dexie Local Sync • Sub-millisecond Broadcast
        </span>
        <div className="flex items-center space-x-4">
          <span className="text-slate-500">Local IP: 192.168.1.26:5174/?view=tv</span>
          <span>ServeFlow POS TV Kiosk Mode</span>
        </div>
      </div>

      {/* Connect Modal */}
      <TvConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
      />
    </div>
  );
};
