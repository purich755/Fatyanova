// Футер — последняя страница программки.
import { FOOTER, PROGRAM, SITE } from '@/lib/data';

export default function Footer() {
  return (
    <footer className="foot paper" data-tone="paper">
      <div className="wrap foot-grid">
        <div className="foot-mark">
          <span className="foot-af">АФ</span>
          <p className="mono-sm">{SITE.name}</p>
        </div>
        <ol className="foot-toc mono-sm" aria-label="Разделы">
          {PROGRAM.map((p) => (
            <li key={p.n}>
              <a href={p.href} className="link-u">
                {p.insert ? p.title : `№ ${p.n} ${p.title}`}
              </a>
            </li>
          ))}
        </ol>
        <div className="foot-contacts">
          <a href={SITE.phoneHref} className="foot-phone">
            {SITE.phone}
          </a>
          <a href={SITE.vk} className="link-u mono-sm" target="_blank" rel="noopener noreferrer">
            ВКонтакте ↗
          </a>
          <a href={SITE.whatsapp} className="link-u mono-sm" target="_blank" rel="noopener noreferrer">
            WhatsApp ↗
          </a>
          <span className="mono-sm">{SITE.max}</span>
          <a href={`mailto:${SITE.email}`} className="link-u mono-sm">
            {SITE.email}
          </a>
        </div>
      </div>
      <div className="wrap foot-base mono-sm">
        <span>{FOOTER.copy}</span>
        <span>{FOOTER.photos}</span>
        <a href="#" className="link-u">
          {FOOTER.privacy}
        </a>
        <span aria-hidden="true">стр. 09 · конец программы</span>
      </div>
    </footer>
  );
}
