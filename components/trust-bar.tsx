import { Truck, Shield, Clock, HeadphonesIcon } from 'lucide-react'

export function TrustBar() {
  const items = [
    {
      icon: <Truck size={20} />,
      title: 'Livraison gratuite',
      desc: 'Pour les commandes > 500DT'
    },
    {
      icon: <Shield size={20} />,
      title: 'Paiement sécurisé',
      desc: 'Protection garantie'
    },
    {
      icon: <Clock size={20} />,
      title: 'Livraison rapide',
      desc: 'En 2-3 jours ouvrables'
    },
    {
      icon: <HeadphonesIcon size={20} />,
      title: 'Support 24/7',
      desc: 'Toujours à votre service'
    }
  ]

  return (
    <section className="bg-white px-[5%] py-6 border-b border-gray-200 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3.5 p-2.5">
            <div className="w-11 h-11 bg-green-100 rounded-3xl flex items-center justify-center text-green-600 flex-shrink-0">
              {item.icon}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-0.5">{item.title}</h4>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
