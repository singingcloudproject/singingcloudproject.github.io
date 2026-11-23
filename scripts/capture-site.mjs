// Takes phone + desktop screenshots and a short scrolling video of a live website,
// for the Web Design section.   node scripts/capture-site.mjs <url> <name>
import puppeteer from 'puppeteer-core'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const [url, name] = process.argv.slice(2)
const OUT = path.resolve(import.meta.dirname, '..', 'public', 'media', 'sites')
const TMP = path.resolve(import.meta.dirname, '..', 'media-source', 'sites')
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(TMP, { recursive: true })
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args: ['--hide-scrollbars', '--autoplay-policy=no-user-gesture-required'],
})
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const webp = (src, out, w) => execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-vf', `scale=${w}:-2:flags=lanczos`, '-c:v', 'libwebp', '-quality', '80', out])

// Phone
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
await wait(3500)
await page.screenshot({ path: `${TMP}/${name}-phone.png` })
// Scrolling video: smooth scroll through the page while recording frames
const frames = path.join(TMP, `${name}-frames`)
fs.rmSync(frames, { recursive: true, force: true }); fs.mkdirSync(frames)
const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)
const distance = Math.min(total, 9000)
const N = 150
for (let i = 0; i < N; i++) {
  const t = i / (N - 1)
  const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(ease * distance))
  await wait(60)
  await page.screenshot({ path: path.join(frames, `f${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 85 })
}
execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', '24', '-i', path.join(frames, 'f%04d.jpg'), '-vf', 'scale=390:-2',
  '-c:v', 'libx264', '-crf', '28', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', `${OUT}/${name}-scroll.mp4`])
fs.rmSync(frames, { recursive: true, force: true })

// Desktop
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
await wait(3500)
await page.screenshot({ path: `${TMP}/${name}-desktop.png` })
await browser.close()

webp(`${TMP}/${name}-phone.png`, `${OUT}/${name}-phone.webp`, 600)
webp(`${TMP}/${name}-desktop.png`, `${OUT}/${name}-desktop.webp`, 1400)
console.log('captured', name)
