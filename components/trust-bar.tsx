import { Truck, Shield, Clock, HeadphonesIcon } from 'lucide-react'

export function TrustBar() {
  const items = [
    {
      icon: <Truck size={20} />,
      title: 'Livraison gratuite',
      desc: 'Hammamet ou commandes > 500DT'
    },
    {
      icon: <Shield size={20} />,
      title: 'Paiement sécurisé',
      desc: 'Protection garantie'
    },
    {
      icon: <Clock size={20} />,
      title: 'Livraison rapide',
      desc: 'Depuis Hammamet'
    },
    {
      icon: <HeadphonesIcon size={20} />,
      title: 'Support 24/7',
      desc: 'Toujours à votre service'
    }
  ]

  return (
    <section className="bg-white px-4 md:px-[5%] py-4 md:py-6 border-b border-gray-200 shadow-sm">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-3.5 p-2">
            <div className="w-10 h-10 md:w-11 md:h-11 bg-green-100 rounded-3xl flex items-center justify-center text-green-600 flex-shrink-0">
              {item.icon}
            </div>
            <div className="text-center md:text-left">
              <h4 className="text-xs md:text-sm font-semibold text-gray-800 mb-0.5">{item.title}</h4>
              <p className="text-xs text-gray-500 line-clamp-1">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
