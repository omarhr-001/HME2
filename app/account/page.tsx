'use client'

import { useProtectedRoute } from '@/hooks/use-protected-route'
import { useAuth } from '@/lib/auth-context'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { Mail, LogOut, User } from 'lucide-react'
import Link from 'next/link'

export default function AccountPage() {
  const { user, loading } = useProtectedRoute()
  const { signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <Skeleton className="h-10 w-48 mb-8" />
            <Card className="p-8">
              <Skeleton className="h-6 w-full mb-4" />
              <Skeleton className="h-6 w-3/4" />
            </Card>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Mon compte</h1>

          <Card className="p-8 mb-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <User className="mr-2 h-5 w-5" />
              Informations du compte
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-400 mr-2" />
                  <p className="text-gray-900">{user.email}</p>
                </div>
              </div>

              {user.user_metadata?.first_name && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom
                  </label>
                  <p className="text-gray-900">{user.user_metadata.first_name}</p>
                </div>
              )}

              {user.user_metadata?.last_name && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <p className="text-gray-900">{user.user_metadata.last_name}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compte créé le
                </label>
                <p className="text-gray-900">
                  {new Date(user.created_at || '').toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8 mb-8">
            <h2 className="text-xl font-semibold mb-6">Actions</h2>
            <div className="space-y-4">
              <Link href="/orders" className="block">
                <Button variant="outline" className="w-full">
                  Mes commandes
                </Button>
              </Link>
              <Link href="/account/change-password" className="block">
                <Button variant="outline" className="w-full">
                  Changer le mot de passe
                </Button>
              </Link>
            </div>
          </Card>

          <Button
            onClick={handleSignOut}
            variant="destructive"
            className="w-full"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Se déconnecter
          </Button>
        </div>
      </div>
      <Footer />
    </>
  )
}
