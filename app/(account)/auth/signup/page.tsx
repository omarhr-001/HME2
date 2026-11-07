import { StaticFeatureNotice } from '@/components/static-feature-notice'

export default function SignupPage() {
  return (
    <StaticFeatureNotice
      title="Création de compte indisponible"
      description="Le mode JSON est en lecture seule et ne crée pas de comptes utilisateurs. Le catalogue reste accessible sans connexion."
    />
  )
}
