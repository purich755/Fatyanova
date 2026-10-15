import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { SITE } from '@/lib/data';
import { BASE } from '@/lib/base';
import './globals.css';
import './sections.css';

// Шрифты — сабсеты под латиницу и русскую кириллицу (scripts/subset-fonts.mjs, OFL).
// Сразу грузятся только антиква и текстовый гротеск; моно и рукописный — по мере надобности.
const playfair = localFont({
  src: [
    { path: './fonts/playfair.woff2', weight: '400', style: 'normal' },
    { path: './fonts/playfair-italic.woff2', weight: '400', style: 'italic' },
  ],
  variable: '--f-playfair',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
});
const manrope = localFont({ src: './fonts/manrope.woff2', weight: '400 700', variable: '--f-manrope', display: 'swap', fallback: ['system-ui', 'sans-serif'] });
const plex = localFont({
  src: [
    { path: './fonts/plex-400.woff2', weight: '400' },
    { path: './fonts/plex-500.woff2', weight: '500' },
  ],
  variable: '--f-plex',
  display: 'swap',
  preload: false,
  fallback: ['ui-monospace', 'monospace'],
});
const marck = localFont({ src: './fonts/marck.woff2', weight: '400', variable: '--f-marck', display: 'swap', preload: false });

const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://fatyanova.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: SITE.title,
  description: SITE.description,
  openGraph: {
    title: SITE.title,
    description: SITE.description,
    type: 'website',
    locale: 'ru_RU',
    siteName: SITE.name,
    images: [{ url: `${BASE}/media/og.jpg`, width: 1200, height: 630, alt: 'Все коллективы центра у экрана «День космонавтики» в Музее Победы' }],
  },
  // демо для показа клиенту — в поиск не нужно
  robots: { index: false, follow: false },
  icons: { icon: `${BASE}/icon.svg` },
};

export const viewport: Viewport = { themeColor: '#0F0D16', width: 'device-width', initialScale: 1 };

// До первой отрисовки: прелоадер «Третий звонок» — один раз за сессию (и не при reduced-motion)
const bellScript = `try{var d=document.documentElement;if(sessionStorage.getItem('fa-bell')||matchMedia('(prefers-reduced-motion: reduce)').matches)d.dataset.bell='seen';d.dataset.js='1'}catch(e){document.documentElement.dataset.bell='seen'}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bellScript }} />
      </head>
      <body className={`${playfair.variable} ${manrope.variable} ${plex.variable} ${marck.variable}`}>{children}</body>
    </html>
  );
}
