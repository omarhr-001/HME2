import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 px-[5%] pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Conditions d'Utilisation</h1>
          <p className="text-gray-600 mb-8">Dernière mise à jour: {new Date().getFullYear()}</p>

          <div className="bg-white rounded-lg p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Accord d'Utilisation</h2>
              <p className="text-gray-600">
                En accédant et en utilisant ce site web, vous acceptez d'être lié par ces Conditions d'Utilisation et toutes les lois et réglementations applicables.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Licence d'Utilisation</h2>
              <p className="text-gray-600 mb-4">
                La permission est accordée de télécharger temporairement une copie des matériaux (informations ou logiciels) sur le site de Hamroun Meuble & Electro 
                pour usage personnel, non commercial uniquement. C'est la seule base de cette licence et cette licence sera automatiquement révoquée si vous violez l'une de ces restrictions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Limitation de Responsabilité</h2>
              <p className="text-gray-600 mb-4">
                Les matériaux sur le site de Hamroun Meuble & Electro sont fournis "tels quels". Hamroun Meuble & Electro ne donne aucune garantie, expresse ou implicite, 
                et décline par la présente et annule toutes les autres garanties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Limitations Légales</h2>
              <p className="text-gray-600 mb-4">
                En vertu d'aucune circonstance, Hamroun Meuble & Electro ou ses fournisseurs ne seront responsables de tout dommage (y compris, sans limitation, les dommages 
                pour perte de données ou profit, ou en raison d'une interruption d'activité) découlant de l'utilisation ou de l'incapacité à utiliser les matériaux sur le site 
                de Hamroun Meuble & Electro, même si Hamroun Meuble & Electro ou un représentant autorisé de Hamroun Meuble & Electro a été informé de la possibilité de tels dommages.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Exactitude des Matériaux</h2>
              <p className="text-gray-600">
                Les matériaux apparaissant sur le site de Hamroun Meuble & Electro pourraient inclure des erreurs techniques, typographiques ou photographiques. 
                Hamroun Meuble & Electro ne garantit pas que les matériaux de son site web sont exacts, complets ou actuels.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Matériaux sur le Site</h2>
              <p className="text-gray-600 mb-4">
                Hamroun Meuble & Electro n'a pas examiné tous les sites liés à son site web et n'est pas responsable du contenu d'aucun de ces sites liés. 
                L'inclusion de tout lien n'implique pas l'approbation du site par Hamroun Meuble & Electro. L'utilisation de ces sites liés se fait aux risques de l'utilisateur.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Modifications des Conditions</h2>
              <p className="text-gray-600">
                Hamroun Meuble & Electro peut réviser ces conditions d'utilisation de son site web à tout moment sans préavis. 
                En utilisant ce site web, vous acceptez d'être lié par la version alors actuelle de ces Conditions d'Utilisation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Droit d'Auteur</h2>
              <p className="text-gray-600">
                Tous les contenus du site, y compris le texte, les graphiques, les logos, les images et les logiciels, 
                est la propriété de Hamroun Meuble & Electro ou de ses fournisseurs de contenu et est protégé par les lois internationales sur le droit d'auteur.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Comptes Utilisateurs</h2>
              <p className="text-gray-600 mb-4">
                Si vous créez un compte sur notre site, vous êtes responsable de maintenir la confidentialité de votre mot de passe et de votre compte. 
                Vous acceptez de la responsabilité de toutes les activités qui se produisent sous votre compte. Vous acceptez de nous informer immédiatement 
                de tout utilisation non autorisée de votre compte.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Loi Applicable</h2>
              <p className="text-gray-600">
                Ces Conditions d'Utilisation et tout accord séparé grâce auquel nous vous fournissons des Services sont régis par 
                et construits conformément aux lois de la Tunisie.
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
