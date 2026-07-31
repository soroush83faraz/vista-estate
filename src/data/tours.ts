export interface TourNode {
  id: string;
  name: string;
  /** فایل پانوراما نسبت به public/img/pano/{tourSlug}/ */
  pano: string;
  /** لینک به نودهای دیگر + جهت فلش (درجه) */
  links: { to: string; yaw: number }[];
}

export interface Tour {
  slug: string;
  title: string;
  propSlug: string;
  start: string;
  nodes: TourNode[];
}

export const TOURS: Tour[] = [
  {
    slug: 'lavasan-villa',
    title: 'ویلا دوبلکس لواسان',
    propSlug: 'lavasan-villa',
    start: 'living',
    nodes: [
      {
        id: 'living',
        name: 'نشیمن اصلی',
        pano: 'living.jpg',
        links: [
          { to: 'fireplace', yaw: 40 },
          { to: 'lounge', yaw: 150 },
        ],
      },
      {
        id: 'fireplace',
        name: 'سالن شومینه',
        pano: 'fireplace.jpg',
        links: [
          { to: 'living', yaw: 220 },
          { to: 'study', yaw: 100 },
        ],
      },
      {
        id: 'lounge',
        name: 'لانج چوبی',
        pano: 'lounge.jpg',
        links: [
          { to: 'living', yaw: 330 },
          { to: 'study', yaw: 80 },
        ],
      },
      {
        id: 'study',
        name: 'اتاق مطالعه',
        pano: 'study.jpg',
        links: [
          { to: 'fireplace', yaw: 280 },
          { to: 'lounge', yaw: 200 },
        ],
      },
    ],
  },
  {
    slug: 'zafaraniyeh-penthouse',
    title: 'پنت‌هاوس زعفرانیه',
    propSlug: 'zafaraniyeh-penthouse',
    start: 'hall',
    nodes: [
      {
        id: 'hall',
        name: 'سالن اصلی',
        pano: 'hall.jpg',
        links: [
          { to: 'interior', yaw: 60 },
          { to: 'hallway', yaw: 180 },
        ],
      },
      {
        id: 'interior',
        name: 'نشیمن',
        pano: 'interior.jpg',
        links: [
          { to: 'hall', yaw: 250 },
          { to: 'bedroom', yaw: 120 },
        ],
      },
      {
        id: 'hallway',
        name: 'راهروی شیشه‌ای',
        pano: 'hallway.jpg',
        links: [
          { to: 'hall', yaw: 0 },
          { to: 'bedroom', yaw: 160 },
        ],
      },
      {
        id: 'bedroom',
        name: 'اتاق خواب اصلی',
        pano: 'bedroom.jpg',
        links: [
          { to: 'interior', yaw: 300 },
          { to: 'hallway', yaw: 40 },
        ],
      },
    ],
  },
];

export const tourBySlug = (slug: string) => TOURS.find((t) => t.slug === slug);
