import { BadgeCheck, Handshake, MapPin, MessageCircle } from 'lucide-react'

const commitments = [
  {
    icon: Handshake,
    title: 'Un accompagnement humain',
    description: 'Chaque projet commence par une écoute sincère.',
  },
  {
    icon: BadgeCheck,
    title: 'Des conseils transparents',
    description: 'Des réponses claires, à chaque étape.',
  },
  {
    icon: MapPin,
    title: 'Une recherche ciblée',
    description: 'Vos priorités guident chaque sélection.',
  },
  {
    icon: MessageCircle,
    title: 'Un suivi attentif',
    description: 'Nous restons présents tout au long du projet.',
  },
]

export function TrustBar() {
  return (
    <section aria-label="Nos engagements" className="border-b border-brand-ink/10 bg-brand-paper px-4 py-4 shadow-sm md:px-[5%] md:py-6">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
        {commitments.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex flex-col items-center gap-2 p-2 text-center md:flex-row md:gap-3.5 md:text-left">
            <div className="grid size-10 shrink-0 place-items-center rounded-3xl bg-brand-gold/15 text-brand-gold-deep md:size-11">
              <Icon aria-hidden="true" size={20} />
            </div>
            <div>
              <h2 className="mb-0.5 text-xs font-semibold text-brand-ink md:text-sm">{title}</h2>
              <p className="line-clamp-2 text-xs text-brand-muted">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
