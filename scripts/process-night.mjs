/**
 * Generates the "night theme" variant of every property cover + the home hero:
 * darkened, cooled toward deep blue, slight vignette — warm/lit areas of the
 * original photo stay relatively bright so windows read as glowing.
 * Output: night.jpg next to each cover.jpg, and img/hero-night.jpg.
 */
import { readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');

async function nightify(src, dest) {
  if (!existsSync(src)) {
    console.warn(`  ! missing ${src}`);
    return;
  }
  const img = sharp(src);
  const { width = 1600, height = 1200 } = await img.metadata();

  // navy multiply layer → cools + darkens; radial vignette via SVG
  const navy = await sharp({
    create: { width, height, channels: 4, background: { r: 47, g: 62, b: 105, alpha: 1 } },
  })
    .png()
    .toBuffer();

  const vignette = Buffer.from(
    `<svg width="${width}" height="${height}">
      <radialGradient id="g" cx="50%" cy="42%" r="75%">
        <stop offset="55%" stop-color="black" stop-opacity="0"/>
        <stop offset="100%" stop-color="black" stop-opacity="0.55"/>
      </radialGradient>
      <rect width="100%" height="100%" fill="url(#g)"/>
    </svg>`
  );

  const out = await img
    .modulate({ brightness: 0.52, saturation: 0.78 })
    .gamma(1.15)
    .composite([
      { input: navy, blend: 'multiply' },
      { input: vignette, blend: 'over' },
    ])
    .jpeg({ quality: 76, mozjpeg: true })
    .toBuffer();

  await writeFile(dest, out);
  console.log(`  ✓ ${path.relative(ROOT, dest)}`);
}

const propsDir = path.join(ROOT, 'public/img/props');
for (const slug of await readdir(propsDir)) {
  await nightify(path.join(propsDir, slug, 'cover.jpg'), path.join(propsDir, slug, 'night.jpg'));
}
await nightify(path.join(ROOT, 'public/img/hero.jpg'), path.join(ROOT, 'public/img/hero-night.jpg'));
console.log('✓ night variants done');
