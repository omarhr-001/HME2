import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Truck, MapPin, Clock } from 'lucide-react'

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24">
        {/* Hero */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white px-[5%] py-20">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold mb-4">Livraison & Frais</h1>
            <p className="text-xl text-gray-300">Informations complètes sur la livraison de vos commandes.</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-[5%] py-20">
          <div className="max-w-4xl mx-auto">
            {/* Shipping Zones */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Zones de Livraison</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-lg">
                  <MapPin className="w-12 h-12 text-green-500 mb-4" />
                  <h3 className="font-bold text-lg mb-2">Grand Tunis</h3>
                  <p className="text-gray-600 mb-4">Tunis, Ariana, Ben Arous, Manouba</p>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-bold">Délai:</span> 3-5 jours</p>
                    <p className="text-sm"><span className="font-bold">Frais:</span> Gratuit (500 DT)</p>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-lg">
                  <MapPin className="w-12 h-12 text-green-500 mb-4" />
                  <h3 className="font-bold text-lg mb-2">Gouvernorats Côtiers</h3>
                  <p className="text-gray-600 mb-4">Sousse, Sfax, Djerba, Monastir</p>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-bold">Délai:</span> 5-7 jours</p>
                    <p className="text-sm"><span className="font-bold">Frais:</span> 25 DT standard</p>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-lg">
                  <MapPin className="w-12 h-12 text-green-500 mb-4" />
                  <h3 className="font-bold text-lg mb-2">Intérieur</h3>
                  <p className="text-gray-600 mb-4">Autres régions de Tunisie</p>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-bold">Délai:</span> 7-10 jours</p>
                    <p className="text-sm"><span className="font-bold">Frais:</span> 40 DT standard</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Process */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Processus de Livraison</h2>
              <div className="space-y-4">
                {[
                  { step: 1, title: 'Commande Confirmée', desc: 'Vous recevez une confirmation avec le numéro de suivi.' },
                  { step: 2, title: 'Préparation', desc: 'Nous préparons votre commande (généralement 24-48h).' },
                  { step: 3, title: 'Expédition', desc: 'Votre colis est remis au transporteur.' },
                  { step: 4, title: 'En Transit', desc: 'Vous pouvez suivre votre colis en temps réel.' },
                  { step: 5, title: 'Livraison', desc: 'Le livreur contacte le client pour convenir d\'un horaire.' },
                  { step: 6, title: 'Réception', desc: 'Vous recevez votre commande à l\'adresse convenue.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-500 text-white font-bold">
                        {item.step}
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-lg">{item.title}</h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Rates */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Tarifs de Livraison</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-6 py-3 text-left font-bold">Zone</th>
                      <th className="px-6 py-3 text-left font-bold">Délai Standard</th>
                      <th className="px-6 py-3 text-left font-bold">Tarif Standard</th>
                      <th className="px-6 py-3 text-left font-bold">Livraison Gratuite</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="px-6 py-4">Grand Tunis</td>
                      <td className="px-6 py-4">3-5 jours</td>
                      <td className="px-6 py-4">Gratuit</td>
                      <td className="px-6 py-4">À partir de 300 DT</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4">Côtiers</td>
                      <td className="px-6 py-4">5-7 jours</td>
                      <td className="px-6 py-4">25 DT</td>
                      <td className="px-6 py-4">À partir de 500 DT</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4">Intérieur</td>
                      <td className="px-6 py-4">7-10 jours</td>
                      <td className="px-6 py-4">40 DT</td>
                      <td className="px-6 py-4">À partir de 800 DT</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Installation Service */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Service d'Installation</h2>
              <div className="bg-green-50 p-8 rounded-lg border border-green-200">
                <div className="flex gap-4 mb-4">
                  <Truck className="w-8 h-8 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-lg mb-2">Installation Professionnelle</h3>
                    <p className="text-gray-700 mb-4">Nous offrons l'installation gratuite pour la plupart des appareils à Tunis et dans les gouvernorats côtiers.</p>
                    <ul className="text-gray-700 space-y-2">
                      <li>✓ Installation et mise en marche complète</li>
                      <li>✓ Raccordement électrique et plomberie si nécessaire</li>
                      <li>✓ Test de fonctionnement</li>
                      <li>✓ Enlèvement des emballages</li>
                      <li>✓ Formation d'utilisation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Suivi de Commande</h2>
              <div className="bg-white p-8 rounded-lg">
                <p className="text-gray-600 mb-4">Vous pouvez suivre votre commande en temps réel grâce au numéro de suivi fourni par email.</p>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-sm text-gray-600 mb-4">Exemple de numéro de suivi:</p>
                  <p className="font-mono font-bold text-lg mb-4">TN-2024-123456</p>
                  <a href="#" className="btn-primary inline-block">
                    Suivre ma Commande
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-green-500 text-white px-[5%] py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Des questions sur la livraison?</h2>
            <p className="text-lg mb-8 opacity-90">Contactez notre équipe de support.</p>
            <a href="/contact" className="inline-block bg-white text-green-600 font-bold px-8 py-3 rounded-full hover:bg-gray-100 transition">
              Nous Contacter
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
