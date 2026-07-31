/**
 * Downloads all placeholder assets:
 *  - fonts (Vazirmatn + Estedad variable) → src/assets/fonts
 *  - property photos (Unsplash, hotlink-free local copies) → public/img/props/<slug>/
 *  - 360° panoramas (Poly Haven tonemapped JPGs) → public/img/pano/<tour>/
 * Idempotent: skips files that already exist and look sane.
 */
import { mkdir, writeFile, stat, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { setGlobalDispatcher, ProxyAgent } from 'undici';

// برخی CDNها (unsplash و…) فقط از طریق پراکسی در دسترس‌اند
const PROXY = process.env.HTTPS_PROXY || process.env.https_proxy;
if (PROXY) {
  setGlobalDispatcher(new ProxyAgent(PROXY));
  console.log(`(using proxy ${PROXY})`);
}

const ROOT = path.resolve(import.meta.dirname, '..');
const u = (id, w = 1600) => `https://images.unsplash.com/photo-${id}?w=${w}&q=80&fm=jpg`;

/* ─── manifest ─── */
const FONTS = [
  {
    dest: 'src/assets/fonts/Vazirmatn-Variable.woff2',
    candidates: [
      'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/webfonts/Vazirmatn%5Bwght%5D.woff2',
      'https://raw.githubusercontent.com/rastikerdar/vazirmatn/v33.003/fonts/webfonts/Vazirmatn%5Bwght%5D.woff2',
      'https://unpkg.com/vazirmatn@33.0.3/fonts/webfonts/Vazirmatn%5Bwght%5D.woff2',
    ],
    min: 30_000,
  },
  {
    dest: 'src/assets/fonts/Estedad-Variable.woff2',
    candidates: [
      'https://raw.githubusercontent.com/aminabedi68/Estedad/master/fonts/webfonts/Estedad%5Bwght%5D.woff2',
      'https://cdn.jsdelivr.net/gh/aminabedi68/Estedad@master/fonts/webfonts/Estedad%5Bwght%5D.woff2',
    ],
    min: 30_000,
    // اگر پیدا نشد، وزیرمتن جایگزین میشه (پایین‌تر)
    optional: true,
  },
];

// famous, stable Unsplash photo ids as backup when a specific id 404s
const FALLBACK_POOL = [
  '1600596542815-ffad4c1539a9',
  '1512917774080-9991f1c4c750',
  '1600585154340-be6161a56a0c',
  '1568605114967-8130f3a36994',
  '1570129477492-45c003edd2be',
  '1580587771525-78b9dba3b914',
  '1613490493576-7fde63acd811',
  '1600607687939-ce8a6c25118c',
  '1522708323590-d24dbb6b0267',
  '1502672260266-1c1ef2d93688',
  '1560448204-e02f11c3d0e2',
  '1493809842364-78817add7ffb',
];
const usedFallbacks = new Set();

const PROPS = {
  'lavasan-villa': {
    cover: '1600596542815-ffad4c1539a9',
    gallery: [
      '1600585154340-be6161a56a0c',
      '1600607687939-ce8a6c25118c',
      '1600210492486-724fe5c67fb0',
      '1600121848594-d8644e57abab',
    ],
  },
  'zafaraniyeh-penthouse': {
    cover: '1600047509807-ba8f99d2cdde',
    gallery: [
      '1522708323590-d24dbb6b0267',
      '1600607687920-4e2a09cf159d',
      '1600566753190-17f0baa2a6c3',
      '1560448204-e02f11c3d0e2',
    ],
  },
  'elahiyeh-apartment': {
    cover: '1493809842364-78817add7ffb',
    gallery: ['1560185007-cde436f6a4d0', '1560185127-6ed189bf02f4', '1502672260266-1c1ef2d93688'],
  },
  'namakabrud-villa': {
    cover: '1613490493576-7fde63acd811',
    gallery: ['1600585154526-990dced4db0d', '1584622650111-993a426fbf0a', '1583608205776-bfd35f0d9f83'],
  },
  'saadatabad-apartment': {
    cover: '1460317442991-0ec209397118',
    gallery: ['1484154218962-a197022b5858', '1556912167-f556f1f39fdf', '1554995207-c18c203602cb'],
  },
  'kordan-garden-villa': {
    cover: '1568605114967-8130f3a36994',
    gallery: ['1570129477492-45c003edd2be', '1580587771525-78b9dba3b914', '1523217582562-09d0def993a6'],
  },
};

const HERO = '1605276374104-dee2a0ed3cd6'; // mansion at dusk

const PANOS = {
  'lavasan-villa': {
    living: 'lebombo',
    fireplace: 'fireplace',
    lounge: 'wooden_lounge',
    study: 'reading_room',
  },
  'zafaraniyeh-penthouse': {
    bedroom: 'hotel_room',
    hallway: 'glass_passage',
    hall: 'photo_studio_loft_hall',
    interior: 'cayley_interior',
  },
};
const PANO_FALLBACKS = ['lebombo', 'fireplace', 'wooden_lounge', 'hotel_room', 'artist_workshop', 'colorful_studio'];

/* ─── helpers ─── */
async function fetchBuf(url, min = 15_000) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: { 'user-agent': 'Mozilla/5.0 vista-estate-setup' },
    signal: AbortSignal.timeout(90_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < min) throw new Error(`too small (${buf.length}B)`);
  return buf;
}

async function saveOk(dest, min = 15_000) {
  if (!existsSync(dest)) return false;
  const s = await stat(dest);
  return s.size >= min;
}

async function downloadImage(id, dest, w = 1600) {
  if (await saveOk(dest)) return 'skip';
  await mkdir(path.dirname(dest), { recursive: true });
  const tryIds = [id, ...FALLBACK_POOL.filter((f) => f !== id && !usedFallbacks.has(f))];
  for (const tid of tryIds) {
    try {
      const buf = await fetchBuf(u(tid, w));
      // re-encode → strips metadata, normalizes quality
      const out = await sharp(buf).jpeg({ quality: 78, mozjpeg: true }).toBuffer();
      await writeFile(dest, out);
      if (tid !== id) usedFallbacks.add(tid);
      return tid === id ? 'ok' : `fallback:${tid}`;
    } catch (e) {
      if (tid === id) console.warn(`  ! ${id} failed (${e.message}) → trying fallback pool`);
    }
  }
  throw new Error(`all candidates failed for ${id} → ${dest}`);
}

async function downloadPano(name, dest) {
  if (await saveOk(dest, 100_000)) return 'skip';
  await mkdir(path.dirname(dest), { recursive: true });
  const tryNames = [name, ...PANO_FALLBACKS.filter((n) => n !== name)];
  for (const n of tryNames) {
    try {
      const buf = await fetchBuf(
        `https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/${n}.jpg`,
        200_000
      );
      const out = await sharp(buf)
        .resize(4096, 2048, { fit: 'fill' })
        .jpeg({ quality: 72, mozjpeg: true })
        .toBuffer();
      await writeFile(dest, out);
      return n === name ? 'ok' : `fallback:${n}`;
    } catch (e) {
      console.warn(`  ! pano ${n} failed: ${e.message}`);
    }
  }
  throw new Error(`all pano candidates failed for ${name}`);
}

async function pool(tasks, limit = 5) {
  const results = [];
  let i = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (i < tasks.length) {
      const t = tasks[i++];
      results.push(await t());
    }
  });
  await Promise.all(workers);
  return results;
}

/* ─── run ─── */
console.log('▸ fonts');
for (const f of FONTS) {
  const dest = path.join(ROOT, f.dest);
  if (await saveOk(dest, f.min)) {
    console.log(`  = ${f.dest} (exists)`);
    continue;
  }
  await mkdir(path.dirname(dest), { recursive: true });
  let done = false;
  for (const c of f.candidates) {
    try {
      await writeFile(dest, await fetchBuf(c, f.min));
      console.log(`  ✓ ${f.dest}`);
      done = true;
      break;
    } catch (e) {
      console.warn(`  ! ${c} → ${e.message}`);
    }
  }
  if (!done) {
    if (f.optional) {
      // fall back to Vazirmatn so the family still resolves
      await copyFile(path.join(ROOT, FONTS[0].dest), dest);
      console.warn(`  ! ${f.dest}: using Vazirmatn as stand-in`);
    } else {
      throw new Error(`font download failed: ${f.dest}`);
    }
  }
}

console.log('▸ property photos');
const jobs = [];
for (const [slug, imgs] of Object.entries(PROPS)) {
  const dir = path.join(ROOT, 'public/img/props', slug);
  jobs.push(async () => {
    const r = await downloadImage(imgs.cover, path.join(dir, 'cover.jpg'), 2000);
    console.log(`  ${slug}/cover ${r}`);
  });
  imgs.gallery.forEach((id, i) => {
    jobs.push(async () => {
      const r = await downloadImage(id, path.join(dir, `${i + 1}.jpg`), 1600);
      console.log(`  ${slug}/${i + 1} ${r}`);
    });
  });
}
jobs.push(async () => {
  const r = await downloadImage(HERO, path.join(ROOT, 'public/img/hero.jpg'), 2400);
  console.log(`  hero ${r}`);
});
await pool(jobs, 5);

console.log('▸ panoramas (Poly Haven)');
const panoJobs = [];
for (const [tour, rooms] of Object.entries(PANOS)) {
  for (const [room, name] of Object.entries(rooms)) {
    panoJobs.push(async () => {
      const r = await downloadPano(name, path.join(ROOT, 'public/img/pano', tour, `${room}.jpg`));
      console.log(`  ${tour}/${room} ${r}`);
    });
  }
}
await pool(panoJobs, 3);

console.log('✓ all assets ready');
