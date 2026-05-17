import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Car2Hand — ตลาดรถมือสอง',
    short_name: 'Car2Hand',
    description: 'แพลตฟอร์มซื้อขายรถมือสองในประเทศไทย พร้อมประเมินราคา AI',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F4F6F8',
    theme_color: '#0F3460',
    lang: 'th-TH',
    dir: 'ltr',
    categories: ['business', 'shopping', 'lifestyle'],
    icons: [
      {
        src: '/icons/icon-192.jpg',
        sizes: '192x192',
        type: 'image/jpg',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.jpg',
        sizes: '512x512',
        type: 'image/jpg',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-512.jpg',
        sizes: '512x512',
        type: 'image/jpg',
        purpose: 'maskable',
      },
      {
        src: '/favicon.webp',
        sizes: '64x64',
        type: 'image/webp',
      },
    ],
    shortcuts: [
      {
        name: 'ซื้อรถ',
        short_name: 'ซื้อรถ',
        url: '/buy',
      },
      {
        name: 'ลงประกาศขายรถ',
        short_name: 'ลงขาย',
        url: '/sellLandingPage',
      },
      {
        name: 'ชุมชน',
        short_name: 'ชุมชน',
        url: '/community',
      },
    ],
  };
}
