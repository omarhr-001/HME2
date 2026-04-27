import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { RotateCcw, AlertCircle } from 'lucide-react'

export default function ReturnsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24">
        {/* Hero */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white px-[5%] py-20">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold mb-4">Politique de Retour</h1>
            <p className="text-xl text-gray-300">Retournez votre produit facilement dans les 14 jours.</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-[5%] py-20">
          <div className="max-w-4xl mx-auto">
            {/* Return Policy */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Conditions de Retour</h2>
              <div className="bg-white p-8 rounded-lg mb-6">
                <div className="flex gap-4 mb-4">
                  <AlertCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-lg mb-2">Délai de Retour</h3>
                    <p className="text-gray-600">Vous disposez de 14 jours à compter de la réception de votre commande pour demander un retour, sans frais supplémentaires.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Conditions pour un retour accepté</h3>
                  <ul className="text-gray-700 space-y-2">
                    <li>✓ Le produit doit être en bon état, sans dommage visuel</li>
                    <li>✓ Tous les accessoires d'origine doivent être inclus</li>
                    <li>✓ L'emballage d'origine doit être conservé</li>
                    <li>✓ Le produit ne doit pas montrer de signes d'utilisation</li>
                    <li>✓ Vous devez conserver la preuve d'achat</li>
                  </ul>
                </div>

                <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                  <h3 className="font-bold text-lg mb-2">Retours non acceptés</h3>
                  <ul className="text-gray-700 space-y-2">
                    <li>✗ Produits endommagés ou cassés</li>
                    <li>✗ Produits sans emballage d'origine</li>
                    <li>✗ Produits utilisés ou montrant des traces d'usage</li>
                    <li>✗ Produits commandés en promotion/solde (exceptions possibles)</li>
                    <li>✗ Retours après 14 jours</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Return Process */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Processus de Retour</h2>
              <div className="space-y-6">
                {[
                  {
                    step: 1,
                    title: 'Initiez un Retour',
                    desc: 'Contactez notre service client dans les 14 jours avec votre numéro de commande.'
                  },
                  {
                    step: 2,
                    title: 'Approbation',
                    desc: 'Nous examinons votre demande et vous enverrons une étiquette de retour.'
                  },
                  {
                    step: 3,
                    title: 'Emballage',
                    desc: 'Emballez votre produit dans son emballage d\'origine avec tous les accessoires.'
                  },
                  {
                    step: 4,
                    title: 'Retour',
                    desc: 'Déposez votre colis chez le transporteur avec l\'étiquette fournie.'
                  },
                  {
                    step: 5,
                    title: 'Inspection',
                    desc: 'Nous inspectons le produit à la réception.'
                  },
                  {
                    step: 6,
                    title: 'Remboursement',
                    desc: 'Vous êtes remboursé dans les 7-10 jours ouvrables.'
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 bg-white p-6 rounded-lg">
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

            {/* Refund Policy */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Politique de Remboursement</h2>
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Montant du Remboursement</h3>
                  <p className="text-gray-600 mb-4">Le remboursement inclut:</p>
                  <ul className="text-gray-700 space-y-2">
                    <li>✓ Prix du produit (montant payé)</li>
                    <li>✓ Frais de livraison initiaux (si applicable)</li>
                    <li>✗ Frais de retour (à votre charge, sauf si produit défectueux)</li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Délai de Remboursement</h3>
                  <p className="text-gray-600">Une fois que nous avons inspecté et accepté votre retour, vous serez remboursé sous 7-10 jours ouvrables selon votre banque.</p>
                </div>

                <div className="bg-white p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Échanges de Produit</h3>
                  <p className="text-gray-600">Si vous souhaitez un produit différent plutôt qu'un remboursement, nous pouvons l'expédier directement avec le retour gratuit du produit original.</p>
                </div>
              </div>
            </div>

            {/* Special Cases */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Cas Spéciaux</h2>
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Produit Défectueux ou Endommagé</h3>
                  <p className="text-gray-600 mb-2">Si vous recevez un produit défectueux ou endommagé:</p>
                  <ul className="text-gray-700 space-y-2">
                    <li>1. Contactez-nous dans les 48 heures avec photos</li>
                    <li>2. Nous arrangerons un retour gratuit ou un remplacement</li>
                    <li>3. Vous serez remboursé ou verrez recevoir un nouveau produit</li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Produit Manquant ou Incorrect</h3>
                  <p className="text-gray-600">Si vous avez reçu le mauvais article ou des articles manquent:</p>
                  <ul className="text-gray-700 space-y-2">
                    <li>1. Signalez-le dans les 24 heures</li>
                    <li>2. Nous enverrons le bon produit immédiatement</li>
                    <li>3. Aucun retour ne sera exigé (dans la plupart des cas)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-green-50 p-8 rounded-lg border border-green-200">
              <h3 className="font-bold text-lg mb-4">Besoin d'initier un retour?</h3>
              <p className="text-gray-700 mb-6">Contactez notre équipe de support avec votre numéro de commande. Nous sommes disponibles 24/7.</p>
              <div className="flex gap-4">
                <a href="/contact" className="btn-primary">Contacter le Support</a>
                <a href="tel:+21698123456" className="btn-outline">Appeler: +216 98 123 456</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
