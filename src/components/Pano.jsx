import { useEffect, useRef, useState } from 'react'

/*
  360° panorama viewer.
  - WebGL (any phone or laptop from the last ~10 years): a tiny shader wraps a cylindrical panorama strip around the viewer.
  - No WebGL / context lost: the same strip as a CSS background you can drag. Nobody gets a blank hero.
  - Drag with a mouse, swipe sideways on touch screens (vertical swipes still scroll the page), arrow keys, or phone tilt.
  The parent drives the camera through `look` (a ref): { yaw, pitch, zoom, userMoved, locked, reduced }.
  pitch > 0 looks down. Hotspot pitch is elevation (> 0 = above the horizon).
*/

const TAU = Math.PI * 2
export const wrapAngle = (a) => ((((a + Math.PI) % TAU) + TAU) % TAU) - Math.PI

/** Pick the sharpest strip this device can safely handle. */
export function pickWidth(maxTex) {
  const c = navigator.connection
  // the small strip always loads first, so even a slow phone shows the scene quickly; this picks the sharp one
  const lowMem = navigator.deviceMemory && navigator.deviceMemory <= 2
  if (c?.saveData || lowMem || maxTex < 4096) return 2048
  const fast = !c?.effectiveType || c.effectiveType === '4g'
  if (fast && maxTex >= 8192 && !(navigator.deviceMemory && navigator.deviceMemory < 4)) return 8192
  return 4096
}

function webglContext(canvas) {
  const opts = { antialias: false, alpha: false, powerPreference: 'default', preserveDrawingBuffer: false }
  try { return canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts) } catch { return null }
}

const VERT = 'attribute vec2 p; varying vec2 v; void main(){ v=p; gl_Position=vec4(p,0.,1.); }'
const FRAG = `precision mediump float;
varying vec2 v;
uniform sampler2D tex;
uniform float yaw, pitch, tanHalfV, aspect, k, horizon;
uniform vec3 sky, ground;
void main(){
  vec3 d = normalize(vec3(v.x*tanHalfV*aspect, v.y*tanHalfV, -1.0));
  float cp = cos(pitch), sp = sin(pitch);
  d = vec3(d.x, d.y*cp + d.z*sp, -d.y*sp + d.z*cp);
  float th = atan(d.x, -d.z) + yaw;
  float u = fract(0.5 + th / 6.2831853);
  float te = d.y / max(length(d.xz), 1e-4);
  float vv = horizon - te * k;
  vec3 c = texture2D(tex, vec2(u, clamp(vv, 0.002, 0.998))).rgb;
  c = mix(c, sky, smoothstep(0.0, 0.12, -vv));
  c = mix(c, ground, smoothstep(1.0, 1.12, vv));
  gl_FragColor = vec4(c, 1.0);
}`

function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => (img.decode ? img.decode().catch(() => {}).then(() => res(img)) : res(img))
    img.onerror = () => rej(new Error(`Could not load ${src}`))
    img.src = src
  })
}

/*
  scene = { name, srcs: {2048, 4096, 8192}, ratio (strip height / width), horizon (0..1 eye-level row), sky:[r,g,b], ground:[r,g,b] }  (colours 0..1)
  hotspots = [{ id, yaw, pitch, node }]
*/
export default function Pano({ scene, look, hotspots = [], onProgress, onFail, interactive = true, className = '' }) {
  const wrap = useRef(), canvas = useRef(), css = useRef(), spotRefs = useRef({})
  const [mode, setMode] = useState(null) // 'gl' | 'css'
  const state = useRef({ gl: null, tex: {}, img: {}, size: [1, 1], fov: 1 })
  state.current.scene = scene
  state.current.hotspots = hotspots

  // ── WebGL check once; fall back to CSS when it's missing or fails ─────
  useEffect(() => {
    // ?nogl in the address forces the no-WebGL fallback (for testing old phones)
    const gl = /[?&]nogl\b/.test(location.search) ? null : webglContext(canvas.current)
    if (!gl) { setMode('css'); return }
    try {
      const prog = gl.createProgram()
      for (const [type, src] of [[gl.VERTEX_SHADER, VERT], [gl.FRAGMENT_SHADER, FRAG]]) {
        const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s)
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s))
        gl.attachShader(prog, s)
      }
      gl.linkProgram(prog)
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link failed')
      gl.useProgram(prog)
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
      const loc = gl.getAttribLocation(prog, 'p')
      gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
      const u = {}
      for (const n of ['tex', 'yaw', 'pitch', 'tanHalfV', 'aspect', 'k', 'horizon', 'sky', 'ground']) u[n] = gl.getUniformLocation(prog, n)
      Object.assign(state.current, { gl, u, maxTex: gl.getParameter(gl.MAX_TEXTURE_SIZE) })
      canvas.current.addEventListener('webglcontextlost', (e) => { e.preventDefault(); state.current.gl = null; setMode('css') })
      setMode('gl')
    } catch { setMode('css') }
  }, [])

  // ── load the scene: small strip first (fast), then the sharp one ─────
  useEffect(() => {
    if (!mode || !scene) return
    let cancelled = false
    const s = state.current
    const best = mode === 'gl' ? pickWidth(s.maxTex || 4096) : Math.min(4096, pickWidth(4096))
    const steps = [...new Set([2048, best])]
    const upload = (img, w) => {
      const gl = s.gl
      if (!gl) return
      const t = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, t)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img)
      if (s.tex[scene.name]) gl.deleteTexture(s.tex[scene.name].t)
      s.tex[scene.name] = { t, w }
    }
    ;(async () => {
      for (let i = 0; i < steps.length; i++) {
        if (s.img[scene.name]?.w >= steps[i]) continue
        try {
          const img = await loadImage(scene.srcs[steps[i]])
          if (cancelled) return
          s.img[scene.name] = { src: scene.srcs[steps[i]], w: steps[i] }
          if (mode === 'gl') upload(img, steps[i])
          else if (css.current) css.current.style.backgroundImage = `url("${scene.srcs[steps[i]]}")`
          onProgress?.(scene.name, (i + 1) / steps.length)
        } catch {
          if (!s.img[scene.name]) { onFail?.(scene.name); return } // keep the small one if only the sharp one fails
        }
      }
      onProgress?.(scene.name, 1)
    })()
    return () => { cancelled = true }
  }, [mode, scene?.name]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── render loop (paused when off-screen or tab hidden) ─────
  useEffect(() => {
    if (!mode) return
    const s = state.current
    let raf = 0, visible = true, last = performance.now()
    const start = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame) } }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start() }, { threshold: 0 })
    io.observe(wrap.current)
    const onVis = () => { if (!document.hidden) start() }
    document.addEventListener('visibilitychange', onVis)
    const resize = () => {
      const r = wrap.current.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      s.size = [Math.max(r.width, 1), Math.max(r.height, 1)]
      if (mode === 'gl' && canvas.current) {
        canvas.current.width = Math.round(s.size[0] * dpr); canvas.current.height = Math.round(s.size[1] * dpr)
      }
    }
    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('orientationchange', resize)

    function frame(now) {
      raf = 0
      if (!visible || document.hidden) return
      const dt = Math.min((now - last) / 1000, 0.05); last = now
      const L = look.current, sc = s.scene
      // gentle drift until the visitor moves, so the scene visibly lives on every device
      // clearly visible spin (a full turn in about a minute); also resumes 4 s after the visitor lets go
      const idle = !L.dragging && performance.now() - (L.lastTouch || 0) > 4000
      if (idle && !L.locked && !L.reduced) L.yaw += dt * (L.spin ?? 0.11)
      if (L.vel && !L.dragging) { L.yaw += L.vel * dt; L.vel *= Math.pow(0.03, dt); if (Math.abs(L.vel) < 0.001) L.vel = 0 }
      const [w, h] = s.size
      const aspect = w / h
      const fovV = (aspect < 1 ? 0.92 : 0.86) / (L.zoom || 1)
      const tanHalfV = Math.tan(fovV / 2)
      s.fov = fovV
      const k = 1 / (TAU * sc.ratio) // strip-height fraction per unit of tan(elevation)
      const up = Math.atan(sc.horizon / k) - fovV / 2, down = Math.atan((1 - sc.horizon) / k) - fovV / 2
      L.pitch = Math.min(Math.max(L.pitch, -Math.max(up, 0) - 0.06), Math.max(down, 0) + 0.06)

      if (mode === 'gl' && s.gl && s.tex[sc.name]) {
        const gl = s.gl, u = s.u
        gl.viewport(0, 0, canvas.current.width, canvas.current.height)
        gl.bindTexture(gl.TEXTURE_2D, s.tex[sc.name].t)
        gl.uniform1i(u.tex, 0)
        gl.uniform1f(u.yaw, L.yaw); gl.uniform1f(u.pitch, L.pitch)
        gl.uniform1f(u.tanHalfV, tanHalfV); gl.uniform1f(u.aspect, aspect)
        gl.uniform1f(u.k, k); gl.uniform1f(u.horizon, sc.horizon)
        gl.uniform3fv(u.sky, sc.sky); gl.uniform3fv(u.ground, sc.ground)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      } else if (mode === 'css' && css.current) {
        // same camera, drawn as a repeating background: radius R so the vertical field of view fills the screen
        const R = h / (2 * tanHalfV)
        const stripW = R * TAU, stripH = stripW * sc.ratio
        const x = w / 2 - (0.5 + wrapAngle(L.yaw) / TAU) * stripW
        const y = h / 2 - stripH * (sc.horizon + Math.tan(L.pitch) * k)
        css.current.style.backgroundSize = `${stripW}px ${stripH}px`
        css.current.style.backgroundPosition = `${x}px ${y}px`
      }

      // hotspots: project each one onto the screen
      for (const hs of s.hotspots) {
        const el = spotRefs.current[hs.id]
        if (!el) continue
        const dyaw = wrapAngle(hs.yaw - L.yaw)
        const off = Math.abs(dyaw) > Math.min(Math.atan(tanHalfV * aspect) + 0.35, 1.45)
        const sx = w / 2 + (Math.tan(dyaw) / (tanHalfV * aspect)) * (w / 2)
        const sy = h / 2 - (Math.tan(hs.pitch + L.pitch) / tanHalfV) * (h / 2)
        el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, -50%)`
        el.style.visibility = off ? 'hidden' : 'visible'
      }
      raf = requestAnimationFrame(frame)
    }
    start()
    return () => {
      cancelAnimationFrame(raf); io.disconnect(); document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('resize', resize); window.removeEventListener('orientationchange', resize)
    }
  }, [mode, look])

  // ── drag / swipe / keys ────────────────────────────────────
  useEffect(() => {
    const el = wrap.current
    if (!el || !interactive) return
    let drag = null
    const down = (e) => {
      if (e.target.closest('[data-hotspot]')) return
      drag = { x: e.clientX, y: e.clientY, yaw: look.current.yaw, pitch: look.current.pitch, t: performance.now(), lx: e.clientX, id: e.pointerId, axis: null }
    }
    const move = (e) => {
      if (!drag || e.pointerId !== drag.id) return
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y
      if (!drag.axis) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return
        // on touch, a mostly vertical swipe scrolls the page instead of turning the view
        drag.axis = e.pointerType === 'mouse' || Math.abs(dx) > Math.abs(dy) ? 'turn' : 'scroll'
        if (drag.axis === 'turn') { try { el.setPointerCapture(e.pointerId) } catch { /* old browsers */ } look.current.dragging = true }
      }
      if (drag.axis !== 'turn') return
      const [w, h] = state.current.size
      const radPerPx = (2 * Math.atan(Math.tan(state.current.fov / 2) * (w / h))) / w
      look.current.yaw = drag.yaw - dx * radPerPx
      if (e.pointerType === 'mouse') look.current.pitch = drag.pitch - dy * radPerPx
      const now = performance.now()
      look.current.vel = (-(e.clientX - drag.lx) * radPerPx) / Math.max((now - drag.t) / 1000, 0.008)
      drag.lx = e.clientX; drag.t = now
      look.current.userMoved = true; look.current.lastTouch = now
    }
    const up = () => { if (drag) { look.current.dragging = false; drag = null } }
    const key = (e) => {
      const step = { ArrowLeft: -0.12, ArrowRight: 0.12 }[e.key]
      if (step) { look.current.yaw += step; look.current.userMoved = true; look.current.lastTouch = performance.now(); e.preventDefault() }
    }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    el.addEventListener('keydown', key)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      el.removeEventListener('keydown', key)
    }
  }, [look, interactive])

  return (
    <div ref={wrap} className={`absolute inset-0 select-none overflow-hidden ${className}`} style={{ touchAction: 'pan-y' }}
      tabIndex={interactive ? 0 : undefined} role={interactive ? 'application' : undefined}
      aria-label={interactive ? '360 degree view. Drag, swipe sideways or use the arrow keys to look around.' : undefined}>
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" style={{ display: mode === 'gl' ? 'block' : 'none' }} />
      {mode === 'css' && <div ref={css} className="absolute inset-0" style={{ backgroundRepeat: 'repeat-x', backgroundColor: `rgb(${scene.sky.map((c) => Math.round(c * 255)).join(',')})` }} />}
      {hotspots.map((hs) => (
        <div key={hs.id} data-hotspot ref={(n) => { spotRefs.current[hs.id] = n }} className="absolute left-0 top-0 z-10 will-change-transform" style={{ visibility: 'hidden' }}>
          {hs.node}
        </div>
      ))}
    </div>
  )
}
