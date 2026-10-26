import { db } from '../db/database';
import type { StoreSettings } from '../types';
import { INITIAL_SETTINGS } from '../db/seedData';

export class SettingsRepository {
  async getSettings(): Promise<StoreSettings> {
    const record = await db.settings.get('store_settings');
    if (!record) {
      await db.settings.put({ key: 'store_settings', value: INITIAL_SETTINGS });
      return INITIAL_SETTINGS;
    }
    return record.value as StoreSettings;
  }

  async updateSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
    const current = await this.getSettings();
    const updated: StoreSettings = { ...current, ...settings };
    await db.settings.put({ key: 'store_settings', value: updated });
    return updated;
  }
}

export const settingsRepository = new SettingsRepository();
