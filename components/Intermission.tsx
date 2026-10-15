// № 09 — «Антракт». Лёгкий бумажный лист: три шага и кнопка связи. Никаких форм.
import { JOIN } from '@/lib/data';
import { lines } from '@/lib/text';

export default function Intermission() {
  return (
    <section className="join paper" id="join" data-tone="paper" aria-labelledby="join-title">
      <div className="wrap join-grid">
        <p className="join-k mono" data-rv>
          Антракт
        </p>
        <h2 className="h2 join-title" id="join-title" data-split>
          {lines(JOIN.title)}
        </h2>
        <ol className="join-steps">
          {JOIN.steps.map((s, i) => (
            <li key={s} data-rv>
              <span className="mono join-n">{i + 1})</span>
              <span className="join-s">{s}</span>
            </li>
          ))}
        </ol>
        <div className="join-cta" data-rv>
          <a href="#contacts" className="btn btn--ink" data-magnet>
            {JOIN.cta} <span className="arr">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
