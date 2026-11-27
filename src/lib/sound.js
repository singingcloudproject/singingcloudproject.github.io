// Site sounds, made in the browser (no audio files to download).
// OFF by default; they only play after the visitor turns the speaker on.
let ctx = null
let enabled = false
const listeners = new Set()

export const soundOn = () => enabled
export function setSound(on) {
  enabled = on
  if (on) {
    try { ctx ||= new (window.AudioContext || window.webkitAudioContext)(); ctx.resume?.() } catch { enabled = false }
  }
  listeners.forEach((f) => f(enabled))
}
export function onSoundChange(f) { listeners.add(f); return () => listeners.delete(f) }

function tone(freq, start, dur, gain, type = 'sine') {
  const o = ctx.createOscillator(), g = ctx.createGain()
  o.type = type; o.frequency.value = freq
  g.gain.setValueAtTime(0.0001, start)
  g.gain.exponentialRampToValueAtTime(gain, start + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  o.connect(g).connect(ctx.destination)
  o.start(start); o.stop(start + dur + 0.05)
}

const ready = () => enabled && ctx && ctx.state !== 'closed'

/** Classic system-dialog "ding": a bright two-note bell. */
export function ding() {
  if (!ready()) return
  const t = ctx.currentTime
  tone(1318.5, t, 0.9, 0.18); tone(2637, t, 0.5, 0.05)
  tone(987.8, t + 0.11, 1.1, 0.16); tone(1975.5, t + 0.11, 0.6, 0.04)
}

/** Soft companion chime. */
export function chime() {
  if (!ready()) return
  const t = ctx.currentTime
  tone(1568, t, 0.6, 0.08); tone(2093, t + 0.08, 0.7, 0.06)
}

/** Wind whoosh for the flight: filtered noise sweeping up then down. */
export function whoosh(duration = 2.6) {
  if (!ready()) return
  const t = ctx.currentTime
  const len = Math.floor(ctx.sampleRate * duration)
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource(); src.buffer = buf
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.8
  bp.frequency.setValueAtTime(300, t)
  bp.frequency.exponentialRampToValueAtTime(2400, t + duration * 0.55)
  bp.frequency.exponentialRampToValueAtTime(500, t + duration)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.5, t + duration * 0.45)
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  src.connect(bp).connect(g).connect(ctx.destination)
  src.start(t)
}
