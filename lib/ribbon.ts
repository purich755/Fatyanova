// Геометрия атласной ленты: центральная линия + лента переменной ширины, которая «перекручивается»
// там, где косинус меняет знак (лицо светлее, изнанка темнее). Считается на сервере — без гидратации.

export type RibbonGeo = { viewBox: string; center: string; faces: { d: string; back: boolean }[] };

type Pt = [number, number];
const r1 = (n: number) => Math.round(n * 10) / 10;

export function ribbon(opts: {
  w: number;
  h: number;
  /** центральная линия: t ∈ [0,1] → точка */
  curve: (t: number) => Pt;
  width: number;
  twists: number;
  phase?: number;
  steps?: number;
}): RibbonGeo {
  const { w, h, curve, width, twists, phase = 0.3, steps = 180 } = opts;
  const pts: Pt[] = [];
  for (let i = 0; i <= steps; i++) pts.push(curve(i / steps));
  // нормали
  const nrm: Pt[] = pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    return [-dy / l, dx / l];
  });
  const k = pts.map((_, i) => Math.cos((i / steps) * Math.PI * 2 * twists + phase));
  const edgeA = pts.map((p, i) => [p[0] + nrm[i][0] * (width / 2) * k[i], p[1] + nrm[i][1] * (width / 2) * k[i]] as Pt);
  const edgeB = pts.map((p, i) => [p[0] - nrm[i][0] * (width / 2) * k[i], p[1] - nrm[i][1] * (width / 2) * k[i]] as Pt);

  // режем на куски по смене знака
  const faces: { d: string; back: boolean }[] = [];
  let start = 0;
  for (let i = 1; i <= steps; i++) {
    const flip = i === steps || Math.sign(k[i]) !== Math.sign(k[i - 1]);
    if (!flip) continue;
    const end = i;
    const a = edgeA.slice(start, end + 1);
    const b = edgeB.slice(start, end + 1).reverse();
    const d = 'M' + [...a, ...b].map(([x, y]) => `${r1(x)} ${r1(y)}`).join('L') + 'Z';
    faces.push({ d, back: k[Math.floor((start + end) / 2)] < 0 });
    start = i;
  }
  const center = 'M' + pts.map(([x, y]) => `${r1(x)} ${r1(y)}`).join('L');
  return { viewBox: `0 0 ${w} ${h}`, center, faces };
}

/** Лента-разделитель: по диагонали экрана, с мягкой волной */
export const RIBBON_DIAG = ribbon({
  w: 1440,
  h: 420,
  width: 30,
  twists: 2.5,
  curve: (t) => [-60 + t * 1560, 380 - t * 330 + Math.sin(t * Math.PI * 2.2) * 70],
});

/** Короткая волна между бумажными листами */
export const RIBBON_SOFT = ribbon({
  w: 1440,
  h: 260,
  width: 22,
  twists: 1.5,
  phase: 1.2,
  curve: (t) => [-40 + t * 1520, 150 + Math.sin(t * Math.PI * 3) * 60 - t * 40],
});
