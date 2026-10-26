import React, { useState, useEffect } from 'react';
import { ContentHeader } from '../components/layout/ContentHeader';
import { Card } from '../components/common/Card';
import { settingsRepository } from '../repositories/settingsRepository';
import { db } from '../db/database';
import { Save, RotateCcw, Check } from 'lucide-react';
import type { StoreSettings } from '../types';

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    settingsRepository.getSettings().then(setSettings);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    await settingsRepository.updateSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleResetDatabase = async () => {
    if (
      window.confirm(
        'WARNING: This will clear all transactions, reset products, and reseed initial sample café data. Proceed?'
      )
    ) {
      await db.delete();
      window.location.reload();
    }
  };

  if (!settings) return <div className="p-8 text-center text-slate-500">Loading settings...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <ContentHeader
        title="Store & POS System Configuration"
        subtitle="Manage business details, tax rates, receipt formatting, and local database"
        breadcrumbs={[{ label: 'Home' }, { label: 'Settings', active: true }]}
      />

      <form onSubmit={handleSave} className="space-y-6">
        <Card title="Store Business Information" variant="primary">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Store / Business Name</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tagline / Motto</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">TIN / Business Reg #</label>
              <input
                type="text"
                value={settings.tin}
                onChange={(e) => setSettings({ ...settings, tin: e.target.value })}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Telephone / Hotline</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </Card>

        <Card title="Tax & Receipt Customization" variant="outline">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tax Rate (VAT)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={settings.taxRate}
                    onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
                    className="w-32 text-xs font-bold bg-white border border-slate-300 rounded-lg px-3 py-2"
                  />
                  <span className="text-xs text-slate-500 font-semibold">
                    ({(settings.taxRate * 100).toFixed(0)}% Value Added Tax)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Currency Symbol</label>
                <input
                  type="text"
                  value={settings.currencySymbol}
                  onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                  className="w-24 text-xs font-bold bg-white border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Receipt Footer Message</label>
              <textarea
                rows={2}
                value={settings.receiptFooterMessage}
                onChange={(e) => setSettings({ ...settings, receiptFooterMessage: e.target.value })}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2"
              ></textarea>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDatabase}
            className="px-4 py-2 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset & Reseed Database</span>
          </button>

          <div className="flex items-center space-x-3">
            {isSaved && (
              <span className="text-xs font-bold text-emerald-700 flex items-center">
                <Check className="w-4 h-4 mr-1 text-emerald-600" />
                Settings saved!
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-lg shadow-sm flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
