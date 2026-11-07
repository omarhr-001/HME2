import { StaticFeatureNotice } from '@/components/static-feature-notice'

export default function ResetPasswordPage() {
  return (
    <StaticFeatureNotice
      title="Modification du mot de passe indisponible"
      description="Les comptes ne sont pas activés avec les données JSON statiques. Le catalogue de produits reste accessible sans connexion."
    />
  )
}
