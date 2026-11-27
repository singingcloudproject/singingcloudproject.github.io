// Official, full-colour platform logos (unchanged files in /public/icons) + the site mark.
// objectFit: contain keeps every logo in its real shape (YouTube is wider than tall).
export function BrandIcon({ name, size = 22, className = '' }) {
  return <img src={`/icons/${name}.svg`} width={size} height={size} alt="" aria-hidden="true" className={className} style={{ width: size, height: size, objectFit: 'contain' }} />
}

// Black logos (ChatGPT) sit on a small white badge so they stay visible.
export function IconBadge({ name, size = 22, label }) {
  return (
    <span className="inline-flex items-center justify-center rounded-full bg-white" style={{ width: size + 16, height: size + 16 }} title={label}>
      <BrandIcon name={name} size={size} />
    </span>
  )
}

export function LogoMark({ className = '' }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <img src="/media/ui/companion.webp" alt="" aria-hidden="true" width="44" height="24" className="h-6 w-auto" />
      <span className="xp-brand">Singing Cloud Project</span>
    </span>
  )
}
