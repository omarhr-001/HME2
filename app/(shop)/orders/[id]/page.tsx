import { StaticFeatureNotice } from '@/components/static-feature-notice'

export default function OrderDetailsPage() {
  return (
    <StaticFeatureNotice
      title="Détails de commande indisponibles"
      description="Aucune commande n’est enregistrée dans le catalogue JSON statique."
    />
  )
}
