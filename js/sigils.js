// Procedural sigils: each god's sacred symbol, drawn as stroke-only SVG
// in the style of alchemical and astronomical notation. Deterministic
// per god per world — a god's sigil is as fixed as their name.

import { createRng } from './prng.js';

const SIZE = 64;
const C = SIZE / 2;

function pt(radius, angle) {
  return {
    x: +(C + radius * Math.cos(angle)).toFixed(2),
    y: +(C + radius * Math.sin(angle)).toFixed(2),
  };
}

function ring(radius) {
  return `<circle cx="${C}" cy="${C}" r="${radius.toFixed(2)}" />`;
}

function polygon(points, close = true) {
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
  return `<path d="${d}${close ? ' Z' : ''}" />`;
}

function starPolygon(rng, radius) {
  const n = rng.int(3, 8);
  const skip = n >= 5 && rng.chance(0.5) ? 2 : 1;
  const offset = rng.float(0, Math.PI * 2);
  const points = [];
  for (let i = 0; i < n; i += 1) {
    points.push(pt(radius, offset + ((i * skip) % n) * (Math.PI * 2 / n)));
  }
  return { svg: polygon(points), n, offset };
}

function radialTicks(rng, n, offset, inner, outer) {
  const parts = [];
  for (let i = 0; i < n; i += 1) {
    const angle = offset + i * (Math.PI * 2 / n);
    const a = pt(inner, angle);
    const b = pt(outer, angle);
    parts.push(`<path d="M${a.x} ${a.y} L${b.x} ${b.y}" />`);
  }
  return parts.join('');
}

function crescent(rng, radius) {
  const angle = rng.float(0, Math.PI * 2);
  const a = pt(radius, angle - 1.1);
  const b = pt(radius, angle + 1.1);
  const bulge = (radius * 1.15).toFixed(2);
  const tuck = (radius * 0.72).toFixed(2);
  return `<path d="M${a.x} ${a.y} A${bulge} ${bulge} 0 0 1 ${b.x} ${b.y} A${tuck} ${tuck} 0 0 0 ${a.x} ${a.y} Z" />`;
}

function dots(rng, n, radius, offset) {
  const parts = [];
  for (let i = 0; i < n; i += 1) {
    const p = pt(radius, offset + i * (Math.PI * 2 / n));
    parts.push(`<circle cx="${p.x}" cy="${p.y}" r="1.6" fill="currentColor" stroke="none" />`);
  }
  return parts.join('');
}

// Inner markup only — reusable inside other SVGs (the lineage tree).
export function sigilInner(seed, godId) {
  const rng = createRng(`${seed}:sigil:${godId}`);
  const parts = [];

  const hasOuterRing = rng.chance(0.8);
  if (hasOuterRing) parts.push(ring(27));

  const star = starPolygon(rng, rng.float(16, 22));
  parts.push(star.svg);

  if (rng.chance(0.5)) parts.push(ring(rng.float(7, 12)));
  if (rng.chance(0.45)) parts.push(crescent(rng, rng.float(10, 15)));
  if (hasOuterRing && rng.chance(0.55)) {
    parts.push(radialTicks(rng, star.n, star.offset, 27, 30.5));
  }
  if (rng.chance(0.5)) parts.push(dots(rng, rng.int(2, star.n), 23.5, star.offset + Math.PI / star.n));
  if (rng.chance(0.4)) parts.push(`<circle cx="${C}" cy="${C}" r="1.8" fill="currentColor" stroke="none" />`);

  // A bare polygon reads as unfinished; every sigil earns ≥3 strokes.
  if (parts.length < 3) parts.push(ring(rng.float(8, 12)));
  if (parts.length < 3) parts.push(dots(rng, star.n, 23.5, star.offset + Math.PI / star.n));

  return parts.join('');
}

// Self-contained: colors flow from CSS currentColor, so the same sigil
// works in cards, the favicon, and the lineage tree.
export function godSigil(seed, godId) {
  return `<svg viewBox="0 0 ${SIZE} ${SIZE}" class="sigil" stroke="currentColor" fill="none" stroke-width="1.3" stroke-linecap="round" role="img" aria-hidden="true">${sigilInner(seed, godId)}</svg>`;
}

// The world itself gets a master sigil — used in the hero and as a favicon.
export function worldSigil(seed) {
  return godSigil(seed, 'world');
}
