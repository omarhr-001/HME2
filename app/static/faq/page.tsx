import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

const FAQS = [
  {
    category: 'Commandes & Livraison',
    items: [
      { q: 'Comment passer une commande?', a: 'Naviguez dans nos produits, ajoutez-les à votre panier, et procédez au paiement. C\'est simple et sécurisé!' },
      { q: 'Quel est le délai de livraison?', a: 'Nous livrons sous 3-5 jours à Tunis et 5-7 jours dans le reste de la Tunisie.' },
      { q: 'Livrez-vous l\'installation?', a: 'Oui, installation gratuite pour la plupart des appareils à Tunis. Consultez nos conditions.' },
      { q: 'Puis-je suivre ma commande?', a: 'Oui, vous recevrez un numéro de suivi par email après l\'expédition.' },
    ]
  },
  {
    category: 'Paiement',
    items: [
      { q: 'Quels modes de paiement acceptez-vous?', a: 'Nous acceptons les cartes bancaires, virements et le paiement à la livraison.' },
      { q: 'Est-ce que mes données de paiement sont sécurisées?', a: 'Oui, nous utilisons le chiffrement SSL 256-bit pour sécuriser toutes les transactions.' },
      { q: 'Puis-je payer en plusieurs fois?', a: 'Oui, sur demande. Contactez-nous pour les modalités de paiement en plusieurs tranches.' },
    ]
  },
  {
    category: 'Produits & Garantie',
    items: [
      { q: 'Tous les produits sont-ils neufs?', a: 'Oui, tous nos produits sont 100% neufs et dans leur emballage d\'origine.' },
      { q: 'Quelle est la garantie?', a: 'Les produits bénéficient de la garantie du fabricant, généralement 1-3 ans.' },
      { q: 'Avez-vous des pièces de rechange?', a: 'Oui, nous proposons les pièces d\'origine pour la plupart des marques.' },
      { q: 'Puis-je acheter un article spécifique qui n\'est pas en stock?', a: 'Contactez-nous, nous pouvons parfois le commander pour vous.' },
    ]
  },
  {
    category: 'Retours & Échanges',
    items: [
      { q: 'Quelle est votre politique de retour?', a: 'Vous avez 14 jours pour retourner un produit en bon état avec tous les accessoires.' },
      { q: 'Qui paie les frais de retour?', a: 'Pour les produits défectueux, nous paions les frais. Sinon, ils sont à votre charge.' },
      { q: 'Comment initier un retour?', a: 'Contactez-nous pour obtenir une étiquette de retour et les instructions.' },
      { q: 'Combien de temps pour recevoir mon remboursement?', a: 'Une fois reçu et inspecté, vous serez remboursé dans les 7-10 jours.' },
    ]
  },
  {
    category: 'Autres Questions',
    items: [
      { q: 'Proposez-vous un service de devis?', a: 'Oui, contactez-nous pour un devis pour vos projets d\'équipement en gros.' },
      { q: 'Livrez-vous aussi à l\'étranger?', a: 'Actuellement non, mais nous avons des plans pour l\'expansion. Revenez bientôt!' },
      { q: 'Avez-vous des promotions saisonnières?', a: 'Oui! Inscrivez-vous à notre newsletter pour ne pas manquer les offres spéciales.' },
      { q: 'Comment puis-je devenir partenaire?', a: 'Nous recherchons toujours des partenaires. Contactez notre équipe commerciale.' },
    ]
  }
]

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24">
        {/* Hero */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white px-[5%] py-20">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold mb-4">Questions Fréquentes</h1>
            <p className="text-xl text-gray-300">Trouvez les réponses aux questions les plus courantes.</p>
          </div>
        </div>

        {/* FAQs */}
        <div className="px-[5%] py-20">
          <div className="max-w-4xl mx-auto">
            {FAQS.map((category, idx) => (
              <div key={idx} className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b-2 border-green-500">
                  {category.category}
                </h2>
                <div className="space-y-6">
                  {category.items.map((item, i) => (
                    <div key={i} className="bg-white p-6 rounded-lg">
                      <h3 className="font-bold text-lg text-gray-900 mb-3">{item.q}</h3>
                      <p className="text-gray-600 leading-relaxed">{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-green-500 text-white px-[5%] py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Vous n'avez pas trouvé votre réponse?</h2>
            <p className="text-lg mb-8 opacity-90">Notre équipe de support est disponible pour vous aider.</p>
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
