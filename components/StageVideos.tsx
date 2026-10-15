'use client';
// «30 секунд со сцены»: три вертикальных клипа со стены VK. Без звука и по кругу, играют только в зоне
// видимости; у каждого своя кнопка звука (звук включается только у одного клипа за раз).
import { useEffect, useRef, useState } from 'react';
import { VIDEOS } from '@/lib/data';
import { asset } from '@/lib/base';
import { mediaSrc, pickWidth } from './Photo';

export default function StageVideos() {
  const ref = useRef<HTMLDivElement>(null);
  const [sound, setSound] = useState<number | null>(null);
  // постеры и метаданные — только когда блок подъехал (иначе они спорят с первым экраном)
  const [near, setNear] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setNear(true), io.disconnect()), { rootMargin: '900px 0px' });
    io.observe(ref.current!);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const vids = [...ref.current!.querySelectorAll('video')];
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting && !reduced) v.play().catch(() => {});
          else v.pause();
        }
      },
      { threshold: 0.45 },
    );
    vids.forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, [near]);

  useEffect(() => {
    ref.current!.querySelectorAll('video').forEach((v, i) => {
      v.muted = sound !== i;
      if (sound === i) v.play().catch(() => {});
    });
  }, [sound]);

  return (
    <div className="vids wrap" ref={ref}>
      <div className="vids-head">
        <p className="no">30 секунд со сцены</p>
        <p className="mono-sm vids-note">Короткие клипы со стены сообщества — звук включается кнопкой на каждом</p>
      </div>
      <ul className="vids-row">
        {VIDEOS.map((v, i) => (
          <li className="vid" key={v.src} data-rv>
            <div className="vid-frame">
              <video src={near ? asset(v.src) : undefined} poster={near ? mediaSrc(v.poster, pickWidth(v.poster, 540)) : undefined} muted loop playsInline preload="metadata" aria-label={v.caption} />
              <button type="button" className="vid-sound mono-sm" aria-pressed={sound === i} onClick={() => setSound(sound === i ? null : i)}>
                <span aria-hidden="true">{sound === i ? '◉' : '○'}</span> {sound === i ? 'Звук включён' : 'Включить звук'}
              </button>
            </div>
            <p className="cap vid-cap">
              <span className="vid-n">0{i + 1}</span> {v.caption}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
