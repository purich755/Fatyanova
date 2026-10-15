'use client';
// № 07 — «Что мы делаем». Строки как номера программы. На десктопе за курсором плывёт фото-превью
// (gsap.quickTo), на тач-экранах строка раскрывается аккордеоном с фото.
import { useEffect, useRef, useState } from 'react';
import { gsap, prefersReduced } from '@/lib/gsap';
import { SERVICES } from '@/lib/data';
import Photo from './Photo';

export default function Services() {
  const ref = useRef<HTMLElement>(null);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current!;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 900px)');
    if (!fine.matches) return;
    const list = el.querySelector<HTMLElement>('.svc-list')!;
    const float = el.querySelector<HTMLElement>('.svc-float')!;
    const imgs = [...float.querySelectorAll<HTMLElement>('.svc-float-i')];
    const reduced = prefersReduced();
    const xTo = gsap.quickTo(float, 'x', { duration: reduced ? 0.01 : 0.55, ease: 'power3' });
    const yTo = gsap.quickTo(float, 'y', { duration: reduced ? 0.01 : 0.55, ease: 'power3' });
    const rTo = gsap.quickTo(float, 'rotation', { duration: 0.8, ease: 'power3' });
    let lastX = 0;
    let cur = -1;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      xTo(x + 28);
      yTo(y - 120);
      if (!reduced) rTo(gsap.utils.clamp(-8, 8, (e.clientX - lastX) * 0.6));
      lastX = e.clientX;
    };
    const onOver = (e: PointerEvent) => {
      const row = (e.target as HTMLElement).closest<HTMLElement>('.svc');
      if (!row) return;
      const i = Number(row.dataset.i);
      if (i === cur) return;
      cur = i;
      imgs.forEach((im, k) => im.classList.toggle('is-on', k === i));
      float.classList.add('is-vis');
    };
    const onLeave = () => {
      cur = -1;
      float.classList.remove('is-vis');
    };
    list.addEventListener('pointermove', onMove);
    list.addEventListener('pointerover', onOver);
    list.addEventListener('pointerleave', onLeave);
    return () => {
      list.removeEventListener('pointermove', onMove);
      list.removeEventListener('pointerover', onOver);
      list.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <section className="svc-sec paper" id="services" ref={ref} data-tone="paper" aria-labelledby="svc-title">
      <div className="wrap svc-grid">
        <header className="svc-head">
          <p className="no" data-rv>
            № 05 · Номера программы
          </p>
          <h2 className="h2" id="svc-title" data-split>
            Что мы <em>делаем</em>
          </h2>
          <p className="svc-intro" data-rv>
            Всё, что нужно коллективу между репетиционным залом и большой сценой.
          </p>
        </header>
        <ol className="svc-list">
          {SERVICES.map((s, i) => {
            const isOpen = openIdx === i;
            return (
              <li className="svc" key={s.title} data-i={i} data-open={isOpen ? '1' : '0'} data-rv>
                <button type="button" className="svc-row" aria-expanded={isOpen} aria-controls={`svc-p-${i}`} onClick={() => setOpenIdx(isOpen ? null : i)}>
                  <span className="svc-n mono">{String(i + 1).padStart(2, '0')}</span>
                  <span className="svc-t">{s.title}</span>
                  <span className="svc-d">{s.text}</span>
                  <span className="svc-plus" aria-hidden="true" />
                </button>
                <div className="svc-panel" id={`svc-p-${i}`}>
                  <div className="svc-panel-in">
                    <p className="svc-d-m">{s.text}</p>
                    <div className="svc-ph">
                      <Photo id={s.photo} sizes="90vw" className="fill" />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="svc-float" aria-hidden="true">
        {SERVICES.map((s) => (
          <div className="svc-float-i" key={s.title}>
            <Photo id={s.photo} sizes="300px" className="fill" alt="" />
          </div>
        ))}
      </div>
    </section>
  );
}
