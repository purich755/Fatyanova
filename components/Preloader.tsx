'use client';
// № 00 — «Третий звонок». Три точки загораются по очереди, затем сливаются в полоску рампы внизу.
// Один раз за сессию: флаг в sessionStorage, скрытие до первой отрисовки — скрипт в <head> (data-bell="seen").
// CSS-страховка: если гидратация не случилась, оверлей сам уходит через 4 с.
import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { PRELOADER } from '@/lib/data';

declare global {
  interface Window {
    __faOpened?: boolean;
  }
}

export function openCurtain() {
  if (window.__faOpened) return;
  window.__faOpened = true;
  window.dispatchEvent(new Event('fa:open'));
}

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = root.current!;
    const seen = document.documentElement.dataset.bell === 'seen';
    if (seen) {
      setDone(true);
      openCurtain();
      return;
    }
    el.dataset.live = '1';
    try {
      sessionStorage.setItem('fa-bell', '1');
    } catch {}
    const dots = el.querySelectorAll<HTMLElement>('.pl-dot');
    const words = el.querySelectorAll<HTMLElement>('.pl-word');
    const bar = el.querySelector<HTMLElement>('.pl-bar')!;
    const finish = () => {
      openCurtain();
      setDone(true);
    };
    const tl = gsap.timeline({ onComplete: finish });
    dots.forEach((d, i) => {
      tl.to(d, { backgroundColor: '#FFC14D', boxShadow: '0 0 22px 6px rgba(255,193,77,.55)', scale: 1, duration: 0.22, ease: 'power2.out' }, i * 0.42)
        .fromTo(words[i], { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.25 }, i * 0.42)
        .to(words[i], { autoAlpha: i === 2 ? 1 : 0.35, duration: 0.2 }, i * 0.42 + 0.34);
    });
    tl.to(words, { autoAlpha: 0, duration: 0.2 }, 1.3)
      .to(dots, { y: () => window.innerHeight * 0.5 - 2, scale: 0.4, duration: 0.42, ease: 'power3.in', stagger: 0.03 }, 1.32)
      .to(bar, { scaleX: 1, duration: 0.38, ease: 'power3.out' }, 1.68)
      .to(dots, { autoAlpha: 0, duration: 0.1 }, 1.7)
      .to(el, { autoAlpha: 0, duration: 0.35, ease: 'power1.out' }, 1.92);
    const skip = () => {
      tl.progress(1);
    };
    el.querySelector('.pl-skip')?.addEventListener('click', skip);
    return () => {
      tl.kill();
    };
  }, []);

  if (done) return null;
  return (
    <div className="pl" ref={root} aria-hidden="false" role="status" aria-label="Загрузка: третий звонок">
      <div className="pl-dots">
        {PRELOADER.map((w, i) => (
          <div className="pl-col" key={w}>
            <span className="pl-dot" />
            <span className="pl-word mono">
              {w}
              {i < 2 ? '…' : ''}
            </span>
          </div>
        ))}
      </div>
      <span className="pl-bar" />
      <button type="button" className="pl-skip mono-sm">
        Пропустить
      </button>
    </div>
  );
}
