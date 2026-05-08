'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Mail, Lock, AlertCircle, Loader2, ArrowRight } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs')
      return
    }

    setLoading(true)

    try {
      const result = await signIn(formData.email, formData.password)

      if (!result.success) {
        setError(result.error || 'Erreur de connexion')
        setLoading(false)
        return
      }

      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        setError('Session non créée')
        setLoading(false)
        return
      }

      router.push('/')

    } catch (err) {
      console.error('[v0] Login error:', err)
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
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-500 via-green-600 to-green-700 flex-col justify-center items-center p-12 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-400 opacity-10 rounded-full -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-300 opacity-10 rounded-full -ml-48 -mb-48"></div>
          
          <div className="relative z-10 text-white text-center max-w-md">
            <div className="mb-8">
              <img src="/logo.png" alt="Hamroun" className="w-24 h-24 mx-auto mb-6 bg-white/10 p-2 rounded-2xl" />
            </div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">Hamroun Meuble &amp; Electro</h1>
            <p className="text-green-50 text-lg mb-8 leading-relaxed">
              Connectez-vous pour accéder à votre compte et profiter de nos meilleures offres en électroménager de qualité.
            </p>
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-green-50">Accès rapide</p>
                  <p className="text-sm text-green-100">à vos commandes et favoris</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-green-50">Offres exclusives</p>
                  <p className="text-sm text-green-100">réservées aux membres</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-green-50">Support prioritaire</p>
                  <p className="text-sm text-green-100">à votre service 24/7</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 py-12 bg-white">
          <div className="w-full max-w-md mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Connexion</h2>
              <p className="text-gray-600">Entrez vos identifiants pour accéder à votre compte</p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* EMAIL */}
              <div>
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Adresse Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="vous@exemple.com"
                    required
                    disabled={loading}
                    className="pl-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                    Mot de passe
                  </Label>
                  <Link href="#" className="text-sm text-green-600 hover:text-green-700 font-medium">
                    Oublié?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="pl-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* REMEMBER ME */}
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-green-600 cursor-pointer"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-600 cursor-pointer">
                  Me garder connecté
                </label>
              </div>

              {/* SUBMIT BUTTON */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            {/* DIVIDER */}
            <div className="my-8 flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-300"></div>
              <p className="text-sm text-gray-600">ou</p>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* SIGNUP LINK */}
            <div className="text-center">
              <p className="text-gray-600">
                Vous n&apos;avez pas de compte ?{' '}
                <Link href="/auth/signup" className="text-green-600 hover:text-green-700 font-semibold">
                  Créer un compte gratuitement
                </Link>
              </p>
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
