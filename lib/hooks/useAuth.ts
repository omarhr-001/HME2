import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/auth'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error checking auth:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const requireAuth = () => {
    if (!user && !loading) {
      router.push('/auth/login')
      return false
    }
    return true
  }

  return { user, loading, requireAuth, router }
}
