'use client'

type PixelEventData = Record<string, unknown>

export async function trackReactPixelEvent(event: string, data: PixelEventData) {
  if (typeof window === 'undefined') return
  const { default: ReactPixel } = await import('react-facebook-pixel')
  ReactPixel.track(event, data)
}
