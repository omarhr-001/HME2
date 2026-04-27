import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { FileText, Download } from 'lucide-react'

const PRESS_RELEASES = [
  {
    id: 1,
    title: 'Hamroun Meuble & Electro Atteint 50,000 Clients Satisfaits',
    date: 'Janvier 2024',
    excerpt: 'Nous célébrons le franchissement de 50,000 clients satisfaits. Grâce à votre confiance, nous continuons à grandir.',
    downloadUrl: '#'
  },
  {
    id: 2,
    title: 'Nouveau Service d\'Installation Gratuite Lancé',
    date: 'Décembre 2023',
    excerpt: 'Hamroun lance son service d\'installation gratuite pour la plupart des appareils électroménagers à Tunis.',
    downloadUrl: '#'
  },
  {
    id: 3,
    title: 'Expansion du Catalogue Produits: +200 Nouveaux Articles',
    date: 'Novembre 2023',
    excerpt: 'Nous avons ajouté plus de 200 nouveaux articles à notre catalogue pour mieux servir nos clients.',
    downloadUrl: '#'
  },
  {
    id: 4,
    title: 'Hamroun Reçoit l\'Award du Meilleur Service Client',
    date: 'Octobre 2023',
    excerpt: 'Hamroun Meuble & Electro reçoit un prix pour son excellence en matière de service client.',
    downloadUrl: '#'
  },
]

export default function PressPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24">
        {/* Hero */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white px-[5%] py-20">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-4">Presse & Médias</h1>
            <p className="text-xl text-gray-300">Suivez les dernières actualités de Hamroun Meuble & Electro.</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-[5%] py-20">
          <div className="max-w-5xl mx-auto">
            {/* Press Releases */}
            <section className="mb-20">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Derniers Communiqués de Presse</h2>
              <div className="space-y-6">
                {PRESS_RELEASES.map(release => (
                  <div key={release.id} className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition">
                    <div className="flex gap-4 items-start">
                      <FileText className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-2">{release.date}</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{release.title}</h3>
                        <p className="text-gray-600 mb-4">{release.excerpt}</p>
                        <a href={release.downloadUrl} className="inline-flex items-center gap-2 text-green-600 font-bold hover:text-green-700">
                          <Download size={16} />
                          Télécharger le PDF
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Media Kit */}
            <section className="mb-20">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Kit Médias</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-8">
                <p className="text-gray-700 mb-6">
                  Téléchargez notre kit médias contenant les logos, descriptions d'entreprise et images de haute qualité.
                </p>
                <a href="#" className="inline-block bg-green-500 text-white font-bold px-8 py-3 rounded-full hover:bg-green-600 transition">
                  Télécharger le Kit Médias (ZIP)
                </a>
              </div>
            </section>

            {/* Company Info */}
            <section className="mb-20">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">À Propos de Nous</h2>
              <div className="bg-white p-8 rounded-lg space-y-4">
                <p className="text-gray-700">
                  <strong>Hamroun Meuble & Electro</strong> est le leader du marché en fourniture d'équipements électroménagers de qualité supérieure en Tunisie. 
                  Fondée en 2005, l'entreprise a servi plus de 50,000 clients satisfaits avec un engagement envers la qualité et le service client exceptionnel.
                </p>
                <div className="grid grid-cols-2 gap-6 mt-6">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Siège Social</h4>
                    <p className="text-gray-600 text-sm">Tunis, Tunisie</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Année de Fondation</h4>
                    <p className="text-gray-600 text-sm">2005</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Clients Satisfaits</h4>
                    <p className="text-gray-600 text-sm">50,000+</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Produits Disponibles</h4>
                    <p className="text-gray-600 text-sm">500+</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact for Media */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Contact Médias</h2>
              <div className="bg-white p-8 rounded-lg border border-gray-200">
                <p className="text-gray-700 mb-6">
                  Pour toute demande de renseignements, d'interview ou de couverture médiatique, veuillez contacter:
                </p>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Responsable Presse</h4>
                    <p className="text-gray-600">Directeur Marketing</p>
                    <p className="text-gray-600 font-medium">press@hamroun.tn</p>
                    <p className="text-gray-600">+216 98 123 456</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
