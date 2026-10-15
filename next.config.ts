import type { NextConfig } from 'next';

// Сборка — всегда статический экспорт в out/ (Vercel отдаёт его как статику, GitHub Pages — тоже).
// GITHUB_PAGES=true — тот же экспорт под https://purich755.github.io/Fatyanova/ (собирает GitHub Actions).
const pages = process.env.GITHUB_PAGES === 'true';
const basePath = pages ? '/Fatyanova' : '';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // в родительской папке лежит свой package-lock — фиксируем корень трассировки на проекте
  outputFileTracingRoot: process.cwd(),
  output: 'export',
  trailingSlash: true,
  basePath,
  // картинки готовит scripts/build-media.mjs (AVIF + WebP); next/image везде получает свой loader (components/Photo.tsx)
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_SITE_URL: pages ? 'https://purich755.github.io/Fatyanova' : 'https://fatyanova.vercel.app',
  },
};

export default nextConfig;
