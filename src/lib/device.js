// Decides whether the full 3D studio can run smoothly on this device.
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function canRun3D() {
  if (typeof window === 'undefined') return false
  try {
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2') || c.getContext('webgl')
    if (!gl) return false
  } catch { return false }
  const mem = navigator.deviceMemory // undefined on iPhone: fine
  const cores = navigator.hardwareConcurrency || 4
  if ((mem && mem < 2) || cores < 3) return false
  if (navigator.connection?.saveData) return false
  return true
}

export const isTouch = () => typeof window !== 'undefined' && matchMedia('(pointer: coarse)').matches
