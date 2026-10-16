// Вкладыш в программку — анонс ближайшей программы «Из Сибири с любовью. День Победы», 2 мая 2027.
// Это приглашение коллективам, а не продажа билетов: кнопка ведёт к контактам Анны.
import { NEXT, SITE } from '@/lib/data';
import { lines } from '@/lib/text';
import Photo from './Photo';

export default function NextProgram() {
  return (
    <section className="next" id="next" data-tone="paper" aria-labelledby="next-title">
      <div className="wrap">
        <article className="next-card paper" data-rv>
          <div className="next-date" aria-label={`${NEXT.day} ${NEXT.month} ${NEXT.year}`}>
            <span className="next-day" aria-hidden="true">
              {NEXT.day}
            </span>
            <span className="next-month" aria-hidden="true">
              {NEXT.month} <span className="next-year">{NEXT.year}</span>
            </span>
            <span className="next-place mono-sm">{NEXT.place}</span>
          </div>

          <div className="next-body">
            <p className="mono next-k">{NEXT.kicker}</p>
            <h2 className="h2 next-title" id="next-title">
              {lines(NEXT.title)}
            </h2>
            <p className="next-lead">{NEXT.lead}</p>
            <div className="next-care">
              <p className="mono-sm next-care-t">{NEXT.care.title}</p>
              <ol className="next-care-list">
                {NEXT.care.items.map((it, i) => (
                  <li key={it}>
                    <span className="mono-sm">{String(i + 1).padStart(2, '0')}</span> {it}
                  </li>
                ))}
              </ol>
              <p className="next-care-note">{NEXT.care.note}</p>
            </div>
            <div className="next-actions">
              <a href="#contacts" className="btn btn--ink" data-magnet>
                {NEXT.cta} <span className="arr">→</span>
              </a>
              <a href={SITE.whatsapp} className="link-u next-wa" target="_blank" rel="noopener noreferrer">
                {NEXT.wa} <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          <figure className="next-ph">
            <div className="next-ph-frame">
              <Photo id={NEXT.photo} sizes="(max-width: 899px) 90vw, 26vw" className="fill" pos="62% 50%" />
            </div>
            <figcaption className="cap">{NEXT.photoCaption}</figcaption>
          </figure>
        </article>
      </div>
    </section>
  );
}
