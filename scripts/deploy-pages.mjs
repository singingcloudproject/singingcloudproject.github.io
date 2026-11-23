// Publishes the site:  npm run deploy
// 1. Builds the site into dist/
// 2. Puts the built files on the `main` branch of singingcloudproject.github.io (that is what
//    GitHub Pages shows at https://singingcloudproject.github.io/). Earlier versions stay in the history.
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const run = (cmd, cwd = ROOT) => execSync(cmd, { cwd, stdio: 'inherit', env: { ...process.env, MSYS_NO_PATHCONV: '1' } })
const out = (cmd, cwd = ROOT) => execSync(cmd, { cwd }).toString().trim()
const remote = out('git remote get-url origin')
const name = out('git config user.name'), email = out('git config user.email')

run('npm run build')
const dist = path.join(ROOT, 'dist')
fs.writeFileSync(path.join(dist, '.nojekyll'), '')

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'scs-pages-'))
run(`git clone -q --depth 1 --branch main ${remote} "${tmp}"`)
for (const f of fs.readdirSync(tmp)) if (f !== '.git') fs.rmSync(path.join(tmp, f), { recursive: true, force: true })
fs.cpSync(dist, tmp, { recursive: true })
run('git add -A', tmp)
const changed = out('git status --porcelain', tmp)
if (!changed) { console.log('Nothing changed.'); process.exit(0) }
const source = out('git rev-parse --short HEAD')
run(`git -c user.name="${name}" -c user.email="${email}" commit -q -m "Publish site (source ${source})"`, tmp)
run('git push -q origin main', tmp)
fs.rmSync(tmp, { recursive: true, force: true })
console.log('\nPublished. Live in about a minute: https://singingcloudproject.github.io/')
