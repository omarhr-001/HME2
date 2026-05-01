// Type definitions for HME E-Commerce Database

export interface UserSession {
  id: string
  user_id: string
  session_token: string
  created_at: Date
  last_activity: Date
  expires_at: Date
}

export interface User {
  id: number;
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  profile_image_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  cost?: number;
  stock_quantity?: number;
  category?: string;
  image?: string;
  image_url?: string;
  sku?: string;
  rating?: number;
  reviews?: number;
  specs?: Record<string, string>;
  inStock?: boolean;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface Order {
  id: number;
  user_id: number;
  order_number: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address?: string;
  billing_address?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: Date;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  created_at: Date;
}

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  created_at: Date;
  updated_at: Date;
}

export interface WishlistItem {
  id: number;
  user_id: number;
  product_id: number;
  created_at: Date;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  title?: string;
  comment?: string;
  helpful_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface Payment {
  id: number;
  order_id: number;
  amount: number;
  payment_method?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Promotion {
  id: number;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase_amount?: number;
  max_uses?: number;
  current_uses: number;
  valid_from?: Date;
  valid_until?: Date;
  is_active: boolean;
  created_at: Date;
}

export interface InventoryLog {
  id: number;
  product_id: number;
  quantity_change: number;
  reason?: string;
  created_at: Date;
}
