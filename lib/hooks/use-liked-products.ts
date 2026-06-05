'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { useAuth } from '@/lib/auth-context'

interface LikedProduct {
  id: string
  user_id: string
  product_id: string
  products: any
  created_at: string
}

export function useLikedProducts() {
  const { user } = useAuth()
  const [isInitialized, setIsInitialized] = useState(false)
  const [likedProductIds, setLikedProductIds] = useState<Set<string>>(new Set())

  const fetcher = async () => {
    if (!user) return []

    try {
      const response = await fetch(`/api/account/liked-products?user_id=${user.id}`)
      if (!response.ok) throw new Error('Failed to fetch')
      return response.json()
    } catch (error) {
      console.error('[v0] Error fetching liked products:', error)
      return []
    }
  }

  const { data: likedProducts = [], isLoading, mutate } = useSWR(
    user ? ['liked-products', user.id] : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )

  useEffect(() => {
    if (!isLoading && user) {
      const ids = new Set<string>(likedProducts.map((p: LikedProduct) => String(p.product_id)))
      setLikedProductIds(ids)
      setIsInitialized(true)
    }
  }, [likedProducts, isLoading, user])

  const toggleLike = async (productId: string) => {
    if (!user) return

    const productIdStr = String(productId)
    const isCurrentlyLiked = likedProductIds.has(productIdStr)
    const newState = !isCurrentlyLiked

    // Optimistic update
    const newIds = new Set(likedProductIds)
    if (newState) {
      newIds.add(productIdStr)
    } else {
      newIds.delete(productIdStr)
    }
    setLikedProductIds(newIds)

    try {
      const response = await fetch('/api/account/liked-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          product_id: productIdStr,
          isLiked: newState,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('[v0] API error response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        })
        // Revert on error
        setLikedProductIds(likedProductIds)
        throw new Error(`Failed to update (${response.status}: ${response.statusText})`)
      }

      // Revalidate the data after successful update
      await mutate()
    } catch (error) {
      console.error('[v0] Error toggling like:', error)
      // Revert on error
      setLikedProductIds(likedProductIds)
    }
  }

  return {
    likedProducts,
    likedProductIds,
    toggleLike,
    isLoading,
    isInitialized,
  }
}
