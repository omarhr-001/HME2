'use client'

import { useState } from 'react'
import { useProtectedRoute } from '@/hooks/use-protected-route'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Loader2, Plus, Edit2, Trash2, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function AddressesPage() {
  const { user, loading: authLoading } = useProtectedRoute()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    postal: '',
    country: 'Tunisie',
    isDefault: false,
  })

  const [addresses, setAddresses] = useState([
    {
      id: 1,
      street: '123 Rue de la Paix',
      city: 'Tunis',
      postal: '1000',
      country: 'Tunisie',
      isDefault: true,
    }
  ])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    }))
  }

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    setTimeout(() => {
      const newAddress = {
        id: addresses.length + 1,
        ...formData,
      }
      setAddresses([...addresses, newAddress])
      setFormData({
        street: '',
        city: '',
        postal: '',
        country: 'Tunisie',
        isDefault: false,
      })
      setShowForm(false)
      setLoading(false)
    }, 500)
  }

  const handleDeleteAddress = (id: number) => {
    setAddresses(addresses.filter(addr => addr.id !== id))
  }

  const handleSetDefault = (id: number) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })))
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
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Link href="/account" className="flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold mb-6">
                <ArrowLeft className="w-5 h-5" />
                Retour au compte
              </Link>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">Mes adresses</h1>
                  <p className="text-gray-600">Gérez vos adresses de livraison</p>
                </div>
                <Button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 px-6 py-3 rounded-xl"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter une adresse
                </Button>
              </div>
            </div>

            {/* Add Address Form */}
            {showForm && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Nouvelle adresse</h2>
                <form onSubmit={handleAddAddress} className="space-y-6">
                  {/* Street */}
                  <div>
                    <Label htmlFor="street" className="block text-sm font-semibold text-gray-700 mb-2">
                      Rue et numéro
                    </Label>
                    <Input
                      id="street"
                      name="street"
                      type="text"
                      value={formData.street}
                      onChange={handleChange}
                      placeholder="123 Rue de la Paix"
                      required
                      className="py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    />
                  </div>

                  {/* City and Postal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                        Ville
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        type="text"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Tunis"
                        required
                        className="py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postal" className="block text-sm font-semibold text-gray-700 mb-2">
                        Code postal
                      </Label>
                      <Input
                        id="postal"
                        name="postal"
                        type="text"
                        value={formData.postal}
                        onChange={handleChange}
                        placeholder="1000"
                        required
                        className="py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  {/* Default */}
                  <div className="flex items-center gap-3 bg-green-50 p-4 rounded-lg">
                    <input
                      id="isDefault"
                      name="isDefault"
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-green-600 cursor-pointer"
                    />
                    <label htmlFor="isDefault" className="text-sm font-semibold text-gray-700 cursor-pointer">
                      Utiliser comme adresse par défaut
                    </label>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-4 pt-4 border-t border-gray-200">
                    <Button
                      type="button"
                      onClick={() => setShowForm(false)}
                      variant="outline"
                      className="flex-1 py-3 rounded-lg border-2 border-gray-300"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Ajout...
                        </>
                      ) : (
                        'Ajouter'
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Addresses List */}
            <div className="space-y-4">
              {addresses.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
                  <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune adresse</h3>
                  <p className="text-gray-600 mb-6">Vous n&apos;avez pas encore d&apos;adresse enregistrée</p>
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-green-600 hover:bg-green-700 text-white inline-flex items-center gap-2 px-6 py-3 rounded-xl"
                  >
                    <Plus className="w-5 h-5" />
                    Ajouter une adresse
                  </Button>
                </div>
              ) : (
                addresses.map(address => (
                  <div
                    key={address.id}
                    className={`bg-white rounded-2xl shadow-sm border-2 p-6 transition-all ${
                      address.isDefault ? 'border-green-500 bg-green-50/30' : 'border-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{address.street}</h3>
                          {address.isDefault && (
                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                              Par défaut
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600">
                          {address.city}, {address.postal} - {address.country}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {!address.isDefault && (
                          <Button
                            onClick={() => handleSetDefault(address.id)}
                            variant="outline"
                            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                          >
                            Par défaut
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          className="p-3 rounded-lg border border-gray-300 hover:bg-gray-50"
                        >
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteAddress(address.id)}
                          variant="outline"
                          className="p-3 rounded-lg border border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
