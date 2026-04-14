import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Category } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private STORAGE_KEY = 'categories';

  private defaults: Category[] = [
    { id: '1', name: 'Food', icon: 'fast-food', color: '#FF6B6B' },
    { id: '2', name: 'School Supplies', icon: 'school', color: '#4ECDC4' },
    { id: '3', name: 'Electronics', icon: 'laptop', color: '#45B7D1' },
    { id: '4', name: 'Clothing', icon: 'shirt', color: '#96CEB4' },
    { id: '5', name: 'Medicine', icon: 'medkit', color: '#FF8C94' },
    { id: '6', name: 'Others', icon: 'cube', color: '#A8A8A8' },
  ];

  async getCategories(): Promise<Category[]> {
    const { value } = await Preferences.get({ key: this.STORAGE_KEY });
    if (value) {
      return JSON.parse(value);
    }
    await this.saveCategories(this.defaults);
    return this.defaults;
  }

  async saveCategories(categories: Category[]): Promise<void> {
    await Preferences.set({ key: this.STORAGE_KEY, value: JSON.stringify(categories) });
  }

  async addCategory(category: Omit<Category, 'id'>): Promise<void> {
    const categories = await this.getCategories();
    const newCat: Category = {
      ...category,
      id: Date.now().toString(),
    };
    categories.push(newCat);
    await this.saveCategories(categories);
  }

  async updateCategory(updated: Category): Promise<void> {
    const categories = await this.getCategories();
    const index = categories.findIndex(c => c.id === updated.id);
    if (index !== -1) {
      categories[index] = updated;
      await this.saveCategories(categories);
    }
  }

  async deleteCategory(id: string): Promise<void> {
    let categories = await this.getCategories();
    categories = categories.filter(c => c.id !== id);
    await this.saveCategories(categories);
  }
}
