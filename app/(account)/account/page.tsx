import { StaticFeatureNotice } from '@/components/static-feature-notice'

export default function AccountPage() {
  return (
    <StaticFeatureNotice
      title="Compte indisponible"
      description="La connexion et les profils ne sont pas activés en mode données JSON statiques."
    />
  )
}
