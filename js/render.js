// Renders one complete mythology into the page. All content is
// generator-produced; the only user-controlled string (the seed) is
// always set via textContent, never markup.

import { composeMyth, godApocrypha, godRoles } from './myth.js';
import { fillPronouns } from './domains.js';
import { godSigil, worldSigil } from './sigils.js';
import { renderLineage } from './lineage.js';
import { createStarmap } from './starmap.js';

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function skySentence(world) {
  const moons = {
    0: 'No moon hangs above it, and its nights are honest about the dark',
    1: 'One moon hangs above it',
    2: 'Two moons hang above it',
    3: 'Three moons hang above it',
  }[world.moons];
  const suns = world.suns === 2 ? 'two suns quarrel across its sky' : 'one sun crosses it';
  return `${moons}; ${suns}.`;
}

function heroSection(m) {
  return `
    <section class="hero">
      <div class="hero-sigil" aria-hidden="true">${worldSigil(m.seed)}</div>
      <p class="kicker">Here begins the telling of</p>
      <h1>${esc(m.world.name)}</h1>
      <p class="hero-epithet">called ${esc(m.world.epithet)} in the songs of the ${esc(m.world.peopleName)}</p>
      <p class="hero-meta">${esc(skySentence(m.world))} Its people speak ${esc(m.world.language)}.</p>
    </section>`;
}

function creationSection(m) {
  const cantos = composeMyth(m).map((c) => `
    <article class="canto">
      <h3><span class="canto-numeral">${c.numeral}</span>${esc(c.title)}</h3>
      <p>${esc(c.text)}</p>
    </article>`).join('');
  return `
    <section class="section" id="creation">
      <p class="kicker">I &middot; The Creation</p>
      <h2>The Telling of ${esc(m.world.name)}</h2>
      ${cantos}
    </section>`;
}

function godCard(m, god) {
  const chips = [
    `<span class="chip chip-gen">${god.gen === 1 ? 'Elder' : 'Younger'}</span>`,
    ...god.domains.map((d) => `<span class="chip">${esc(d.noun.replace(/^the /, ''))}</span>`),
  ].join('');
  const roles = godRoles(m, god);
  const rolesRow = roles.length > 0
    ? `<p class="god-roles">${roles.map((r) => `<span class="role">${esc(cap(r))}</span>`).join('')}</p>`
    : '';
  return `
    <article class="god-card">
      <div class="god-head">
        <div>
          <h3>${esc(god.name)}</h3>
          <p class="god-epithet">${esc(god.epithet)}</p>
        </div>
        <div class="god-sigil" aria-hidden="true">${godSigil(m.seed, god.id)}</div>
      </div>
      <p class="god-chips">${chips}</p>
      <p class="god-line">${cap(god.aspect.pronoun)} is ${esc(fillPronouns(god.temperament.line, god.aspect))}. Sacred to ${god.aspect.object}: ${esc(god.sacred)}.</p>
      ${rolesRow}
      <p class="god-apocrypha">${esc(godApocrypha(m, god))}</p>
    </article>`;
}

function pantheonSection(m) {
  return `
    <section class="section" id="pantheon">
      <p class="kicker">II &middot; The Pantheon</p>
      <h2>The ${m.gods.length} Who Remain Named</h2>
      <p class="section-intro">Before the gods there were ${esc(listPrimordials(m))} — and from them, these.</p>
      <div class="god-grid">${m.gods.map((g) => godCard(m, g)).join('')}</div>
    </section>`;
}

function listPrimordials(m) {
  const parts = m.primordials.map((p) => `${p.name}, who was ${p.concept}`);
  if (parts.length === 2) return `${parts[0]}, and ${parts[1]}`;
  return `${parts.slice(0, -1).join('; ')}; and ${parts[parts.length - 1]}`;
}

function heavensSection() {
  return `
    <section class="section" id="heavens">
      <p class="kicker">III &middot; The Heavens</p>
      <h2>The Sky That Remembers</h2>
      <div class="sky-wrap"><canvas id="sky-canvas"></canvas></div>
      <p class="sky-legend" id="sky-legend">Move across the sky — every constellation remembers something.</p>
    </section>`;
}

function lineageSection(m) {
  return `
    <section class="section" id="lineage">
      <p class="kicker">IV &middot; The Lineage</p>
      <h2>The Divine House</h2>
      <div class="lineage-wrap">${renderLineage(m)}</div>
    </section>`;
}

function agesSection(m) {
  const items = m.events.ages.map((age) => `
    <li>
      <h4>${esc(cap(age.name))}</h4>
      <p>${esc(age.line)}</p>
    </li>`).join('');
  return `
    <section class="section" id="ages">
      <p class="kicker">V &middot; The Ages</p>
      <h2>The Shape of Time</h2>
      <ol class="ages-list">${items}</ol>
    </section>`;
}

function footerSection() {
  return `
    <footer class="site-foot section">
      <p>Every mythology is a seed. This one is <span class="seed-chip" id="seed-echo"></span> —
      share the link, and anyone can summon this exact world.</p>
      <p class="foot-actions">
        <button class="btn ghost" type="button" data-action="copy">Copy link</button>
        <button class="btn" type="button" data-action="forge">&#10049; Forge another</button>
      </p>
      <p class="credit">mythos&middot;building — a mythology forge. No two seeds tell the same story.</p>
    </footer>`;
}

export function renderMythos(root, mythos) {
  root.innerHTML = [
    heroSection(mythos),
    creationSection(mythos),
    pantheonSection(mythos),
    heavensSection(),
    lineageSection(mythos),
    agesSection(mythos),
    footerSection(),
  ].join('');

  // Seed is user input: textContent only.
  root.querySelector('#seed-echo').textContent = mythos.seed;

  const canvas = root.querySelector('#sky-canvas');
  const legend = root.querySelector('#sky-legend');
  return createStarmap(canvas, legend, mythos);
}
