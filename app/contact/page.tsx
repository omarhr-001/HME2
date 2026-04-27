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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    setSubmitted(true)
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
              <p className="text-gray-600 mb-4">+216 XX XXX XXX</p>
              <p className="text-sm text-gray-500">Lun-Dim: 08:00 - 20:00</p>
            </div>
            <div className="bg-white p-8 rounded-lg text-center hover:shadow-lg transition">
              <Mail className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="font-bold text-lg mb-2">Email</h3>
              <p className="text-gray-600 mb-4">contact@hamroun.tn</p>
              <p className="text-sm text-gray-500">Réponse en 24 heures</p>
            </div>
            <div className="bg-white p-8 rounded-lg text-center hover:shadow-lg transition">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="font-bold text-lg mb-2">Adresse</h3>
              <p className="text-gray-600 mb-4">Tunis, Tunisie</p>
              <p className="text-sm text-gray-500">Visite sur rendez-vous</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-12 rounded-lg shadow-sm">
              <h2 className="text-3xl font-bold mb-8">Envoyez-nous un message</h2>
              
              {submitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                  Merci! Votre message a été envoyé avec succès. Nous vous répondrons dans les 24 heures.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition"
                      placeholder="Votre nom"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition"
                    placeholder="+216 XX XXX XXX"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition"
                    placeholder="Sujet de votre message"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition resize-none"
                    placeholder="Votre message..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  Envoyer le message
                </button>
              </form>
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
                  a: 'Nous livrons généralement dans les 3-5 jours ouvrables à Tunis et les 5-7 jours dans le reste de la Tunisie.'
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
                  a: 'Oui, l\'installation gratuite est disponible pour la plupart des appareils à Tunis.'
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
