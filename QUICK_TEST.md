# Étapes de Test - Authentification & Sécurité

## État Actuel
- ✅ API routes sécurisées avec authentification JWT
- ✅ Middleware d'authentification en place
- ✅ Tokens JWT envoyés par les hooks client
- ⏳ Tests de sécurité en cours

## Test 1: Vérifier que l'authentification fonctionne

### 1. Login avec un compte
```
1. Aller sur https://hme2-zeta.vercel.app/auth/login
2. Se connecter avec vos identifiants
3. Vous devriez être redirigé vers la page d'accueil
```

### 2. Vérifier les tokens dans DevTools
```
1. Ouvrir DevTools (F12)
2. Aller à Console
3. Exécuter:
   const {data} = await supabase.auth.getSession()
   console.log(data.session.access_token)
4. Vous devriez voir un token JWT long
```

## Test 2: Tester l'API du panier

### Via le formulaire (le plus simple)
```
1. Rester connecté
2. Aller à /session-demo
3. Cliquer sur "Add Demo Product to Cart"
4. Vérifier dans DevTools → Network → cart (GET)
   - Status devrait être 200
   - Response devrait montrer les articles du panier
```

### Via curl (pour tester manuellement)
```bash
# 1. D'abord, récupérer le token
TOKEN=$(curl -s -X POST https://hme2-zeta.vercel.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"votre@email.com","password":"motdepasse"}' | jq -r '.session.access_token')

# 2. Tester l'API du panier
curl -X GET https://hme2-zeta.vercel.app/api/cart \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# 3. Vous devriez voir votre panier
```

## Test 3: Vérifier l'isolation des utilisateurs

### Créer 2 comptes de test
```
Compte A: test-a@example.com / password123
Compte B: test-b@example.com / password123
```

### Test d'isolation
```
1. Se connecter avec Compte A
2. Ajouter des articles au panier via /session-demo
3. Vérifier le panier dans DevTools (Network → /api/cart)
   Vous devriez voir les articles de Compte A

4. Ouvrir un nouvel onglet (Ctrl+Shift+N = mode privé)
5. Se connecter avec Compte B
6. Aller à /session-demo
7. Le panier devrait être VIDE (pas les articles de A)

8. Ajouter des articles avec Compte B
9. Revenir au premier onglet (Compte A)
10. Rafraîchir la page
11. Vous devriez voir les articles de Compte A (pas ceux de B)
```

## Erreurs Courantes

### 401 Unauthorized
- **Problème**: Token JWT non envoyé
- **Solution**: Vérifier que vous êtes connecté, ouvrir Console et vérifier le token

### 403 Forbidden
- **Problème**: Vous essayez d'accéder aux données d'un autre utilisateur
- **Solution**: C'est normal! Le système fonctionne correctement

### 500 Internal Server Error
- **Problème**: Erreur côté serveur
- **Solution**: Vérifier les logs dans Vercel Dashboard

## État de l'Application

| Fonctionnalité | Statut | Notes |
|---|---|---|
| Login/Signup | ✅ Fonctionne | JWT généré |
| Cart API | ✅ Sécurisée | Nécessite JWT |
| Orders API | ✅ Sécurisée | Nécessite JWT |
| Isolation utilisateur | ✅ Code prêt | Fonctionne sans RLS |
| RLS en BD | ⏳ Optionnel | Ajoute une couche supplémentaire |

## Prochaines Étapes

### Optionnel: Ajouter RLS en Supabase (sécurité double-layer)
Si les tests passent sans RLS:
1. Ouvrir Supabase Dashboard
2. Aller à SQL Editor
3. Exécuter les policies de `RLS_SETUP.md`
4. Tester à nouveau

### Sinon: L'app est déjà sécurisée!
Les API nécessitent un JWT valide et vérifient la propriété côté serveur.
