// Boot: seed ⇄ URL hash, forge transitions, header controls.

import { generateMythos } from './mythos.js';
import { randomSeed } from './prng.js';
import { renderMythos } from './render.js';
import { worldSigil } from './sigils.js';

const app = document.getElementById('app');
const seedInput = document.getElementById('seed-input');
const veilMs = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 420;

let active = null;

function seedFromHash() {
  try {
    return decodeURIComponent(window.location.hash.replace(/^#/, '')).trim() || null;
  } catch {
    return null;
  }
}

function setFavicon(seed) {
  const svg = worldSigil(seed).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" style="color:#d4af37" ');
  const link = document.getElementById('favicon');
  link.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function forge(seed, { instant = false } = {}) {
  const work = () => {
    if (active) active.destroy();
    const mythos = generateMythos(seed);
    active = renderMythos(app, mythos);
    document.title = `${mythos.world.name} — mythos.building`;
    seedInput.value = seed;
    setFavicon(seed);
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.body.classList.remove('veil');
  };

  if (instant || veilMs === 0) {
    work();
    return;
  }
  document.body.classList.add('veil');
  window.setTimeout(work, veilMs);
}

function setSeed(seed) {
  const target = `#${encodeURIComponent(seed)}`;
  if (window.location.hash === target) return;
  window.location.hash = target;
}

async function copyLink(button) {
  try {
    await navigator.clipboard.writeText(window.location.href);
    const original = button.textContent;
    button.textContent = 'Copied ✓';
    window.setTimeout(() => { button.textContent = original; }, 1400);
  } catch {
    window.prompt('Copy this link:', window.location.href);
  }
}

document.addEventListener('click', (e) => {
  const button = e.target.closest('[data-action]');
  if (!button) return;
  if (button.dataset.action === 'forge') setSeed(randomSeed());
  if (button.dataset.action === 'copy') copyLink(button);
});

document.getElementById('seed-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const value = seedInput.value.trim();
  if (value) {
    setSeed(value);
    seedInput.blur();
  }
});

window.addEventListener('hashchange', () => {
  const seed = seedFromHash();
  if (seed) forge(seed);
});

// First load: honor a shared seed, otherwise forge fresh and make the URL shareable.
const initial = seedFromHash() || randomSeed();
window.history.replaceState(null, '', `#${encodeURIComponent(initial)}`);
forge(initial, { instant: true });
