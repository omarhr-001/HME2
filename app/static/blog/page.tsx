import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import Link from 'next/link'
import { Calendar, User } from 'lucide-react'
import Image from 'next/image'

const BLOG_POSTS = [
  {
    id: 1,
    title: 'Comment Choisir le Bon Réfrigérateur pour Votre Maison',
    excerpt: 'Découvrez les critères importants pour sélectionner le réfrigérateur idéal selon votre espace et vos besoins.',
    date: '15 mars 2024',
    author: 'Ahmed Ben Ali',
    image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600',
    category: 'Guides'
  },
  {
    id: 2,
    title: 'Les Avantages des Lave-linge Modernes',
    excerpt: 'Explorez les dernières technologies en matière de lave-linge et leurs avantages pour votre famille.',
    date: '12 mars 2024',
    author: 'Fatima Mansouri',
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02ae2a0e?w=600',
    category: 'Actualités'
  },
  {
    id: 3,
    title: '5 Conseils pour Économiser Énergie avec Vos Appareils',
    excerpt: 'Des astuces pratiques pour réduire votre consommation d\'énergie et vos factures.',
    date: '10 mars 2024',
    author: 'Mohamed Rouissi',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600',
    category: 'Conseils'
  },
  {
    id: 4,
    title: 'Cuisine Moderne: Les Meilleures Cuisinières Électriques',
    excerpt: 'Comparaison des cuisinières modernes et ce qui les rend indispensables dans une cuisine contemporaine.',
    date: '8 mars 2024',
    author: 'Leila Gharbi',
    image: 'https://images.unsplash.com/photo-1585518419759-66ed3b89cd5f?w=600',
    category: 'Produits'
  },
]

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24">
        {/* Hero */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white px-[5%] py-20">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-4">Blog Hamroun</h1>
            <p className="text-xl text-gray-300">Conseils, guides et actualités sur les équipements électroménagers.</p>
          </div>
        </div>

        {/* Blog Posts */}
        <div className="px-[5%] py-20">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {BLOG_POSTS.map(post => (
                <article key={post.id} className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition">
                  <div className="overflow-hidden h-48 relative">
                    <Image 
                      src={post.image} 
                      alt={post.title} 
                      fill
                      className="object-cover hover:scale-105 transition duration-300"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="p-6">
                    <div className="text-green-600 text-sm font-bold mb-2">{post.category}</div>
                    <h3 className="text-xl font-bold mb-3 hover:text-green-600 transition cursor-pointer">{post.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex gap-4 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-200">
                      <div className="flex gap-1 items-center">
                        <Calendar size={16} />
                        {post.date}
                      </div>
                      <div className="flex gap-1 items-center">
                        <User size={16} />
                        {post.author}
                      </div>
                    </div>
                    <Link href={`/blog/${post.id}`} className="text-green-600 font-bold hover:text-green-700">
                      Lire l'article →
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Newsletter */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-12 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Restez Informé</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Inscrivez-vous à notre newsletter pour recevoir les derniers articles, conseils et offres spéciales.
              </p>
              <form className="flex gap-3 max-w-md mx-auto flex-col sm:flex-row">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                />
                <button type="submit" className="btn-primary">
                  S'inscrire
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
