// Makes web-ready copies of the portfolio files:  npm run media
// Originals stay in media-source/ (private, never uploaded). Web copies go to public/media/.
// Photos -> WebP (large 1200px + small 600px). Videos -> silent MP4 (720p for the lightbox,
// 360p loop for the 3D screens) + a poster image. Skips files that are already done.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { MEDIA } from '../src/data/portfolio.js'

const ROOT = path.resolve(import.meta.dirname, '..')
const SRC = path.join(ROOT, 'media-source')
const OUT = path.join(ROOT, 'public', 'media')
const ff = (...args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' })
const fresh = (out) => !fs.existsSync(out)

fs.mkdirSync(path.join(OUT, 'work'), { recursive: true })
fs.mkdirSync(path.join(OUT, 'video'), { recursive: true })

for (const m of MEDIA) {
  const src = path.join(SRC, m.src)
  if (!fs.existsSync(src)) { console.warn('missing', m.src); continue }
  if (m.kind === 'photo') {
    const big = path.join(OUT, 'work', `${m.id}.webp`)
    const small = path.join(OUT, 'work', `${m.id}-sm.webp`)
    if (fresh(big)) ff('-i', src, '-vf', "scale='min(1200,iw)':-2:flags=lanczos", '-c:v', 'libwebp', '-quality', '80', big)
    if (fresh(small)) ff('-i', src, '-vf', "scale='min(600,iw)':-2:flags=lanczos", '-c:v', 'libwebp', '-quality', '74', small)
  } else {
    const hd = path.join(OUT, 'video', `${m.id}.mp4`)
    const loop = path.join(OUT, 'video', `${m.id}-loop.mp4`)
    const poster = path.join(OUT, 'video', `${m.id}.webp`)
    // no audio: the Studio site has no sound anywhere
    if (fresh(hd)) ff('-i', src, '-an', '-vf', "scale=-2:'min(1280,ih)'", '-c:v', 'libx264', '-profile:v', 'high', '-crf', '27', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', hd)
    if (fresh(loop)) ff('-i', src, '-an', '-t', '6', '-vf', 'scale=-2:360,fps=24', '-c:v', 'libx264', '-crf', '30', '-preset', 'slow', '-g', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', loop)
    if (fresh(poster)) ff('-ss', '1.5', '-i', src, '-frames:v', '1', '-vf', 'scale=-2:900', '-c:v', 'libwebp', '-quality', '78', poster)
  }
}
console.log('done')
