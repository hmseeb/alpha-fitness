import sharp from 'sharp'
import { mkdirSync, rmSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'
import path from 'node:path'

const SRC = path.resolve('assets/icon.svg')
const OUT_DIR = path.resolve('assets/build')
const ICONSET = path.resolve('assets/build/Alpha.iconset')

mkdirSync(OUT_DIR, { recursive: true })
if (existsSync(ICONSET)) rmSync(ICONSET, { recursive: true })
mkdirSync(ICONSET, { recursive: true })

// macOS iconset spec
const sizes = [
  [16, '16x16'],
  [32, '16x16@2x'],
  [32, '32x32'],
  [64, '32x32@2x'],
  [128, '128x128'],
  [256, '128x128@2x'],
  [256, '256x256'],
  [512, '256x256@2x'],
  [512, '512x512'],
  [1024, '512x512@2x'],
]

for (const [px, label] of sizes) {
  const dest = path.join(ICONSET, `icon_${label}.png`)
  await sharp(SRC).resize(px, px).png().toFile(dest)
}

// Also write a flat 512 PNG used for window/dock icon
await sharp(SRC).resize(512, 512).png().toFile(path.join(OUT_DIR, 'icon.png'))
await sharp(SRC).resize(1024, 1024).png().toFile(path.join(OUT_DIR, 'icon@2x.png'))

// Bundle .icns via macOS iconutil
try {
  execSync(`iconutil -c icns ${ICONSET} -o ${path.join(OUT_DIR, 'icon.icns')}`)
  console.log('✓ icon.icns built')
} catch (e) {
  console.warn('iconutil failed — .icns not built, png fallback in use')
}

console.log('✓ icons written to assets/build/')
