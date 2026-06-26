# Guide d'importation des produits par CSV

## 📋 Structure du fichier CSV

Le système accepte les fichiers **CSV** et **XLSX** (Excel). Voici les colonnes supportées :

## ✅ Champs obligatoires

| Colonne | Aliases supportés | Format | Description |
|---------|------------------|--------|-------------|
| **nom_produit** | product, product_name, titre, nom | Texte | Nom du produit (requis) |
| **prix** | price | Nombre | Prix de vente du produit (requis) |

## 📝 Champs optionnels

| Colonne | Aliases supportés | Format | Description |
|---------|------------------|--------|-------------|
| **description** | description | Texte | Description complète du produit |
| **prix_original** | original_price, old_price, prix_original | Nombre | Prix avant réduction (pour afficher la réduction) |
| **cout** | cost, cout | Nombre | Coût d'achat du produit |
| **quantite_stock** | stock, quantity, stock_quantity, quantite | Nombre entier | Quantité en stock (défaut: 0) |
| **categorie** | category, categorie, category_name | Texte | Nom de la catégorie |
| **marque** | brand, marque | Texte | Marque du produit |
| **tags** | tags, tag, etiquettes | Texte | Étiquettes séparées par des virgules (ex: "confort, moderne, gris") |
| **sku** | sku, reference | Texte | Code unique du produit (doit être unique dans le système) |
| **photo** | image, image_url, image_url | URL | URL de l'image principale du produit |
| **actif** | active, is_active | Booléen | Produit actif (true/false) |
| **en_stock** | in_stock | Booléen | Produit en stock (true/false) |

## 🏠 Catégories spéciales de meubles

Pour les meubles, vous pouvez utiliser des colonnes spéciales qui seront automatiquement converties en catégories :

| Colonne | Effet |
|---------|--------|
| **meubles_salons** ou **salon** | Assigne automatiquement la catégorie "Meubles/Salons" |
| **meubles_chambres** ou **chambre** | Assigne automatiquement la catégorie "Meubles/Chambres" |

## ✅ Valeurs booléennes acceptées

Pour les colonnes booléennes (actif, en_stock), les valeurs suivantes sont reconnues :

**Pour TRUE :** true, yes, oui, 1, active, actif  
**Pour FALSE :** false, no, non, 0, inactive, inactif

## 🚀 Règles de traitement automatique

1. **Création de catégories** : Si une catégorie n'existe pas, elle sera créée automatiquement
2. **Génération SKU** : Si aucun SKU n'est fourni, le système génère automatiquement un code unique
3. **État du stock** : Le champ `en_stock` se met à jour automatiquement en fonction de la quantité si non spécifié
4. **Réduction** : Si `prix_original` > `prix`, une réduction s'affichera sur le site
5. **Images** : L'image fournie devient l'image principale du produit

## 📌 Aliases des colonnes (flexibilité)

Le système normalise automatiquement les en-têtes de colonnes. Vous pouvez utiliser :

- **Français ou Anglais** : "nom_produit" ou "product_name" ou "product"
- **Variations** : "categorie", "category", "category_name"
- **Accents** : Les accents sont automatiquement ignorés
- **Casse** : Majuscules/minuscules n'importent pas
- **Espaces** : Les espaces sont convertis en underscores

## 📊 Exemple de CSV

```csv
nom_produit,description,prix,prix_original,cout,quantite_stock,categorie,marque,tags,sku,photo,actif,en_stock
Canapé Moderne Gris,Confortable canapé moderne en tissu gris,2500.00,2999.00,1500.00,15,Meubles/Salons,Meubles Élégants,"confort, moderne, gris",CAN-MOD-01,https://example.com/images/canape.jpg,true,true
Table Basse Scandinave,Table basse en bois style scandinave,899.99,1199.99,450.00,8,Meubles/Salons,Design Nordique,"table, salon, bois",TAB-BAS-01,https://example.com/images/table.jpg,true,true
```

## ⚠️ Messages d'erreur possibles

| Erreur | Cause | Solution |
|--------|-------|----------|
| Missing product name | Colonne "nom" vide | Remplissez le nom du produit |
| Missing or invalid price | Prix manquant ou invalide | Entrez un prix valide (nombre) |
| SKU already exists | SKU dupliqué | Utilisez un SKU unique ou laissez vide pour auto-génération |
| Category error | Impossible de créer la catégorie | Vérifiez le nom de la catégorie |

## 💡 Conseils pratiques

1. **Testez d'abord** : Importez quelques produits pour vérifier le format
2. **URLs d'images** : Utilisez des URLs directes vers les images
3. **Séparateurs** : Pour les tags, utilisez des virgules (ex: "tag1, tag2, tag3")
4. **Accents** : Utilisez l'encoding UTF-8 pour les accents
5. **Droits d'accès** : L'import nécessite les droits d'administration

## 🔄 Format des fichiers acceptés

- **CSV** : Format texte délimité par des virgules (extension .csv)
- **XLSX** : Format Excel (extension .xlsx)

Les deux formats sont traités de la même manière et donnent les mêmes résultats.
