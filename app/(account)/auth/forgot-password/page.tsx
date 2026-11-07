import { StaticFeatureNotice } from '@/components/static-feature-notice'

export default function ForgotPasswordPage() {
  return (
    <StaticFeatureNotice
      title="Récupération de compte indisponible"
      description="La récupération de mot de passe nécessite une authentification persistante, qui n’est pas activée dans ce mode catalogue."
    />
  )
}
