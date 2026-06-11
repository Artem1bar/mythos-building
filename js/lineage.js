// The Lineage: a three-row SVG genealogy — primordials, elder gods,
// younger gods. Spouses are seated adjacent so union lines never cross
// the table; children hang from the midpoint of their parents' union.

import { sigilInner } from './sigils.js';
import { godById } from './pantheon.js';

const W = 940;
const ROW_Y = [64, 250, 436];
const SIGIL_SCALE = 0.62;
const SIGIL_HALF = 32 * SIGIL_SCALE;

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Order a row so that every union pair sits side by side.
function orderRow(members, unions) {
  const placed = [];
  const seen = new Set();
  for (const [a, b] of unions) {
    const ga = members.find((m) => m.id === a);
    const gb = members.find((m) => m.id === b);
    if (ga && gb && !seen.has(a) && !seen.has(b)) {
      placed.push(ga, gb);
      seen.add(a);
      seen.add(b);
    }
  }
  return [...placed, ...members.filter((m) => !seen.has(m.id))];
}

function rowPositions(count, rowIndex) {
  return Array.from({ length: count }, (_, i) => ({
    x: ((i + 1) / (count + 1)) * W,
    y: ROW_Y[rowIndex],
  }));
}

function nodeMarkup(mythos, member, pos, caption, dead) {
  const cls = dead ? 'tree-node dead' : 'tree-node';
  const sigil = `<g transform="translate(${pos.x - SIGIL_HALF} ${pos.y - SIGIL_HALF}) scale(${SIGIL_SCALE})" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">${sigilInner(mythos.seed, member.id)}</g>`;
  const name = `<text class="tree-name" x="${pos.x}" y="${pos.y + SIGIL_HALF + 18}">${dead ? '† ' : ''}${esc(member.name)}</text>`;
  const captionText = `<text class="tree-caption" x="${pos.x}" y="${pos.y + SIGIL_HALF + 33}">${esc(caption)}</text>`;
  return `<g class="${cls}">${sigil}${name}${captionText}</g>`;
}

function unionLine(a, b) {
  const y = a.y + SIGIL_HALF + 40;
  const midX = (a.x + b.x) / 2;
  return {
    midX,
    y,
    markup: `<path class="tree-union" d="M${a.x} ${y} L${b.x} ${y}" />`
      + `<path class="tree-diamond" d="M${midX} ${y - 3.5} L${midX + 3.5} ${y} L${midX} ${y + 3.5} L${midX - 3.5} ${y} Z" />`,
  };
}

function childCurve(fromX, fromY, to) {
  const toY = to.y - SIGIL_HALF - 6;
  const bend = (toY - fromY) * 0.55;
  return `<path class="tree-edge" d="M${fromX} ${fromY} C${fromX} ${fromY + bend} ${to.x} ${toY - bend} ${to.x} ${toY}" />`;
}

export function renderLineage(mythos) {
  const elders = mythos.gods.filter((g) => g.gen === 1);
  const youngers = mythos.gods.filter((g) => g.gen === 2);

  // Collect the unions actually used by births, plus declared marriages.
  const elderUnions = [...mythos.unions];
  const primordialUnions = [];
  for (const god of mythos.gods) {
    if (god.birth.type === 'union') {
      const key = god.birth.parents;
      const target = god.gen === 1 ? primordialUnions : elderUnions;
      if (!target.some(([a, b]) => (a === key[0] && b === key[1]) || (a === key[1] && b === key[0]))) {
        target.push([key[0], key[1]]);
      }
    }
  }

  const rows = [
    orderRow(mythos.primordials, primordialUnions),
    orderRow(elders, elderUnions),
    orderRow(youngers, []),
  ];

  const positions = new Map();
  rows.forEach((row, rowIndex) => {
    const pts = rowPositions(row.length, rowIndex);
    row.forEach((member, i) => positions.set(member.id, pts[i]));
  });

  const parts = [];

  // Union lines first (under everything), remembering their midpoints.
  const unionMid = new Map();
  for (const [a, b] of [...primordialUnions, ...elderUnions]) {
    const pa = positions.get(a);
    const pb = positions.get(b);
    if (!pa || !pb) continue;
    const u = unionLine(pa, pb);
    unionMid.set(`${a}|${b}`, u);
    unionMid.set(`${b}|${a}`, u);
    parts.push(u.markup);
  }

  // Birth edges.
  for (const god of mythos.gods) {
    const childPos = positions.get(god.id);
    if (god.birth.type === 'union') {
      const [a, b] = god.birth.parents;
      const u = unionMid.get(`${a}|${b}`);
      if (u) parts.push(childCurve(u.midX, u.y, childPos));
    } else {
      const parentPos = positions.get(god.birth.parents[0]);
      if (parentPos) {
        parts.push(childCurve(parentPos.x, parentPos.y + SIGIL_HALF + 40, childPos));
      }
    }
  }

  // Nodes last, on top of the lines.
  const deadId = mythos.events.death.godId;
  const clamp = (s) => (s.length > 26 ? `${s.slice(0, 24).trimEnd()}…` : s);
  for (const p of mythos.primordials) {
    parts.push(nodeMarkup(mythos, p, positions.get(p.id), clamp(p.concept), false));
  }
  for (const god of mythos.gods) {
    const dead = god.id === deadId;
    const caption = dead
      ? `now ${mythos.events.death.becomes.text}`
      : god.domains.map((d) => d.noun.replace(/^the /, '')).join(' · ');
    parts.push(nodeMarkup(mythos, god, positions.get(god.id), clamp(caption), dead));
  }

  const height = ROW_Y[2] + 96;
  return `<svg viewBox="0 0 ${W} ${height}" class="lineage-svg" role="img" aria-label="Divine family tree">${parts.join('')}</svg>`;
}

// Used by tests: every edge in the rendered tree must connect real ids.
export function lineageSanity(mythos) {
  return mythos.gods.every((g) => g.birth.parents.every((id) => godById(mythos, id) !== null));
}
