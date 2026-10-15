'use client';
// Звёзды на canvas. mode="field" — неподвижное небо (рисуется один раз и при ресайзе);
// mode="burst" — по смене `burst` небо на секунду наполняется редкими звёздами и гаснет (День космонавтики).
import { useEffect, useRef } from 'react';
import { prefersReduced } from '@/lib/gsap';

type Star = { x: number; y: number; r: number; a: number; d: number; tw: number };

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export default function StarsCanvas({ mode, burst = 0, density = 1, className = '' }: { mode: 'field' | 'burst'; burst?: number; density?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const stars = useRef<Star[]>([]);
  const size = useRef({ w: 0, h: 0, dpr: 1 });

  // размеры и набор звёзд
  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext('2d')!;
    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = c.clientWidth;
      const h = c.clientHeight;
      size.current = { w, h, dpr };
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const rnd = seeded(mode === 'field' ? 7 : 42);
      const n = Math.round(((w * h) / (mode === 'field' ? 5200 : 9000)) * density);
      stars.current = Array.from({ length: n }, () => ({
        x: rnd() * w,
        y: rnd() * h,
        r: rnd() < 0.08 ? 1.3 + rnd() * 1.1 : 0.4 + rnd() * 0.8,
        a: 0.25 + rnd() * 0.75,
        d: rnd() * 0.6,
        tw: rnd() * Math.PI * 2,
      }));
      if (mode === 'field') draw(1, 0);
      else ctx.clearRect(0, 0, w, h);
    };
    const draw = (k: number, t: number) => {
      const { w, h } = size.current;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars.current) {
        const local = mode === 'burst' ? Math.max(0, Math.min(1, (k - s.d) / 0.4)) * Math.max(0, Math.min(1, (1.9 - k - s.d * 0.5) / 0.5)) : 1;
        if (local <= 0) continue;
        const a = s.a * local * (mode === 'burst' ? 0.7 + 0.3 * Math.sin(t * 9 + s.tw) : 1);
        ctx.globalAlpha = a;
        ctx.fillStyle = s.r > 1.2 ? '#FFE3A8' : '#F4EFE6';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (s.r > 1.2) {
          ctx.globalAlpha = a * 0.18;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };
    (c as HTMLCanvasElement & { __draw?: typeof draw }).__draw = draw;
    build();
    const ro = new ResizeObserver(() => build());
    ro.observe(c);
    return () => ro.disconnect();
  }, [mode, density]);

  // вспышка
  useEffect(() => {
    if (mode !== 'burst' || !burst || prefersReduced()) return;
    const c = ref.current as HTMLCanvasElement & { __draw?: (k: number, t: number) => void };
    const t0 = performance.now();
    let raf = 0;
    const DUR = 1900;
    const tick = (now: number) => {
      const p = (now - t0) / DUR;
      c.__draw?.(p * 1.9, (now - t0) / 1000);
      if (p < 1) raf = requestAnimationFrame(tick);
      else c.getContext('2d')!.clearRect(0, 0, size.current.w, size.current.h);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [burst, mode]);

  return <canvas ref={ref} className={`stars ${className}`} aria-hidden="true" />;
}
