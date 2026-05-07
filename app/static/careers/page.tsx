import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Users, Briefcase, Heart } from 'lucide-react'

const JOBS = [
  {
    id: 1,
    title: 'Vendeur en Électroménager',
    department: 'Ventes',
    location: 'Tunis',
    type: 'CDI',
    salary: '1200 - 1500 DT'
  },
  {
    id: 2,
    title: 'Responsable Logistique',
    department: 'Opérations',
    location: 'Tunis',
    type: 'CDI',
    salary: '1800 - 2200 DT'
  },
  {
    id: 3,
    title: 'Technicien Service Après-Vente',
    department: 'Support',
    location: 'Tunis & Régions',
    type: 'CDI',
    salary: '1400 - 1700 DT'
  },
  {
    id: 4,
    title: 'Responsable Marketing Digital',
    department: 'Marketing',
    location: 'Tunis',
    type: 'CDI',
    salary: '1600 - 2000 DT'
  },
]

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24">
        {/* Hero */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white px-[5%] py-20">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-4">Rejoignez Notre Équipe</h1>
            <p className="text-xl text-gray-300">Nous recherchons des talents pour nous aider à servir nos clients.</p>
          </div>
        </div>

        {/* Why Join */}
        <div className="px-[5%] py-20">
          <div className="max-w-5xl mx-auto mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Pourquoi Nous Rejoindre?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <h3 className="font-bold text-lg mb-2">Équipe Dynamique</h3>
                <p className="text-gray-600">Travaillez avec des professionnels passionnés par le service client et l'excellence.</p>
              </div>
              <div className="bg-white p-8 rounded-lg text-center">
                <Briefcase className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <h3 className="font-bold text-lg mb-2">Opportunités de Carrière</h3>
                <p className="text-gray-600">Développez vos compétences et progressez au sein d'une entreprise en croissance.</p>
              </div>
              <div className="bg-white p-8 rounded-lg text-center">
                <Heart className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <h3 className="font-bold text-lg mb-2">Culture de Respect</h3>
                <p className="text-gray-600">Un environnement de travail inclusif et respectueux pour tous.</p>
              </div>
            </div>
          </div>

          {/* Open Positions */}
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Postes Disponibles</h2>
            <div className="space-y-4">
              {JOBS.map(job => (
                <div key={job.id} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                      <p className="text-gray-600">{job.department}</p>
                    </div>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">{job.type}</span>
                  </div>
                  <div className="flex flex-wrap gap-6 mb-4 text-gray-600">
                    <div>
                      <p className="text-sm text-gray-500">Localisation</p>
                      <p className="font-medium">{job.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Salaire</p>
                      <p className="font-medium">{job.salary}</p>
                    </div>
                  </div>
                  <a href="#" className="text-green-600 font-bold hover:text-green-700">
                    Postuler maintenant →
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-gray-100 px-[5%] py-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Avantages et Bénéfices</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                'Salaire compétitif et augmentations régulières',
                'Couverture sociale et assurance santé',
                'Formation et développement professionnel',
                'Horaires flexibles et télétravail possible',
                'Primes de performance et bonus annuels',
                'Congés payés et jours fériés',
              ].map((benefit, i) => (
                <div key={i} className="flex gap-3 items-start bg-white p-4 rounded-lg">
                  <span className="text-green-500 font-bold text-xl mt-1">✓</span>
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-green-500 text-white px-[5%] py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Vous n'avez pas trouvé le poste?</h2>
            <p className="text-lg mb-8 opacity-90">Envoyez-nous votre CV pour être considéré pour les futures opportunités.</p>
            <a href="mailto:careers@hamroun.tn" className="inline-block bg-white text-green-600 font-bold px-8 py-3 rounded-full hover:bg-gray-100 transition">
              Envoyer Mon CV
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
