// Generates the structural bones of a mythology: the world itself,
// the primordial powers, and two generations of gods with domains,
// epithets, parentage, and marriages.

import { makeLanguage, makeName, uniqueName, languageName } from './phonology.js';
import { DOMAINS, TEMPERAMENTS, ASPECTS, PRIMORDIAL_CONCEPTS } from './domains.js';

const WORLD_EPITHETS = {
  'world-egg': ['the Shell-Born', 'the Hatched and Whole', 'the Yolk of Heaven'],
  'sundered-primordial': ['the Living Wound', 'the Body Made Home', 'the Inherited Flesh'],
  'world-dream': ['the Dreamt', 'the Sleeper’s Garden', 'the Unwaking'],
  'first-word': ['the Spoken', 'the Long Echo', 'the Sentence Still Being Said'],
  'endless-sea': ['the Risen Shore', 'the Borrowed Land', 'the Gift of the Deep'],
  'world-tree': ['the Green Branch', 'the Orchard of the Void', 'the Rooted'],
  'ember': ['the Last Ember', 'the Coal of Heaven', 'the Warmth That Remained'],
};

const AGENT_NOUNS = ['Herald', 'Keeper', 'Warden', 'Singer', 'Bearer', 'Breaker', 'Shepherd', 'Witness'];

const HONORIFICS = {
  god: ['Father', 'Lord', 'King', 'Shepherd'],
  goddess: ['Mother', 'Lady', 'Queen', 'Weaver'],
  'twin-natured': ['Keeper', 'Twin', 'Warden'],
  faceless: ['Warden', 'Keeper', 'Watcher'],
};

const SOLE_BIRTH_MANNERS = [
  'from a single shed tear',
  'from a severed hand that would not die',
  'from a shout of joy given shape',
  'from a shadow that grew tired of following',
  'from a wound that sang as it closed',
  'from breath fogged on the cold of the void',
];

function makeEpithet(rng, god, domain, usedEpithets) {
  const honorific = rng.pick(HONORIFICS[god.aspect.key]);
  const patterns = [
    () => `the ${rng.pick(domain.adjectives)}`,
    () => `${rng.pick(domain.epithetNouns)}-${rng.pick(AGENT_NOUNS)}`,
    () => `${honorific} of ${domain.plural.charAt(0).toUpperCase() + domain.plural.slice(1)}`,
    () => `the ${rng.pick(domain.adjectives)} ${rng.pick(domain.epithetNouns)}`,
  ];
  for (let attempt = 0; attempt < 16; attempt += 1) {
    const epithet = rng.pick(patterns)();
    if (!usedEpithets.has(epithet)) return epithet;
  }
  return `the ${rng.pick(domain.adjectives)}`;
}

function makeWorld(rng, lang, cosmologyKey, usedNames) {
  const name = uniqueName(rng, lang, usedNames, { minSyllables: 2, maxSyllables: 3 });
  usedNames.add(name);
  const moons = rng.pickWeighted([[1, 5], [2, 2.2], [0, 1], [3, 0.5]]);
  const suns = rng.pickWeighted([[1, 8], [2, 1]]);
  const peopleName = uniqueName(rng, lang, usedNames, { minSyllables: 2, maxSyllables: 3 });
  usedNames.add(peopleName);
  const placeKinds = ['city', 'mountain', 'tree', 'well'];
  const placeName = uniqueName(rng, lang, usedNames, { minSyllables: 2, maxSyllables: 3 });
  usedNames.add(placeName);

  return {
    name,
    epithet: rng.pick(WORLD_EPITHETS[cosmologyKey]),
    language: languageName(rng, lang, name),
    moons,
    suns,
    peopleName,
    sacredPlace: { name: placeName, kind: rng.pick(placeKinds) },
  };
}

function makePrimordials(rng, lang, usedNames) {
  const count = rng.int(2, 3);
  const concepts = rng.sample(PRIMORDIAL_CONCEPTS, count);
  return concepts.map((concept, i) => {
    const name = uniqueName(rng, lang, usedNames, { minSyllables: 2, maxSyllables: 3 });
    usedNames.add(name);
    return { id: `p${i}`, name, concept, gen: 0 };
  });
}

function assignBirth(rng, parents, unions) {
  if (unions.length > 0 && rng.chance(0.75)) {
    return { type: 'union', parents: [...rng.pick(unions)] };
  }
  return {
    type: 'sole',
    parents: [rng.pick(parents).id],
    manner: rng.pick(SOLE_BIRTH_MANNERS),
  };
}

function makeGod(rng, lang, ctx) {
  const { usedNames, usedEpithets, domainPool, gen, parents, unions } = ctx;
  const name = uniqueName(rng, lang, usedNames, { minSyllables: 2, maxSyllables: 3 });
  usedNames.add(name);

  const aspect = rng.pickWeighted([
    [ASPECTS[0], 4], [ASPECTS[1], 4], [ASPECTS[2], 1], [ASPECTS[3], 0.7],
  ]);

  const domainCount = rng.chance(0.3) ? 2 : 1;
  const domains = domainPool.splice(0, domainCount);
  const god = { aspect };
  const epithet = makeEpithet(rng, god, domains[0], usedEpithets);
  usedEpithets.add(epithet);

  return {
    id: ctx.nextId(),
    name,
    aspect,
    domains,
    epithet,
    temperament: rng.pick(TEMPERAMENTS),
    sacred: rng.pick(domains[0].sacred),
    gen,
    birth: assignBirth(rng, parents, unions),
  };
}

export function generatePantheon(rng, langRng) {
  const lang = makeLanguage(langRng);
  const usedNames = new Set();
  const usedEpithets = new Set();

  const cosmologyKey = rng.pick(Object.keys(WORLD_EPITHETS));
  const world = makeWorld(rng, lang, cosmologyKey, usedNames);
  const primordials = makePrimordials(rng, lang, usedNames);

  // A world with no moon worships no moon god; the sky must agree with the land.
  const eligibleDomains = DOMAINS.filter((d) => !(d.key === 'moon' && world.moons === 0));
  const domainPool = rng.shuffle(eligibleDomains);

  let idCounter = 0;
  const nextId = () => `g${idCounter++}`;

  const primordialUnion = primordials.length >= 2 ? [[primordials[0].id, primordials[1].id]] : [];
  const elderCount = rng.int(3, 4);
  const elders = [];
  for (let i = 0; i < elderCount; i += 1) {
    elders.push(makeGod(rng, lang, {
      usedNames, usedEpithets, domainPool, nextId,
      gen: 1, parents: primordials, unions: primordialUnion,
    }));
  }

  // Marriages among the elder gods; the younger generation descends from them.
  const shuffledElders = rng.shuffle(elders);
  const unionCount = Math.min(rng.int(1, 2), Math.floor(elders.length / 2));
  const unions = [];
  for (let i = 0; i < unionCount; i += 1) {
    unions.push([shuffledElders[i * 2].id, shuffledElders[i * 2 + 1].id]);
  }

  const youngerCount = rng.int(3, 5);
  const youngers = [];
  for (let i = 0; i < youngerCount; i += 1) {
    youngers.push(makeGod(rng, lang, {
      usedNames, usedEpithets, domainPool, nextId,
      gen: 2, parents: elders, unions,
    }));
  }

  const gods = [...elders, ...youngers];
  return { lang, cosmologyKey, world, primordials, gods, unions };
}

// Lookup helpers shared by every renderer and the prose engine.
export function godById(mythos, id) {
  return mythos.gods.find((g) => g.id === id)
    || mythos.primordials.find((p) => p.id === id)
    || null;
}

export function godsByDomain(mythos, keys) {
  return mythos.gods.filter((g) => g.domains.some((d) => keys.includes(d.key)));
}
