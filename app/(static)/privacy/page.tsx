import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 px-[5%] pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Politique de Confidentialité</h1>
          <p className="text-gray-600 mb-8">Dernière mise à jour: {new Date().getFullYear()}</p>

          <div className="bg-white rounded-lg p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-600 mb-4">
                Hamroun Meuble & Electro ("nous", "notre" ou "la Société") respecte la vie privée de nos utilisateurs ("utilisateur" ou "vous"). 
                Cette Politique de Confidentialité explique comment nous collectons, utilisons, divulguons et sauvegardons vos informations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Informations que Nous Collectons</h2>
              <p className="text-gray-600 mb-4">Nous collectons les informations suivantes:</p>
              <ul className="text-gray-600 space-y-2">
                <li>• <strong>Informations Personnelles:</strong> Nom, adresse e-mail, numéro de téléphone, adresse postale</li>
                <li>• <strong>Informations de Paiement:</strong> Détails de carte bancaire (traités de manière sécurisée)</li>
                <li>• <strong>Informations de Navigation:</strong> Adresse IP, type de navigateur, pages visitées</li>
                <li>• <strong>Cookies:</strong> Données de suivi pour améliorer votre expérience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Utilisation de Vos Informations</h2>
              <p className="text-gray-600 mb-4">Nous utilisons vos informations pour:</p>
              <ul className="text-gray-600 space-y-2">
                <li>• Traiter et livrer vos commandes</li>
                <li>• Vous contacter concernant votre compte ou commande</li>
                <li>• Améliorer notre site web et nos services</li>
                <li>• Vous envoyer des e-mails marketing (avec consentement)</li>
                <li>• Prévenir la fraude et assurer la sécurité</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Sécurité des Données</h2>
              <p className="text-gray-600">
                Nous utilisons le chiffrement SSL 256-bit pour protéger vos données. Cependant, aucune méthode de transmission sur Internet n'est 100% sécurisée. 
                Nous ne pouvons pas garantir la sécurité absolue de vos informations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cookies</h2>
              <p className="text-gray-600 mb-4">
                Notre site utilise des cookies pour améliorer votre expérience. Vous pouvez contrôler les cookies via les paramètres de votre navigateur. 
                Certains cookies sont essentiels au fonctionnement du site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Partage des Informations</h2>
              <p className="text-gray-600 mb-4">Nous ne vendons pas vos informations personnelles. Nous pouvons les partager avec:</p>
              <ul className="text-gray-600 space-y-2">
                <li>• Nos partenaires de livraison pour livrer votre commande</li>
                <li>• Les processeurs de paiement pour traiter les transactions</li>
                <li>• Les autorités légales si requis par la loi</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Vos Droits</h2>
              <p className="text-gray-600 mb-4">Vous avez le droit de:</p>
              <ul className="text-gray-600 space-y-2">
                <li>• Accéder à vos données personnelles</li>
                <li>• Corriger les données inexactes</li>
                <li>• Supprimer vos données (droit à l'oubli)</li>
                <li>• Vous désabonner des communications marketing</li>
                <li>• Retirer votre consentement</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact</h2>
              <p className="text-gray-600">
                Si vous avez des questions concernant cette politique, veuillez nous contacter à contact@hamroun.tn ou appelez +216 98 123 456.
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
