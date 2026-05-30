'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPasswordForEmail } from '@/lib/auth'
import { Mail, AlertCircle, Loader2, CheckCircle, ArrowRight } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!email) {
      setError('Veuillez entrer votre adresse email')
      return
    }

    if (!validateEmail(email)) {
      setError('Veuillez entrer une adresse email valide')
      return
    }

    setLoading(true)

    try {
      const result = await resetPasswordForEmail(email)

      if (!result.success) {
        setError(result.error || 'Erreur lors de l\'envoi du lien de réinitialisation')
        setLoading(false)
        return
      }

      setSuccess(true)
      setEmail('')
      setLoading(false)
    } catch (err) {
      console.error('[v0] Forgot password error:', err)
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
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex-col justify-center items-center p-12 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 opacity-10 rounded-full -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300 opacity-10 rounded-full -ml-48 -mb-48"></div>
          
          <div className="relative z-10 text-white text-center max-w-md">
            <div className="mb-8">
              <img src="/logo.png" alt="Hamroun" className="w-24 h-24 mx-auto mb-6 bg-white/10 p-2 rounded-2xl" />
            </div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">Réinitialiser votre mot de passe</h1>
            <p className="text-blue-50 text-lg mb-8 leading-relaxed">
              Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-blue-50">Sécurisé</p>
                  <p className="text-sm text-blue-100">Vos données sont protégées</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-blue-50">Rapide</p>
                  <p className="text-sm text-blue-100">Reçevez le lien en quelques secondes</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-blue-50">Simple</p>
                  <p className="text-sm text-blue-100">Réinitialisez en quelques clics</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 py-12 bg-white">
          <div className="w-full max-w-md mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Mot de passe oublié</h2>
              <p className="text-gray-600">Pas de problème. Nous vous aiderons à accéder à votre compte.</p>
            </div>

            {success && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Un lien de réinitialisation a été envoyé à votre adresse email. Vérifiez votre boîte de réception et vos spams.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* EMAIL */}
                <div>
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Adresse Email
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vous@exemple.com"
                      required
                      disabled={loading}
                      className="bg-white pl-12 py-3 text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Nous enverrons un lien de réinitialisation sécurisé à cette adresse.</p>
                </div>

                {/* SUBMIT BUTTON */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      Envoyer le lien
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="p-6 bg-blue-50 rounded-lg border border-blue-200 text-center">
                  <CheckCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Email envoyé</h3>
                  <p className="text-gray-600 text-sm">
                    Vérifiez votre adresse email pour le lien de réinitialisation. Le lien expire après 1 heure.
                  </p>
                </div>

                <Button
                  onClick={() => setSuccess(false)}
                  variant="outline"
                  className="w-full py-3 rounded-lg border border-gray-300"
                >
                  Envoyer un autre email
                </Button>
              </div>
            )}

            {/* DIVIDER */}
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
                  <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                    Se connecter
                  </Link>
                </p>
              </div>
              <div>
                <p className="text-gray-600">
                  Vous n&apos;avez pas de compte ?{' '}
                  <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
                    Créer un compte
                  </Link>
                </p>
              </div>
            </div>

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
