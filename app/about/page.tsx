import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Award, Users, Zap, TrendingUp } from 'lucide-react'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white px-[5%] py-20">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold mb-4">À Propos de Hamroun Meuble & Electro</h1>
            <p className="text-xl text-gray-300">Nous sommes le leader du marché en fourniture d'équipements électroménagers de qualité supérieure en Tunisie depuis 2005.</p>
          </div>
        </div>

        {/* Our Story Section */}
        <div className="px-[5%] py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-5xl">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Notre Histoire</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Fondée en 2005, Hamroun Meuble & Electro a commencé comme une petite boutique locale avec une vision simple : fournir aux Tunisiens les meilleurs équipements électroménagers à des prix justes.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Au cours des deux décennies, nous avons grandi pour devenir l'un des plus grands fournisseurs d'appareils électroménagers en Tunisie, servant des milliers de clients satisfaits.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Aujourd'hui, nous sommes fiers d'offrir une gamme complète de produits de marques renommées, avec un service client exceptionnel et des prix compétitifs.
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 text-white">
              <img src="/logo.png" alt="Hamroun" className="w-48 h-48 mx-auto" />
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gray-900 text-white px-[5%] py-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center">Nos Chiffres</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-green-500 mb-2">19+</div>
                <p className="text-gray-300">Années d'expérience</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-green-500 mb-2">50K+</div>
                <p className="text-gray-300">Clients satisfaits</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-green-500 mb-2">500+</div>
                <p className="text-gray-300">Produits disponibles</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-green-500 mb-2">24/7</div>
                <p className="text-gray-300">Support client</p>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="px-[5%] py-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Nos Valeurs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-8 rounded-lg text-center hover:shadow-lg transition">
                <Award className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <h3 className="text-xl font-bold mb-2">Qualité</h3>
                <p className="text-gray-600">Nous ne proposons que des produits de marques réputées et testés.</p>
              </div>
              <div className="bg-white p-8 rounded-lg text-center hover:shadow-lg transition">
                <Users className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <h3 className="text-xl font-bold mb-2">Client First</h3>
                <p className="text-gray-600">La satisfaction de nos clients est notre priorité absolue.</p>
              </div>
              <div className="bg-white p-8 rounded-lg text-center hover:shadow-lg transition">
                <Zap className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <h3 className="text-xl font-bold mb-2">Innovation</h3>
                <p className="text-gray-600">Nous adoptons les dernières technologies pour servir nos clients.</p>
              </div>
              <div className="bg-white p-8 rounded-lg text-center hover:shadow-lg transition">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <h3 className="text-xl font-bold mb-2">Croissance</h3>
                <p className="text-gray-600">Nous investissons continuellement pour améliorer nos services.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-gray-100 px-[5%] py-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Notre Équipe</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 h-48" />
                  <div className="p-6 text-center">
                    <h4 className="font-bold text-lg mb-1">Team Member {i}</h4>
                    <p className="text-gray-600 text-sm mb-4">Position</p>
                    <p className="text-gray-600 text-sm">Expert en électroménagers avec plus de 10 ans d'expérience.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-green-500 text-white px-[5%] py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Prêt à équiper votre maison?</h2>
            <p className="text-lg mb-8 opacity-90">Parcourez notre collection complète d'équipements électroménagers de qualité.</p>
            <a href="/products" className="inline-block bg-white text-green-600 font-bold px-8 py-3 rounded-full hover:bg-gray-100 transition">
              Voir les produits
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
