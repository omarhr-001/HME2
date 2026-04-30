export interface Order {
  id: string
  userId: string
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded'
  items: OrderItem[]
  total: number
  subtotal: number
  tax: number
  shippingFee: number
  paymentMethod: 'konnect' | 'other'
  transactionId?: string
  customerFirstName: string
  customerLastName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: Address
  billingAddress?: Address
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  productId: string
  productName: string
  price: number
  quantity: number
  image: string
  total: number
}

export interface Address {
  street: string
  city: string
  postalCode: string
  country: string
  region?: string
}

export interface OrderResponse {
  success: boolean
  order?: Order
  error?: string
}

export interface CreateOrderRequest {
  items: OrderItem[]
  subtotal: number
  tax: number
  shippingFee: number
  customerFirstName: string
  customerLastName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: Address
  billingAddress?: Address
  notes?: string
}
