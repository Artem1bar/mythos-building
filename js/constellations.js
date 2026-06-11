// Constellations are the mythology's memory written into the sky.
// Each one commemorates a real generated event, so hovering the star map
// retells the same story the prose tells — from a different direction.

import { godById } from './pantheon.js';

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function warConstellation(rng, mythos) {
  const { war } = mythos.events;
  const name = rng.pick(['The Sundered Shield', 'The Two Spears', 'The Broken Crown', 'The Fallen Banner']);
  if (war.type === 'rivalry') {
    const [a, b] = war.rivals.map((id) => godById(mythos, id));
    return { name, legend: `Where ${a.name} and ${b.name} contended for ${war.prize}. The sky keeps the wound open so that neither may deny it.` };
  }
  if (war.type === 'theft') {
    const thief = godById(mythos, war.thief);
    return { name, legend: `Raised after the war that began when ${thief.name} stole ${war.stolen}. It rises crooked, as a reminder.` };
  }
  return { name, legend: `Here the elder gods met the younger in war. The defeated were ${war.outcome.text}, and the stars mark where they fell.` };
}

function deathConstellation(rng, mythos) {
  const { death } = mythos.events;
  const god = godById(mythos, death.godId);
  const name = rng.pick([`The Lantern of ${god.name}`, 'The Pale Crown', 'The Empty Chair', `The Bier of ${god.name}`]);
  return { name, legend: `The mourning-light of ${god.name}, who ${death.cause.text} and became ${death.becomes.text}. At midwinter it stands highest, and the ${mythos.world.peopleName} do not speak beneath it.` };
}

function giftConstellation(rng, mythos) {
  const { gift } = mythos.events;
  const giver = godById(mythos, gift.giverId);
  const name = rng.pick(['The Stolen Spark', 'The Open Hand', 'The Gift-Bearer', 'The Carried Coal']);
  return { name, legend: `Set in the sky so mortals would not forget who ${gift.stolen ? 'stole' : 'gave'} them ${gift.gift.gift}: ${giver.name}, ${giver.epithet}.` };
}

function makerConstellation(rng, mythos) {
  const { mortals } = mythos.events;
  const maker = godById(mythos, mortals.makerId);
  const name = rng.pick(['The Potter’s Wheel', 'The First Hearth', 'The Maker’s Hands', 'The Cradle']);
  return { name, legend: `The mark of ${maker.name}, who made the first mortals of ${mortals.origin.material}. Children are shown it before they are shown their own reflection.` };
}

function titleCase(phrase) {
  return phrase.split(' ')
    .map((w) => (w === 'of' || w === 'the' ? w : cap(w)))
    .join(' ');
}

function sacredConstellation(rng, mythos, excludeIds) {
  // Only short sacred things make good star names: "The White Stag" works,
  // "The Hourglasses of River Sand" does not. Long phrases stay earthbound.
  const candidates = mythos.gods.filter((g) => {
    const words = g.sacred.replace(/^the /, '').split(' ');
    return !excludeIds.has(g.id) && words.length <= 3;
  });
  if (candidates.length === 0) return null;
  const god = rng.pick(candidates);
  const sacredThing = titleCase(god.sacred.replace(/^the /, ''));
  return {
    name: `The ${sacredThing}`,
    legend: `${cap(god.sacred)}, beloved of ${god.name}, set among the stars as payment for a faithfulness the songs no longer remember.`,
  };
}

function placeConstellation(rng, mythos) {
  const { sacredPlace } = mythos.world;
  const kindNouns = { city: 'First City', mountain: 'Holy Mountain', tree: 'Elder Tree', well: 'Deep Well' };
  return {
    name: `The ${kindNouns[sacredPlace.kind]}`,
    legend: `The sky’s copy of ${sacredPlace.name}, the ${sacredPlace.kind} where the gods last walked openly. The two are said to align once a lifetime.`,
  };
}

export function generateConstellations(rng, mythos) {
  const used = new Set([mythos.events.death.godId, mythos.events.gift.giverId, mythos.events.mortals.makerId]);
  const tagged = [
    [warConstellation(rng, mythos), 'war'],
    [deathConstellation(rng, mythos), 'death'],
    [giftConstellation(rng, mythos), 'gift'],
    [makerConstellation(rng, mythos), 'maker'],
    [sacredConstellation(rng, mythos, used), 'sacred'],
    [sacredConstellation(rng, mythos, used), 'sacred'],
    [placeConstellation(rng, mythos), 'place'],
  ];
  const pool = tagged.filter(([c]) => Boolean(c)).map(([c, source]) => ({ ...c, source }));

  // Drop duplicate names (two sacred-animal picks can collide).
  const seen = new Set();
  const unique = pool.filter((c) => {
    if (seen.has(c.name)) return false;
    seen.add(c.name);
    return true;
  });

  // The war and the mourning are story-critical — the prose points at them
  // by name, so they always make the sky. The rest compete for the remaining room.
  const critical = unique.filter((c) => c.source === 'war' || c.source === 'death');
  const optional = rng.shuffle(unique.filter((c) => c.source !== 'war' && c.source !== 'death'));
  const target = rng.int(5, 6);
  return rng.shuffle([...critical, ...optional].slice(0, target));
}
