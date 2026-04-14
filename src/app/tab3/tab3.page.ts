import { Component } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { CategoryService } from '../services/category.service';
import { Category } from '../models/category.model';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {
  categories: Category[] = [];

  availableIcons: string[] = [
    'fast-food', 'school', 'laptop', 'shirt', 'medkit', 'cube',
    'cart', 'book', 'hammer', 'bulb', 'football', 'musical-notes',
    'paw', 'leaf', 'water', 'car', 'home', 'gift',
    'brush', 'camera', 'game-controller', 'fitness',
  ];

  availableColors: string[] = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FF8C94',
    '#A8A8A8', '#DDA0DD', '#F0E68C', '#87CEEB', '#FFA07A',
    '#98FB98', '#FFB347',
  ];

  constructor(
    private categoryService: CategoryService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  async ionViewWillEnter() {
    await this.loadCategories();
  }

  async loadCategories() {
    this.categories = await this.categoryService.getCategories();
  }

  async addCategory() {
    const alert = await this.alertCtrl.create({
      header: 'New Category',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Category name',
        },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Next',
          handler: async (data) => {
            if (!data.name || data.name.trim() === '') {
              return false;
            }
            await this.selectIconForCategory(data.name.trim());
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  async selectIconForCategory(name: string) {
    const iconInputs = this.availableIcons.map((icon, index) => ({
      name: 'icon',
      type: 'radio' as const,
      label: icon,
      value: icon,
      checked: index === 0,
    }));

    const alert = await this.alertCtrl.create({
      header: 'Choose Icon',
      inputs: iconInputs,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Next',
          handler: async (icon: string) => {
            await this.selectColorForCategory(name, icon);
          },
        },
      ],
    });
    await alert.present();
  }

  async selectColorForCategory(name: string, icon: string) {
    const colorInputs = this.availableColors.map((color, index) => ({
      name: 'color',
      type: 'radio' as const,
      label: color,
      value: color,
      checked: index === 0,
    }));

    const alert = await this.alertCtrl.create({
      header: 'Choose Color',
      inputs: colorInputs,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Create',
          handler: async (color: string) => {
            await this.categoryService.addCategory({ name, icon, color });
            const toast = await this.toastCtrl.create({
              message: `Category "${name}" added!`,
              duration: 2000,
              color: 'success',
              position: 'bottom',
            });
            toast.present();
            await this.loadCategories();
          },
        },
      ],
    });
    await alert.present();
  }

  async deleteCategory(category: Category) {
    const alert = await this.alertCtrl.create({
      header: 'Delete Category',
      message: `Are you sure you want to delete "${category.name}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            await this.categoryService.deleteCategory(category.id);
            const toast = await this.toastCtrl.create({
              message: 'Category deleted',
              duration: 2000,
              color: 'danger',
              position: 'bottom',
            });
            toast.present();
            await this.loadCategories();
          },
        },
      ],
    });
    await alert.present();
  }
}
