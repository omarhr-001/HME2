import { StaticFeatureNotice } from '@/components/static-feature-notice'

export default function InvoicePage() {
  return (
    <StaticFeatureNotice
      title="Factures indisponibles"
      description="Les factures et commandes ne sont pas générées dans le mode JSON en lecture seule."
    />
  )
}
