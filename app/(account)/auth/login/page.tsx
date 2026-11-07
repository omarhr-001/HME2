import { StaticFeatureNotice } from '@/components/static-feature-notice'

export default function LoginPage() {
  return (
    <StaticFeatureNotice
      title="Connexion indisponible"
      description="L’authentification n’est pas activée avec le catalogue JSON statique. Vous pouvez parcourir les produits et les promotions sans créer de compte."
    />
  )
}
