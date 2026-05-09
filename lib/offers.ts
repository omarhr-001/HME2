export interface Offer {
    id: string
    title: string
    description: string
    discount: number
    image?: string
    expiresAt: string
}

// Mock offers data - can be replaced with database calls
export const offers: Offer[] = [
    {
        id: '1',
        title: 'Réfrigérateurs',
        description: 'Samsung, LG, Bosch',
        discount: 30,
        expiresAt: '31 Mai 2026'
    },
    {
        id: '2',
        title: 'Machines à laver',
        description: 'Toutes marques',
        discount: 25,
        expiresAt: '31 Mai 2026'
    },
    {
        id: '3',
        title: 'Climatiseurs',
        description: 'Offre été 2026',
        discount: 40,
        expiresAt: '31 Mai 2026'
    },
    {
        id: '4',
        title: 'Fours électriques',
        description: 'Siemens, Electrolux',
        discount: 20,
        expiresAt: '31 Mai 2026'
    },
    {
        id: '5',
        title: 'Lave-vaisselle',
        description: 'Tous les modèles',
        discount: 35,
        expiresAt: '31 Mai 2026'
    }
]

export function getTopOffers(limit: number = 3): Offer[] {
    // Sort by discount descending and return top offers
    return [...offers]
        .sort((a, b) => b.discount - a.discount)
        .slice(0, limit)
}

export function getAllOffers(): Offer[] {
    return offers
}
