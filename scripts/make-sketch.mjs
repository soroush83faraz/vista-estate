/**
 * Generates the hero "blueprint sketch" from the hero villa photo:
 * edge-detected gold line-art on black (Navana-style wireframe look).
 * Outputs: public/img/hero-villa.jpg (photo) + public/img/hero-sketch.jpg (line art)
 */
import { copyFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'public/img/props/namakabrud-villa/cover.jpg');

// نسخه عکس هیرو
await copyFile(SRC, path.join(ROOT, 'public/img/hero-villa.jpg'));

// اسکچ: لبه‌یابی لاپلاسین + تقویت کنتراست + ته‌رنگ طلایی
const base = sharp(SRC).resize(1920, 1080, { fit: 'cover' });
const sketch = await base
  .greyscale()
  .blur(0.7) // نویز ریز قبل از لبه‌یابی گرفته شود
  .convolve({
    width: 3,
    height: 3,
    kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1],
  })
  .linear(2.1, -46) // لبه‌ها پررنگ، نویز زمینه سیاه
  .tint({ r: 236, g: 210, b: 156 }) // طلایی برند
  .jpeg({ quality: 82, mozjpeg: true })
  .toBuffer();

await writeFile(path.join(ROOT, 'public/img/hero-sketch.jpg'), sketch);
console.log('✓ hero-sketch.jpg + hero-villa.jpg ready');
