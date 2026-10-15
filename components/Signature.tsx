'use client';
// Подпись «Анна Фатьянова» шрифтом Marck Script: буквы прописываются обводкой при появлении, затем заливаются.
// Пути — scripts/build-signature.mjs (opentype.js), по одному на букву.
import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, prefersReduced } from '@/lib/gsap';
import { SIGN_GLYPHS, SIGN_VIEWBOX } from '@/lib/signature.generated';

export default function Signature({ className = '' }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current!;
    if (prefersReduced()) return;
    const paths = [...svg.querySelectorAll<SVGPathElement>('path')];
    const lens = paths.map((p) => p.getTotalLength());
    paths.forEach((p, i) => {
      p.style.strokeDasharray = `${lens[i]}`;
      p.style.strokeDashoffset = `${lens[i]}`;
      p.style.fillOpacity = '0';
    });
    const tl = gsap.timeline({ paused: true });
    let t = 0;
    paths.forEach((p, i) => {
      const d = Math.max(0.12, Math.min(0.32, lens[i] / 900));
      tl.to(p, { strokeDashoffset: 0, duration: d, ease: 'none' }, t);
      t += d * 0.8;
    });
    tl.to(paths, { fillOpacity: 1, duration: 0.6, ease: 'power1.out' }, t - 0.2);
    tl.to(paths, { strokeOpacity: 0, duration: 0.4 }, t + 0.1);
    const st = ScrollTrigger.create({ trigger: svg, start: 'top 85%', once: true, onEnter: () => tl.play() });
    return () => {
      st.kill();
      tl.kill();
    };
  }, []);

  return (
    <svg ref={ref} className={`sign ${className}`} viewBox={SIGN_VIEWBOX} role="img" aria-label="Подпись: Анна Фатьянова">
      {SIGN_GLYPHS.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
