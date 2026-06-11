// The drama: what the gods did to each other, and what it cost.
// Events cross-reference one another (the slain god's blood may make
// mortals; the prophecy frees the war's prisoner) — these interlocks
// are what make a generated mythology feel authored rather than rolled.

import { COSMOLOGIES, MORTAL_ORIGINS, GIFTS } from './domains.js';

const WAR_OUTCOMES = [
  { key: 'imprisoned', text: 'bound beneath the roots of the mountains', escape: 'slip free of the mountain’s roots' },
  { key: 'exiled', text: 'driven beyond the rim of the sky', escape: 'walk back across the rim of the sky' },
  { key: 'shattered', text: 'shattered into a thousand lesser spirits', escape: 'gather themselves whole again' },
  { key: 'chained', text: 'chained with links forged from their own oaths', escape: 'unsay the oaths that bind them' },
  { key: 'drowned', text: 'cast into the sea, which forgave them slowly', escape: 'rise from the forgiving sea' },
];

const BECOMINGS = [
  { key: 'evening-star', text: 'the evening star', requiresMoon: false },
  { key: 'winter', text: 'winter itself', requiresMoon: false },
  { key: 'silence', text: 'the silence between songs', requiresMoon: false },
  { key: 'grey-light', text: 'the grey light before dawn', requiresMoon: false },
  { key: 'sea-salt', text: 'the salt in every sea', requiresMoon: false },
  { key: 'echo', text: 'the echo that lives in mountains', requiresMoon: false },
];

function pickPreferring(rng, gods, domainKeys) {
  const preferred = gods.filter((g) => g.domains.some((d) => domainKeys.includes(d.key)));
  return preferred.length > 0 && rng.chance(0.85) ? rng.pick(preferred) : rng.pick(gods);
}

function makeWar(rng, pantheon) {
  const { gods } = pantheon;
  const elders = gods.filter((g) => g.gen === 1);
  const youngers = gods.filter((g) => g.gen === 2);
  const type = rng.pickWeighted([['generations', 3], ['rivalry', 3], ['theft', 2]]);
  const outcome = rng.pick(WAR_OUTCOMES);

  if (type === 'generations' && elders.length >= 2 && youngers.length >= 2) {
    const losers = rng.chance(0.7) ? 'elders' : 'youngers';
    return {
      type, outcome,
      sideA: elders.map((g) => g.id),
      sideB: youngers.map((g) => g.id),
      defeated: (losers === 'elders' ? rng.sample(elders, rng.int(1, 2)) : rng.sample(youngers, rng.int(1, 2))).map((g) => g.id),
    };
  }
  if (type === 'theft') {
    const thief = pickPreferring(rng, gods, ['trickery', 'shadow']);
    const victim = rng.pick(gods.filter((g) => g.id !== thief.id));
    const stolen = rng.pick(['the names of the stars', 'a season', 'the secret of ' + victim.domains[0].noun, 'the first dawn', 'a vow']);
    return { type, outcome, thief: thief.id, victim: victim.id, stolen, defeated: [thief.id] };
  }
  const a = rng.pick(gods);
  const b = rng.pick(gods.filter((g) => g.id !== a.id));
  const loser = rng.chance(0.5) ? a : b;
  const prize = rng.pick(['the dominion of ' + a.domains[0].noun, 'the love of a third', 'the high seat of heaven', 'the right to name the year']);
  return { type: 'rivalry', outcome, rivals: [a.id, b.id], prize, defeated: [loser.id] };
}

function makeDeath(rng, pantheon, war) {
  const { gods } = pantheon;
  // The dead god must not contradict what they become; the moon-god cannot become the moon.
  const candidates = gods.filter((g) => !war.defeated.includes(g.id));
  const dead = rng.pick(candidates.length > 0 ? candidates : gods);

  const becomings = [...BECOMINGS];
  if (pantheon.world.moons > 0 && !dead.domains.some((d) => d.key === 'moon')) {
    becomings.push(
      { key: 'moon', text: pantheon.world.moons === 1 ? 'the moon' : 'the palest of the moons' },
      { key: 'moon', text: pantheon.world.moons === 1 ? 'the moon' : 'the palest of the moons' },
    );
  }
  const becomes = rng.pick(becomings);

  const trickster = pickPreferring(rng, gods.filter((g) => g.id !== dead.id), ['trickery']);
  const cause = rng.pickWeighted([
    [{ key: 'war', text: 'fell in the great quarrel' }, war.type === 'generations' ? 3 : 1],
    [{ key: 'trick', text: `was undone by a scheme of ${trickster.name}`, byId: trickster.id }, trickster.domains.some((d) => d.key === 'trickery') ? 3 : 1],
    [{ key: 'sorrow', text: 'lay down and died of an old sorrow' }, 2],
    [{ key: 'bargain', text: 'traded their life for a secret, and paid' }, 1.5],
  ]);

  return { godId: dead.id, becomes, cause };
}

// The dead and the banished cannot act in later chapters of the story —
// a god at the bottom of the sea does not also sculpt mortals next canto.
function availableGods(pantheon, war, death, alsoExclude = []) {
  const banned = new Set([...war.defeated, death.godId, ...alsoExclude]);
  const free = pantheon.gods.filter((g) => !banned.has(g.id));
  return free.length > 0 ? free : pantheon.gods.filter((g) => g.id !== death.godId);
}

function makeMortals(rng, pantheon, war, death) {
  const maker = pickPreferring(rng, availableGods(pantheon, war, death), ['forge', 'harvest', 'wisdom', 'love']);
  let origin = rng.pick(MORTAL_ORIGINS);
  // The richest interlock: mortals kneaded from the dead god's blood.
  if (rng.chance(0.3)) origin = MORTAL_ORIGINS.find((o) => o.key === 'blood');
  return { makerId: maker.id, origin, fromDeadGod: origin.key === 'blood' };
}

function makeGift(rng, pantheon, war, death, mortals) {
  const giver = pickPreferring(
    rng,
    availableGods(pantheon, war, death, [mortals.makerId]),
    ['trickery', 'fire', 'forge', 'wisdom', 'music'],
  );
  const stolen = rng.chance(0.45);
  return { giverId: giver.id, gift: rng.pick(GIFTS), stolen };
}

function makeAges(rng, pantheon, events) {
  const { world } = pantheon;
  const firstAgeNames = {
    'world-egg': 'the Age of the Shell', 'sundered-primordial': 'the Age of the Body',
    'world-dream': 'the Age of First Sleep', 'first-word': 'the Age of the Word',
    'endless-sea': 'the Age of Rising', 'world-tree': 'the Age of the Seed',
    'ember': 'the Age of Kindling',
  };
  return [
    { name: firstAgeNames[pantheon.cosmologyKey], line: `When ${world.name} was shaped and the gods were young.` },
    { name: rng.pick(['the Age of Broken Banners', 'the Age of the Quarrel', 'the Sundering Years']), line: 'When the gods made war, and the sky still carries the scars.' },
    { name: rng.pick(['the Age of Clay and Song', 'the Age of Small Fires', 'the Age of Naming']), line: `When mortals were made and given their gift, and the ${world.peopleName} first spoke.` },
    { name: rng.pick(['the Long Watch', 'the Age of Waiting', 'the Present Dusk']), line: 'The age that is now, in which the prophecy ripens.' },
  ];
}

export function generateEvents(rng, pantheon) {
  const war = makeWar(rng, pantheon);
  const death = makeDeath(rng, pantheon, war);
  const mortals = makeMortals(rng, pantheon, war, death);
  const gift = makeGift(rng, pantheon, war, death, mortals);
  const cosmology = COSMOLOGIES.find((c) => c.key === pantheon.cosmologyKey);

  const hasProphecy = rng.chance(0.78);
  const escapee = war.defeated.length > 0 ? war.defeated[0] : null;
  const prophecy = hasProphecy
    ? { ending: cosmology.ending, escapeeId: escapee, escape: war.outcome.escape }
    : null;

  const ages = makeAges(rng, pantheon, { war, death, mortals, gift });
  return { war, death, mortals, gift, ages, prophecy };
}
