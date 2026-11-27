// Makes the home page hero videos:  npm run hero
// Put your originals in media-source/hero/ (private, never uploaded):
//   vertical.mp4    phone version, 9:16 (any common format works: .mp4 .mov .webm)
//   horizontal.mp4  laptop/desktop version, 16:9
// Writes fast web copies to public/media/hero/: hero-portrait.{mp4,webm,jpg} and hero-landscape.{mp4,webm,jpg}.
// If an original is missing, a temporary moving-gradient placeholder is made instead.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const SRC = path.join(ROOT, 'media-source', 'hero')
const OUT = path.join(ROOT, 'public', 'media', 'hero')
const ff = (...args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' })
fs.mkdirSync(OUT, { recursive: true })

const MAX_SECONDS = '12' // a hero loop longer than this just costs data
const jobs = [
  { name: 'portrait', source: 'vertical', w: 720, h: 1280 },
  { name: 'landscape', source: 'horizontal', w: 1920, h: 1080 },
]

for (const j of jobs) {
  const file = fs.existsSync(SRC) && fs.readdirSync(SRC).find((f) => path.parse(f).name.toLowerCase() === j.source)
  // fill the frame (crop the overflow) so the video always covers the screen
  const fit = `scale=${j.w}:${j.h}:force_original_aspect_ratio=increase:flags=lanczos,crop=${j.w}:${j.h},fps=30,format=yuv420p`
  const input = file
    ? ['-i', path.join(SRC, file), '-t', MAX_SECONDS]
    : ['-f', 'lavfi', '-i', `gradients=s=${j.w}x${j.h}:c0=0x070b1f:c1=0x1d3f9a:c2=0x8fd3ff:c3=0x3a1d6e:c4=0x070b1f:n=5:speed=0.03:type=radial:d=10:r=30`]
  console.log(`${j.name}: ${file ? `using media-source/hero/${file}` : 'no original yet, making a placeholder'}`)
  const base = path.join(OUT, `hero-${j.name}`)
  ff(...input, '-an', '-vf', fit, '-c:v', 'libx264', '-profile:v', 'high', '-crf', '26', '-preset', 'slow', '-g', '60', '-movflags', '+faststart', `${base}.mp4`)
  ff(...input, '-an', '-vf', fit, '-c:v', 'libvpx-vp9', '-crf', '36', '-b:v', '0', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', '-g', '60', `${base}.webm`)
  // poster = first frame, so the still and the video start on the same picture
  ff('-i', `${base}.mp4`, '-frames:v', '1', '-q:v', '4', `${base}.jpg`)
  for (const ext of ['mp4', 'webm', 'jpg']) console.log(`  hero-${j.name}.${ext}  ${(fs.statSync(`${base}.${ext}`).size / 1024).toFixed(0)} KB`)
}
