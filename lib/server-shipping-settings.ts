import storeData from './store-data.json'
import { STATIC_WRITE_DISABLED_MESSAGE } from './static-mode'
import { DEFAULT_SHIPPING_SETTINGS, type ShippingSettings } from './shipping'

export function normalizeShippingSettings(value: Partial<ShippingSettings> | null | undefined): ShippingSettings {
  return {
    freeThreshold: toNonNegativeNumber(value?.freeThreshold, DEFAULT_SHIPPING_SETTINGS.freeThreshold),
    hammametFee: toNonNegativeNumber(value?.hammametFee, DEFAULT_SHIPPING_SETTINGS.hammametFee),
    nabeulFee: toNonNegativeNumber(value?.nabeulFee, DEFAULT_SHIPPING_SETTINGS.nabeulFee),
    coastalFee: toNonNegativeNumber(value?.coastalFee, DEFAULT_SHIPPING_SETTINGS.coastalFee),
    otherFee: toNonNegativeNumber(value?.otherFee, DEFAULT_SHIPPING_SETTINGS.otherFee),
  }
}

export async function getShippingSettings(): Promise<ShippingSettings> {
  return normalizeShippingSettings(storeData.shippingSettings as Partial<ShippingSettings>)
}

export async function saveShippingSettings(_settings: ShippingSettings): Promise<never> {
  throw new Error(STATIC_WRITE_DISABLED_MESSAGE)
}

function toNonNegativeNumber(value: unknown, fallback: number) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : fallback
}
