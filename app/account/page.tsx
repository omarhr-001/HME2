'use client'

import { useAuth } from '@/lib/auth-context'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Mail, LogOut, User, Package, Lock, Settings, CreditCard, MapPin, Edit2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function AccountPage() {
  const { user, loading, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="pt-17 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="container mx-auto px-4 py-12">
            <Skeleton className="h-32 w-full mb-8 rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="pt-17 min-h-screen bg-gray-50">
          <div className="max-w-2xl mx-auto px-[5%] py-12 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Veuillez vous connecter</h1>
            <p className="text-gray-600 mb-6">Vous devez être connecté pour accéder à votre compte.</p>
            <Link href="/auth/login" className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
              Aller à la connexion
            </Link>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  const firstName = user.user_metadata?.first_name || ''
  const lastName = user.user_metadata?.last_name || ''
  const fullName = `${firstName} ${lastName}`.trim() || 'Utilisateur'

  return (
    <>
      <Navbar />
      <div className="pt-17 min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-12">
          {/* Profile Header */}
          <div className="mb-12">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white flex-shrink-0">
                  <User className="w-12 h-12" />
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{fullName}</h1>
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <Mail className="w-5 h-5" />
                    <span>{user.email}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Membre depuis {new Date(user.created_at || '').toLocaleDateString('fr-FR', { 
                      year: 'numeric', 
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {/* Edit Button */}
                <Link href="/account/edit">
                  <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 px-6 py-3 rounded-xl">
                    <Edit2 className="w-4 h-4" />
                    Modifier
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-semibold">Commandes</h3>
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500 mt-2">En attente</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-semibold">Adresses</h3>
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">1</p>
              <p className="text-sm text-gray-500 mt-2">Adresse(s) sauvegardée(s)</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-semibold">Wallet</h3>
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">0 DT</p>
              <p className="text-sm text-gray-500 mt-2">Crédit disponible</p>
            </div>
          </div>

          {/* Action Cards */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Mon Compte</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Orders */}
              <Link href="/orders">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md hover:border-green-200 transition-all duration-300 cursor-pointer group h-full">
                  <div className="flex items-start justify-between mb-4">
                    <Package className="w-8 h-8 text-green-600" />
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-green-600 transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Mes Commandes</h3>
                  <p className="text-gray-600 text-sm">Consultez l&apos;historique et le statut de vos commandes</p>
                </div>
              </Link>

              {/* Addresses */}
              <Link href="/account/addresses">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md hover:border-green-200 transition-all duration-300 cursor-pointer group h-full">
                  <div className="flex items-start justify-between mb-4">
                    <MapPin className="w-8 h-8 text-green-600" />
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-green-600 transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Adresses</h3>
                  <p className="text-gray-600 text-sm">Gérez vos adresses de livraison et de facturation</p>
                </div>
              </Link>

              {/* Change Password */}
              <Link href="/account/change-password">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md hover:border-green-200 transition-all duration-300 cursor-pointer group h-full">
                  <div className="flex items-start justify-between mb-4">
                    <Lock className="w-8 h-8 text-green-600" />
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-green-600 transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Sécurité</h3>
                  <p className="text-gray-600 text-sm">Changez votre mot de passe et gérez la sécurité</p>
                </div>
              </Link>

              {/* Settings */}
              <Link href="/account/settings">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md hover:border-green-200 transition-all duration-300 cursor-pointer group h-full">
                  <div className="flex items-start justify-between mb-4">
                    <Settings className="w-8 h-8 text-green-600" />
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-green-600 transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Paramètres</h3>
                  <p className="text-gray-600 text-sm">Préférences, notifications et confidentialité</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Logout Section */}
          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border border-red-100 p-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-red-900 mb-1">Déconnexion</h3>
                <p className="text-red-700 text-sm">Vous serez déconnecté de votre compte</p>
              </div>
              <Button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 px-6 py-3 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                Se déconnecter
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
