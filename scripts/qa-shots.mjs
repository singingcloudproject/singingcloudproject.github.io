// QA screenshots at phone and desktop sizes:  node scripts/qa-shots.mjs <baseUrl> <outDir> [paths...]
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const [base, out, ...paths] = process.argv.slice(2)
fs.mkdirSync(out, { recursive: true })
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args: ['--hide-scrollbars', '--autoplay-policy=no-user-gesture-required', '--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=d3d11'],
})
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const sizes = { phone: { width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true }, desk: { width: 1440, height: 900 } }
for (const [name, vp] of Object.entries(sizes)) {
  const page = await browser.newPage()
  page.on('console', (m) => { if (m.type() === 'error') console.log(`[${name}] console error:`, m.text()) })
  page.on('pageerror', (e) => console.log(`[${name}] page error:`, e.message))
  await page.setViewport(vp)
  for (const p of paths.length ? paths : ['/']) {
    const [route, waitMs = '2500', scrollY = '0'] = p.split('@')
    await page.goto(base + route, { waitUntil: 'networkidle2', timeout: 60000 })
    await wait(+waitMs)
    if (+scrollY) { await page.evaluate((y) => window.scrollTo(0, y), +scrollY); await wait(1500) }
    const file = `${out}/${name}${route.replace(/\W+/g, '_')}${scrollY !== '0' ? '_' + scrollY : ''}.jpg`
    await page.screenshot({ path: file, type: 'jpeg', quality: 70 })
    console.log('shot', file, await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth })))
  }
  await page.close()
}
await browser.close()
