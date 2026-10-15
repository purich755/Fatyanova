import { Fragment, type ReactNode } from 'react';

/** «на *главные сцены* страны» → курсив Playfair для слов между звёздочками */
export function rich(s: string): ReactNode {
  return s.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith('*') ? <em key={i}>{part.slice(1, -1)}</em> : <Fragment key={i}>{part}</Fragment>,
  );
}

/** Многострочный заголовок: каждая строка — отдельный блок (для построчного выезда из-под маски) */
export function lines(rows: string[]): ReactNode {
  return rows.map((r, i) => (
    <span className="ln" key={i}>
      {rich(r)}
      {i < rows.length - 1 ? ' ' : ''}
    </span>
  ));
}
