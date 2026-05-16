'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import { DashboardCard, StatusBadge } from '@/components/admin-components'
import { supabase } from '@/lib/supabase'

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock_quantity: number
  category: string
  image_url?: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category: '',
    image_url: '',
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  function openModal(product?: Product) {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        stock_quantity: product.stock_quantity.toString(),
        category: product.category,
        image_url: product.image_url || '',
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        category: '',
        image_url: '',
      })
    }
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      if (editingProduct) {
        // Update
        await supabase
          .from('products')
          .update({
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            stock_quantity: parseInt(formData.stock_quantity),
            category: formData.category,
            image_url: formData.image_url,
          })
          .eq('id', editingProduct.id)

        setProducts(products.map(p =>
          p.id === editingProduct.id
            ? { ...p, ...formData, price: parseFloat(formData.price), stock_quantity: parseInt(formData.stock_quantity) }
            : p
        ))
      } else {
        // Create
        const { data } = await supabase
          .from('products')
          .insert([{
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            stock_quantity: parseInt(formData.stock_quantity),
            category: formData.category,
            image_url: formData.image_url,
          }])
          .select()

        if (data) {
          setProducts([...products, data[0]])
        }
      }

      setShowModal(false)
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) return

    try {
      await supabase
        .from('products')
        .delete()
        .eq('id', id)

      setProducts(products.filter(p => p.id !== id))
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produits</h1>
          <p className="text-gray-600 mt-2">Gérez votre catalogue de produits</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          <Plus size={20} />
          Ajouter un produit
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
        />
      </div>

      {/* Products Table */}
      <DashboardCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Produit</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Prix</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Stock</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Catégorie</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Statut</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="py-3 px-4 font-medium text-gray-900">{product.name}</td>
                  <td className="py-3 px-4 text-gray-700">{product.price.toFixed(2)} DT</td>
                  <td className="py-3 px-4 text-gray-700">{product.stock_quantity}</td>
                  <td className="py-3 px-4 text-gray-700">{product.category}</td>
                  <td className="py-3 px-4">
                    <StatusBadge
                      status={product.stock_quantity > 0 ? 'in-stock' : 'out-of-stock'}
                    />
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <button
                      onClick={() => openModal(product)}
                      className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
                      title="Éditer"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingProduct ? 'Éditer le produit' : 'Ajouter un produit'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix (DT)</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    required
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Image</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  {editingProduct ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
