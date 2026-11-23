// Shared animation settings (Framer Motion)
export const EASE = [0.23, 1, 0.32, 1]
export const reveal = {
  initial: { opacity: 0, y: 28, filter: 'blur(6px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, margin: '0px 0px -12% 0px' },
  transition: { duration: 0.8, ease: EASE },
}
export const stagger = (i, base = 0.06) => ({ ...reveal, transition: { ...reveal.transition, delay: Math.min(i * base, 0.36) } })
