export function PromoBanner() {
  return (
    <section className="mx-[5%] mb-10 bg-gradient-to-br from-gray-800 to-teal-900 rounded-2xl p-12 flex items-center justify-between overflow-hidden relative">
      {/* Decorative Element */}
      <div className="absolute -right-10 -top-15 w-75 h-75 rounded-full opacity-5 pointer-events-none" style={{
        background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)'
      }} />

      <div className="relative z-10">
        <p className="text-xs font-bold text-green-500 uppercase tracking-wider mb-2">Offre limitée</p>
        <h3 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Syne' }}>
          Jusqu'à <span className="text-green-500">40% de réduction</span>
        </h3>
        <p className="text-base text-white/60">Sur toute la collection de printemps</p>
      </div>

      <button className="btn-primary relative z-10">
        Découvrir l'offre
      </button>
    </section>
  )
}
