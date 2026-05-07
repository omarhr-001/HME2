'use client'

import { useState } from 'react'
import { useProtectedRoute } from '@/hooks/use-protected-route'
import { useAuth } from '@/lib/auth-context'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function EditAccountPage() {
  const { user, loading: authLoading } = useProtectedRoute()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    firstName: user?.user_metadata?.first_name || '',
    lastName: user?.user_metadata?.last_name || '',
    email: user?.email || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        email: formData.email,
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
        }
      })

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/account')
      }, 2000)
    } catch (err) {
      console.error(err)
      setError('Une erreur est survenue lors de la mise à jour')
    }

    setLoading(false)
  }

  if (authLoading || !user) {
    return (
      <>
        <Navbar />
        <div className="pt-17 min-h-screen bg-gray-50" />
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="pt-17 min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Link href="/account" className="flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold mb-6">
                <ArrowLeft className="w-5 h-5" />
                Retour au compte
              </Link>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Éditer mon profil</h1>
              <p className="text-gray-600">Mettez à jour vos informations personnelles</p>
            </div>

            {/* Success Message */}
            {success && (
              <Alert className="mb-6 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Profil mis à jour avec succès! Redirection en cours...
                </AlertDescription>
              </Alert>
            )}

            {/* Error Message */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Form */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-3">
                      Prénom
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Jean"
                      disabled={loading}
                      className="py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-3">
                      Nom
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Dupont"
                      disabled={loading}
                      className="py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <Label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                    Adresse Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="vous@exemple.com"
                    disabled={loading}
                    className="py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Un email de confirmation sera envoyé à cette nouvelle adresse
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-8 border-t border-gray-200">
                  <Link href="/account" className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full py-3 rounded-lg border-2 border-gray-300"
                    >
                      Annuler
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Mise à jour...
                      </>
                    ) : (
                      'Mettre à jour'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
