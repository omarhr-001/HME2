import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Truck, MapPin } from 'lucide-react'

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white px-[5%] py-20">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold mb-4">Livraison & Frais</h1>
            <p className="text-xl text-gray-300">Expedition depuis Hammamet vers toute la Tunisie.</p>
          </div>
        </div>

        <div className="px-[5%] py-20">
          <div className="max-w-4xl mx-auto">
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Zones de Livraison</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-lg">
                  <MapPin className="w-12 h-12 text-green-500 mb-4" />
                  <h3 className="font-bold text-lg mb-2">Hammamet</h3>
                  <p className="text-gray-600 mb-4">Hammamet et Yasmine Hammamet</p>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-bold">Delai:</span> 24-48h</p>
                    <p className="text-sm"><span className="font-bold">Frais:</span> Gratuit</p>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-lg">
                  <MapPin className="w-12 h-12 text-green-500 mb-4" />
                  <h3 className="font-bold text-lg mb-2">Zone Nabeul</h3>
                  <p className="text-gray-600 mb-4">Nabeul, Mrezga, Bir Bouregba, Korba, Kelibia</p>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-bold">Delai:</span> 1-3 jours</p>
                    <p className="text-sm"><span className="font-bold">Frais:</span> 10 DT standard</p>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-lg">
                  <MapPin className="w-12 h-12 text-green-500 mb-4" />
                  <h3 className="font-bold text-lg mb-2">Tunisie</h3>
                  <p className="text-gray-600 mb-4">Grand Tunis, villes cotieres et autres regions</p>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-bold">Delai:</span> 3-7 jours</p>
                    <p className="text-sm"><span className="font-bold">Frais:</span> 20-30 DT standard</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Processus de Livraison</h2>
              <div className="space-y-4">
                {[
                  { step: 1, title: 'Commande confirmee', desc: 'Vous confirmez votre commande sur WhatsApp.' },
                  { step: 2, title: 'Preparation', desc: 'Nous preparons votre commande depuis Hammamet.' },
                  { step: 3, title: 'Expedition', desc: 'Votre commande est remise au transporteur ou planifiee en livraison locale.' },
                  { step: 4, title: 'Livraison', desc: 'Le livreur contacte le client pour convenir d un horaire.' },
                  { step: 5, title: 'Reception', desc: 'Vous recevez votre commande a l adresse convenue.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
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

            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Tarifs de Livraison</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-6 py-3 text-left font-bold">Zone</th>
                      <th className="px-6 py-3 text-left font-bold">Delai standard</th>
                      <th className="px-6 py-3 text-left font-bold">Tarif standard</th>
                      <th className="px-6 py-3 text-left font-bold">Livraison gratuite</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="px-6 py-4">Hammamet</td>
                      <td className="px-6 py-4">24-48h</td>
                      <td className="px-6 py-4">Gratuit</td>
                      <td className="px-6 py-4">Toujours gratuite</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4">Zone Nabeul</td>
                      <td className="px-6 py-4">1-3 jours</td>
                      <td className="px-6 py-4">10 DT</td>
                      <td className="px-6 py-4">A partir de 500 DT</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4">Grand Tunis et villes cotieres</td>
                      <td className="px-6 py-4">2-5 jours</td>
                      <td className="px-6 py-4">20 DT</td>
                      <td className="px-6 py-4">A partir de 500 DT</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4">Autres regions</td>
                      <td className="px-6 py-4">3-7 jours</td>
                      <td className="px-6 py-4">30 DT</td>
                      <td className="px-6 py-4">A partir de 500 DT</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Service d'installation</h2>
              <div className="bg-green-50 p-8 rounded-lg border border-green-200">
                <div className="flex gap-4 mb-4">
                  <Truck className="w-8 h-8 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-lg mb-2">Installation professionnelle</h3>
                    <p className="text-gray-700 mb-4">
                      L'installation est disponible a Hammamet et dans la zone Nabeul selon le produit et le planning de livraison.
                    </p>
                    <ul className="text-gray-700 space-y-2">
                      <li>Installation et mise en marche complete</li>
                      <li>Raccordement electrique et plomberie si necessaire</li>
                      <li>Test de fonctionnement</li>
                      <li>Enlevement des emballages</li>
                      <li>Conseils d'utilisation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-500 text-white px-[5%] py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Des questions sur la livraison?</h2>
            <p className="text-lg mb-8 opacity-90">Contactez notre equipe pour confirmer les frais selon votre ville.</p>
            <a href="/contact" className="inline-block bg-white text-green-600 font-bold px-8 py-3 rounded-full hover:bg-gray-100 transition">
              Nous contacter
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
