export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  lowStockThreshold: number;
  barcode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
