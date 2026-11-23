import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, RoundedBox, useTexture, Environment, Lightformer, Stars, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { makePuffTexture, makeGlowTexture, makeVideoTexture } from './textures.js'
import { SERVICES } from '../data/services.js'

/*
  The Cloud Studio: a glossy platform floating above a sea of clouds at night.
  Five stations stand in a circle around the visitor (one per service). The visitor
  stands in the middle and looks around (drag / tilt). Each station has a glowing hotspot.
*/

const EYE = 1.55
const R = 5.2 // station distance from the centre
const STATIONS = ['ai', 'websites', 'social', 'branding', 'automation'].map((id, i) => {
  const yaw = (i * Math.PI * 2) / 5 // 0 = straight ahead (-z)
  return { id, yaw, pos: new THREE.Vector3(-Math.sin(yaw) * R, 0, -Math.cos(yaw) * R) }
})
const M = '/media'

/* ── materials ─────────────────────────────────────────────── */
function useGlossy(color = '#9fd6ff') {
  return useMemo(() => new THREE.MeshPhysicalMaterial({
    color, roughness: 0.18, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.12, sheen: 0.4, sheenColor: new THREE.Color('#e8f6ff'),
  }), [color])
}

/* ── glossy "cloud" blob built from spheres, like the brand's soft 3D clouds ── */
function GlossyCloud({ position, scale = 1, color, speed = 1 }) {
  const ref = useRef()
  const mat = useGlossy(color)
  const puffs = [[0, 0, 0, 1], [-0.95, -0.2, 0.1, 0.72], [0.95, -0.22, 0.05, 0.75], [-0.35, 0.45, 0, 0.78], [0.45, 0.38, -0.1, 0.7], [0, -0.35, 0.35, 0.7]]
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed
    ref.current.position.y = position[1] + Math.sin(t * 0.6 + position[0]) * 0.18
    ref.current.rotation.y = Math.sin(t * 0.25) * 0.25
  })
  return (
    <group ref={ref} position={position} scale={scale}>
      {puffs.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} material={mat}><sphereGeometry args={[r, 40, 28]} /></mesh>
      ))}
    </group>
  )
}

/* ── sky dome with a soft horizon glow ─────────────────────── */
function Sky() {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: {},
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `varying vec3 vP;
      void main(){
        float h = vP.y;
        vec3 top = vec3(0.016,0.027,0.09);
        vec3 mid = vec3(0.05,0.08,0.22);
        vec3 glow = vec3(0.30,0.52,0.85);
        vec3 c = mix(mid, top, smoothstep(0.0, 0.7, h));
        c = mix(c, glow, smoothstep(0.18, -0.06, h) * 0.55);
        c = mix(c, vec3(0.02,0.04,0.12), smoothstep(-0.1, -0.6, h));
        gl_FragColor = vec4(c, 1.0);
      }`,
  }), [])
  return <mesh material={mat} scale={120}><sphereGeometry args={[1, 32, 24]} /></mesh>
}

/* ── sea of soft clouds (billboard sprites) the camera rises through ── */
function CloudSea({ count = 70 }) {
  const tex = useMemo(() => makePuffTexture(), [])
  const group = useRef()
  const puffs = useMemo(() => {
    let s = 11
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
    return Array.from({ length: count }, (_, i) => {
      const layer = i < count * 0.55 ? 'sea' : 'wisp'
      const a = rnd() * Math.PI * 2
      const d = layer === 'sea' ? 7 + rnd() * 26 : 2 + rnd() * 8
      const y = layer === 'sea' ? -2.6 - rnd() * 2.2 : -11 + rnd() * 8.5
      const size = layer === 'sea' ? 7 + rnd() * 9 : 4 + rnd() * 5
      const tint = new THREE.Color().setHSL(0.6, 0.35, 0.62 + rnd() * 0.25)
      return { pos: [Math.cos(a) * d, y, Math.sin(a) * d], size, tint, opacity: layer === 'sea' ? 0.55 : 0.4, drift: (rnd() - 0.5) * 0.06 }
    })
  }, [count])
  useFrame((_, dt) => { if (group.current) group.current.rotation.y += dt * 0.006 })
  return (
    <group ref={group}>
      {puffs.map((p, i) => (
        <sprite key={i} position={p.pos} scale={[p.size, p.size * 0.62, 1]}>
          <spriteMaterial map={tex} color={p.tint} transparent opacity={p.opacity} depthWrite={false} fog={false} />
        </sprite>
      ))}
    </group>
  )
}

/* ── a screen: rounded frame + unlit picture or video ─────── */
function Screen({ w, h, map, position, rotation, frame = '#1b2a5c', glow = '#8fd3ff', float = 0.08, phase = 0 }) {
  const ref = useRef()
  const glowTex = useMemo(() => makeGlowTexture(), [])
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.8 + phase) * float
  })
  return (
    <group ref={ref} position={position} rotation={rotation}>
      <sprite position={[0, 0, -0.08]} scale={[w * 2.2, h * 2.2, 1]}>
        <spriteMaterial map={glowTex} color={glow} transparent opacity={0.28} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <RoundedBox args={[w + 0.12, h + 0.12, 0.06]} radius={0.05} smoothness={3} position={[0, 0, -0.035]}>
        <meshPhysicalMaterial color={frame} roughness={0.25} metalness={0.4} clearcoat={1} />
      </RoundedBox>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={map} toneMapped={false} />
      </mesh>
    </group>
  )
}

function useVideo(src, active) {
  const v = useMemo(() => makeVideoTexture(), [])
  useEffect(() => {
    // attach the file on mount (and again after React's dev double-mount), free it on unmount
    if (!v.video.getAttribute('src')) { v.video.src = src; v.video.load() }
    return () => { v.video.pause(); v.video.removeAttribute('src'); v.video.load() }
  }, [v, src])
  useEffect(() => {
    if (active) v.video.play().catch(() => {})
    else v.video.pause()
  }, [active, v, src])
  return v.tex
}

/* ── camera rig: tripod + body + lens, gold details ─────────── */
function CameraRig({ position, rotation }) {
  const dark = '#1a2147', gold = '#e7c27d'
  return (
    <group position={position} rotation={rotation}>
      {[0, 1, 2].map((i) => {
        const a = (i * Math.PI * 2) / 3
        return (
          <mesh key={i} position={[Math.sin(a) * 0.32, 0.62, Math.cos(a) * 0.32]} rotation={[Math.cos(a) * 0.28, 0, -Math.sin(a) * 0.28]}>
            <cylinderGeometry args={[0.025, 0.03, 1.3, 10]} /><meshStandardMaterial color={dark} metalness={0.7} roughness={0.3} />
          </mesh>
        )
      })}
      <RoundedBox args={[0.5, 0.36, 0.62]} radius={0.06} position={[0, 1.42, 0]}>
        <meshPhysicalMaterial color={dark} metalness={0.5} roughness={0.25} clearcoat={1} />
      </RoundedBox>
      <mesh position={[0, 1.42, -0.48]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.17, 0.36, 28]} /><meshPhysicalMaterial color="#0b1030" metalness={0.6} roughness={0.2} clearcoat={1} />
      </mesh>
      <mesh position={[0, 1.42, -0.67]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.12, 0.165, 32]} /><meshStandardMaterial color={gold} metalness={1} roughness={0.25} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 1.42, -0.665]}>
        <circleGeometry args={[0.12, 32]} /><meshPhysicalMaterial color="#2d6dff" roughness={0} metalness={0.2} clearcoat={1} emissive="#1d4fd8" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0.12, 1.64, 0.05]}><sphereGeometry args={[0.035, 12, 12]} /><meshBasicMaterial color="#ff5a6e" toneMapped={false} /></mesh>
    </group>
  )
}

/* ── automation core: glowing orb with orbiting chat bubbles ── */
function AutomationCore({ position }) {
  const ring = useRef()
  const glossy = useGlossy('#bfe6ff')
  const glowTex = useMemo(() => makeGlowTexture(), [])
  useFrame((_, dt) => { if (ring.current) ring.current.rotation.y += dt * 0.5 })
  return (
    <group position={position}>
      <mesh position={[0, 1.7, 0]}>
        <icosahedronGeometry args={[0.52, 3]} />
        <meshPhysicalMaterial color="#5fb8ff" emissive="#2a7bff" emissiveIntensity={0.9} roughness={0.1} clearcoat={1} transmission={0.2} />
      </mesh>
      <sprite position={[0, 1.7, 0]} scale={[3.4, 3.4, 1]}>
        <spriteMaterial map={glowTex} color="#62b8ff" transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <group ref={ring} position={[0, 1.7, 0]}>
        {[0, 1, 2, 3].map((i) => {
          const a = (i * Math.PI) / 2
          return (
            <group key={i} position={[Math.cos(a) * 1.25, Math.sin(a * 2) * 0.25, Math.sin(a) * 1.25]}>
              <RoundedBox args={[0.5, 0.3, 0.08]} radius={0.12} smoothness={4} material={glossy} />
              {[-0.12, 0, 0.12].map((x) => (
                <mesh key={x} position={[x, 0, 0.05]}><sphereGeometry args={[0.03, 10, 10]} /><meshBasicMaterial color="#2a5bd7" /></mesh>
              ))}
            </group>
          )
        })}
      </group>
      <mesh position={[0, 1.7, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.25, 0.008, 8, 96]} /><meshBasicMaterial color="#8fd3ff" transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.36, 0.48, 1, 32]} /><meshPhysicalMaterial color="#16204d" roughness={0.3} metalness={0.4} clearcoat={1} /></mesh>
    </group>
  )
}

/* ── an easel-style design board ───────────────────────────── */
function DesignBoard({ position, rotation, map, w = 2, h = 1.38 }) {
  return (
    <group position={position} rotation={rotation}>
      {[-0.7, 0.7].map((x) => (
        <mesh key={x} position={[x * (w / 2), 0.95, 0.05]} rotation={[-0.12, 0, 0]}><boxGeometry args={[0.05, 2, 0.05]} /><meshStandardMaterial color="#e7c27d" metalness={1} roughness={0.3} /></mesh>
      ))}
      <group position={[0, 1.45, 0]} rotation={[-0.12, 0, 0]}>
        <RoundedBox args={[w + 0.1, h + 0.1, 0.04]} radius={0.02} position={[0, 0, -0.03]}><meshStandardMaterial color="#f4efe6" roughness={0.6} /></RoundedBox>
        <mesh><planeGeometry args={[w, h]} /><meshBasicMaterial map={map} toneMapped={false} /></mesh>
      </group>
    </group>
  )
}

/* ── hotspot: glowing, pulsing, labelled button in 3D space ── */
function Hotspot({ station, onSelect, visible }) {
  const s = SERVICES.find((x) => x.id === station.id)
  return (
    <Html position={[station.pos.x * 0.86, 2.95, station.pos.z * 0.86]} center zIndexRange={[20, 0]} style={{ pointerEvents: visible ? 'auto' : 'none' }}>
      <button type="button" onClick={() => onSelect(s)}
        className={`group flex flex-col items-center gap-2 transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
        aria-label={`Open ${s.name}`}>
        <span className="pulse relative flex h-5 w-5 items-center justify-center rounded-full bg-sky shadow-[0_0_24px_6px_rgba(143,211,255,0.75)]">
          <span className="h-2 w-2 rounded-full bg-white" />
        </span>
        <span className="whitespace-nowrap rounded-full border border-sky/40 bg-night/70 px-3.5 py-1.5 text-[13px] font-semibold text-ink backdrop-blur-md transition-colors duration-200 group-hover:border-sky group-hover:bg-deep">
          {s.short}
        </span>
      </button>
    </Html>
  )
}

/* ── the camera: intro flight, look-around, fly-to ─────────── */
function CameraDirector({ look, introDone, setIntroDone, skipIntro, flyTarget, onArrived }) {
  const { camera } = useThree()
  const state = useRef({ y: skipIntro ? EYE : -12, back: skipIntro ? 0 : 10.5, pitchIntro: skipIntro ? 0 : 0.42, fwd: 0 })
  useEffect(() => {
    camera.rotation.order = 'YXZ'
    if (skipIntro) { setIntroDone(true); return }
    const tl = gsap.timeline({ onComplete: () => setIntroDone(true) })
    // rise up through the clouds just outside the platform, then glide in to the centre
    tl.to(state.current, { y: EYE + 0.6, duration: 3.0, ease: 'power2.inOut' })
      .to(state.current, { pitchIntro: 0, duration: 1.8, ease: 'power2.out' }, 1.6)
      .to(state.current, { back: 0, y: EYE, duration: 1.9, ease: 'power3.inOut' }, 2.5)
    return () => tl.kill()
  }, [camera, skipIntro, setIntroDone])

  useEffect(() => {
    if (!flyTarget) return
    // turn to face the station, then glide toward it
    const target = flyTarget.yaw
    let dy = ((target - look.current.yaw) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI
    const tl = gsap.timeline({ onComplete: onArrived })
    tl.to(look.current, { yaw: look.current.yaw + dy, pitch: -0.05, duration: 0.7, ease: 'power2.inOut' })
      .to(state.current, { fwd: R * 0.62, duration: 1.1, ease: 'power3.in' }, 0.45)
      .to(camera, { fov: 38, duration: 1.1, ease: 'power3.in', onUpdate: () => camera.updateProjectionMatrix() }, 0.45)
    return () => tl.kill()
  }, [flyTarget, camera, look, onArrived])

  useFrame(() => {
    const L = look.current
    L.smoothYaw += (L.yaw - L.smoothYaw) * 0.08
    L.smoothPitch += (L.pitch - L.smoothPitch) * 0.08
    const s = state.current
    camera.rotation.y = L.smoothYaw
    camera.rotation.x = L.smoothPitch + s.pitchIntro
    camera.position.set(-Math.sin(L.smoothYaw) * s.fwd, s.y, -Math.cos(L.smoothYaw) * s.fwd + s.back)
  })
  return null
}

/* ── everything on the platform ────────────────────────────── */
function StudioSet({ active }) {
  const [desk, moon1, moon2, moon3, whipped, game] = useTexture([
    `${M}/sites/jewelry-desktop.webp`, `${M}/work/moon-1411-sm.webp`, `${M}/work/moon-1409-sm.webp`, `${M}/work/moon-1412-sm.webp`,
    `${M}/work/whip-1-sm.webp`, `${M}/work/game-1-sm.webp`,
  ])
  ;[desk, moon1, moon2, moon3, whipped, game].forEach((t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4 })
  const perfume = useVideo(`${M}/video/perfume-teaser-loop.mp4`, active)
  const latte = useVideo(`${M}/video/latte-wave-loop.mp4`, active)
  const fig = useVideo(`${M}/video/fig-honey-loop.mp4`, active)
  const siteScroll = useVideo(`${M}/sites/jewelry-scroll.mp4`, active)
  const platform = useGlossy('#d7ecff')
  const [ai, web, social, brand, auto] = STATIONS
  const face = (st) => [0, st.yaw, 0] // stations face the centre

  return (
    <group>
      {/* floating platform */}
      <mesh position={[0, -0.18, 0]} material={platform}><cylinderGeometry args={[7.4, 6.6, 0.36, 96]} /></mesh>
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.6, 1.64, 96]} /><meshBasicMaterial color="#8fd3ff" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[7.18, 7.25, 128]} /><meshBasicMaterial color="#e7c27d" transparent opacity={0.7} />
      </mesh>

      {/* AI Videos & Photos: big cinema screen, two side screens, camera rig */}
      <group position={ai.pos.toArray()} rotation={face(ai)}>
        <Screen w={1.35} h={2.4} map={perfume} position={[0, 1.95, 0]} rotation={[0, 0, 0]} phase={0} />
        <Screen w={0.78} h={1.38} map={latte} position={[-1.35, 1.6, 0.45]} rotation={[0, 0.35, 0]} phase={1} />
        <Screen w={0.78} h={1.38} map={game} position={[1.4, 1.5, 0.45]} rotation={[0, -0.35, 0]} phase={2} glow="#e7c27d" />
        <CameraRig position={[2.1, 0, 0.8]} rotation={[0, 0.9, 0]} />
      </group>

      {/* Websites: laptop-style wide screen + phone with the live site scrolling */}
      <group position={web.pos.toArray()} rotation={face(web)}>
        <Screen w={2.5} h={1.56} map={desk} position={[-0.3, 1.9, 0]} rotation={[0, 0, 0]} phase={0.5} />
        <Screen w={0.62} h={1.34} map={siteScroll} position={[1.35, 1.55, 0.5]} rotation={[0, -0.3, 0]} phase={1.6} frame="#0e1433" />
      </group>

      {/* Social Media & Content: a fan of vertical posts */}
      <group position={social.pos.toArray()} rotation={face(social)}>
        <Screen w={0.85} h={1.5} map={fig} position={[0, 1.9, 0]} rotation={[0, 0, 0]} phase={0.3} />
        <Screen w={0.85} h={1.06} map={moon1} position={[-1.05, 1.62, 0.35]} rotation={[0, 0.3, 0.06]} phase={1.1} glow="#cfe8ff" />
        <Screen w={0.85} h={1.06} map={moon3} position={[1.05, 1.62, 0.35]} rotation={[0, -0.3, -0.06]} phase={2.3} glow="#cfe8ff" />
      </group>

      {/* Branding & Logos: design board with the mood board + a small swatch board */}
      <group position={brand.pos.toArray()} rotation={face(brand)}>
        <DesignBoard map={whipped} position={[-0.25, 0, 0]} w={2.1} h={1.44} />
        <Screen w={0.7} h={0.88} map={moon2} position={[1.45, 1.35, 0.6]} rotation={[0, -0.4, 0]} phase={0.9} glow="#e7c27d" />
      </group>

      {/* Automation & AI Assistants */}
      <AutomationCore position={auto.pos.toArray()} />

      {/* glossy blue cloud forms drifting around the studio */}
      <GlossyCloud position={[-3.6, 5.6, -8.5]} scale={0.7} color="#9fd6ff" speed={0.8} />
      <GlossyCloud position={[6.5, 3.6, -2]} scale={0.6} color="#b4e0ff" speed={1.1} />
      <GlossyCloud position={[-6.8, 3.2, 3.5]} scale={0.7} color="#8ccfff" speed={0.9} />
      <GlossyCloud position={[3, 4.8, 6.5]} scale={0.55} color="#a8dcff" speed={1.2} />
    </group>
  )
}

/* ── the brand cloud floating above the studio entrance ────── */
function BrandCloud() {
  const tex = useTexture(`${M}/logo/cloud-1024.webp`)
  tex.colorSpace = THREE.SRGBColorSpace
  const ref = useRef()
  useFrame(({ clock }) => { if (ref.current) ref.current.position.y = 5.1 + Math.sin(clock.elapsedTime * 0.5) * 0.2 })
  return (
    <sprite ref={ref} position={[0, 5.1, -9.5]} scale={[4.4, 4.4, 1]}>
      <spriteMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
    </sprite>
  )
}

/* ── look-around input: drag, mouse and phone tilt ─────────── */
function useLookControls(target, look, enabled) {
  useEffect(() => {
    const el = target.current
    if (!el) return
    let drag = null
    const down = (e) => { if (!enabled.current) return; drag = { x: e.clientX, y: e.clientY, yaw: look.current.yaw, pitch: look.current.pitch } ; el.setPointerCapture?.(e.pointerId) }
    const move = (e) => {
      if (!drag) return
      const k = 2.6 / Math.max(el.clientWidth, 1)
      look.current.yaw = drag.yaw + (e.clientX - drag.x) * k * 1.3
      look.current.pitch = THREE.MathUtils.clamp(drag.pitch + (e.clientY - drag.y) * k * 0.6, -0.45, 0.4)
      look.current.userMoved = true
    }
    const up = () => { drag = null }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [target, look, enabled])
}

export function enableGyro(look) {
  let base = null
  const on = (e) => {
    if (e.alpha == null) return
    if (!base) base = { a: e.alpha, b: e.beta, yaw: look.current.yaw }
    let da = e.alpha - base.a
    if (da > 180) da -= 360
    if (da < -180) da += 360
    look.current.yaw = base.yaw + THREE.MathUtils.degToRad(da)
    look.current.pitch = THREE.MathUtils.clamp(THREE.MathUtils.degToRad((e.beta - base.b) * 0.6), -0.45, 0.4)
  }
  window.addEventListener('deviceorientation', on)
  return () => window.removeEventListener('deviceorientation', on)
}

/* ── the canvas ────────────────────────────────────────────── */
export default function Studio({ onSelect, skipIntro, onIntroDone, lookRef, active, onReady }) {
  const wrap = useRef()
  const [introDone, setIntroDone] = useState(skipIntro)
  const [fly, setFly] = useState(null)
  const enabled = useRef(true)
  const [dpr, setDpr] = useState(1.5)
  useLookControls(wrap, lookRef, enabled)
  useEffect(() => { if (introDone) onIntroDone?.() }, [introDone, onIntroDone])

  // gentle auto-drift until the visitor moves, so the studio feels alive
  useEffect(() => {
    if (!introDone) return
    let raf, last = performance.now()
    const tick = (t) => {
      const dt = (t - last) / 1000; last = t
      if (!lookRef.current.userMoved && enabled.current) lookRef.current.yaw += dt * 0.05
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [introDone, lookRef])

  const select = (s) => {
    enabled.current = false
    const st = STATIONS.find((x) => x.id === s.id)
    setFly({ ...st, service: s })
  }

  return (
    <div ref={wrap} className="absolute inset-0 touch-none select-none" style={{ cursor: 'grab' }}>
      <Canvas
        dpr={dpr}
        frameloop={active ? 'always' : 'never'}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
        camera={{ fov: typeof window !== 'undefined' && innerWidth < innerHeight ? 72 : 58, near: 0.1, far: 300, position: [0, -13, 0] }}
        onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.outputColorSpace = THREE.SRGBColorSpace; onReady?.() }}
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(Math.min(window.devicePixelRatio, 1.75))} />
        <color attach="background" args={['#070b1f']} />
        <fog attach="fog" args={['#0a1238', 14, 60]} />
        <Sky />
        <Stars radius={90} depth={30} count={1800} factor={3.2} saturation={0} fade speed={0.4} />
        <hemisphereLight args={['#bfe3ff', '#0b1236', 0.9]} />
        <ambientLight intensity={0.25} />
        <pointLight position={[0, 5, 0]} intensity={30} color="#cfe8ff" distance={20} />
        <pointLight position={[-4, 2.5, 3]} intensity={14} color="#e7c27d" distance={12} />
        <Environment resolution={64} frames={1}>
          <Lightformer intensity={2.2} color="#bfe3ff" position={[0, 5, -6]} scale={[10, 3, 1]} />
          <Lightformer intensity={1.2} color="#e7c27d" position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
          <Lightformer intensity={1.4} color="#5b8cff" position={[6, 2, 2]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} />
        </Environment>
        <CloudSea />
        <BrandCloud />
        <StudioSet active={active} />
        {STATIONS.map((st) => <Hotspot key={st.id} station={st} visible={introDone && !fly} onSelect={select} />)}
        <CameraDirector look={lookRef} introDone={introDone} setIntroDone={setIntroDone} skipIntro={skipIntro}
          flyTarget={fly} onArrived={() => fly && onSelect(fly.service)} />
      </Canvas>
    </div>
  )
}
