export const FREE_SHIPPING_THRESHOLD = 500

export type ShippingSettings = {
  freeThreshold: number
  hammametFee: number
  nabeulFee: number
  coastalFee: number
  otherFee: number
}

export const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  freeThreshold: FREE_SHIPPING_THRESHOLD,
  hammametFee: 0,
  nabeulFee: 10,
  coastalFee: 20,
  otherFee: 30,
}

const HAMMAMET_CITIES = ['hammamet', 'yasmine hammamet']
const NABEUL_AREA_CITIES = [
  'nabeul',
  'dar chaabane',
  'beni khiar',
  'mrezga',
  'bir bouregba',
  'bouficha',
  'korba',
  'kelibia',
  'soliman',
]
const COASTAL_CITIES = [
  'tunis',
  'ariana',
  'ben arous',
  'manouba',
  'sousse',
  'monastir',
  'sfax',
]

export function calculateShippingFee(
  subtotal: number,
  city?: string,
  settings: ShippingSettings = DEFAULT_SHIPPING_SETTINGS,
) {
  if (subtotal >= settings.freeThreshold) return 0

  const normalizedCity = normalizeCity(city)
  if (HAMMAMET_CITIES.some((item) => normalizedCity.includes(item))) return settings.hammametFee
  if (NABEUL_AREA_CITIES.some((item) => normalizedCity.includes(item))) return settings.nabeulFee
  if (COASTAL_CITIES.some((item) => normalizedCity.includes(item))) return settings.coastalFee

  return settings.otherFee
}

export function getShippingZoneLabel(city?: string) {
  const normalizedCity = normalizeCity(city)
  if (HAMMAMET_CITIES.some((item) => normalizedCity.includes(item))) return 'Hammamet'
  if (NABEUL_AREA_CITIES.some((item) => normalizedCity.includes(item))) return 'Zone Nabeul'
  if (COASTAL_CITIES.some((item) => normalizedCity.includes(item))) return 'Villes cotieres'
  return 'Tunisie'
}

function normalizeCity(city?: string) {
  return (city || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}
