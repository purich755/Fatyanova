'use client';
// № 01 — «Занавес». Бархат из двух половин (CSS-складки), после третьего звонка собирается к кулисам,
// открывая сцену: медленный Ken Burns по двум кадрам, луч прожектора за курсором, бегущая строка площадок.
import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, SplitText, prefersReduced, PIN_QUERY } from '@/lib/gsap';
import { HERO, SITE } from '@/lib/data';
import { rich } from '@/lib/text';
import Photo from './Photo';
import Spotlight from './Spotlight';
import VenuesTicker from './VenuesTicker';

export function Drapes({ className = '' }: { className?: string }) {
  return (
    <div className={`drapes ${className}`} aria-hidden="true">
      <div className="drape drape--l">
        <span className="drape-sheen" />
      </div>
      <div className="drape drape--r">
        <span className="drape-sheen" />
      </div>
      <div className="valance" />
    </div>
  );
}

export default function Curtain() {
  const ref = useRef<HTMLElement>(null);
  // второй кадр Ken Burns появляется на 7-й секунде — грузим его после load, чтобы не спорил с LCP
  const [slideB, setSlideB] = useState(false);
  useEffect(() => {
    const go = () => setTimeout(() => setSlideB(true), 900);
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go, { once: true });
  }, []);

  useEffect(() => {
    const el = ref.current!;
    const reduced = prefersReduced();
    const left = el.querySelector<HTMLElement>('.drape--l')!;
    const right = el.querySelector<HTMLElement>('.drape--r')!;
    const h1 = el.querySelector<HTMLElement>('h1')!;
    const fades = el.querySelectorAll<HTMLElement>('[data-hero-fade]');
    el.dataset.live = '1';

    if (reduced) {
      gsap.set([left, right], { scaleX: 0.06 });
      return;
    }

    const ctx = gsap.context(() => {
      const split = SplitText.create(h1, { type: 'lines', mask: 'lines', linesClass: 'hl', aria: 'none', autoSplit: false });
      split.masks?.forEach((m) => m.classList.add('split-mask'));
      gsap.set(split.lines, { yPercent: 110 });
      gsap.set(fades, { autoAlpha: 0, y: 24 });
      gsap.set([left, right], { scaleX: 1 });

      const open = () => {
        const wide = window.innerWidth >= 900;
        const tl = gsap.timeline();
        tl.to([left, right], { scaleX: wide ? 0.12 : 0.05, duration: 1.4, ease: 'power4.inOut' })
          .fromTo(el.querySelector('.hero-stage'), { scale: 1.06 }, { scale: 1, duration: 2.2, ease: 'power3.out' }, 0.1)
          .to(split.lines, { yPercent: 0, duration: 1.05, stagger: 0.08, ease: 'power4.out' }, 0.75)
          .to(fades, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08 }, 1.05);
        el.dataset.open = '1';
      };
      if (window.__faOpened) gsap.delayedCall(0.15, open);
      else window.addEventListener('fa:open', () => open(), { once: true });

      // лист программки наезжает на закреплённую сцену (только десктоп)
      const mm = gsap.matchMedia();
      mm.add(PIN_QUERY, () => {
        ScrollTrigger.create({ trigger: el, start: 'top top', end: '+=100%', pin: true, pinSpacing: false });
        gsap.to(el.querySelector('.hero-dim'), { opacity: 0.75, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: '+=100%', scrub: true } });
        gsap.to(el.querySelector('.hero-in'), { yPercent: -8, scale: 0.97, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: '+=100%', scrub: true } });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section className="hero stage" id="top" ref={ref} data-tone="stage" aria-labelledby="hero-title">
      <div className="hero-in">
        <div className="hero-stage">
          <Photo id={HERO.slides[0]} sizes="100vw" priority className="fill hero-slide hero-slide--a" pos="50% 42%" posMobile="64% 50%" />
          {slideB && <Photo id={HERO.slides[1]} sizes="100vw" className="fill hero-slide hero-slide--b" pos="50% 30%" posMobile="56% 40%" />}
        </div>
        <Spotlight />
        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-dim" aria-hidden="true" />

        <div className="hero-copy wrap">
          <p className="mono hero-kicker" data-hero-fade>
            {HERO.kicker}
          </p>
          <h1 className="display hero-title" id="hero-title">
            {HERO.title.map((t, i) => (
              <span className="ln" key={i}>
                {rich(t)}{' '}
              </span>
            ))}
          </h1>
          <p className="lead hero-lead" data-hero-fade>
            {HERO.lead}
          </p>
          <div className="hero-actions" data-hero-fade>
            <a href="#contacts" className="btn" data-magnet>
              {HERO.cta} <span className="arr">→</span>
            </a>
            <a href="#gallery" className="link-u hero-watch">
              {HERO.watch} <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
        <VenuesTicker />
      </div>
      <Drapes />
      <span className="sr-only">{SITE.name}</span>
    </section>
  );
}
