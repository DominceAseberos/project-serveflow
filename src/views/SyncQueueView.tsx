import React, { useState, useEffect } from 'react';
import { ContentHeader } from '../components/layout/ContentHeader';
import { Card } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { syncQueueRepository } from '../repositories/syncQueueRepository';
import { syncService } from '../services/syncService';
import { useSessionStore } from '../stores/sessionStore';
import { RefreshCw, Trash2 } from 'lucide-react';
import type { SyncQueueItem } from '../types';

export const SyncQueueView: React.FC = () => {
  const [items, setItems] = useState<SyncQueueItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<SyncQueueItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { setPendingSyncCount } = useSessionStore();

  const loadQueue = async () => {
    const all = await syncQueueRepository.getAll();
    setItems(all);
    const pending = all.filter((i) => i.status === 'pending').length;
    setPendingSyncCount(pending);
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleProcessQueue = async () => {
    setIsProcessing(true);
    try {
      await syncService.processQueue();
      await loadQueue();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearCompleted = async () => {
    await syncQueueRepository.clearCompleted();
    await loadQueue();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <ContentHeader
        title="Offline Synchronization Engine"
        subtitle="Durable local-first mutation queue backed by IndexedDB"
        breadcrumbs={[{ label: 'Home' }, { label: 'Sync Queue', active: true }]}
        actions={
          <div className="flex items-center space-x-2">
            <button
              onClick={handleClearCompleted}
              className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Synced</span>
            </button>
            <button
              onClick={handleProcessQueue}
              disabled={isProcessing}
              className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Synchronizing...' : 'Process Sync Queue'}</span>
            </button>
          </div>
        }
      />

      {/* Architecture Explanation Card */}
      <Card variant="outline" className="bg-emerald-900/5 border-emerald-900/20">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 bg-emerald-800 rounded-xl text-white shrink-0 mt-0.5">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-600 leading-relaxed">
            <h4 className="font-bold text-slate-900 text-sm mb-1">
              Guaranteed Eventual Consistency Architecture
            </h4>
            <p>
              When operations occur (sales, inventory adjustments, status updates), mutations are
              first committed locally into Dexie (IndexedDB), and serialized payloads are recorded to
              the <code className="bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded font-mono">sync_queue</code> table.
              When cloud connectivity is available, items are dispatched in sequence without
              interrupting cashier checkout operations.
            </p>
          </div>
        </div>
      </Card>

      {/* Queue Table */}
      <Card title="Queue Items Ledger" variant="primary">
        <div className="overflow-x-auto -mx-5 -my-5">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Queue ID</th>
                <th className="px-5 py-3">Entity Table</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Enqueued At</th>
                <th className="px-5 py-3">Attempts</th>
                <th className="px-5 py-3">Sync Status</th>
                <th className="px-5 py-3 text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    The sync queue is currently empty.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3 font-mono text-slate-900">{item.id}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {item.entityTable}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-bold text-slate-800">{item.action}</td>
                    <td className="px-5 py-3 text-slate-500">{new Date(item.createdAt).toLocaleTimeString()}</td>
                    <td className="px-5 py-3 text-slate-600">{item.attempts}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          item.status === 'synced'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'failed'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Payload Inspection Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title="Serialized Sync Mutation Payload"
        subtitle={`Queue ID: ${selectedItem?.id}`}
      >
        {selectedItem && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400">Target Table:</span>
                <span className="font-bold ml-1 text-slate-800">{selectedItem.entityTable}</span>
              </div>
              <div>
                <span className="text-slate-400">Action:</span>
                <span className="font-bold ml-1 text-slate-800">{selectedItem.action}</span>
              </div>
              <div>
                <span className="text-slate-400">Entity ID:</span>
                <span className="font-mono ml-1 text-slate-800">{selectedItem.entityId}</span>
              </div>
              <div>
                <span className="text-slate-400">Status:</span>
                <span className="font-bold ml-1 uppercase text-emerald-700">{selectedItem.status}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">JSON Payload Body:</label>
              <pre className="p-4 bg-slate-900 text-emerald-400 rounded-lg text-xs overflow-x-auto font-mono max-h-64">
                {JSON.stringify(JSON.parse(selectedItem.payload), null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
