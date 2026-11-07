import storeData from './store-data.json'
import { getProducts } from './products'

export interface Offer {
  id: string
  title: string
  description: string
  discount: number
  image?: string
  expiresAt: string
  products?: Array<{
    id: string
    name: string
    price: number
    originalPrice: number
    discount: number
    image_url?: string | null
  }>
}

interface StaticPromotion {
  id: string
  title: string
  description: string
  image_url: string
  end_date: string
  status: string
  product_ids: string[]
}

const staticPromotions = storeData.promotions as StaticPromotion[]

async function getEnrichedPromotions() {
  const products = await getProducts()

  return staticPromotions
    .filter((promotion) => promotion.status === 'active' && Date.parse(promotion.end_date) > Date.now())
    .map((promotion) => {
      const promotionProducts = promotion.product_ids
        .map((productId) => products.find((product) => product.id === productId))
        .filter((product) => product !== undefined)
        .map((product) => {
          const originalPrice = product.originalPrice || product.price
          const discount = originalPrice > 0
            ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
            : 0

          return {
            id: product.id,
            name: product.name,
            price: product.price,
            originalPrice,
            discount,
            image_url: product.image_url || product.image || null,
          }
        })

      return {
        id: promotion.id,
        title: promotion.title,
        description: promotion.description,
        discount: Math.max(0, ...promotionProducts.map((product) => product.discount)),
        image: promotion.image_url,
        expiresAt: new Date(promotion.end_date).toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        products: promotionProducts,
        image_url: promotion.image_url,
        end_date: promotion.end_date,
      }
    })
}

export async function getTopOffers(limit = 3): Promise<Offer[]> {
  const offers = await getEnrichedPromotions()
  return offers
    .sort((left, right) => right.discount - left.discount)
    .slice(0, Math.max(0, limit))
}

export async function getAllOffers(): Promise<Offer[]> {
  return getEnrichedPromotions()
}

export async function getPromotionApiData() {
  const offers = await getEnrichedPromotions()
  return offers.map(({ id, title, description, image_url, end_date, discount, products }) => ({
    id,
    title,
    description,
    image_url,
    expiresAt: end_date,
    discount,
    products,
  }))
}
