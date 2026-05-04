import type { Product } from './product';

export type PaymentMethod = 'cash' | 'transfer' | 'card' | 'other';

export interface Sale {
  id: string;
  product_id: string;
  quantity: number;
  unit_sale_price: number;
  total_sale: number;
  unit_cost: number;
  profit: number;
  payment_method: PaymentMethod;
  customer_name: string | null;
  notes: string | null;
  sold_at: string;
}

export interface SaleWithProduct extends Sale {
  product: Pick<Product, 'id' | 'name' | 'image_url' | 'category'> | null;
}

export interface SaleFormValues {
  product_id: string;
  quantity: number;
  unit_sale_price: number;
  payment_method: PaymentMethod;
  customer_name: string;
  notes: string;
}
