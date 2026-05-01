# Configuration d'Authentification Supabase

## Vue d'ensemble
Ce projet inclut maintenant une authentification complète avec Supabase, permettant aux utilisateurs de s'inscrire, se connecter et gérer leur profil.

## Fonctionnalités implémentées

### 🔐 Authentification
- ✅ Inscription avec email et mot de passe
- ✅ Connexion (login)
- ✅ Déconnexion (logout)
- ✅ Gestion de sessions utilisateur
- ✅ Protection des routes

### 📄 Pages créées
1. **`/auth/signup`** - Formulaire d'inscription
2. **`/auth/login`** - Formulaire de connexion
3. **`/account`** - Page de profil utilisateur (protégée)

### 🔧 Fichiers ajoutés

#### Utilitaires (`lib/`)
- **`auth.ts`** - Fonctions d'authentification (signUp, signIn, signOut, getCurrentUser, resetPassword, updatePassword)
- **`auth-context.tsx`** - Context React pour gérer l'état d'authentification globalement

#### Hooks (`hooks/`)
- **`use-protected-route.ts`** - Hook personnalisé pour protéger les routes nécessitant une authentification

#### Composants mis à jour
- **`components/navbar.tsx`** - Boutons de login/signup/compte + menu utilisateur

---

## Installation et Configuration

### Étape 1 : Configuration Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet ou utilisez un existant
3. Allez dans **Authentication → Providers**
4. Activez **Email** avec les options :
   - ☑️ Confirm email (authentification par email)
   - ☑️ Secure password

### Étape 2 : Obtenir vos clés API

1. Allez dans **Settings → API**
2. Copiez votre **Project URL** (exemple: `https://xxxxx.supabase.co`)
3. Copiez votre **Anon (public) Key** sous "Project API keys"
   - ⚠️ NE JAMAIS partager votre Service Role Key

### Étape 3 : Configuration des variables d'environnement

1. Renommez `.env.local.example` en `.env.local`
2. Remplissez les variables :
```env
NEXT_PUBLIC_iatvymxnfnkctcehqgho_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_iatvymxnfnkctcehqgho_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Étape 4 : Redémarrer le serveur

```bash
npm run dev
```

---

## Utilisation

### Accès aux fonctionnalités d'authentification

#### 1. Dans des composants client
```tsx
'use client'

import { useAuth } from '@/lib/auth-context'

export function MyComponent() {
  const { user, loading, signOut } = useAuth()

  if (loading) return <div>Chargement...</div>
  if (!user) return <div>Non connecté</div>

  return (
    <div>
      Bienvenue {user.email}
      <button onClick={signOut}>Se déconnecter</button>
    </div>
  )
}
```

#### 2. Protéger une route
```tsx
'use client'

import { useProtectedRoute } from '@/hooks/use-protected-route'

export default function MonCompte() {
  const { user, loading } = useProtectedRoute()

  if (loading) return <div>Chargement...</div>
  
  return <div>Contenu protégé - {user?.email}</div>
}
```

#### 3. Fonctions d'authentification autonomes
```tsx
import { signUp, signIn, signOut, resetPassword } from '@/lib/auth'

// Inscription
const result = await signUp('email@test.com', 'password123', 'Jean', 'Dupont')
if (result.success) {
  console.log('Inscription réussie')
}

// Connexion
const loginResult = await signIn('email@test.com', 'password123')
if (loginResult.success) {
  console.log('Connecté')
}
```

---

## Flux utilisateur

### 1. **Inscription**
```
Utilisateur → Page /auth/signup
           → Remplit le formulaire
           → Clic sur "S'inscrire"
           → Email de confirmation envoyé
           → Redirection vers /auth/login (après 3s)
```

### 2. **Connexion**
```
Utilisateur → Page /auth/login
           → Entre email et mot de passe
           → Clic sur "Se connecter"
           → Vérification avec Supabase
           → Redirection vers /account
```

### 3. **Routes protégées**
```
Utilisateur non connecté → Route protégée → Redirection automatique vers /auth/login
Utilisateur connecté     → Route protégée → Accès autorisé
```

---

## Personnalisation

### Ajouter une route protégée

```tsx
'use client'

import { useProtectedRoute } from '@/hooks/use-protected-route'

export default function MaPageProtegee() {
  const { user, loading } = useProtectedRoute()

  if (loading) return <Skeleton />
  
  return (
    <div>
      <h1>Bienvenue {user?.email}</h1>
    </div>
  )
}
```

### Modifier le formulaire de connexion

Modifiez `/app/auth/login/page.tsx` pour ajouter des champs supplémentaires comme "Se souvenir de moi" ou l'authentification OAuth.

### Ajouter l'authentification OAuth (Google, GitHub, etc.)

1. Allez dans **Authentication → Providers** dans Supabase
2. Activez le provider (Google, GitHub, etc.)
3. Complétez la configuration OAuth
4. Utilisez `signInWithOAuth()` dans vos formulaires

---

## Dépannage

### "Missing Supabase environment variables"
- ✅ Vérifiez que `.env.local` existe et contient les variables
- ✅ Redémarrez le serveur dev après modification du .env.local

### Utilisateur reste connecté après page reload
- ✅ C'est le comportement normal - la session est stockée dans Supabase

### Email de confirmation non reçu
- ✅ Vérifiez le dossier spam
- ✅ Allez dans **Settings → Email Templates** dans Supabase pour personnaliser l'email
- ✅ Assurez-vous que l'email est activé dans les providers

### Impossible de changer de mot de passe
- ✅ L'utilisateur doit être connecté
- ✅ Implémentez `/app/account/change-password/page.tsx`

---

## Fonctionnalités futures à ajouter

- [ ] Réinitialisation de mot de passe par email
- [ ] Authentification OAuth (Google, GitHub)
- [ ] Profil utilisateur complet (adresse, téléphone, etc.)
- [ ] Historique des commandes
- [ ] Notifications par email
- [ ] Deux facteurs d'authentification (2FA)

---

## Architecture

```
lib/
├── auth.ts                 # Fonctions d'authentification
├── auth-context.tsx        # Context global
└── supabase.ts            # Client Supabase

hooks/
└── use-protected-route.ts  # Hook pour routes protégées

app/
├── auth/
│   ├── login/page.tsx      # Page de connexion
│   └── signup/page.tsx     # Page d'inscription
└── account/
    └── page.tsx            # Profil utilisateur
```

---

## Support et documentation

- [Documentation Supabase Auth](https://supabase.com/docs/guides/auth)
- [Documentation Next.js](https://nextjs.org/docs)
- [Vos clés Supabase](https://app.supabase.com) - Settings → API
