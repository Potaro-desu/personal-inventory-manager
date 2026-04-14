import { Component } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { InventoryService } from '../services/inventory.service';
import { CategoryService } from '../services/category.service';
import { InventoryItem } from '../models/item.model';
import { Category } from '../models/category.model';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {
  items: InventoryItem[] = [];
  filteredItems: InventoryItem[] = [];
  categories: Category[] = [];
  searchTerm: string = '';
  selectedCategory: string = '';
  lowStockCount: number = 0;

  constructor(
    private inventoryService: InventoryService,
    private categoryService: CategoryService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  async ionViewWillEnter() {
    await this.loadData();
  }

  async loadData() {
    this.categories = await this.categoryService.getCategories();
    this.items = await this.inventoryService.getItems();
    const lowStockItems = await this.inventoryService.getLowStockItems();
    this.lowStockCount = lowStockItems.length;
    this.filterItems();
  }

  filterItems() {
    let result = [...this.items];

    if (this.selectedCategory) {
      result = result.filter(i => i.category === this.selectedCategory);
    }

    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(i =>
        i.name.toLowerCase().includes(term) ||
        i.category.toLowerCase().includes(term) ||
        (i.notes && i.notes.toLowerCase().includes(term))
      );
    }

    result.sort((a, b) => {
      const aLow = a.quantity <= a.lowStockThreshold ? 0 : 1;
      const bLow = b.quantity <= b.lowStockThreshold ? 0 : 1;
      if (aLow !== bLow) return aLow - bLow;
      return a.name.localeCompare(b.name);
    });

    this.filteredItems = result;
  }

  filterByCategory(categoryName: string) {
    if (this.selectedCategory === categoryName) {
      this.selectedCategory = '';
    } else {
      this.selectedCategory = categoryName;
    }
    this.filterItems();
  }

  getCategoryIcon(categoryName: string): string {
    const cat = this.categories.find(c => c.name === categoryName);
    return cat ? cat.icon : 'cube';
  }

  getCategoryColor(categoryName: string): string {
    const cat = this.categories.find(c => c.name === categoryName);
    return cat ? cat.color : '#A8A8A8';
  }

  async deleteItem(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this item?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            await this.inventoryService.deleteItem(id);
            const toast = await this.toastCtrl.create({
              message: 'Item deleted',
              duration: 2000,
              color: 'danger',
              position: 'bottom',
            });
            toast.present();
            await this.loadData();
          }
        }
      ]
    });
    await alert.present();
  }
}
