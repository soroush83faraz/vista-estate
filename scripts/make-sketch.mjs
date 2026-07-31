/**
 * Generates the hero "blueprint sketch" layers from the hero villa photo:
 *  - hero-sketch-rough.jpg — فقط لبه‌های قوی (خطوط اصلی سازه)
 *  - hero-sketch.jpg       — لبه‌های کامل (نقشه با جزئیات)
 * Edge-detected gold line-art on black (Navana-style wireframe look).
 * Also copies the photo itself to public/img/hero-villa.jpg
 */
import { copyFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'public/img/props/namakabrud-villa/cover.jpg');

await copyFile(SRC, path.join(ROOT, 'public/img/hero-villa.jpg'));

async function makeSketch(outName, { preBlur, gain, offset }) {
  const buf = await sharp(SRC)
    .resize(1920, 1080, { fit: 'cover' })
    .greyscale()
    .blur(preBlur)
    .convolve({
      width: 3,
      height: 3,
      kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1],
    })
    .linear(gain, offset)
    .tint({ r: 236, g: 210, b: 156 })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  await writeFile(path.join(ROOT, 'public/img', outName), buf);
  console.log(`  ✓ ${outName}`);
}

// نقشه کامل: لبه‌های ظریف هم دیده شوند
await makeSketch('hero-sketch.jpg', { preBlur: 0.7, gain: 2.1, offset: -46 });
// خطوط اصلی: فقط لبه‌های قوی سازه باقی بمانند
await makeSketch('hero-sketch-rough.jpg', { preBlur: 1.0, gain: 2.4, offset: -58 });

console.log('✓ sketch layers + hero-villa.jpg ready');
