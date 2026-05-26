import { createServiceClient } from '@/lib/server-supabase'
import { DEFAULT_SHIPPING_SETTINGS, type ShippingSettings } from '@/lib/shipping'

const SETTINGS_KEY = 'shipping'

type ShippingSettingsRow = {
  key: string
  value: Partial<ShippingSettings> | null
}

export async function getShippingSettings() {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('app_settings')
      .select('key, value')
      .eq('key', SETTINGS_KEY)
      .maybeSingle<ShippingSettingsRow>()

    if (error) throw error

    return normalizeShippingSettings(data?.value)
  } catch (error) {
    console.warn('[shipping-settings] Falling back to defaults:', error)
    return DEFAULT_SHIPPING_SETTINGS
  }
}

export async function saveShippingSettings(settings: ShippingSettings) {
  const supabase = createServiceClient()
  const normalized = normalizeShippingSettings(settings)

  const { data, error } = await supabase
    .from('app_settings')
    .upsert({
      key: SETTINGS_KEY,
      value: normalized,
      updated_at: new Date().toISOString(),
    })
    .select('value')
    .single()

  if (error) throw error

  return normalizeShippingSettings(data?.value)
}

export function normalizeShippingSettings(value: Partial<ShippingSettings> | null | undefined): ShippingSettings {
  return {
    freeThreshold: toPositiveNumber(value?.freeThreshold, DEFAULT_SHIPPING_SETTINGS.freeThreshold),
    hammametFee: toPositiveNumber(value?.hammametFee, DEFAULT_SHIPPING_SETTINGS.hammametFee),
    nabeulFee: toPositiveNumber(value?.nabeulFee, DEFAULT_SHIPPING_SETTINGS.nabeulFee),
    coastalFee: toPositiveNumber(value?.coastalFee, DEFAULT_SHIPPING_SETTINGS.coastalFee),
    otherFee: toPositiveNumber(value?.otherFee, DEFAULT_SHIPPING_SETTINGS.otherFee),
  }
}

function toPositiveNumber(value: unknown, fallback: number) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : fallback
}
