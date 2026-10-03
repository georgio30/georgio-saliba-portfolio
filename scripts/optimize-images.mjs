// Turns the original screenshots in images-src/projects/ into the responsive
// WebP files the site loads: <name>-800.webp and <name>-1600.webp.
// Usage: npm run images
import { mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const SRC = 'images-src/projects'
const OUT = 'public/images/projects'
const WIDTHS = [800, 1600]

await mkdir(OUT, { recursive: true })
const files = (await readdir(SRC)).filter((f) => /\.(png|jpe?g|webp)$/i.test(f))

for (const file of files) {
  const name = path.parse(file).name
  for (const width of WIDTHS) {
    const out = path.join(OUT, `${name}-${width}.webp`)
    await sharp(path.join(SRC, file))
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(out)
    console.log(`  ${out}`)
  }
}
console.log(`Done: ${files.length} image(s).`)
