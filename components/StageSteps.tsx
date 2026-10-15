'use client';
// № 04 — «Путь на большую сцену». Главная scroll-сцена: секция закреплена ~280vh, снизу поднимаются
// пять ступеней-подиумов, на каждую выезжает фото, предыдущая тускнеет. На мобильных — лестница без пина.
import { useEffect, useRef } from 'react';
import { gsap, PIN_QUERY } from '@/lib/gsap';
import { STEPS } from '@/lib/data';
import Photo from './Photo';

export default function StageSteps() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const counter = el.querySelector<HTMLElement>('.steps-count b')!;
    const mm = gsap.matchMedia();
    mm.add(PIN_QUERY, () => {
      const items = [...el.querySelectorAll<HTMLElement>('.step')];
      const pods = items.map((li) => li.querySelector<HTMLElement>('.step-pod')!);
      const photos = items.map((li) => li.querySelector<HTMLElement>('.step-photo')!);
      const copies = items.map((li) => li.querySelector<HTMLElement>('.step-copy')!);
      el.dataset.pinned = '1';
      gsap.set(pods.slice(1), { yPercent: 102 });
      gsap.set(photos.slice(1), { clipPath: 'inset(100% 0% 0% 0%)' });
      gsap.set(copies.slice(1), { autoAlpha: 0, y: 30 });
      items[0].classList.add('is-on');

      const starts: number[] = [0];
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: '+=190%',
          pin: el.querySelector('.steps-pin'),
          scrub: 0.6,
          // время считаем от прогресса скролла: tl.time() при scrub отстаёт, а onUpdate после догонки не зовётся
          onUpdate: (st) => {
            const t = st.progress * tl.duration();
            let idx = 0;
            starts.forEach((s, i) => {
              if (t >= s + 0.35) idx = i;
            });
            if (counter.textContent !== String(idx + 1)) {
              counter.textContent = String(idx + 1);
              items.forEach((li, i) => li.classList.toggle('is-on', i === idx));
            }
          },
        },
      });
      tl.to({}, { duration: 0.4 });
      for (let i = 1; i < items.length; i++) {
        const at = tl.duration();
        starts.push(at);
        tl.to(pods[i], { yPercent: 0, duration: 1, ease: 'power2.out' }, at)
          .to(photos[i], { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power2.inOut' }, at + 0.35)
          .to([pods[i - 1], photos[i - 1]], { opacity: 0.38, duration: 0.6 }, at + 0.3)
          .to(copies[i - 1], { autoAlpha: 0, y: -30, duration: 0.5 }, at + 0.2)
          .to(copies[i], { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' }, at + 0.55);
      }
      tl.to({}, { duration: 0.5 });
      return () => {
        delete el.dataset.pinned;
        items.forEach((li) => li.classList.remove('is-on'));
      };
    });
    return () => mm.revert();
  }, []);

  return (
    <section className="steps stage" id="path" ref={ref} data-tone="stage" aria-labelledby="steps-title">
      <div className="steps-pin">
        <div className="wrap steps-grid">
          <header className="steps-head">
            <p className="no" data-rv>
              № 02 · Путь
            </p>
            <h2 className="h2 steps-title" id="steps-title" data-split>
              Путь на <em>большую сцену</em>
            </h2>
            <p className="steps-count mono" aria-hidden="true">
              Ступень <b>1</b> / 5
            </p>
          </header>
          <ol className="stair">
            {STEPS.map((s, i) => (
              <li className="step" key={s.title} style={{ '--i': i } as React.CSSProperties}>
                <div className="step-photo">
                  <Photo id={s.photo} sizes="(max-width: 899px) 44vw, 12vw" className="fill" />
                </div>
                <div className="step-pod" aria-hidden="true">
                  <span className="step-pod-n mono">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div className="step-copy">
                  <p className="mono step-note">
                    <span className="step-idx">Ступень {i + 1}</span> · {s.note}
                  </p>
                  <h3 className="h3 step-title">{s.title}</h3>
                  <p className="step-text">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
