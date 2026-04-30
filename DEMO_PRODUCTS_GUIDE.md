# Guide des Produits Démo

## Qu'est-ce qui a changé?

L'application affiche maintenant automatiquement **12 produits de démonstration** si la base de données Supabase est vide ou non configurée.

## Produits Disponibles

Les produits de démonstration incluent:

1. **Ordinateur Portable Pro** - 1,299 DT (Informatique)
2. **Smartphone Premium** - 899 DT (Électronique)
3. **Casque Bluetooth Sans Fil** - 199 DT (Audio)
4. **Montre Intelligente** - 349 DT (Wearables)
5. **Appareil Photo Mirrorless** - 1,599 DT (Photo)
6. **Clavier Mécanique RGB** - 159 DT (Informatique)
7. **Souris Gamer Haute Précision** - 79 DT (Informatique)
8. **Écran 4K UltraWide** - 599 DT (Informatique)
9. **Batterie Externe 30000mAh** - 49 DT (Accessoires)
10. **Support de Téléphone Voiture** - 29 DT (Accessoires)
11. **Câble USB-C Premium** - 19 DT (Câbles)
12. **Routeur WiFi 6** - 129 DT (Réseau)

## Comment Ça Fonctionne?

### Sans Supabase
- L'application affiche les produits de démonstration
- Le panier fonctionne normalement (stocké dans localStorage)
- Le checkout fonctionne aussi
- Aucune donnée persistante en base de données

### Avec Supabase Configuré
- L'application essaie de charger les produits de Supabase
- Si Supabase est vide, les produits de démonstration s'affichent
- Les produits de Supabase ont priorité s'ils existent

## Ajouter Vos Propres Produits

### Option 1: Via l'API de Seed

```bash
# Seed les produits de démo dans Supabase
curl -X POST http://localhost:3000/api/seed/products
```

Réponse:
```json
{
  "success": true,
  "message": "Successfully seeded 12 products",
  "productsCount": 12
}
```

### Option 2: Ajouter Manuellement dans Supabase

1. Allez dans votre console Supabase
2. Allez à la table `products`
3. Insérez les colonnes requises:
   - `name` (text)
   - `category` (text)
   - `price` (number)
   - `original_price` (number)
   - `image_url` (text)
   - `rating` (number)
   - `reviews_count` (number)
   - `description` (text)
   - `in_stock` (boolean)
   - `specs` (jsonb)

4. Ajoutez vos produits
5. Les produits s'afficheront automatiquement

### Option 3: Utiliser l'API REST

Créez un endpoint POST pour ajouter des produits:

```typescript
const product = {
  name: 'Mon Produit',
  category: 'Électronique',
  price: 499,
  original_price: 599,
  image_url: 'https://...',
  rating: 4.5,
  reviews_count: 42,
  description: 'Description du produit',
  in_stock: true,
  specs: {}
}

await supabase.from('products').insert([product])
```

## Tester Localement

1. Démarrez le serveur dev:
```bash
npm run dev
```

2. Allez sur `http://localhost:3000/products`

3. Vous verrez les 12 produits de démo

4. Testez:
   - Ajouter au panier ✓
   - Filtrer par catégorie ✓
   - Rechercher par nom ✓
   - Trier par prix ✓
   - Voir les détails du produit ✓

## Migration vers la Production

### Étape 1: Configurer Supabase
```
NEXT_PUBLIC_SUPABASE_URL=votre_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service
```

### Étape 2: Créer la Table
Exécutez le SQL dans Supabase:
```sql
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  image_url TEXT,
  rating DECIMAL(3, 1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  description TEXT,
  in_stock BOOLEAN DEFAULT TRUE,
  specs JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Étape 3: Remplir les Données
Option A - Importer les produits de démo:
```bash
curl -X POST https://votre-app.vercel.app/api/seed/products
```

Option B - Importer vos propres produits

### Étape 4: Déployer
```bash
git push
```

Vercel déploiera automatiquement la nouvelle version avec votre Supabase.

## Dépannage

**Les produits de démonstration ne s'affichent pas?**
- Vérifiez que `lib/demo-products.ts` existe
- Redémarrez le serveur dev

**Supabase est vide mais les produits démo ne s'affichent pas?**
- Vérifiez les logs de la console
- Assurez-vous que Supabase est configuré correctement

**Les produits Supabase ne s'affichent pas?**
- Vérifiez que la table `products` existe
- Vérifiez les permissions RLS
- Testez l'API: `GET /api/seed/products`

## Fichiers Clés

- `/lib/demo-products.ts` - Données de produits démo
- `/lib/products.ts` - Logique de chargement des produits
- `/app/api/seed/products/route.ts` - Endpoint pour remplir Supabase
- `/app/products/page.tsx` - Page d'affichage des produits
