'use client';
// Общая «режиссура»: Lenis, якоря, построчные выезды заголовков, мягкие появления [data-rv],
// прорисовка лент, магнитные кнопки. Стоит последним в дереве — пины секций к этому моменту уже созданы.
import { useEffect } from 'react';
import { gsap, ScrollTrigger, SplitText, prefersReduced } from '@/lib/gsap';
import { startSmoothScroll, stopSmoothScroll, scrollToTarget } from '@/lib/smooth-scroll';

export default function Motion() {
  useEffect(() => {
    const reduced = prefersReduced();
    startSmoothScroll();

    // якоря — скриптом (у html нет scroll-behavior: smooth)
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
      const id = a.getAttribute('href')!;
      if (id === '#') return e.preventDefault();
      const target = document.querySelector<HTMLElement>(id);
      if (!target) return;
      e.preventDefault();
      scrollToTarget(target, id === '#top' ? 0 : -8);
      history.replaceState(null, '', id);
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    };
    document.addEventListener('click', onClick);

    const ctx = gsap.context(() => {
      if (reduced) return;

      // заголовки: строки выезжают из-под маски
      document.querySelectorAll<HTMLElement>('[data-split]').forEach((h) => {
        SplitText.create(h, {
          type: 'lines',
          mask: 'lines',
          aria: 'none',
          autoSplit: true,
          onSplit(self) {
            self.masks.forEach((m) => m.classList.add('split-mask'));
            return gsap.from(self.lines, {
              yPercent: 110,
              duration: 1.05,
              stagger: 0.08,
              ease: 'power4.out',
              scrollTrigger: { trigger: h, start: 'top 86%', once: true },
            });
          },
        });
      });

      // текст и мелкие блоки: fade + 24px
      gsap.set('[data-rv]', { autoAlpha: 0, y: 24 });
      ScrollTrigger.batch('[data-rv]', {
        start: 'top 90%',
        once: true,
        onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.07, ease: 'power3.out', overwrite: 'auto' }),
      });

      // ленты: прорисовка по скроллу
      document.querySelectorAll<SVGSVGElement>('[data-ribbon]').forEach((svg) => {
        const draw = svg.querySelector('.ribbon-draw');
        if (!draw) return;
        gsap.fromTo(draw, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: svg, start: 'top 95%', end: 'bottom 30%', scrub: 0.6 } });
      });
    });

    // магнитные кнопки
    const offs: (() => void)[] = [];
    if (!reduced && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      document.querySelectorAll<HTMLElement>('[data-magnet]').forEach((b) => {
        const xTo = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3' });
        const yTo = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3' });
        const move = (e: PointerEvent) => {
          const r = b.getBoundingClientRect();
          xTo((e.clientX - (r.left + r.width / 2)) * 0.3);
          yTo((e.clientY - (r.top + r.height / 2)) * 0.4);
        };
        const leave = () => {
          xTo(0);
          yTo(0);
        };
        b.addEventListener('pointermove', move);
        b.addEventListener('pointerleave', leave);
        offs.push(() => {
          b.removeEventListener('pointermove', move);
          b.removeEventListener('pointerleave', leave);
        });
      });
    }

    // пересчёт после шрифтов и картинок
    ScrollTrigger.sort();
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh);
    // якорь в адресе при загрузке
    if (location.hash.length > 1) {
      const t = document.querySelector<HTMLElement>(location.hash);
      if (t) setTimeout(() => scrollToTarget(t, -8), 400);
    }

    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('load', refresh);
      offs.forEach((f) => f());
      ctx.revert();
      stopSmoothScroll();
    };
  }, []);

  return null;
}
