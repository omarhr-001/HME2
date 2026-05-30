'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updatePassword, getCurrentUser } from '@/lib/auth'
import { Lock, AlertCircle, Loader2, CheckCircle, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const router = useRouter()

  // Check if user has a valid session (from password reset email link)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await getCurrentUser()
        if (user) {
          setSessionReady(true)
        } else {
          setError('Votre session a expiré. Veuillez demander un nouveau lien de réinitialisation.')
          setLoading(true) // Show loading to prevent form interaction
        }
      } catch (err) {
        console.error('[v0] Session check error:', err)
        setError('Erreur lors de la vérification de votre session.')
      }
    }

    checkSession()
  }, [])

  const validatePasswords = (): boolean => {
    if (!formData.password || !formData.confirmPassword) {
      setError('Veuillez remplir tous les champs')
      return false
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return false
    }

    return true
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('') // Clear error when user starts typing
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validatePasswords()) {
      return
    }

    setLoading(true)

    try {
      const result = await updatePassword(formData.password)

      if (!result.success) {
        setError(result.error || 'Erreur lors de la réinitialisation du mot de passe')
        setLoading(false)
        return
      }

      setSuccess(true)
      setFormData({ password: '', confirmPassword: '' })
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)

    } catch (err) {
      console.error('[v0] Reset password error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erreur serveur inattendue'
      setError(errorMessage)
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />

      <div className="pt-17 min-h-screen flex">
        {/* Left Side - Brand Section */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 flex-col justify-center items-center p-12 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 opacity-10 rounded-full -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-300 opacity-10 rounded-full -ml-48 -mb-48"></div>
          
          <div className="relative z-10 text-white text-center max-w-md">
            <div className="mb-8">
              <img src="/logo.png" alt="Hamroun" className="w-24 h-24 mx-auto mb-6 bg-white/10 p-2 rounded-2xl" />
            </div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">Créer un nouveau mot de passe</h1>
            <p className="text-purple-50 text-lg mb-8 leading-relaxed">
              Choisissez un mot de passe sécurisé pour protéger votre compte Hamroun Meuble & Electro.
            </p>
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-purple-50">Mot de passe fort</p>
                  <p className="text-sm text-purple-100">Minimum 8 caractères recommandé</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-purple-50">Crypté</p>
                  <p className="text-sm text-purple-100">Votre mot de passe est sécurisé</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-purple-50">Accès immédiat</p>
                  <p className="text-sm text-purple-100">Connectez-vous dès que c'est fait</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 py-12 bg-white">
          <div className="w-full max-w-md mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Réinitialiser le mot de passe</h2>
              <p className="text-gray-600">Créez un nouveau mot de passe pour votre compte</p>
            </div>

            {success && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Votre mot de passe a été réinitialisé avec succès ! Redirection vers la page de connexion...
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!success && sessionReady && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* NEW PASSWORD */}
                <div>
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Nouveau mot de passe
                  </Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      disabled={loading}
                      className="bg-white pl-12 pr-12 py-3 text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Minimum 8 caractères</p>
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Confirmer le mot de passe
                  </Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      disabled={loading}
                      className="bg-white pl-12 pr-12 py-3 text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* PASSWORD REQUIREMENTS */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-3">Conditions du mot de passe :</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-xs text-gray-600">Au moins 8 caractères</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${formData.password === formData.confirmPassword && formData.password ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-xs text-gray-600">Les mots de passe correspondent</span>
                    </div>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Réinitialisation en cours...
                    </>
                  ) : (
                    <>
                      Réinitialiser le mot de passe
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {!success && !sessionReady && (
              <div className="p-6 bg-red-50 rounded-lg border border-red-200 text-center">
                <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Lien de réinitialisation expiré</h3>
                <p className="text-gray-600 text-sm mb-6">
                  Le lien de réinitialisation a expiré ou n'est pas valide. Veuillez demander un nouveau lien.
                </p>
                <Link href="/auth/forgot-password" className="text-purple-600 hover:text-purple-700 font-semibold">
                  Demander un nouveau lien
                </Link>
              </div>
            )}

            {/* DIVIDER */}
            {!success && (
              <>
                <div className="my-8 flex items-center gap-4">
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <p className="text-sm text-gray-600">ou</p>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>

                {/* LINKS */}
                <div className="text-center space-y-4">
                  <div>
                    <p className="text-gray-600">
                      Vous vous souvenez de votre mot de passe ?{' '}
                      <Link href="/auth/login" className="text-purple-600 hover:text-purple-700 font-semibold">
                        Se connecter
                      </Link>
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* FOOTER TEXT */}
            <p className="text-center text-xs text-gray-500 mt-8">
              En continuant, vous acceptez nos{' '}
              <Link href="/terms" className="text-gray-600 hover:text-gray-700 underline">
                conditions
              </Link>
              {' '}et notre{' '}
              <Link href="/privacy" className="text-gray-600 hover:text-gray-700 underline">
                politique de confidentialité
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
