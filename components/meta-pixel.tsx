'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { trackPageView } from '@/lib/meta-pixel'

export function MetaPixel() {
  const pathname = usePathname()
  const previousPathname = useRef<string | null>(null)

  useEffect(() => {
    if (previousPathname.current === null) {
      previousPathname.current = pathname
      return
    }

    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname
      trackPageView()
    }
  }, [pathname])

  return null
}
