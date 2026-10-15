'use client';
// № 06 — «Танцуем со звёздами». Пять звёзд-имён на ночном небе; по скроллу соединяются линиями.
// Наведение / нажатие — сбоку выезжает карточка-программка с фактом и фото НАШИХ коллективов.
// Мобильная версия — горизонтальный свайп по карточкам, линия созвездия над ними дорисовывается по свайпу.
import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, prefersReduced } from '@/lib/gsap';
import { STARS } from '@/lib/data';
import Photo from './Photo';
import StarsCanvas from './StarsCanvas';

// линия созвездия в координатах 1000×600 (x, y звёзд — проценты)
const VB = { w: 1000, h: 600 };
const pts = STARS.map((s) => [(s.x / 100) * VB.w, (s.y / 100) * VB.h]);
const LINE = 'M' + pts.map(([x, y]) => `${x} ${y}`).join('L');
// мини-созвездие для мобильной ленты: звёзды по горизонтали равномерно
const MINI = 'M' + STARS.map((s, i) => `${i * 200 + 100} ${s.y * 0.6 + 6}`).join('L');

export default function Constellation() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = ref.current!;
    const line = el.querySelector<SVGPathElement>('.sky-line');
    const mini = el.querySelector<SVGPathElement>('.mini-line');
    const track = el.querySelector<HTMLElement>('.sky-cards');
    const reduced = prefersReduced();
    const ctx = gsap.context(() => {
      if (line && !reduced) {
        gsap.fromTo(line, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: el.querySelector('.sky'), start: 'top 80%', end: 'center 45%', scrub: 0.8 } });
        gsap.from(el.querySelectorAll('.star'), { autoAlpha: 0, scale: 0.4, stagger: 0.12, duration: 0.8, ease: 'back.out(2)', scrollTrigger: { trigger: el.querySelector('.sky'), start: 'top 75%', once: true } });
      }
    }, el);

    // мобильная лента: линия и активная звезда по положению свайпа
    const onStrip = () => {
      if (!track || !mini) return;
      const max = track.scrollWidth - track.clientWidth;
      const p = max > 0 ? track.scrollLeft / max : 0;
      mini.style.strokeDashoffset = String(1 - (0.12 + p * 0.88));
      const idx = Math.round(p * (STARS.length - 1));
      el.querySelectorAll('.mini-star').forEach((s, i) => s.classList.toggle('is-on', i <= idx));
    };
    track?.addEventListener('scroll', onStrip, { passive: true });
    onStrip();
    return () => {
      ctx.revert();
      track?.removeEventListener('scroll', onStrip);
    };
  }, []);

  // открытая карточка — выезд сбоку
  useEffect(() => {
    const card = ref.current?.querySelector<HTMLElement>('.sky-card');
    if (!card || prefersReduced()) return;
    gsap.fromTo(card, { x: 40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.55, ease: 'power3.out', overwrite: 'auto' });
  }, [active, open]);

  const show = (i: number) => {
    setActive(i);
    setOpen(true);
  };

  const s = STARS[active];

  return (
    <section className="sky-sec stage" id="stars" ref={ref} data-tone="stage" aria-labelledby="stars-title">
      <StarsCanvas mode="field" className="sky-field" />
      <div className="wrap sky-head">
        <p className="no" data-rv>
          № 04 · Звёзды
        </p>
        <h2 className="h2" id="stars-title" data-split>
          Танцуем <em>со звёздами</em>
        </h2>
        <p className="mono sky-lit" data-rv>
          — буквально
        </p>
        <p className="sky-hint mono-sm" data-rv>
          Наведите на звезду или нажмите — откроется страница программки
        </p>
      </div>

      {/* десктоп: небо и карточка-программка */}
      <div className="wrap sky-wrap">
        <div className="sky">
          <svg className="sky-svg" viewBox={`0 0 ${VB.w} ${VB.h}`} preserveAspectRatio="none" aria-hidden="true">
            <path className="sky-line" d={LINE} pathLength={1} />
          </svg>
          {STARS.map((st, i) => (
            <button
              key={st.id}
              type="button"
              className="star"
              style={{ left: `${st.x}%`, top: `${st.y}%` }}
              aria-expanded={open && active === i}
              aria-controls="sky-card"
              data-on={active === i ? '1' : '0'}
              onMouseEnter={() => show(i)}
              onFocus={() => show(i)}
              onClick={() => show(i)}
            >
              <span className="star-dot" aria-hidden="true" />
              <span className="star-name">{st.name}</span>
            </button>
          ))}
        </div>
        <aside className="sky-card paper" id="sky-card" aria-live="polite">
          <p className="mono-sm sky-card-k">Страница программки · № 0{active + 1}</p>
          <h3 className="h3 sky-card-name">{s.name}</h3>
          <p className="sky-card-fact">{s.fact}</p>
          <p className="mono-sm sky-card-meta">{s.meta}</p>
          <figure className="sky-card-ph">
            <div className="sky-card-frame">
              <Photo id={s.photo} sizes="320px" className="fill" key={s.photo} />
            </div>
            <figcaption className="cap">На фото — коллективы центра</figcaption>
          </figure>
        </aside>
      </div>

      {/* мобильные: мини-созвездие + свайп по карточкам */}
      <div className="sky-mobile">
        <svg className="mini" viewBox="0 0 1000 90" aria-hidden="true">
          <path className="mini-line" d={MINI} pathLength={1} />
          {STARS.map((st, i) => (
            <circle key={st.id} className="mini-star" cx={i * 200 + 100} cy={st.y * 0.6 + 6} r="13" />
          ))}
        </svg>
        <ul className="sky-cards" aria-label="Артисты, с которыми выступали коллективы центра">
          {STARS.map((st) => (
            <li className="sky-mcard paper" key={st.id}>
              <h3 className="h3">{st.name}</h3>
              <p className="sky-card-fact">{st.fact}</p>
              <p className="mono-sm sky-card-meta">{st.meta}</p>
              <div className="sky-card-frame">
                <Photo id={st.photo} sizes="80vw" className="fill" />
              </div>
              <p className="cap">На фото — коллективы центра</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
