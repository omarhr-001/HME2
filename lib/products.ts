export interface Product {
  id: string
  name: string
  category: string
  price: number
  originalPrice: number
  image: string
  rating: number
  reviews: number
  description: string
  specs: Record<string, string>
  inStock: boolean
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Réfrigérateur Double Porte Premium',
    category: 'Réfrigérateurs',
    price: 899.99,
    originalPrice: 1199.99,
    image: '/products/refrigerator-1.jpg',
    rating: 4.8,
    reviews: 156,
    description: 'Réfrigérateur haute performance avec technologie de refroidissement avancée, grande capacité et design élégant.',
    specs: {
      'Capacité': '650L',
      'Consommation énergétique': 'A+++',
      'Dimensions': '910x1700x700mm',
      'Garantie': '5 ans',
      'Fonctionnalités': 'No Frost, Congélateur inverser, Ice Maker'
    },
    inStock: true
  },
  {
    id: '2',
    name: 'Lave-linge Frontal 8kg',
    category: 'Lave-linge',
    price: 599.99,
    originalPrice: 799.99,
    image: '/products/washing-machine-1.jpg',
    rating: 4.7,
    reviews: 203,
    description: 'Lave-linge frontal moderne avec programmes variés et efficacité énergétique maximale.',
    specs: {
      'Capacité': '8kg',
      'Classe énergétique': 'A+++',
      'Vitesse d\'essorage': '1400 tours/min',
      'Dimensions': '600x850x550mm',
      'Programmes': '15 programmes',
      'Garantie': '3 ans'
    },
    inStock: true
  },
  {
    id: '3',
    name: 'Cuisinière Électrique 4 Foyers',
    category: 'Cuisinières',
    price: 449.99,
    originalPrice: 599.99,
    image: '/products/cooking-range-1.jpg',
    rating: 4.6,
    reviews: 142,
    description: 'Cuisinière électrique performante avec four spacieux et foyers puissants pour une cuisson optimale.',
    specs: {
      'Foyers': '4 foyers électriques',
      'Capacité du four': '60L',
      'Température max': '260°C',
      'Dimensions': '600x900x600mm',
      'Poids': '65kg',
      'Garantie': '2 ans'
    },
    inStock: true
  },
  {
    id: '4',
    name: 'Climatiseur Split 2 Tonnes',
    category: 'Climatisation',
    price: 799.99,
    originalPrice: 1099.99,
    image: '/products/air-conditioner-1.jpg',
    rating: 4.9,
    reviews: 187,
    description: 'Climatiseur split ultra-silencieux avec technologie inverter pour un confort optimal et économies d\'énergie.',
    specs: {
      'Puissance': '2 tonnes',
      'Classe énergétique': 'A+++',
      'Bruit': '22dB',
      'Débit d\'air': '550m³/h',
      'Technologie': 'Inverter',
      'Garantie': '5 ans'
    },
    inStock: true
  },
  {
    id: '5',
    name: 'Micro-ondes Gril 30L',
    category: 'Micro-ondes',
    price: 299.99,
    originalPrice: 399.99,
    image: '/products/microwave-1.jpg',
    rating: 4.5,
    reviews: 98,
    description: 'Micro-ondes moderne avec fonction gril pour une cuisson polyvalente et rapide.',
    specs: {
      'Capacité': '30L',
      'Puissance': '1000W',
      'Fonction gril': 'Oui',
      'Dimensions': '510x300x410mm',
      'Contrôle': 'Digital',
      'Garantie': '2 ans'
    },
    inStock: true
  },
  {
    id: '6',
    name: 'Lave-vaisselle 12 Couverts',
    category: 'Lave-vaisselle',
    price: 449.99,
    originalPrice: 649.99,
    image: '/products/dishwasher-1.jpg',
    rating: 4.7,
    reviews: 126,
    description: 'Lave-vaisselle efficace avec programme écologique et classe énergétique A+++.',
    specs: {
      'Couverts': '12 couverts',
      'Classe énergétique': 'A+++',
      'Consommation d\'eau': '84L par cycle',
      'Dimensions': '600x850x600mm',
      'Programmes': '8 programmes',
      'Garantie': '3 ans'
    },
    inStock: true
  },
  {
    id: '7',
    name: 'Chauffe-eau Électrique 50L',
    category: 'Chauffe-eau',
    price: 299.99,
    originalPrice: 399.99,
    image: '/products/water-heater-1.jpg',
    rating: 4.4,
    reviews: 87,
    description: 'Chauffe-eau performant avec thermostat et sécurité optimale pour votre confort.',
    specs: {
      'Capacité': '50L',
      'Puissance': '2000W',
      'Température max': '75°C',
      'Temps de chauffe': '1.5 heures',
      'Classe énergétique': 'C',
      'Garantie': '2 ans'
    },
    inStock: true
  },
  {
    id: '8',
    name: 'Réfrigérateur Side-by-Side Premium',
    category: 'Réfrigérateurs',
    price: 1299.99,
    originalPrice: 1699.99,
    image: '/products/refrigerator-2.jpg',
    rating: 4.9,
    reviews: 234,
    description: 'Réfrigérateur haut de gamme avec ice maker intégré et technologie smart.',
    specs: {
      'Capacité': '800L',
      'Consommation énergétique': 'A+++',
      'Dimensions': '910x1900x700mm',
      'Ice Maker': 'Automatique',
      'Technologie': 'Smart Control',
      'Garantie': '7 ans'
    },
    inStock: true
  },
  {
    id: '9',
    name: 'Lave-linge Top 7kg',
    category: 'Lave-linge',
    price: 499.99,
    originalPrice: 699.99,
    image: '/products/washing-machine-2.jpg',
    rating: 4.6,
    reviews: 165,
    description: 'Lave-linge chargement par le haut compact et performant pour petits espaces.',
    specs: {
      'Capacité': '7kg',
      'Classe énergétique': 'A++',
      'Vitesse d\'essorage': '1200 tours/min',
      'Dimensions': '660x900x600mm',
      'Programmes': '12 programmes',
      'Garantie': '2 ans'
    },
    inStock: true
  },
  {
    id: '10',
    name: 'Cuisinière Gaz 6 Foyers',
    category: 'Cuisinières',
    price: 699.99,
    originalPrice: 899.99,
    image: '/products/cooking-range-2.jpg',
    rating: 4.8,
    reviews: 189,
    description: 'Cuisinière gaz professionnelle avec puissance exceptionnelle et contrôle précis.',
    specs: {
      'Foyers': '6 foyers gaz',
      'Capacité du four': '80L',
      'Allumage': 'Électrique',
      'Dimensions': '900x900x600mm',
      'Poids': '95kg',
      'Garantie': '3 ans'
    },
    inStock: true
  },
  {
    id: '11',
    name: 'Climatiseur Fenêtre 1.5T',
    category: 'Climatisation',
    price: 549.99,
    originalPrice: 699.99,
    image: '/products/air-conditioner-2.jpg',
    rating: 4.5,
    reviews: 142,
    description: 'Climatiseur de fenêtre compact et facile à installer pour petit à moyen espace.',
    specs: {
      'Puissance': '1.5 tonnes',
      'Classe énergétique': 'A++',
      'Bruit': '25dB',
      'Dimensions': '600x450x300mm',
      'Installation': 'Fenêtre',
      'Garantie': '3 ans'
    },
    inStock: true
  },
  {
    id: '12',
    name: 'Micro-ondes Classique 20L',
    category: 'Micro-ondes',
    price: 199.99,
    originalPrice: 299.99,
    image: '/products/microwave-2.jpg',
    rating: 4.3,
    reviews: 76,
    description: 'Micro-ondes compact et fiable pour usage quotidien avec contrôles intuitifs.',
    specs: {
      'Capacité': '20L',
      'Puissance': '700W',
      'Fonction gril': 'Non',
      'Dimensions': '450x260x380mm',
      'Contrôle': 'Mécanique',
      'Garantie': '1 an'
    },
    inStock: true
  },
  {
    id: '13',
    name: 'Sèche-linge Frontal 8kg',
    category: 'Sèche-linge',
    price: 599.99,
    originalPrice: 799.99,
    image: '/products/dryer-1.jpg',
    rating: 4.7,
    reviews: 131,
    description: 'Sèche-linge efficace avec pompe à chaleur et technologie intelligente de détection d\'humidité.',
    specs: {
      'Capacité': '8kg',
      'Classe énergétique': 'A+++',
      'Technologie': 'Pompe à chaleur',
      'Dimensions': '600x850x600mm',
      'Programmes': '16 programmes',
      'Garantie': '5 ans'
    },
    inStock: true
  },
  {
    id: '14',
    name: 'Four Encastrable Multifonction',
    category: 'Fours',
    price: 799.99,
    originalPrice: 1099.99,
    image: '/products/oven-1.jpg',
    rating: 4.8,
    reviews: 167,
    description: 'Four encastrable multifonction avec technologie convection et nettoyage automatique.',
    specs: {
      'Capacité': '65L',
      'Température max': '300°C',
      'Fonctions': '10+ fonctions',
      'Dimensions': '600x600x580mm',
      'Nettoyage': 'Vapeur automatique',
      'Garantie': '5 ans'
    },
    inStock: true
  },
  {
    id: '15',
    name: 'Congélateur Armoire 350L',
    category: 'Congélateurs',
    price: 349.99,
    originalPrice: 499.99,
    image: '/products/freezer-1.jpg',
    rating: 4.6,
    reviews: 108,
    description: 'Congélateur spacieux avec technologie de conservation optimale et compartiments organisés.',
    specs: {
      'Capacité': '350L',
      'Classe énergétique': 'A++',
      'Température min': '-24°C',
      'Dimensions': '700x1700x700mm',
      'Panier mobile': 'Oui',
      'Garantie': '3 ans'
    },
    inStock: true
  }
]

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id)
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter(p => p.category === category)
}

export function getAllCategories(): string[] {
  return Array.from(new Set(products.map(p => p.category)))
}
