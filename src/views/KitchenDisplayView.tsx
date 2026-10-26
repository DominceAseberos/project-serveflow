import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, RefreshCw, Flame } from 'lucide-react';
import { ContentHeader } from '../components/layout/ContentHeader';
import { orderRepository } from '../repositories/orderRepository';
import type { Order, OrderStatus } from '../types';

export const KitchenDisplayView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  const loadKdsOrders = async () => {
    const all = await orderRepository.getAll();
    const active = all.filter(
      (o) =>
        o.status === 'kitchen_pending' ||
        o.status === 'preparing' ||
        o.status === 'ready'
    );
    setOrders(active);
  };

  useEffect(() => {
    loadKdsOrders();
    const interval = setInterval(loadKdsOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    await orderRepository.updateStatus(orderId, nextStatus);
    await loadKdsOrders();
  };

  const pendingTickets = orders.filter((o) => o.status === 'kitchen_pending');
  const preparingTickets = orders.filter((o) => o.status === 'preparing');
  const readyTickets = orders.filter((o) => o.status === 'ready');

  const getElapsedTime = (createdAt: string) => {
    const elapsedMinutes = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60));
    return `${elapsedMinutes}m ago`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <ContentHeader
        title="Kitchen Display System (KDS)"
        subtitle="Live queue for espresso bar and kitchen prep stations"
        breadcrumbs={[{ label: 'Home' }, { label: 'Kitchen KDS', active: true }]}
        actions={
          <button
            onClick={loadKdsOrders}
            className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        }
      />

      {/* 3 Column KDS Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Incoming / Pending */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-amber-700" />
              <h3 className="font-bold text-sm text-amber-900">1. Incoming / Queue</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-200 text-amber-900">
              {pendingTickets.length}
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {pendingTickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                No tickets waiting in queue.
              </div>
            ) : (
              pendingTickets.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border-l-4 border-l-amber-500 border border-slate-200 p-4 shadow-xs space-y-3 animate-in fade-in"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-base font-extrabold text-slate-900 block">
                        #{order.orderNumber}
                      </span>
                      <span className="text-xs font-semibold text-slate-600">
                        {order.customerName} • {order.tableNumber}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      {getElapsedTime(order.createdAt)}
                    </span>
                  </div>

                  {/* Ticket Items */}
                  <div className="space-y-1.5 border-y border-slate-100 py-2">
                    {order.items.map((i, idx) => (
                      <div key={idx} className="flex justify-between text-xs font-medium">
                        <span className="text-slate-800">
                          <strong className="text-emerald-800 font-bold mr-1.5">{i.quantity}×</strong>
                          {i.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleUpdateStatus(order.id, 'preparing')}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg flex items-center justify-center space-x-1.5 shadow-2xs transition-colors"
                  >
                    <Flame className="w-4 h-4" />
                    <span>Start Preparing</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Currently Preparing */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-blue-700" />
              <h3 className="font-bold text-sm text-blue-900">2. In Preparation</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-200 text-blue-900">
              {preparingTickets.length}
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {preparingTickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                No tickets currently in preparation.
              </div>
            ) : (
              preparingTickets.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border-l-4 border-l-blue-600 border border-slate-200 p-4 shadow-xs space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-base font-extrabold text-slate-900 block">
                        #{order.orderNumber}
                      </span>
                      <span className="text-xs font-semibold text-slate-600">
                        {order.customerName} • {order.tableNumber}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded animate-pulse">
                      Cooking ({getElapsedTime(order.createdAt)})
                    </span>
                  </div>

                  <div className="space-y-1.5 border-y border-slate-100 py-2">
                    {order.items.map((i, idx) => (
                      <div key={idx} className="flex justify-between text-xs font-medium">
                        <span className="text-slate-800">
                          <strong className="text-blue-800 font-bold mr-1.5">{i.quantity}×</strong>
                          {i.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleUpdateStatus(order.id, 'ready')}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center justify-center space-x-1.5 shadow-2xs transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Ready for Pickup</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Ready for Customer Pickup */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-sm text-emerald-900">3. Ready for Customer</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-200 text-emerald-900">
              {readyTickets.length}
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {readyTickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                No orders waiting on pickup counter.
              </div>
            ) : (
              readyTickets.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border-l-4 border-l-emerald-600 border border-slate-200 p-4 shadow-xs space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-base font-extrabold text-slate-900 block">
                        #{order.orderNumber}
                      </span>
                      <span className="text-xs font-semibold text-slate-600">
                        {order.customerName} • {order.tableNumber}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Ready
                    </span>
                  </div>

                  <div className="space-y-1.5 border-y border-slate-100 py-2">
                    {order.items.map((i, idx) => (
                      <div key={idx} className="flex justify-between text-xs font-medium">
                        <span className="text-slate-800">
                          <strong className="text-emerald-800 font-bold mr-1.5">{i.quantity}×</strong>
                          {i.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleUpdateStatus(order.id, 'completed')}
                    className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg flex items-center justify-center space-x-1.5 shadow-2xs transition-colors"
                  >
                    <span>Handed to Guest (Complete)</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
