import { StaticFeatureNotice } from '@/components/static-feature-notice'

export default function EditAccountPage() {
  return (
    <StaticFeatureNotice
      title="Profil indisponible"
      description="Les profils et leurs modifications nécessitent un backend persistant. Le catalogue JSON est consultable en lecture seule."
    />
  )
}
