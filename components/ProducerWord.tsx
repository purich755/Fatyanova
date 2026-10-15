// № 03 — «Слово продюсера». Цитата курсивом, два абзаца от первого лица, подпись прописью,
// портрет в паспарту (стоп-кадр промо-ролика из VK) и маленький кадр солистки внахлёст.
import { WORD } from '@/lib/data';
import Photo from './Photo';
import Signature from './Signature';

export default function ProducerWord() {
  return (
    <section className="word paper" id="word" data-tone="paper" aria-labelledby="word-title">
      <div className="wrap word-grid">
        <p className="no word-no" data-rv>
          № 01 · Слово продюсера
        </p>
        <h2 className="sr-only" id="word-title">
          Слово продюсера
        </h2>
        <blockquote className="word-quote">
          <p data-split>
            <span className="q q--open">«</span>
            {WORD.quote}
            <span className="q">»</span>
          </p>
        </blockquote>

        <div className="word-text">
          {WORD.paragraphs.map((p, i) => (
            <p key={i} data-rv>
              {p}
            </p>
          ))}
          <div className="word-sign" data-rv>
            <Signature />
            <p className="mono-sm word-role">Продюсер, основатель центра</p>
          </div>
        </div>

        <figure className="word-portrait" data-rv>
          <div className="mat">
            <div className="mat-frame">
              <Photo id={WORD.portrait} sizes="(max-width: 767px) 80vw, 30vw" className="fill" pos="50% 30%" />
            </div>
          </div>
          <figcaption className="cap">{WORD.portraitCaption}</figcaption>
        </figure>

        <figure className="word-solo" data-rv>
          <div className="word-solo-frame">
            <Photo id={WORD.solo} sizes="(max-width: 767px) 50vw, 18vw" className="fill" pos="52% 40%" />
          </div>
          <figcaption className="cap">{WORD.soloCaption}</figcaption>
        </figure>

        <p className="mono-sm word-foot" data-rv>
          <sup>*</sup> {WORD.footnote}
        </p>
      </div>
    </section>
  );
}
