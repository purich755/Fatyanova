'use client';
// Лайтбокс галереи: портал в body, затемнение, стрелки, свайп, Esc, счётчик «07 / 11»,
// FLIP-переход из миниатюры, блокировка скролла, ловушка фокуса, возврат фокуса на кадр.
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { gsap, prefersReduced } from '@/lib/gsap';
import { lockScroll } from '@/lib/smooth-scroll';
import { MEDIA, type MediaId } from '@/lib/media';
import { mediaSrc } from './Photo';

type Item = { id: MediaId; caption: string };

const srcset = (id: MediaId, ext: 'avif' | 'webp') => MEDIA[id].widths.map((w) => `${mediaSrc(id, w, ext)} ${w}w`).join(', ');

export default function Lightbox({ items, index, origin, onClose, onIndex }: { items: Item[]; index: number; origin: HTMLElement | null; onClose: () => void; onIndex: (i: number) => void }) {
  const root = useRef<HTMLDivElement>(null);
  const imgWrap = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const item = items[index];
  const m = MEDIA[item.id];

  const go = useCallback((d: number) => onIndex((index + d + items.length) % items.length), [index, items.length, onIndex]);

  const close = useCallback(() => {
    const el = root.current;
    if (!el || prefersReduced()) return onClose();
    gsap.to(el, { autoAlpha: 0, duration: 0.25, onComplete: onClose });
  }, [onClose]);

  // открытие: FLIP из миниатюры
  useLayoutEffect(() => {
    const el = root.current!;
    const wrap = imgWrap.current!;
    if (!first.current) {
      if (!prefersReduced()) gsap.fromTo(wrap, { autoAlpha: 0, scale: 0.97 }, { autoAlpha: 1, scale: 1, duration: 0.4 });
      return;
    }
    first.current = false;
    if (prefersReduced()) return;
    gsap.fromTo(el.querySelector('.lb-bg'), { opacity: 0 }, { opacity: 1, duration: 0.35 });
    gsap.fromTo(el.querySelectorAll('.lb-ui'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, delay: 0.25 });
    const thumb = origin?.querySelector('img') ?? origin;
    if (!thumb) return;
    const a = thumb.getBoundingClientRect();
    const b = wrap.getBoundingClientRect();
    const s = Math.max(a.width / b.width, a.height / b.height);
    gsap.fromTo(
      wrap,
      { x: a.left + a.width / 2 - (b.left + b.width / 2), y: a.top + a.height / 2 - (b.top + b.height / 2), scale: s, clipPath: `inset(${((1 - a.height / (b.height * s)) / 2) * 100}% ${((1 - a.width / (b.width * s)) / 2) * 100}%)` },
      { x: 0, y: 0, scale: 1, clipPath: 'inset(0% 0%)', duration: 0.6, ease: 'power3.inOut' },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // клавиатура, фокус, блокировка скролла
  useEffect(() => {
    const el = root.current!;
    lockScroll(true);
    const prevFocus = document.activeElement as HTMLElement | null;
    el.querySelector<HTMLElement>('.lb-close')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'Tab') {
        const f = [...el.querySelectorAll<HTMLElement>('button')];
        const i = f.indexOf(document.activeElement as HTMLElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length]?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      lockScroll(false);
      (origin ?? prevFocus)?.focus?.({ preventScroll: true });
    };
  }, [close, go, origin]);

  // свайп
  useEffect(() => {
    const el = root.current!;
    let x0 = 0;
    let y0 = 0;
    let on = false;
    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('button')) return;
      on = true;
      x0 = e.clientX;
      y0 = e.clientY;
    };
    const up = (e: PointerEvent) => {
      if (!on) return;
      on = false;
      const dx = e.clientX - x0;
      const dy = e.clientY - y0;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
      else if (Math.abs(dx) < 6 && Math.abs(dy) < 6 && (e.target as HTMLElement).classList.contains('lb-bg')) close();
    };
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
    };
  }, [go, close]);

  return createPortal(
    <div className="lb" ref={root} role="dialog" aria-modal="true" aria-label={`Кадр ${index + 1} из ${items.length}: ${item.caption}`} data-lenis-prevent>
      <div className="lb-bg" />
      <div className="lb-stage">
        <div className="lb-img" ref={imgWrap} style={{ aspectRatio: `${m.w} / ${m.h}` }}>
          <picture key={item.id}>
            <source type="image/avif" srcSet={srcset(item.id, 'avif')} sizes="100vw" />
            <img src={mediaSrc(item.id, m.widths[m.widths.length - 1])} srcSet={srcset(item.id, 'webp')} sizes="100vw" alt={m.alt} width={m.w} height={m.h} draggable={false} />
          </picture>
        </div>
      </div>
      <p className="lb-cap lb-ui mono-sm">
        <span className="lb-count">
          {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
        </span>
        <span>{item.caption}</span>
      </p>
      <button type="button" className="lb-btn lb-prev lb-ui" onClick={() => go(-1)} aria-label="Предыдущий кадр">
        ←
      </button>
      <button type="button" className="lb-btn lb-next lb-ui" onClick={() => go(1)} aria-label="Следующий кадр">
        →
      </button>
      <button type="button" className="lb-close lb-ui mono-sm" onClick={close} aria-label="Закрыть просмотр">
        Закрыть ✕
      </button>
    </div>,
    document.body,
  );
}
