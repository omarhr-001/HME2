import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Shield } from 'lucide-react'

export default function WarrantyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 px-[5%] pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Garantie Produits</h1>
          <p className="text-gray-600 mb-12">Information complète sur les garanties de nos produits.</p>

          <div className="bg-white rounded-lg p-8 space-y-8">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200 flex gap-4">
              <Shield className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">Couverture Garantie</h3>
                <p className="text-gray-700">Tous nos produits bénéficient de la garantie du fabricant. La durée et la couverture varient selon la marque et le produit.</p>
              </div>
            </div>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Durées de Garantie par Catégorie</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-6 py-3 text-left font-bold">Catégorie</th>
                      <th className="px-6 py-3 text-left font-bold">Durée Standard</th>
                      <th className="px-6 py-3 text-left font-bold">Couverture</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="px-6 py-4 font-medium">Réfrigérateurs</td>
                      <td className="px-6 py-4">3 ans</td>
                      <td className="px-6 py-4">Défauts de fabrication</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-medium">Lave-linge</td>
                      <td className="px-6 py-4">3 ans</td>
                      <td className="px-6 py-4">Défauts de fabrication</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium">Cuisinières</td>
                      <td className="px-6 py-4">2 ans</td>
                      <td className="px-6 py-4">Défauts de fabrication</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-medium">Climatiseurs</td>
                      <td className="px-6 py-4">2 ans</td>
                      <td className="px-6 py-4">Défauts de fabrication</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium">Fours & Micro-ondes</td>
                      <td className="px-6 py-4">1-2 ans</td>
                      <td className="px-6 py-4">Défauts de fabrication</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ce que Couvre la Garantie</h2>
              <ul className="text-gray-700 space-y-3">
                <li className="flex gap-3">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Défauts de fabrication</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Pièces défectueuses</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Mauvais fonctionnement</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Réparations et remplacements</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ce que NE Couvre PAS la Garantie</h2>
              <ul className="text-gray-700 space-y-3">
                <li className="flex gap-3">
                  <span className="text-red-500 font-bold">✗</span>
                  <span>Dommage causé par l'utilisateur</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-500 font-bold">✗</span>
                  <span>Utilisation incorrecte ou négligence</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-500 font-bold">✗</span>
                  <span>Dommage causé par des chocs ou chutes</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-500 font-bold">✗</span>
                  <span>Entretien et maintenance</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-500 font-bold">✗</span>
                  <span>Usure normale</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-500 font-bold">✗</span>
                  <span>Modifications non autorisées</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Comment Activer la Garantie</h2>
              <ol className="text-gray-700 space-y-3 list-decimal list-inside">
                <li>Gardez votre facture et votre emballage original</li>
                <li>Enregistrez votre produit sur le site du fabricant (si nécessaire)</li>
                <li>Signalez tout défaut dans les 30 jours suivant l'achat</li>
                <li>Contactez-nous avec votre preuve d'achat</li>
                <li>Nous arrangerons la réparation ou le remplacement</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Extension de Garantie</h2>
              <p className="text-gray-700 mb-4">Nous proposons des extensions de garantie optionnelles pour une protection supplémentaire:</p>
              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold mb-2">Garantie Plus (1 an supplémentaire)</h4>
                  <p className="text-gray-600 text-sm">À partir de 50 DT pour couvrir les défauts supplémentaires</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold mb-2">Garantie Total (2 ans supplémentaires + Accidental)</h4>
                  <p className="text-gray-600 text-sm">À partir de 100 DT pour une couverture complète incluant les dommages accidentels</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Service d'Assistance Technique</h2>
              <p className="text-gray-700 mb-4">Avez-vous besoin d'aide pour votre produit?</p>
              <div className="flex gap-4">
                <a href="/contact" className="btn-primary">Contacter le Support</a>
                <a href="tel:+21698123456" className="btn-outline">Appeler: +216 98 123 456</a>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
