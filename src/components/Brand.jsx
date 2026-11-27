// Official, full-colour platform logos (unchanged files in /public/icons) + the studio mark.
export function BrandIcon({ name, size = 22, className = '' }) {
  return <img src={`/icons/${name}.svg`} width={size} height={size} alt="" aria-hidden="true" className={className} style={{ width: size, height: size }} />
}

// Black logos (ChatGPT) sit on a small white badge so they stay visible on the dark site.
export function IconBadge({ name, size = 22, label }) {
  return (
    <span className="inline-flex items-center justify-center rounded-full bg-white" style={{ width: size + 16, height: size + 16 }} title={label}>
      <BrandIcon name={name} size={size} />
    </span>
  )
}

export function LogoMark({ className = '' }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <img src="/media/logo/cloud-mark.webp" alt="" aria-hidden="true" width="44" height="28" className="h-7 w-auto drop-shadow-[0_0_14px_rgba(143,211,255,0.45)]" />
      <span className="font-display text-[22px] leading-none tracking-tight">Singing Cloud <span className="italic text-sky">Project</span></span>
    </span>
  )
}
