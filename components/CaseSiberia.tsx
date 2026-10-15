'use client';
// № 05 — «Из Сибири с любовью». Разворот: слева текст и два «билетика»-переключателя программ,
// справа кадры сменяют друг друга по скроллу (pin). Апрельский билет на секунду зажигает звёзды.
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { gsap } from '@/lib/gsap';
import { CASE } from '@/lib/data';
import { lines } from '@/lib/text';
import Photo from './Photo';
import StarsCanvas from './StarsCanvas';

const CASE_PIN = '(min-width: 900px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)';

export default function CaseSiberia() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [burst, setBurst] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (i: number, focus = false) => {
    if (i === active) return;
    setActive(i);
    if (CASE.tickets[i].id === 'apr') setBurst((b) => b + 1);
    if (focus) tabs.current[i]?.focus();
  };
  const onKey = (e: KeyboardEvent) => {
    const n = CASE.tickets.length;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      select((active + 1) % n, true);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      select((active - 1 + n) % n, true);
    }
  };

  // смена панели — мягкий выезд
  useEffect(() => {
    const panel = ref.current?.querySelector('.case-panel');
    if (!panel || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(panel.children, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.05, overwrite: 'auto' });
  }, [active]);

  useEffect(() => {
    const el = ref.current!;
    const count = el.querySelector<HTMLElement>('.case-count b')!;
    const cap = el.querySelector<HTMLElement>('.case-cap-t')!;
    const mm = gsap.matchMedia();
    mm.add(CASE_PIN, () => {
      const frames = [...el.querySelectorAll<HTMLElement>('.cf')];
      const bar = el.querySelector<HTMLElement>('.case-bar i');
      gsap.set(frames.slice(1), { autoAlpha: 0, scale: 1.08 });
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: '+=150%',
          pin: el.querySelector('.case-pin'),
          scrub: 0.6,
          onUpdate: (st) => {
            const idx = Math.min(frames.length - 1, Math.floor(st.progress * frames.length * 0.999 + 0.15));
            if (count.textContent !== String(idx + 1)) {
              count.textContent = String(idx + 1);
              cap.textContent = CASE.frames[idx].caption;
            }
            if (bar) bar.style.transform = `scaleX(${st.progress.toFixed(3)})`;
          },
        },
      });
      frames.forEach((f, i) => {
        if (!i) return;
        tl.to(f, { autoAlpha: 1, scale: 1, duration: 1, ease: 'power1.inOut' }, i - 0.6).to(frames[i - 1], { scale: 0.98, duration: 1 }, i - 0.6);
      });
      tl.to({}, { duration: 0.4 });
    });
    return () => mm.revert();
  }, []);

  const t = CASE.tickets[active];

  return (
    <section className="case stage" id="case" ref={ref} data-tone="stage" aria-labelledby="case-title">
      <div className="case-pin">
        <StarsCanvas mode="burst" burst={burst} className="case-stars" />
        <div className="wrap case-grid">
          <div className="case-copy">
            <p className="no" data-rv>
              № 03 · Кейс
            </p>
            <h2 className="h2 case-title" id="case-title" data-split>
              {lines(CASE.title)}
            </h2>
            <p className="case-lead" data-rv>
              {CASE.lead}
            </p>

            <div className="tickets" role="tablist" aria-label="Две программы" data-rv>
              {CASE.tickets.map((tk, i) => (
                <button
                  key={tk.id}
                  ref={(b) => {
                    tabs.current[i] = b;
                  }}
                  type="button"
                  role="tab"
                  id={`tk-${tk.id}`}
                  aria-selected={i === active}
                  aria-controls="case-panel"
                  tabIndex={i === active ? 0 : -1}
                  className="ticket"
                  onClick={() => select(i)}
                  onKeyDown={onKey}
                >
                  <span className="ticket-main">
                    <span className="mono-sm ticket-k">Программа № {i + 1}</span>
                    <span className="ticket-date">{tk.date}</span>
                    <span className="mono-sm ticket-y">
                      {tk.year} · {tk.label}
                    </span>
                  </span>
                  <span className="ticket-stub mono-sm" aria-hidden="true">
                    Музей
                    <br />
                    Победы
                  </span>
                </button>
              ))}
            </div>

            <div className="case-panel" id="case-panel" role="tabpanel" aria-labelledby={`tk-${t.id}`}>
              <dl className="facts">
                {t.facts.map((f) => (
                  <div className="fact" key={f.k}>
                    <dt className="mono-sm">{f.k}</dt>
                    <dd>{f.v}</dd>
                  </div>
                ))}
              </dl>
              {t.program && (
                <p className="case-prog">
                  <span className="mono-sm">В программе</span> {t.program.join(' · ')}
                </p>
              )}
            </div>
            <p className="mono-sm case-place">{CASE.place}</p>
          </div>

          <div className="case-media">
            <div className="case-frames">
              {CASE.frames.map((f, i) => (
                <figure className="cf" key={f.id}>
                  <Photo id={f.id} sizes="(max-width: 899px) 86vw, 52vw" className="fill" pos={f.id === 'wide-stage-april12' ? '50% 72%' : '50% 45%'} />
                  <figcaption className="sr-only">{f.caption}</figcaption>
                  <span className="cf-n mono-sm" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </figure>
              ))}
            </div>
            <div className="case-meta mono-sm" aria-hidden="true">
              <span className="case-count">
                Кадр <b>1</b> / {CASE.frames.length}
              </span>
              <span className="case-bar">
                <i />
              </span>
              <span className="case-cap-t">{CASE.frames[0].caption}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
