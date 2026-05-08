import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 px-[5%] pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Politique sur les Cookies</h1>
          <p className="text-gray-600 mb-8">Dernière mise à jour: {new Date().getFullYear()}</p>

          <div className="bg-white rounded-lg p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Qu'est-ce qu'un Cookie?</h2>
              <p className="text-gray-600">
                Un cookie est un petit fichier texte stocké sur votre ordinateur ou appareil mobile lorsque vous visitez un site web. 
                Les cookies contiennent des informations qui permettent au site web de vous identifier et d'améliorer votre expérience de navigation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Types de Cookies Que Nous Utilisons</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Cookies Essentiels</h3>
                  <p className="text-gray-600">
                    Ces cookies sont nécessaires au fonctionnement du site. Ils incluent l'authentification, 
                    la gestion du panier d'achat et les préférences de sécurité.
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Cookies de Performance</h3>
                  <p className="text-gray-600">
                    Nous utilisons ces cookies pour comprendre comment vous utilisez notre site, 
                    quelles pages vous visitez et d'où vous venez. Cela nous aide à améliorer notre site.
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Cookies Fonctionnels</h3>
                  <p className="text-gray-600">
                    Ces cookies nous permettent de mémoriser vos préférences, 
                    comme votre langue et votre devise, pour vous offrir une meilleure expérience.
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Cookies de Marketing</h3>
                  <p className="text-gray-600">
                    Nous utilisons ces cookies pour suivre vos activités sur notre site et d'autres sites 
                    pour vous montrer des publicités personnalisées et pertinentes.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies de Tiers</h2>
              <p className="text-gray-600 mb-4">
                Nous travaillons avec des services tiers qui peuvent aussi définir des cookies sur votre navigateur:
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>• <strong>Google Analytics:</strong> Pour analyser le trafic du site</li>
                <li>• <strong>Facebook Pixel:</strong> Pour suivre les conversions et les publicités</li>
                <li>• <strong>Système de paiement:</strong> Pour sécuriser vos transactions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contrôler et Supprimer les Cookies</h2>
              <p className="text-gray-600 mb-4">
                Vous pouvez contrôler et supprimer les cookies à tout moment. Voici comment:
              </p>
              <div className="space-y-4">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-bold mb-2">Dans Votre Navigateur</h4>
                  <p className="text-gray-600 text-sm">
                    La plupart des navigateurs web vous permettent de contrôler les cookies par le biais de leurs paramètres de confidentialité. 
                    Consultez la documentation de votre navigateur (Chrome, Firefox, Safari, Edge) pour plus d'informations.
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-bold mb-2">Mode Incognito/Privé</h4>
                  <p className="text-gray-600 text-sm">
                    Vous pouvez utiliser le mode incognito ou privé de votre navigateur pour naviguer sans que des cookies soient stockés.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Conséquences de Désactiver les Cookies</h2>
              <p className="text-gray-600 mb-4">
                Si vous désactivez les cookies, certaines fonctionnalités de notre site peuvent ne pas fonctionner correctement:
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>• Le panier d'achat peut ne pas mémoriser vos articles</li>
                <li>• Vous devrez vous reconnecter à chaque visite</li>
                <li>• Certaines préférences ne seront pas sauvegardées</li>
                <li>• Le site peut être plus lent sans cookies de performance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Mises à Jour de Cette Politique</h2>
              <p className="text-gray-600">
                Nous pouvons mettre à jour cette politique sur les cookies de temps en temps. 
                Consultez cette page régulièrement pour être au courant de toute modification.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Nous Contacter</h2>
              <p className="text-gray-600">
                Si vous avez des questions concernant cette politique sur les cookies, 
                veuillez nous contacter à contact@hamroun.tn ou appeler +216 98 123 456.
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
