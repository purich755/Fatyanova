// Фото из public/media: <picture> с AVIF + WebP. Атрибуты <img> (lazy, decoding, fetchPriority,
// без blur-заглушки: она раздувала HTML на ~50 КБ, у рамок и так тёмный/бумажный фон) даёт next/image через getImageProps, srcset — свой, из реально собранных ширин.
import { getImageProps } from 'next/image';
import type { CSSProperties } from 'react';
import { MEDIA, type MediaId } from '@/lib/media';
import { BASE } from '@/lib/base';

export const mediaSrc = (id: MediaId, w: number, ext: 'avif' | 'webp' = 'webp') => `${BASE}/media/${id}-${w}.${ext}`;

/** ближайшая собранная ширина не меньше нужной */
export function pickWidth(id: MediaId, want: number) {
  const ws = MEDIA[id].widths;
  return ws.find((w) => w >= want) ?? ws[ws.length - 1];
}

const srcSet = (id: MediaId, ext: 'avif' | 'webp') => MEDIA[id].widths.map((w) => `${mediaSrc(id, w, ext)} ${w}w`).join(', ');

type Props = {
  id: MediaId;
  sizes: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  alt?: string;
  /** object-position кадра; на мобильных можно переопределить через --pos-m */
  pos?: string;
  posMobile?: string;
  style?: CSSProperties;
  draggable?: boolean;
};

export default function Photo({ id, sizes, className, imgClassName, priority, alt, pos, posMobile, style, draggable }: Props) {
  const m = MEDIA[id];
  const { props } = getImageProps({
    src: id,
    alt: alt ?? m.alt,
    width: m.w,
    height: m.h,
    sizes,
    priority,
    loader: ({ width }) => mediaSrc(id, pickWidth(id, Math.max(width, 1200))),
  });
  const { srcSet: _ignored, style: phStyle, ...img } = props; // eslint-disable-line @typescript-eslint/no-unused-vars
  const vars = { ...(pos ? { '--pos': pos } : {}), ...(posMobile ? { '--pos-m': posMobile } : {}) } as CSSProperties;
  return (
    <picture className={className} style={{ ...vars, ...style }}>
      <source type="image/avif" srcSet={srcSet(id, 'avif')} sizes={sizes} />
      <img {...img} srcSet={srcSet(id, 'webp')} className={imgClassName} style={phStyle} draggable={draggable} fetchPriority={priority ? "high" : undefined} />
    </picture>
  );
}
