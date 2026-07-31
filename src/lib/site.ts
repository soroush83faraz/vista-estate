/** Global site config + tiny helpers. */

export const SITE = {
  brand: 'ویستا',
  brandLatin: 'VISTA',
  tagline: 'چشم‌اندازی نو به زندگی لوکس',
  description:
    'ویستا — مجموعه‌ای گزیده از املاک لوکس؛ ویلا، پنت‌هاوس و آپارتمان‌های خاص با تور مجازی ۳۶۰ درجه.',
  // TODO(owner): شماره‌های واقعی رو جایگزین کن
  phone: '+98 912 000 0000',
  phoneHref: 'tel:+989120000000',
  whatsapp: 'https://wa.me/989120000000',
  email: 'hello@vista-estate.ir',
  instagram: 'https://instagram.com/vista.estate',
} as const;

/** Join a path onto the deploy base (GitHub Pages serves under /vista-estate). */
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');
export const url = (path: string): string => BASE + path;

/** 95_000_000_000 → «۹۵ میلیارد تومان» */
export function formatToman(price: number): string {
  const fa = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 });
  if (price >= 1_000_000_000) return `${fa.format(price / 1_000_000_000)} میلیارد تومان`;
  if (price >= 1_000_000) return `${fa.format(price / 1_000_000)} میلیون تومان`;
  return `${fa.format(price)} تومان`;
}

/** Persian digits for plain numbers (metraj, rooms, year — no grouping separators) */
export const faNum = (n: number): string =>
  new Intl.NumberFormat('fa-IR', { useGrouping: false }).format(n);
