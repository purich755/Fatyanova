// № 02 — «Программа вечера». Лист программки наезжает на сцену; оглавление с отточиями = якорная навигация.
import { PROGRAM, SITE } from '@/lib/data';

export default function ProgramIndex() {
  return (
    <section className="program paper" id="program" data-tone="paper" aria-labelledby="program-title">
      <div className="wrap program-grid">
        <div className="program-head">
          <p className="mono program-presents" data-rv>
            {SITE.name}
            <br /> представляет
          </p>
          <h2 className="h2 program-title" id="program-title" data-split>
            Программа <em>вечера</em>
          </h2>
          <p className="mono-sm program-note" data-rv>
            Новосибирск · Москва · Санкт‑Петербург
          </p>
        </div>
        <ol className="toc" aria-label="Содержание страницы">
          {PROGRAM.map((p) => (
            <li key={p.n} data-rv>
              <a href={p.href} className="toc-row">
                <span className="toc-n mono">№ {p.n}</span>
                <span className="toc-t">{p.title}</span>
                <span className="toc-dots" aria-hidden="true" />
                <span className="toc-p mono" aria-hidden="true">
                  {p.page}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
      <div className="wrap program-foot mono-sm" aria-hidden="true">
        <span>Программа может меняться — как в любом живом концерте</span>
        <span>стр. 02</span>
      </div>
    </section>
  );
}
