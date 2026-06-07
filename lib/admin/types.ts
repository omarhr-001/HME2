export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentMethod = 'cash_on_delivery' | 'bank_transfer'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export type AdminProfile = {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  phone: string | null
  profile_image_url: string | null
  role: 'admin' | 'client' | null
  created_at: string
}

export type AdminCategory = {
  id: string
  name: string
  slug: string
  emoji: string | null
  image_url: string | null
  created_at: string
}

export type AdminProductImage = {
  id: string
  product_id: number
  image_url: string
  is_main: boolean
  sort_order: number
  created_at: string
}

export type AdminProduct = {
  id: number
  name: string
  description: string | null
  category: string | null
  category_id: string | null
  brand_id: string | null
  price: number
  original_price: number | null
  cost: number | null
  stock_quantity: number
  image_url: string | null
  sku: string | null
  in_stock: boolean
  is_active: boolean
  created_at: string
  categories?: AdminCategory | null
  brands?: { id: string; name: string; slug?: string | null; logo_url?: string | null } | null
  product_images?: AdminProductImage[] | null
}

export type AdminOrderItem = {
  id: string
  quantity: number
  price: number
  products?: Pick<AdminProduct, 'id' | 'name' | 'image_url' | 'category' | 'category_id'> | null
}

export type AdminOrder = {
  id: string
  order_number: string | null
  user_id: string
  total_amount: number
  shipping_fee?: number | null
  status: OrderStatus
  payment_method: PaymentMethod | null
  payment_status: PaymentStatus | null
  created_at: string
  updated_at: string
  notes: string | null
  profiles?: AdminProfile | null
  order_items?: AdminOrderItem[]
}

export type AdminDashboardData = {
  stats: {
    totalRevenue: number
    totalOrders: number
    totalProducts: number
    totalCustomers: number
    pendingOrders: number
    processingOrders: number
    deliveredOrders: number
    paidOrders: number
    avgOrderValue: number
    revenueGrowth: number
    orderGrowth: number
    productGrowth: number
    customerGrowthRate: number
    avgOrderGrowth: number
    deliveryRate: number
    paidRate: number
    stockAlertRate: number
    customerAcquisitionCost?: number
    customerLifetimeValue?: number
    conversionRate?: number
    repeatCustomerRate?: number
  }
  revenueSeries: Array<{ label: string; revenue: number }>
  weeklyRevenue: Array<{ label: string; revenue: number }>
  monthlyRevenue: Array<{ label: string; revenue: number }>
  ordersSeries: Array<{ label: string; orders: number }>
  statusDistribution: Array<{ name: OrderStatus; value: number; fill: string }>
  paymentDistribution: Array<{ name: PaymentStatus; value: number; fill: string }>
  bestSellers: Array<{ name: string; quantity: number; revenue: number }>
  customerGrowth: Array<{ label: string; customers: number }>
  lowStockProducts: AdminProduct[]
  outOfStockProducts: AdminProduct[]
  latestOrders: AdminOrder[]
  topCustomers: Array<{ id: string; name: string; email: string | null; total: number; orders: number }>
  insights: Array<{ title: string; value: string; tone: 'green' | 'blue' | 'amber' | 'rose' }>
  productPerformance?: Array<{ name: string; revenue: number; profit: number; margin: number }>
  conversionTrend?: Array<{ label: string; rate: number }>
}
