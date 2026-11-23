import * as THREE from 'three'

// Soft cloud puff, drawn in code (no downloads): layered radial blobs with gentle noise.
export function makePuffTexture(size = 256) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')
  const blob = (x, y, r, a) => {
    const grd = g.createRadialGradient(x, y, 0, x, y, r)
    grd.addColorStop(0, `rgba(255,255,255,${a})`)
    grd.addColorStop(0.55, `rgba(255,255,255,${a * 0.45})`)
    grd.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = grd
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill()
  }
  let seed = 7
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  blob(size / 2, size / 2, size * 0.42, 0.7)
  for (let i = 0; i < 26; i++) {
    const a = rnd() * Math.PI * 2, d = rnd() * size * 0.22
    blob(size / 2 + Math.cos(a) * d, size / 2 + Math.sin(a) * d * 0.7, size * (0.1 + rnd() * 0.16), 0.22 + rnd() * 0.2)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

// Round glow for lights, hotspots and screen halos
export function makeGlowTexture(size = 128) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grd.addColorStop(0, 'rgba(255,255,255,1)')
  grd.addColorStop(0.25, 'rgba(255,255,255,0.45)')
  grd.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, size, size)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

// Silent looping video as a texture (only the small 360p loops are used in 3D)
export function makeVideoTexture() {
  const v = document.createElement('video')
  Object.assign(v, { muted: true, defaultMuted: true, loop: true, playsInline: true, preload: 'auto' })
  v.setAttribute('playsinline', '')
  v.setAttribute('muted', '')
  const tex = new THREE.VideoTexture(v)
  tex.colorSpace = THREE.SRGBColorSpace
  return { tex, video: v }
}
