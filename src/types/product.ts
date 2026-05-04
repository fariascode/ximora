export type ProductStatus = 'active' | 'sold_out' | 'archived';

export interface Product {
  id: string;
  name: string;
  category: string;
  material: string;
  description: string | null;
  purchase_price: number;
  sale_price: number;
  stock: number;
  min_stock: number;
  image_url: string | null;
  status: ProductStatus;
  created_at: string;
}

export type ProductFormValues = Omit<Product, 'id' | 'created_at'>;
