'use client';
// Lenis + ScrollTrigger на одном тикере GSAP. Якоря ведёт скрипт (scroll-behavior в CSS не трогаем — см. грабли Lenis).
import Lenis from 'lenis';
import { gsap, ScrollTrigger, prefersReduced } from './gsap';

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

let raf: ((t: number) => void) | null = null;

export function startSmoothScroll(): Lenis | null {
  if (window.__lenis) return window.__lenis;
  if (prefersReduced()) return null;
  const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, syncTouch: false });
  lenis.on('scroll', ScrollTrigger.update);
  raf = (t: number) => lenis.raf(t * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  window.__lenis = lenis;
  return lenis;
}

export function stopSmoothScroll() {
  const lenis = window.__lenis;
  if (!lenis) return;
  if (raf) gsap.ticker.remove(raf);
  lenis.destroy();
  window.__lenis = undefined;
}

/** Плавный переход к якорю: через Lenis, если он включён, иначе нативно. */
export function scrollToTarget(target: string | HTMLElement, offset = 0) {
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  const lenis = window.__lenis;
  if (lenis) {
    lenis.scrollTo(el, { offset, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
  } else {
    const y = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top: y, behavior: prefersReduced() ? 'auto' : 'smooth' });
  }
}

/** Блокировка прокрутки страницы (лайтбокс) */
export function lockScroll(lock: boolean) {
  const lenis = window.__lenis;
  if (lenis) (lock ? lenis.stop() : lenis.start());
  document.documentElement.style.overflow = lock ? 'hidden' : '';
}
