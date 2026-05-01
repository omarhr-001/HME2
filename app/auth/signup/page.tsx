'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUp } from '@/lib/auth'
import { Mail, Lock, User, AlertCircle, Loader2, CheckCircle, ArrowRight } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setLoading(true)

    const result = await signUp(
      formData.email,
      formData.password,
      formData.firstName,
      formData.lastName
    )

    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
    } else {
      setError(result.error || 'Une erreur est survenue lors de l\'inscription')
    }

    setLoading(false)
  }

  if (success) {
    return (
      <>
        <Navbar />
        <div className="pt-17 min-h-screen flex items-center justify-center px-6">
          <div className="w-full max-w-md">
            <div className="text-center bg-white rounded-2xl p-12 shadow-sm border border-gray-200">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Inscription réussie!</h2>
              <p className="text-gray-600 mb-6">
                Un email de confirmation a été envoyé à <span className="font-semibold">{formData.email}</span>
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Vous allez être redirigé vers la page de connexion dans quelques secondes...
              </p>
              <Link href="/auth/login" className="inline-block">
                <Button className="bg-green-600 hover:bg-green-700">
                  Aller à la connexion
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
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
            <h1 className="text-5xl font-bold mb-6 leading-tight">Rejoignez-nous</h1>
            <p className="text-green-50 text-lg mb-8 leading-relaxed">
              Créez votre compte et accédez à une large sélection d&apos;équipements électroménagers avec les meilleures offres du marché.
            </p>
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-green-50">Inscription gratuite</p>
                  <p className="text-sm text-green-100">sans engagement</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-green-50">Catalogues complets</p>
                  <p className="text-sm text-green-100">à votre disposition</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-green-50">Livraison rapide</p>
                  <p className="text-sm text-green-100">partout en Tunisie</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 py-12 bg-white overflow-y-auto">
          <div className="w-full max-w-md mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Créer un compte</h2>
              <p className="text-gray-600">Rejoignez notre communauté en quelques secondes</p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* NAME FIELDS */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Prénom
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Jean"
                      required
                      disabled={loading}
                      className="pl-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Nom
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Dupont"
                      required
                      disabled={loading}
                      className="pl-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
              </div>

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
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Mot de passe
                </Label>
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
                <p className="text-xs text-gray-500 mt-2">Au minimum 6 caractères</p>
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Confirmer le mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="pl-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* TERMS */}
              <div className="flex items-start gap-3 bg-green-50 p-4 rounded-lg">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 rounded border-gray-300 text-green-600 cursor-pointer mt-1"
                />
                <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                  J&apos;accepte les{' '}
                  <Link href="/terms" className="text-green-600 hover:text-green-700 font-semibold">
                    conditions d&apos;utilisation
                  </Link>
                  {' '}et la{' '}
                  <Link href="/privacy" className="text-green-600 hover:text-green-700 font-semibold">
                    politique de confidentialité
                  </Link>
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
                    Création en cours...
                  </>
                ) : (
                  <>
                    S&apos;inscrire
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

            {/* LOGIN LINK */}
            <div className="text-center">
              <p className="text-gray-600">
                Vous avez déjà un compte ?{' '}
                <Link href="/auth/login" className="text-green-600 hover:text-green-700 font-semibold">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
