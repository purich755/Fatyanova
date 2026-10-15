'use client';
// Единая точка регистрации GSAP: ScrollTrigger, SplitText (построчные выезды), Flip (фильтры галереи и лайтбокс).
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText, Flip);
  gsap.defaults({ ease: 'power3.out' });
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export { gsap, ScrollTrigger, SplitText, Flip };

/** prefers-reduced-motion на момент вызова */
export function prefersReduced(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** «большой» режим: десктоп и анимации разрешены — тот же запрос, что в CSS для pin-сцен */
export const PIN_QUERY = '(min-width: 900px) and (prefers-reduced-motion: no-preference)';
export const MOTION_QUERY = '(prefers-reduced-motion: no-preference)';
