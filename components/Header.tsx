'use client';
// Шапка: монограмма «АФ» в круге света, навигация, телефон. Вниз — прячется, вверх — появляется.
// Цвет — по фактуре секции под шапкой (data-tone="paper" | "stage").
import { useEffect, useRef } from 'react';
import { NAV, SITE } from '@/lib/data';

export default function Header() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current!;
    let last = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const down = y > last + 4;
        const up = y < last - 4;
        if (y < 120) el.dataset.hidden = '0';
        else if (down) el.dataset.hidden = '1';
        else if (up) el.dataset.hidden = '0';
        el.dataset.scrolled = y > 40 ? '1' : '0';
        last = y;
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // фактура под шапкой: следим за секциями, пересекающими полосу 0–header
    const sections = [...document.querySelectorAll<HTMLElement>('[data-tone]')];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) el.dataset.tone = (e.target as HTMLElement).dataset.tone;
      },
      { rootMargin: '-30px 0px -96% 0px' },
    );
    sections.forEach((s) => io.observe(s));
    return () => {
      window.removeEventListener('scroll', onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <header className="hdr" ref={ref} data-tone="stage" data-hidden="0">
      <div className="hdr-in wrap">
        <a href="#top" className="hdr-mark" aria-label={`АФ — ${SITE.name}, в начало`}>
          <span className="hdr-glow" aria-hidden="true" />
          <span className="hdr-af">АФ</span>
        </a>
        <nav className="hdr-nav" aria-label="Разделы">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="hdr-link">
              {n.label}
            </a>
          ))}
        </nav>
        <a href="#program" className="hdr-prog mono-sm">
          Программа
        </a>
        <a href={SITE.phoneHref} className="hdr-tel">
          <span className="hdr-tel-full">{SITE.phone}</span>
          <span className="hdr-tel-ico" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M5 3.5h3.2l1.6 4.2-2 1.3a11 11 0 0 0 7.2 7.2l1.3-2 4.2 1.6V19a1.6 1.6 0 0 1-1.7 1.6C10.4 20.1 3.9 13.6 3.4 5.2A1.6 1.6 0 0 1 5 3.5Z" />
            </svg>
          </span>
          <span className="sr-only">Позвонить</span>
        </a>
      </div>
    </header>
  );
}
