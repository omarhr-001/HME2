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
  category_id?: string;
  category_image_url?: string;
  brand_id?: string;
  brand?: Brand;
  image?: string;
  image_url?: string;
  product_images?: ProductImage[];
  sku?: string;
  specs?: Record<string, string>;
  inStock?: boolean;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryBrand {
  id: string;
  category_id: string;
  brand_id: string;
  created_at?: string;
}

export interface ProductImage {
  id: string;
  product_id: string | number;
  image_url: string;
  is_main: boolean;
  sort_order: number;
  created_at: string;
}

export interface CartProduct {
  id: string | number;
  name?: string;
  category?: string;
  price?: number;
  stock_quantity?: number;
  image_url?: string;
}

export interface CartItemWithProduct {
  id: string;
  user_id?: string;
  product_id: string | number;
  quantity: number;
  price?: number;
  product_name?: string;
  products?: CartProduct | null;
}

export interface Order {
  id: string;
  user_id: string;
  order_number?: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method?: 'cash_on_delivery' | 'bank_transfer';
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
  shipping_fee?: number;
  shipping_address?: Record<string, unknown>;
  billing_address?: Record<string, unknown>;
  notes?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItemWithProduct[];
}

export interface OrderItemWithProduct {
  id: string;
  order_id: string;
  product_id: string | number;
  quantity: number;
  price: number;
  created_at: string;
  products?: CartProduct | null;
}

export interface CheckoutAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country?: string;
}

export interface CheckoutPayload {
  items?: CartItemWithProduct[];
  totalAmount?: number;
  status?: Order['status'];
  paymentMethod?: Order['payment_method'];
  shippingAddress?: CheckoutAddress;
  billingAddress?: CheckoutAddress;
  notes?: string;
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
