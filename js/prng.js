// Deterministic randomness. Every mythology flows from one seed string,
// so the same seed always forges the same world.

function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i += 1) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function next() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

function mulberry32(a) {
  let state = a >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createRng(seedString) {
  const seedFn = xmur3(String(seedString));
  const next = mulberry32(seedFn());

  const rng = {
    next,
    // Integer in [min, max] inclusive.
    int(min, max) {
      return min + Math.floor(next() * (max - min + 1));
    },
    float(min, max) {
      return min + next() * (max - min);
    },
    chance(p) {
      return next() < p;
    },
    pick(arr) {
      if (!Array.isArray(arr) || arr.length === 0) {
        throw new Error('rng.pick requires a non-empty array');
      }
      return arr[Math.floor(next() * arr.length)];
    },
    // pairs: [[value, weight], ...]
    pickWeighted(pairs) {
      const total = pairs.reduce((sum, [, w]) => sum + w, 0);
      let roll = next() * total;
      for (const [value, weight] of pairs) {
        roll -= weight;
        if (roll <= 0) return value;
      }
      return pairs[pairs.length - 1][0];
    },
    // Returns a new shuffled array; the input is never mutated.
    shuffle(arr) {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(next() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    },
    // Take n distinct items; returns a new array.
    sample(arr, n) {
      return rng.shuffle(arr).slice(0, Math.min(n, arr.length));
    },
  };
  return Object.freeze(rng);
}

const SEED_WORDS_A = [
  'amber', 'ashen', 'silver', 'hollow', 'sunken', 'gilded', 'pale', 'iron',
  'crimson', 'quiet', 'broken', 'winter', 'salt', 'ember', 'thorn', 'velvet',
  'wandering', 'sleeping', 'burning', 'drowned',
];

const SEED_WORDS_B = [
  'crown', 'tide', 'lantern', 'serpent', 'orchard', 'mirror', 'anvil', 'gate',
  'comet', 'harp', 'wolf', 'altar', 'loom', 'river', 'bell', 'spire',
  'moth', 'garden', 'oath', 'star',
];

// Human-friendly shareable seeds, e.g. "amber-crown-7041".
export function randomSeed() {
  const a = SEED_WORDS_A[Math.floor(Math.random() * SEED_WORDS_A.length)];
  const b = SEED_WORDS_B[Math.floor(Math.random() * SEED_WORDS_B.length)];
  const n = Math.floor(Math.random() * 9000) + 1000;
  return `${a}-${b}-${n}`;
}
