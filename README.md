# ویستا (VISTA) — سایت املاک لوکس

سایت ویترین املاک لوکس با تم تیره طلایی، فارسی و راست‌به‌چپ. کاملاً استاتیک و فوق‌سبک.

**دموی زنده:** https://soroush83faraz.github.io/vista-estate/

## امکانات

- 🎬 اینتروی سینمایی اورجینال (خط افق طلایی → لوگوتایپ) — یک‌بار در هر نشست
- 🌫️ افکت «مه و نمای شب» — با حرکت نشان‌گر روی تصویر، تم شب ساختمان از پس مه پیدا می‌شود
- 🖼️ فید اسکرولی که قاب‌ها را از وسط باز می‌کند (الهام از 11tanjung) + کارت‌های hover-scale
- 🧭 تور مجازی ۳۶۰° برای دو ملک (Photo Sphere Viewer + virtual-tour) با جابه‌جایی روان بین فضاها
- 🧪 دموی سه‌بعدی آزمایشی قابل قدم‌زدن (three.js — WASD/لمس)
- 🔍 لیست املاک با فیلتر نوع و مرتب‌سازی (بدون فریم‌ورک، JS خالص)
- 💬 فرم تماس بدون بک‌اند — پیام در واتساپ کامپوز می‌شود

## استک

[Astro](https://astro.build) + Tailwind CSS 4 + GSAP (فقط صفحه اصلی) + Photo Sphere Viewer (فقط صفحات تور) + three.js (فقط دموی سه‌بعدی). صفحات عادی تقریباً بدون جاوااسکریپت هستند.

## اجرا

```bash
npm install
npm run dev      # توسعه → localhost:4321/vista-estate
npm run build    # خروجی استاتیک در dist/
npm run preview  # پیش‌نمایش خروجی
```

## جایگزینی محتوای واقعی

- **املاک:** `src/data/properties.ts` — هر ملک یک آبجکت؛ عکس‌ها در `public/img/props/<slug>/` (`cover.jpg`، `night.jpg`، `1.jpg`…)
- **تورها:** `src/data/tours.ts` + پانوراماهای equirectangular در `public/img/pano/<slug>/`
- **تلفن/واتساپ/ایمیل:** `src/lib/site.ts` (+ یک ثابت `WA` در `src/pages/contact.astro`)
- **نسخه شب عکس‌ها:** `node scripts/process-night.mjs` (خودکار از روی cover می‌سازد)

عکس‌های فعلی placeholder هستند (Unsplash / Poly Haven CC0) و با اسکریپت `npm run assets` دانلود شده‌اند.
اگر پشت فیلترینگ هستید: `HTTPS_PROXY=http://127.0.0.1:2080 npm run assets`

## دیپلوی

هر push به `main`، از طریق GitHub Actions (`.github/workflows/deploy.yml`) به GitHub Pages دیپلوی می‌شود.

## فاز ۲ (برنامه آینده)

- پنل ادمین + دیتابیس برای ثبت ملک
- اتصال فرم تماس به سرویس ایمیل/دیتابیس
- دامنه اختصاصی
