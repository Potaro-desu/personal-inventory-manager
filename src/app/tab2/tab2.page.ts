import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import { InventoryService } from '../services/inventory.service';
import { CategoryService } from '../services/category.service';
import { InventoryItem } from '../models/item.model';
import { Category } from '../models/category.model';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {
  item: InventoryItem = this.getEmptyItem();
  categories: Category[] = [];
  isEditing: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private inventoryService: InventoryService,
    private categoryService: CategoryService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {}

  async ionViewWillEnter() {
    this.categories = await this.categoryService.getCategories();

    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      const existing = await this.inventoryService.getItemById(id);
      if (existing) {
        this.item = { ...existing };
        this.isEditing = true;
      }
    } else {
      this.item = this.getEmptyItem();
      this.isEditing = false;
    }
  }

  ionViewWillLeave() {
    this.item = this.getEmptyItem();
    this.isEditing = false;
  }

  getEmptyItem(): InventoryItem {
    return {
      id: '',
      name: '',
      category: '',
      quantity: 0,
      lowStockThreshold: 5,
      barcode: '',
      notes: '',
      createdAt: '',
      updatedAt: '',
    };
  }

  async saveItem() {
    if (!this.item.name || !this.item.category) {
      const toast = await this.toastCtrl.create({
        message: 'Please fill in item name and category.',
        duration: 2000,
        color: 'warning',
        position: 'bottom',
      });
      toast.present();
      return;
    }

    if (this.isEditing) {
      await this.inventoryService.updateItem(this.item);
      const toast = await this.toastCtrl.create({
        message: 'Item updated successfully!',
        duration: 2000,
        color: 'success',
        position: 'bottom',
      });
      toast.present();
    } else {
      await this.inventoryService.addItem(this.item);
      const toast = await this.toastCtrl.create({
        message: 'Item added successfully!',
        duration: 2000,
        color: 'success',
        position: 'bottom',
      });
      toast.present();
    }

    // Check low stock after save
    await this.inventoryService.checkAndNotifyLowStock();

    this.router.navigate(['/tabs/tab1']);
  }

  async deleteItem() {
    const alert = await this.alertCtrl.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete "${this.item.name}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            await this.inventoryService.deleteItem(this.item.id);
            const toast = await this.toastCtrl.create({
              message: 'Item deleted',
              duration: 2000,
              color: 'danger',
              position: 'bottom',
            });
            toast.present();
            this.router.navigate(['/tabs/tab1']);
          }
        }
      ]
    });
    await alert.present();
  }

  incrementQty() {
    this.item.quantity++;
  }

  decrementQty() {
    if (this.item.quantity > 0) {
      this.item.quantity--;
    }
  }
}
