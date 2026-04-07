import { Jimp } from 'jimp'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')
const GREEN = '#006838'

for (const s of [192, 512]) {
  const image = new Jimp({ width: s, height: s, color: GREEN })
  const out = join(publicDir, `pwa-${s}.png`)
  await image.write(out)
  console.log('Wrote', out)
}
