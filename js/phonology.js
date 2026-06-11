// Each mythology invents its own language first. A phonology — a private
// inventory of sounds and syllable shapes — is generated once per world,
// and every god, place, and age is named from it. This is what makes a
// generated pantheon feel like one culture rather than a list of noise.

const CONSONANT_POOL = [
  // [sound, weight] — weights bias toward sounds that read well in Latin script.
  ['k', 5], ['t', 5], ['n', 6], ['m', 5], ['r', 6], ['l', 6], ['s', 6],
  ['d', 4], ['v', 4], ['th', 4], ['sh', 3], ['h', 4], ['g', 3], ['b', 3],
  ['z', 2], ['f', 3], ['kh', 2], ['p', 3], ['y', 3], ['w', 2], ['dh', 1],
];

const VOWEL_POOL = [
  ['a', 6], ['e', 5], ['i', 5], ['o', 4], ['u', 3],
  ['ae', 2], ['ia', 2], ['ei', 1], ['ou', 1], ['ai', 2],
];

const ONSET_CLUSTERS = ['br', 'kr', 'dr', 'thr', 'gl', 'sk', 'vr', 'st'];
const CODA_POOL = ['n', 'r', 'l', 's', 'th', 'm', 'k', 'nd', 'sh'];

function pickInventory(rng, pool, min, max) {
  const count = rng.int(min, max);
  const chosen = [];
  const remaining = [...pool];
  while (chosen.length < count && remaining.length > 0) {
    const item = rng.pickWeighted(remaining);
    chosen.push(item);
    const idx = remaining.findIndex(([value]) => value === item);
    remaining.splice(idx, 1);
  }
  return chosen;
}

export function makeLanguage(rng) {
  // Weights bias which sounds enter a language's inventory; once inside,
  // all sounds are drawn flat — otherwise one heavy consonant colonizes
  // every name and the whole pantheon starts to rhyme.
  const consonants = pickInventory(rng, CONSONANT_POOL, 7, 11).map(([value]) => value);
  const vowels = pickInventory(rng, VOWEL_POOL, 3, 5).map(([value]) => value);
  const clusters = rng.chance(0.6) ? rng.sample(ONSET_CLUSTERS, rng.int(1, 3)) : [];
  const codas = rng.sample(CODA_POOL, rng.int(2, 4));
  const allowsApostrophe = rng.chance(0.18);
  const codaChance = rng.float(0.25, 0.55);
  const clusterChance = clusters.length > 0 ? rng.float(0.1, 0.25) : 0;

  return Object.freeze({
    consonants, vowels, clusters, codas,
    allowsApostrophe, codaChance, clusterChance,
  });
}

function syllable(rng, lang, { isFirst, isLast }) {
  const useCluster = isFirst && rng.chance(lang.clusterChance);
  const onset = useCluster
    ? rng.pick(lang.clusters)
    : (isFirst && rng.chance(0.18) ? '' : rng.pick(lang.consonants));
  const nucleus = rng.pick(lang.vowels);
  const coda = isLast && rng.chance(lang.codaChance) ? rng.pick(lang.codas) : '';
  return onset + nucleus + coda;
}

function rawName(rng, lang, syllableCount) {
  const parts = [];
  for (let i = 0; i < syllableCount; i += 1) {
    let next = '';
    // A syllable may not simply repeat its predecessor ("Zazaza").
    for (let retry = 0; retry < 6; retry += 1) {
      next = syllable(rng, lang, {
        isFirst: i === 0,
        isLast: i === syllableCount - 1,
      });
      if (next !== parts[i - 1]) break;
    }
    parts.push(next);
  }
  let joined = parts.join('');
  if (lang.allowsApostrophe && syllableCount >= 3 && rng.chance(0.3)) {
    joined = parts[0] + '’' + parts.slice(1).join('');
  }
  // Collapse accidental triple letters ("aaa" → "aa").
  joined = joined.replace(/(.)\1\1+/g, '$1$1');
  return joined.charAt(0).toUpperCase() + joined.slice(1);
}

const MIN_LENGTH = 3;
const MAX_LENGTH = 12;

export function makeName(rng, lang, { minSyllables = 2, maxSyllables = 3 } = {}) {
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const name = rawName(rng, lang, rng.int(minSyllables, maxSyllables));
    if (name.length >= MIN_LENGTH && name.length <= MAX_LENGTH) return name;
  }
  return rawName(rng, lang, 2);
}

function editDistance(a, b) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  let prev = Array.from({ length: cols }, (_, j) => j);
  for (let i = 1; i < rows; i += 1) {
    const curr = [i];
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr.push(Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost));
    }
    prev = curr;
  }
  return prev[cols - 1];
}

// Two names are confusable if a reader would mix them up at a glance:
// one contains the other, they open with the same four letters, or they
// sit within two edits of each other (Kikish / Kikasi).
export function isConfusable(a, b) {
  const x = a.toLowerCase();
  const y = b.toLowerCase();
  if (x.includes(y) || y.includes(x)) return true;
  if (x.slice(0, 4) === y.slice(0, 4)) return true;
  return editDistance(x, y) <= 2;
}

function tooSimilar(name, usedNames) {
  for (const used of usedNames) {
    if (isConfusable(name, used)) return true;
  }
  return false;
}

// Draw names until one is unused and unconfusable. The caller owns the set.
export function uniqueName(rng, lang, usedNames, options) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const name = makeName(rng, lang, options);
    if (!usedNames.has(name) && !tooSimilar(name, usedNames)) return name;
  }
  // Cramped phonology: relax the similarity rule, keep strict uniqueness.
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const name = makeName(rng, lang, options);
    if (!usedNames.has(name)) return name;
  }
  // Pathological seed: disambiguate honestly rather than loop forever.
  const base = makeName(rng, lang, options);
  let n = 2;
  while (usedNames.has(`${base}${n}`)) n += 1;
  return `${base}${n}`;
}

// The language names itself: usually derived from the world's own name.
export function languageName(rng, lang, worldName) {
  const suffixes = ['ic', 'ari', 'eth', 'ian', 'ese', 'ah', 'ün'];
  const stem = worldName.replace(/[aeiou]+$/i, '');
  if (rng.chance(0.7)) return stem + rng.pick(suffixes);
  return makeName(rng, lang, { minSyllables: 2, maxSyllables: 3 });
}
