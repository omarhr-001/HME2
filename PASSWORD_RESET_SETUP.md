# Configuration du Flux de Réinitialisation de Mot de Passe

## Vue d'ensemble

Le flux de réinitialisation de mot de passe fonctionne en 3 étapes :

1. **Page "Mot de passe oublié"** (`/auth/forgot-password`) - L'utilisateur entre son email
2. **Email de réinitialisation** - Supabase envoie un email avec un lien
3. **Page "Réinitialiser le mot de passe"** (`/auth/reset-password`) - L'utilisateur crée un nouveau mot de passe

## Configuration Supabase

### 1. Email Configuration

#### Via le Dashboard Supabase :
1. Accédez à **Authentication** > **Email Templates**
2. Trouvez le template **Reset password** (Réinitialiser le mot de passe)
3. Assurez-vous que le template inclut un lien vers `{{ .SiteURL }}/auth/reset-password`

#### Template d'email recommandé :
```
Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :

{{ .ConfirmationURL }}

Ce lien expire dans 1 heure.
```

### 2. Paramètres d'authentification

Dans votre projet Supabase Dashboard, allez à **Authentication** > **Providers** > **Email** :

- **Autoconfirm email** : Désactivé (les utilisateurs doivent confirmer leur email)
- **Secure email change** : Activé
- **SMTP Configuration** : Configurez votre propre SMTP ou utilisez le service de Supabase

### 3. URL de redirection

Dans **Authentication** > **URL Configuration** :

Ajoutez les URLs de redirection suivantes :

```
http://localhost:3000/auth/reset-password
https://yourdomain.com/auth/reset-password
```

Remplacez `yourdomain.com` par votre domaine de production.

## Variables d'environnement

Les variables d'environnement suivantes sont déjà configurées :

```
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role
```

## Fichiers créés

### 1. `/app/(account)/auth/forgot-password/page.tsx`
- Page pour demander un lien de réinitialisation
- Valide le format de l'email
- Envoie le lien via Supabase
- Affiche les messages de succès/erreur

### 2. `/app/(account)/auth/reset-password/page.tsx`
- Page pour entrer le nouveau mot de passe
- Valide que le mot de passe a au moins 8 caractères
- Valide que les deux mots de passe correspondent
- Met à jour le mot de passe via Supabase
- Redirige vers login après succès

### 3. Fonctions d'authentification (`/lib/auth.ts`)
- `resetPasswordForEmail(email)` : Envoie un lien de réinitialisation
- `updatePassword(newPassword)` : Met à jour le mot de passe

## Flux utilisateur

### Utilisateur oublie son mot de passe :

1. Clique sur "Oublié?" sur la page de login
2. Est redirigé vers `/auth/forgot-password`
3. Entre son email et clique sur "Envoyer le lien"
4. Reçoit un email avec un lien de réinitialisation
5. Clique sur le lien dans l'email
6. Est redirigé vers `/auth/reset-password`
7. Entre son nouveau mot de passe (min 8 caractères)
8. Confirme le mot de passe
9. Clique sur "Réinitialiser le mot de passe"
10. Reçoit un message de succès
11. Est automatiquement redirigé vers `/auth/login` après 2 secondes

## Validation

### Email
- Format d'email valide (regex)
- Le champ ne peut pas être vide

### Mot de passe
- Minimum 8 caractères
- Confirmation du mot de passe doit correspondre
- Validation côté client avant l'envoi

## Sécurité

- Les mots de passe sont hachés par Supabase
- Les liens de réinitialisation expirent après 1 heure
- Une seule session active par utilisateur (Supabase Auth gère cela)
- Validation côté serveur via Supabase
- HTTPS recommandé en production

## Messages d'erreur

L'application gère les erreurs suivantes :

- Email invalide
- Aucun utilisateur trouvé avec cet email
- Lien de réinitialisation expiré
- Mots de passe qui ne correspondent pas
- Mot de passe trop court
- Erreurs réseau

## Personnalisation

### Durée d'expiration du lien

Pour modifier la durée de validité du lien (par défaut 1 heure), allez à :
**Supabase Dashboard** > **Authentication** > **Policies**

### Textes et messages

Tous les textes sont localisés en français. Pour changer la langue :
1. Modifiez les chaînes dans `/auth/forgot-password/page.tsx`
2. Modifiez les chaînes dans `/auth/reset-password/page.tsx`

### Styles

Les pages utilisent Tailwind CSS. Les couleurs principales sont :
- Forgot Password : Bleu (`from-blue-500`)
- Reset Password : Violet (`from-purple-500`)

Pour personnaliser, modifiez les classes Tailwind dans les fichiers des pages.

## Test en développement

1. Démarrez votre app en développement : `npm run dev`
2. Allez à `http://localhost:3000/auth/login`
3. Cliquez sur "Oublié?"
4. Entrez votre email
5. Vérifiez votre email (ou la console Supabase pour les tests)
6. Cliquez sur le lien
7. Entrez votre nouveau mot de passe

## Déploiement sur Vercel

1. Déployez votre app sur Vercel
2. Dans les variables d'environnement Vercel, assurez-vous que les variables Supabase sont définies
3. Dans le Dashboard Supabase, ajoutez votre URL de production à **URL Configuration** > **Redirect URLs**

Exemple : `https://monapp.vercel.app/auth/reset-password`

## Dépannage

### Le lien de réinitialisation n'arrive pas
- Vérifiez que SMTP est configuré dans Supabase
- Vérifiez les logs d'email Supabase
- Vérifiez le dossier des spams

### Le lien expires immédiatement
- Vérifiez que l'URL de redirection est correctement configurée
- Vérifiez le fuseau horaire du serveur

### Erreur "Session expired"
- Le lien de réinitialisation a expiré
- L'utilisateur doit recommencer à partir de la page "Mot de passe oublié"
