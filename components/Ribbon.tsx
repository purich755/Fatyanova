// Розовая атласная лента между разделами. Рисуется на скролле: маска — штрих вдоль центральной линии
// (анимация — в Motion.tsx по [data-ribbon]). Серверный компонент: геометрия не гидратируется.
import { RIBBON_DIAG, RIBBON_SOFT } from '@/lib/ribbon';

export default function Ribbon({ variant = 'diag', id }: { variant?: 'diag' | 'soft'; id: string }) {
  const g = variant === 'diag' ? RIBBON_DIAG : RIBBON_SOFT;
  const mask = `rb-mask-${id}`;
  const front = `rb-front-${id}`;
  const back = `rb-back-${id}`;
  return (
    <div className={`ribbon ribbon--${variant}`} aria-hidden="true">
      <svg viewBox={g.viewBox} preserveAspectRatio="xMidYMid slice" data-ribbon>
        <defs>
          <linearGradient id={front} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F6CFE0" />
            <stop offset=".45" stopColor="#E7A3C3" />
            <stop offset="1" stopColor="#C77C9F" />
          </linearGradient>
          <linearGradient id={back} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#A9587E" />
            <stop offset="1" stopColor="#8E4466" />
          </linearGradient>
          <mask id={mask} maskUnits="userSpaceOnUse">
            <path d={g.center} fill="none" stroke="#fff" strokeWidth="80" strokeLinecap="round" className="ribbon-draw" pathLength={1} />
          </mask>
        </defs>
        <g mask={`url(#${mask})`}>
          {g.faces.map((f, i) => (
            <path key={i} d={f.d} fill={`url(#${f.back ? back : front})`} />
          ))}
          <path d={g.center} fill="none" stroke="#FFF3F8" strokeOpacity=".45" strokeWidth="1.2" />
        </g>
      </svg>
    </div>
  );
}
