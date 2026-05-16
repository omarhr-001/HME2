# Instructions pour corriger l'accès Admin

## Problème identifié
La table `profiles` n'avait pas de colonne `role`. C'est pourquoi votre rôle admin n'était jamais récupéré.

## Solution - Étapes à suivre

### 1. Dans Supabase SQL Editor
Accédez à Supabase et exécutez le code suivant dans le SQL Editor :

```sql
-- Add role column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'client' 
CHECK (role in ('admin', 'client'));

-- Create an index on role for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
```

### 2. Mettre à jour votre profil admin
Après avoir exécuté la migration, mettez à jour votre profil avec le rôle 'admin' :

```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'votre-email-admin@example.com';
```

### 3. Rafraîchir la page
Après cela, rafraîchissez la page et vous devriez pouvoir accéder à `/admin` !

## Vérification
Vous pouvez vérifier en:
1. Allant sur http://localhost:3000/admin
2. Ouvrant la console du navigateur (F12)
3. Cherchant les logs `[v0]` qui montrent le rôle en cours de récupération

## Notes
- Les users avec `role = 'client'` seront redirigés vers `/login`
- Les admins avec `role = 'admin'` auront accès à `/admin`
