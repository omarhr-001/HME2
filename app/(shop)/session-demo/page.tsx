import { StaticFeatureNotice } from '@/components/static-feature-notice'

export default function SessionDemoPage() {
  return (
    <StaticFeatureNotice
      title="Sessions de compte désactivées"
      description="Cette démonstration utilise uniquement un catalogue statique. Les sessions, paniers et commandes ne sont pas créés."
    />
  )
}
