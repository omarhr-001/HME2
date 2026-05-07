'use client'

import { useState } from 'react'
import { useProtectedRoute } from '@/hooks/use-protected-route'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Bell, Eye, Lock, Globe } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const { user, loading: authLoading } = useProtectedRoute()
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    newsEmails: false,
    orderUpdates: true,
    twoFactorAuth: false,
    language: 'fr',
    theme: 'light',
  })

  const handleToggle = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: value
    }))
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
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Link href="/account" className="flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold mb-6">
                <ArrowLeft className="w-5 h-5" />
                Retour au compte
              </Link>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Paramètres</h1>
              <p className="text-gray-600">Personnalisez votre expérience</p>
            </div>

            {/* Notifications Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
              </div>

              <div className="space-y-4">
                {/* Email Notifications */}
                <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition">
                  <div>
                    <h3 className="font-semibold text-gray-900">Notifications par email</h3>
                    <p className="text-sm text-gray-600">Recevez des mises à jour sur vos commandes</p>
                  </div>
                  <button
                    onClick={() => handleToggle('emailNotifications')}
                    className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                      settings.emailNotifications ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        settings.emailNotifications ? 'translate-x-9' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* SMS Notifications */}
                <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition">
                  <div>
                    <h3 className="font-semibold text-gray-900">Notifications SMS</h3>
                    <p className="text-sm text-gray-600">Recevez des alertes par SMS</p>
                  </div>
                  <button
                    onClick={() => handleToggle('smsNotifications')}
                    className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                      settings.smsNotifications ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        settings.smsNotifications ? 'translate-x-9' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Marketing Emails */}
                <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition">
                  <div>
                    <h3 className="font-semibold text-gray-900">Emails marketing</h3>
                    <p className="text-sm text-gray-600">Recevez nos offres spéciales</p>
                  </div>
                  <button
                    onClick={() => handleToggle('marketingEmails')}
                    className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                      settings.marketingEmails ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        settings.marketingEmails ? 'translate-x-9' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Order Updates */}
                <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition">
                  <div>
                    <h3 className="font-semibold text-gray-900">Mises à jour de commandes</h3>
                    <p className="text-sm text-gray-600">Suivi de vos commandes en temps réel</p>
                  </div>
                  <button
                    onClick={() => handleToggle('orderUpdates')}
                    className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                      settings.orderUpdates ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        settings.orderUpdates ? 'translate-x-9' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">Sécurité</h2>
              </div>

              <div className="space-y-4">
                {/* Two Factor Auth */}
                <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition">
                  <div>
                    <h3 className="font-semibold text-gray-900">Authentification à deux facteurs</h3>
                    <p className="text-sm text-gray-600">Sécurisez votre compte avec 2FA</p>
                  </div>
                  <button
                    onClick={() => handleToggle('twoFactorAuth')}
                    className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                      settings.twoFactorAuth ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        settings.twoFactorAuth ? 'translate-x-9' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Preferences Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <Eye className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">Préférences</h2>
              </div>

              <div className="space-y-6">
                {/* Language */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Langue
                  </label>
                  <select
                    name="language"
                    value={settings.language}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  >
                    <option value="fr">Français</option>
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                  </select>
                </div>

                {/* Theme */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Thème
                  </label>
                  <select
                    name="theme"
                    value={settings.theme}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  >
                    <option value="light">Clair</option>
                    <option value="dark">Sombre</option>
                    <option value="auto">Automatique</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-4">
              <Link href="/account" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full py-3 rounded-lg border-2 border-gray-300"
                >
                  Annuler
                </Button>
              </Link>
              <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition">
                Enregistrer les paramètres
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
