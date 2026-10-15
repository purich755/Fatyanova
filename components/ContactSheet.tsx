'use client';
// № 08 — «Закулисье и сцена». Контактный лист фотографа: плёнка с перфорацией и номерами кадров,
// перетаскивание с инерцией, колесо листает плёнку внутри секции, лупа 2×, фильтры (Flip), лайтбокс.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Flip, gsap, prefersReduced } from '@/lib/gsap';
import { FILTERS, GALLERY, type Filter } from '@/lib/data';
import Photo from './Photo';
import Lightbox from './Lightbox';
import StageVideos from './StageVideos';

export default function ContactSheet() {
  const ref = useRef<HTMLElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  const [filter, setFilter] = useState<Filter>('Все');
  const [lb, setLb] = useState<{ i: number; origin: HTMLElement | null } | null>(null);

  const items = GALLERY.filter((g) => filter === 'Все' || g.tag === filter);

  const choose = (f: Filter) => {
    if (f === filter) return;
    flipState.current = Flip.getState(strip.current!.querySelectorAll('.frame'));
    setFilter(f);
  };

  useLayoutEffect(() => {
    const s = flipState.current;
    if (!s) return;
    flipState.current = null;
    strip.current!.scrollLeft = 0;
    stripApi.current?.reset();
    if (prefersReduced()) return;
    Flip.from(s, {
      duration: 0.6,
      ease: 'power3.inOut',
      targets: strip.current!.querySelectorAll('.frame:not([data-off])'),
      onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.92 }, { autoAlpha: 1, scale: 1, duration: 0.5, delay: 0.15 }),
    });
  }, [filter]);

  // плёнка: drag с инерцией (мышь), колесо → горизонтальная прокрутка, лупа
  const stripApi = useRef<{ reset: () => void } | null>(null);
  useEffect(() => {
    const el = strip.current!;
    const sec = ref.current!;
    let target = el.scrollLeft;
    let raf = 0;
    let vel = 0;
    let dragging = false;
    let moved = 0;
    let lastX = 0;
    let lastT = 0;
    const max = () => el.scrollWidth - el.clientWidth;
    const loop = () => {
      raf = 0;
      if (!dragging && Math.abs(vel) > 0.3) {
        target = gsap.utils.clamp(0, max(), target - vel);
        vel *= 0.94;
      }
      const cur = el.scrollLeft;
      const next = cur + (target - cur) * 0.2;
      el.scrollLeft = Math.abs(target - next) < 0.5 ? target : next;
      if (Math.abs(target - el.scrollLeft) > 0.5 || (!dragging && Math.abs(vel) > 0.3)) raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    stripApi.current = {
      reset: () => {
        target = 0;
        vel = 0;
      },
    };
    const onScroll = () => {
      if (!raf && !dragging) target = el.scrollLeft;
    };
    const onWheel = (e: WheelEvent) => {
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const m = max();
      if ((d > 0 && target >= m - 1) || (d < 0 && target <= 1)) return; // край — отдаём колесо странице
      e.preventDefault();
      e.stopPropagation();
      vel = 0;
      target = gsap.utils.clamp(0, m, target + d * (e.deltaMode === 1 ? 40 : 1) * 1.1);
      kick();
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      e.preventDefault();
      dragging = true;
      moved = 0;
      vel = 0;
      lastX = e.clientX;
      lastT = performance.now();
      sec.classList.add('is-dragging');
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const now = performance.now();
      moved += Math.abs(dx);
      vel = (dx / Math.max(1, now - lastT)) * 16;
      lastX = e.clientX;
      lastT = now;
      target = gsap.utils.clamp(0, max(), target - dx);
      el.scrollLeft = target;
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      sec.classList.remove('is-dragging');
      kick();
    };
    const onClick = (e: MouseEvent) => {
      if (moved > 6) {
        e.preventDefault();
        e.stopPropagation();
        moved = 0;
      }
    };
    const noDrag = (e: Event) => e.preventDefault();
    el.addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    el.addEventListener('click', onClick, true);
    el.addEventListener('dragstart', noDrag);

    // лупа 2×
    const loupe = sec.querySelector<HTMLElement>('.loupe')!;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const L = 170;
    const onLoupe = (e: PointerEvent) => {
      const img = (e.target as HTMLElement).closest('.frame')?.querySelector('img');
      if (!img || dragging || !fine) {
        loupe.classList.remove('is-on');
        return;
      }
      const r = img.getBoundingClientRect();
      const s = sec.getBoundingClientRect();
      const rx = e.clientX - r.left;
      const ry = e.clientY - r.top;
      // object-fit: cover — считаем реальный масштаб картинки
      const k = Math.max(r.width / img.naturalWidth, r.height / img.naturalHeight) * 2;
      const iw = img.naturalWidth * k;
      const ih = img.naturalHeight * k;
      const ox = (iw - r.width * 2) / 2;
      const oy = (ih - r.height * 2) / 2;
      loupe.style.backgroundImage = `url("${img.currentSrc || img.src}")`;
      loupe.style.backgroundSize = `${iw}px ${ih}px`;
      loupe.style.backgroundPosition = `${-(rx * 2 + ox - L / 2)}px ${-(ry * 2 + oy - L / 2)}px`;
      loupe.style.transform = `translate3d(${e.clientX - s.left - L / 2}px, ${e.clientY - s.top - L / 2}px, 0)`;
      loupe.classList.add('is-on');
    };
    const offLoupe = () => loupe.classList.remove('is-on');
    if (fine) {
      el.addEventListener('pointermove', onLoupe);
      el.addEventListener('pointerleave', offLoupe);
    }
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      el.removeEventListener('click', onClick, true);
      el.removeEventListener('dragstart', noDrag);
      el.removeEventListener('pointermove', onLoupe);
      el.removeEventListener('pointerleave', offLoupe);
    };
  }, []);

  return (
    <section className="sheet stage" id="gallery" ref={ref} data-tone="stage" aria-labelledby="gallery-title">
      <div className="wrap sheet-head">
        <div>
          <p className="no" data-rv>
            № 06 · Контактный лист
          </p>
          <h2 className="h2" id="gallery-title" data-split>
            Закулисье <em>и сцена</em>
          </h2>
        </div>
        <div className="chips" role="group" aria-label="Фильтр кадров" data-rv>
          {FILTERS.map((f) => (
            <button key={f} type="button" className="chip mono-sm" aria-pressed={filter === f} onClick={() => choose(f)}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="film">
        <div className="film-strip" ref={strip} tabIndex={0} aria-label="Плёнка с кадрами — листайте колесом, перетаскиванием или клавишами">
          <ul className="film-row">
            {GALLERY.map((g, i) => {
              const off = !(filter === 'Все' || g.tag === filter);
              const vi = items.findIndex((x) => x.id === g.id);
              return (
                <li className="frame" key={g.id} data-flip-id={g.id} data-off={off ? '' : undefined} hidden={off}>
                  <button type="button" className="frame-btn" onClick={(e) => setLb({ i: vi, origin: e.currentTarget })} aria-label={`Открыть кадр ${String(i + 1).padStart(2, '0')}: ${g.caption}`}>
                    <span className="frame-img">
                      <Photo id={g.id} sizes="(max-width: 767px) 70vw, 30vw" className="fill" draggable={false} />
                    </span>
                  </button>
                  <span className="frame-meta mono-sm" aria-hidden="true">
                    <span className="frame-no">КАДР {String(i + 1).padStart(2, '0')}</span>
                    <span className="frame-tag">{g.tag}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <p className="wrap film-hint mono-sm" aria-hidden="true">
          ← тяните плёнку или крутите колесо →
        </p>
      </div>
      <div className="loupe" aria-hidden="true" />

      <StageVideos />

      {lb && <Lightbox items={items} index={lb.i} origin={lb.origin} onClose={() => setLb(null)} onIndex={(i) => setLb({ i, origin: lb.origin })} />}
    </section>
  );
}
