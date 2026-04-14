import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { LocalNotifications } from '@capacitor/local-notifications';
import { InventoryItem } from '../models/item.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private STORAGE_KEY = 'inventory_items';

  async getItems(): Promise<InventoryItem[]> {
    const { value } = await Preferences.get({ key: this.STORAGE_KEY });
    return value ? JSON.parse(value) : [];
  }

  async getItemById(id: string): Promise<InventoryItem | undefined> {
    const items = await this.getItems();
    return items.find(i => i.id === id);
  }

  async addItem(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const items = await this.getItems();
    const newItem: InventoryItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    items.push(newItem);
    await Preferences.set({ key: this.STORAGE_KEY, value: JSON.stringify(items) });
  }

  async updateItem(updated: InventoryItem): Promise<void> {
    const items = await this.getItems();
    const index = items.findIndex(i => i.id === updated.id);
    if (index !== -1) {
      updated.updatedAt = new Date().toISOString();
      items[index] = updated;
      await Preferences.set({ key: this.STORAGE_KEY, value: JSON.stringify(items) });
    }
  }

  async deleteItem(id: string): Promise<void> {
    let items = await this.getItems();
    items = items.filter(i => i.id !== id);
    await Preferences.set({ key: this.STORAGE_KEY, value: JSON.stringify(items) });
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    const items = await this.getItems();
    return items.filter(i => i.quantity <= i.lowStockThreshold);
  }

  async checkAndNotifyLowStock(): Promise<void> {
    try {
      const permResult = await LocalNotifications.requestPermissions();
      if (permResult.display !== 'granted') return;

      const lowItems = await this.getLowStockItems();
      if (lowItems.length > 0) {
        await LocalNotifications.schedule({
          notifications: [{
            title: 'Low Stock Alert!',
            body: `${lowItems.length} item(s) running low: ${lowItems.map(i => i.name).join(', ')}`,
            id: 1,
            schedule: { at: new Date(Date.now() + 1000) },
          }],
        });
      }
    } catch (e) {
      console.warn('Local notifications not available:', e);
    }
  }
}
