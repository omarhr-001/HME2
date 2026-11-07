import { StaticFeatureNotice } from '@/components/static-feature-notice'

export default function ChangePasswordPage() {
  return (
    <StaticFeatureNotice
      title="Paramètres de compte indisponibles"
      description="La gestion des mots de passe est désactivée avec les données JSON statiques."
    />
  )
}
