import { Component } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';
import { InventoryService } from '../services/inventory.service';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
  standalone: false,
})
export class Tab4Page {
  defaultThreshold: number = 5;
  totalItems: number = 0;
  lowStockItems: number = 0;
  totalCategories: number = 0;

  private SETTINGS_KEY = 'app_settings';

  constructor(
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private inventoryService: InventoryService
  ) {}

  async ionViewWillEnter() {
    await this.loadSettings();
    await this.loadStats();
  }

  async loadSettings() {
    const { value } = await Preferences.get({ key: this.SETTINGS_KEY });
    if (value) {
      const settings = JSON.parse(value);
      this.defaultThreshold = settings.defaultThreshold || 5;
    }
  }

  async loadStats() {
    const items = await this.inventoryService.getItems();
    this.totalItems = items.length;
    const lowStock = await this.inventoryService.getLowStockItems();
    this.lowStockItems = lowStock.length;

    const { value } = await Preferences.get({ key: 'categories' });
    if (value) {
      this.totalCategories = JSON.parse(value).length;
    }
  }

  async saveSettings() {
    const settings = {
      defaultThreshold: this.defaultThreshold,
    };
    await Preferences.set({ key: this.SETTINGS_KEY, value: JSON.stringify(settings) });
    const toast = await this.toastCtrl.create({
      message: 'Settings saved!',
      duration: 2000,
      color: 'success',
      position: 'bottom',
    });
    toast.present();
  }

  async clearAllData() {
    const alert = await this.alertCtrl.create({
      header: 'Clear All Data',
      message: 'This will permanently delete ALL inventory items and categories. This cannot be undone!',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Clear Everything',
          role: 'destructive',
          handler: async () => {
            await Preferences.clear();
            const toast = await this.toastCtrl.create({
              message: 'All data cleared',
              duration: 2000,
              color: 'danger',
              position: 'bottom',
            });
            toast.present();
            await this.loadStats();
          },
        },
      ],
    });
    await alert.present();
  }

  async testNotification() {
    await this.inventoryService.checkAndNotifyLowStock();
    const toast = await this.toastCtrl.create({
      message: 'Low stock notification check triggered!',
      duration: 2000,
      color: 'primary',
      position: 'bottom',
    });
    toast.present();
  }
}
