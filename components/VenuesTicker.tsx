// Бесконечная моно-строка площадок внизу сцены. Чистый CSS: две одинаковые половины, сдвиг на -50%.
import { VENUES } from '@/lib/data';

export default function VenuesTicker() {
  const row = (hidden: boolean) => (
    <span className="tick-row" aria-hidden={hidden || undefined}>
      {VENUES.map((v) => (
        <span key={v} className="tick-item">
          {v}
          <span className="tick-dot" aria-hidden="true">
            ·
          </span>
        </span>
      ))}
    </span>
  );
  return (
    <div className="tick mono" role="marquee" aria-label={`Площадки: ${VENUES.join(', ')}`}>
      <div className="tick-track">
        {row(true)}
        {row(true)}
        {row(true)}
        {row(true)}
      </div>
    </div>
  );
}
