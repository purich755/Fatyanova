'use client';
// № 10 — «Поклон». Полноэкранный поклон всех участников; в последние ~100vh бархат медленно сходится,
// оставляя по центру освещённую сцену с контактами. Атласная лента завязывается бантом над кнопками.
import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, prefersReduced, PIN_QUERY } from '@/lib/gsap';
import { FINALE, SITE } from '@/lib/data';
import { lines } from '@/lib/text';
import Photo from './Photo';
import { Drapes } from './Curtain';

function Bow() {
  return (
    <svg className="bow" viewBox="0 0 240 150" aria-hidden="true">
      <defs>
        <linearGradient id="bow-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F8D6E5" />
          <stop offset=".5" stopColor="#E7A3C3" />
          <stop offset="1" stopColor="#C27699" />
        </linearGradient>
        <linearGradient id="bow-back" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#A9587E" />
          <stop offset="1" stopColor="#874062" />
        </linearGradient>
      </defs>
      <g className="bow-g" stroke="#F6CFE0" strokeWidth="1.2" strokeLinejoin="round">
        <path pathLength={1} fill="url(#bow-back)" d="M116 64C100 90 80 115 60 140L75 147C92 121 108 97 124 66Z" />
        <path pathLength={1} fill="url(#bow-back)" d="M124 64C140 92 158 116 182 139L167 147C150 122 134 98 116 66Z" />
        <path pathLength={1} fill="url(#bow-front)" d="M120 60C95 28 40 8 28 40C20 66 72 80 120 60Z" />
        <path pathLength={1} fill="url(#bow-front)" d="M120 60C145 28 200 8 212 40C220 66 168 80 120 60Z" />
        <path pathLength={1} fill="url(#bow-back)" opacity=".55" d="M118 60C98 44 58 33 47 44C60 52 92 61 118 60Z" />
        <path pathLength={1} fill="url(#bow-back)" opacity=".55" d="M122 60C142 44 182 33 193 44C180 52 148 61 122 60Z" />
        <path pathLength={1} fill="url(#bow-front)" d="M120 48C128 48 132 54 132 61C132 69 127 74 120 74C113 74 108 69 108 61C108 54 112 48 120 48Z" />
      </g>
    </svg>
  );
}

export default function CurtainCall() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const left = el.querySelector<HTMLElement>('.drape--l')!;
    const right = el.querySelector<HTMLElement>('.drape--r')!;
    const bowPaths = el.querySelectorAll<SVGPathElement>('.bow path');
    const reduced = prefersReduced();
    el.dataset.live = '1';
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set([left, right], { scaleX: 0.06 });
        return;
      }
      gsap.set(bowPaths, { strokeDasharray: 1, strokeDashoffset: 1, fillOpacity: 0 });
      gsap
        .timeline({ scrollTrigger: { trigger: el.querySelector('.cc-panel'), start: 'top 75%', once: true } })
        .to(bowPaths, { strokeDashoffset: 0, duration: 0.9, stagger: 0.12, ease: 'power2.inOut' })
        .to(bowPaths, { fillOpacity: 1, duration: 0.6, stagger: 0.05 }, '-=0.4')
        .from(el.querySelector('.bow'), { scale: 0.85, rotation: -6, duration: 1.4, ease: 'elastic.out(1, 0.5)' }, 0);

      const mm = gsap.matchMedia();
      mm.add(PIN_QUERY, () => {
        gsap.set([left, right], { scaleX: 0.04 });
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top top', end: '+=100%', pin: el.querySelector('.cc-pin'), scrub: 0.8 } });
        tl.to([left, right], { scaleX: 0.66, ease: 'power2.inOut', duration: 1 }, 0)
          .to(el.querySelector('.cc-photo'), { scale: 1.06, ease: 'none', duration: 1 }, 0)
          .to(el.querySelector('.cc-dim'), { opacity: 0.85, ease: 'none', duration: 1 }, 0)
          .fromTo(el.querySelector('.cc-light'), { opacity: 0.4 }, { opacity: 1, ease: 'none', duration: 1 }, 0);
      });
      mm.add('(max-width: 899px) and (prefers-reduced-motion: no-preference)', () => {
        gsap.set([left, right], { scaleX: 0.04 });
        gsap.to([left, right], { scaleX: 0.14, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom bottom', scrub: true } });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section className="cc stage" id="contacts" ref={ref} data-tone="stage" aria-labelledby="cc-title">
      <div className="cc-pin">
        <Photo id={FINALE.photo} sizes="100vw" className="fill cc-photo" pos="50% 40%" posMobile="42% 50%" />
        <div className="cc-dim" aria-hidden="true" />
        <div className="cc-light" aria-hidden="true" />
        <Drapes className="drapes--close" />
        <div className="cc-panel">
          <p className="no cc-no">№ 07 · Поклон</p>
          <h2 className="h2 cc-title" id="cc-title">
            {lines(FINALE.title)}
          </h2>
          <Bow />
          <a href={SITE.phoneHref} className="cc-phone">
            {SITE.phone}
          </a>
          <div className="cc-actions">
            <a href={SITE.vk} className="btn" target="_blank" rel="noopener noreferrer" data-magnet>
              {FINALE.vkLabel} <span className="arr">↗</span>
            </a>
          </div>
          <p className="mono cc-city">{SITE.city}</p>
        </div>
      </div>
    </section>
  );
}
