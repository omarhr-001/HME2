import { StaticFeatureNotice } from '@/components/static-feature-notice'

export default function OrdersPage() {
  return (
    <StaticFeatureNotice
      title="Historique des commandes indisponible"
      description="Les commandes sont des données personnelles et ne sont pas simulées ni enregistrées en mode catalogue statique."
    />
  )
}
