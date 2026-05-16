'use client'

import { useState } from 'react'
import { Lock, LogOut } from 'lucide-react'
import { DashboardCard } from '@/components/admin-components'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setLoading(true)
    try {
      const { error: err } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (err) {
        setError(err.message)
      } else {
        setMessage('Mot de passe changé avec succès')
        setOldPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (err) {
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await signOut()
    window.location.href = '/login'
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600 mt-2">Gérez votre compte administrateur</p>
      </div>

      {/* Profile Info */}
      <DashboardCard>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Informations du Compte</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <p className="text-gray-900 mt-1">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Type de Compte</label>
            <p className="text-gray-900 mt-1">Administrateur</p>
          </div>
        </div>
      </DashboardCard>

      {/* Change Password */}
      <DashboardCard>
        <div className="flex items-center gap-2 mb-6">
          <Lock className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-bold text-gray-900">Changer le Mot de Passe</h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ancien mot de passe
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
          </button>
        </form>
      </DashboardCard>

      {/* Logout */}
      <DashboardCard>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <LogOut className="w-5 h-5" />
              Déconnexion
            </h2>
            <p className="text-gray-600 mt-2">Vous déconnecter de votre compte administrateur</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Déconnecter
          </button>
        </div>
      </DashboardCard>
    </div>
  )
}
