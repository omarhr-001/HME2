'use client'

import { useState } from 'react'
import { useProtectedRoute } from '@/hooks/use-protected-route'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Loader2, CheckCircle, AlertCircle, Lock } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ChangePasswordPage() {
  const { user, loading: authLoading } = useProtectedRoute()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (formData.newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères')
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword
      })

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }

      setSuccess(true)
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      
      setTimeout(() => {
        router.push('/account')
      }, 2000)
    } catch (err) {
      console.error(err)
      setError('Une erreur est survenue lors du changement de mot de passe')
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
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Changer le mot de passe</h1>
              <p className="text-gray-600">Sécurisez votre compte avec un nouveau mot de passe</p>
            </div>

            {/* Success Message */}
            {success && (
              <Alert className="mb-6 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Mot de passe changé avec succès! Redirection en cours...
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
                {/* Security Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                  <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    Pour votre sécurité, nous vous recommandons d&apos;utiliser un mot de passe fort avec des majuscules, minuscules et chiffres.
                  </div>
                </div>

                {/* Current Password */}
                <div>
                  <Label htmlFor="currentPassword" className="block text-sm font-semibold text-gray-700 mb-3">
                    Mot de passe actuel
                  </Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    disabled={loading}
                    className="py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  />
                </div>

                {/* New Password */}
                <div>
                  <Label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-3">
                    Nouveau mot de passe
                  </Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    disabled={loading}
                    className="py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Minimum 6 caractères
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <Label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-3">
                    Confirmer le mot de passe
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    disabled={loading}
                    className="py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  />
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
                        Changement...
                      </>
                    ) : (
                      'Changer le mot de passe'
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
