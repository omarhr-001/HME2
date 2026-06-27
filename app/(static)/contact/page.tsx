'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Phone, Mail, MapPin, Send } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    console.log('Form submitted:', formData)
    // Simulation d'appel API
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSubmitted(true)
    setIsSubmitting(false)
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white px-[5%] py-20">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold mb-4">Nous Contacter</h1>
            <p className="text-xl text-gray-300">Une question? Nous sommes là pour vous aider 24/7.</p>
          </div>
        </div>

        {/* Contact Info Cards */}
        <div className="px-[5%] py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
            <div className="bg-white p-8 rounded-lg text-center hover:shadow-lg transition">
              <Phone className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="font-bold text-lg mb-2">Téléphone</h3>
              <p className="text-gray-600 mb-4">+216 97 100 700 / +216 95 776 655
              </p>
              <p className="text-sm text-gray-500">Lun-Dim: 08:00 - 20:00</p>
            </div>
            <div className="bg-white p-8 rounded-lg text-center hover:shadow-lg transition">
              <Mail className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="font-bold text-lg mb-2">Email</h3>
              <p className="text-gray-600 mb-4">jamel_hamroun@yahoo.fr</p>
              <p className="text-sm text-gray-500">Réponse en 24 heures</p>
            </div>
            <div className="bg-white p-8 rounded-lg text-center hover:shadow-lg transition">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="font-bold text-lg mb-2">Adresse</h3>
              <p className="text-gray-600 mb-4">Rue du Koweit Hammamet - Tunisia, Hammamet, Tunisia, 8050
              </p>
              <p className="text-sm text-gray-500">Visite sur rendez-vous</p>
            </div>
          </div>

        </div>

        {/* FAQ Section */}
        <div className="bg-gray-100 px-[5%] py-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Questions Fréquentes</h2>
            <div className="space-y-6">
              {[
                {
                  q: 'Quel est votre délai de livraison?',
                  a: 'Nous livrons depuis Hammamet: 24-48h à Hammamet, 1-3 jours dans la zone Nabeul et 3-7 jours dans le reste de la Tunisie.'
                },
                {
                  q: 'Acceptez-vous les retours?',
                  a: 'Oui, vous avez 14 jours pour retourner un produit en bon état avec tous les accessoires.'
                },
                {
                  q: 'Proposez-vous une garantie?',
                  a: 'Tous nos produits bénéficient de la garantie du fabricant, généralement 1-3 ans selon le produit.'
                },
                {
                  q: 'Livrez-vous l\'installation?',
                  a: 'Oui, l\'installation est disponible à Hammamet et dans la zone Nabeul selon le produit et le planning.'
                }
              ].map((faq, i) => (
                <div key={i} className="bg-white p-6 rounded-lg">
                  <h4 className="font-bold text-lg mb-2">{faq.q}</h4>
                  <p className="text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
