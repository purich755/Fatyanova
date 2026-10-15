'use client';
// Луч прожектора: огромный слой с «дыркой» света двигается transform-ом (только композитинг).
// Мышь — луч догоняет курсор с lerp 0.12; тач — медленно гуляет сам. Вне экрана — стоит.
import { useEffect, useRef } from 'react';
import { prefersReduced } from '@/lib/gsap';

export default function Spotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const host = el.parentElement!;
    if (prefersReduced()) return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let w = host.clientWidth;
    let h = host.clientHeight;
    let tx = w * 0.42, ty = h * 0.45, x = tx, y = ty;
    let raf = 0;
    let visible = true;
    let pointerSeen = false;
    const t0 = performance.now();

    const frame = (now: number) => {
      raf = 0;
      if (!visible) return;
      if (!fine || !pointerSeen) {
        const t = (now - t0) / 1000;
        tx = w * (0.5 + 0.26 * Math.sin(t * 0.23) + 0.06 * Math.sin(t * 0.71));
        ty = h * (0.46 + 0.12 * Math.sin(t * 0.31 + 1.3));
      }
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      if (!fine || !pointerSeen || Math.abs(tx - x) + Math.abs(ty - y) > 0.4) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf && visible) raf = requestAnimationFrame(frame);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = host.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      pointerSeen = true;
      kick();
    };
    const onResize = () => {
      w = host.clientWidth;
      h = host.clientHeight;
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      kick();
    });
    io.observe(host);
    host.addEventListener('pointermove', onMove);
    window.addEventListener('resize', onResize);
    el.dataset.live = '1';
    kick();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      host.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className="spot" aria-hidden="true">
      <div className="spot-beam" ref={ref} />
    </div>
  );
}
