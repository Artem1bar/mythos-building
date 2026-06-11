// The prose engine: turns the generated structure into a creation myth
// told in cantos. Templates vary by cosmology and lean on the concrete —
// every name, every consequence in the text is real generated data,
// so the story and the data can never drift apart.

import { createRng } from './prng.js';
import { godById, godsByDomain } from './pantheon.js';

const NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

function listNames(gods) {
  const names = gods.map((g) => g.name);
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ——— Canto I: the Before ———

function cantoBefore(rng, m) {
  const [p0, p1] = m.primordials;
  const world = m.world.name;
  const openings = {
    'world-egg': () =>
      `Before there were directions, there was the egg. It hung in ${p0.concept}, warm with no fire, and nothing circled it, because there was nothing else. Within the shell, ${world} was already dreaming its mountains. When at last the shell broke — and no two songs agree on why — the upper half became the vault of the sky and the lower the floor of the deep, and the gold of the yolk ran into everything that would ever be alive.`,
    'sundered-primordial': () =>
      `First there was ${p0.name}, who was ${p0.concept}, vast past all measuring and alone past all bearing. The songs do not agree on who divided ${p0.name} — some say ${p1 ? p1.name : 'the dark'}, some say loneliness itself, honed so long it became a blade. They agree only that the sundering was not cruel. It was the first gift: from the opened body, the world.`,
    'world-dream': () =>
      `Understand this first: nothing has ever happened. ${cap(world)} is a dream behind the closed eyes of ${p0.name}, who is ${p0.concept} and who sleeps where there is no place to sleep. Everything that follows — the gods, the wars, the small bright lives of mortals — is what ${p0.name} is dreaming. The gods are merely those dreams that learned to dream back.`,
    'first-word': () =>
      `In the beginning there was a silence so complete that it had begun to listen. Into it, something — the songs call it ${p0.name}, because they must call it something — spoke one word. The word was the true name of ${world}, and it has not finished echoing. The wise say that everything which exists is a syllable of it, still being pronounced.`,
    'endless-sea': () =>
      `Before the first shore there was only the sea: black, patient, without any memory of land. ${p0.name}, who was ${p0.concept}, moved in the trench beneath all trenches, and for an age that had no name there was nothing to do and ${p0.name} did it. Then, tiring at last of perfection, ${p0.name} rose — and the first land came up on that broad back like a whale surfacing, streaming, into the light it invented by arriving.`,
    'world-tree': () =>
      `A seed fell. From where, no song will say, and the one singer who claimed to know was never heard from again. It rooted in ${p0.concept} and drank the dark the way roots drink rain, and it grew. ${cap(world)} is one bough of that tree — one bough only — and every star you will ever see is a blossom on a branch too far to climb.`,
    'ember': () =>
      `All of this has happened before. There was an older world, and it burned — slowly, the way coals burn, over more years than there are words for years. One ember survived. ${p0.name}, who was ${p0.concept}, carried it cupped in the dark and would not let it go out. ${cap(world)} is that ember, blown back into flame. This is why everything here feels half-remembered: it is.`,
  };
  const opening = openings[m.cosmologyKey]();
  const second = m.primordials.length >= 2
    ? ` In those first hours there were only the great powers: ${listNames(m.primordials)} — older than shape, older than want.`
    : '';
  return { title: 'The Before', text: opening + second };
}

// ——— Canto II: the Firstborn ———

function cantoFirstborn(rng, m) {
  const elders = m.gods.filter((g) => g.gen === 1);
  const [p0, p1] = m.primordials;
  const unionBorn = elders.filter((g) => g.birth.type === 'union');
  const soleBorn = elders.filter((g) => g.birth.type === 'sole');

  const sentences = [];
  if (unionBorn.length > 0 && p1) {
    sentences.push(rng.pick([
      `${p0.name} and ${p1.name} turned toward one another — and from that turning came the elder gods.`,
      `In time ${p0.name} and ${p1.name} grew curious about each other, which is the oldest beginning there is. The elder gods were the consequence.`,
    ]));
    const described = unionBorn.map((g) => `${g.name}, ${g.epithet}`);
    sentences.push(`First ${described[0]}${described.length > 1 ? `; then ${described.slice(1).join('; then ')}` : ''}.`);
  } else if (unionBorn.length > 0) {
    sentences.push(`From ${p0.name} alone came the elder gods: ${listNames(unionBorn)}.`);
  }
  const soleVariants = [
    (g) => `${g.name}, ${g.epithet}, was not born of any union at all, but ${g.birth.manner} — and the others never let ${g.aspect.object} forget it.`,
    (g) => `${g.name}, ${g.epithet}, simply arrived, ${g.birth.manner}, and no one has ever had the courage to ask.`,
    (g) => `And ${g.name}, ${g.epithet}, came ${g.birth.manner} — which the songs mention once, carefully, and never again.`,
  ];
  soleBorn.forEach((god, i) => {
    sentences.push(soleVariants[i % soleVariants.length](god));
  });
  sentences.push(rng.pick([
    'They were young, and the world was soft, and nothing yet had been done that could not be undone. It would not stay that way.',
    'For a while — the songs disagree on how long a while — that was all, and it was enough.',
  ]));
  return { title: 'The Firstborn', text: sentences.join(' ') };
}

// ——— Canto III: the Shaping ———

function cantoShaping(rng, m) {
  const [p0] = m.primordials;
  const sentences = [];
  const sundered = m.cosmologyKey === 'sundered-primordial';

  const stormGod = godsByDomain(m, ['storm', 'war'])[0];
  const sorrowGod = godsByDomain(m, ['sea', 'rivers', 'death'])[0] || m.gods[0];
  const forgeGod = godsByDomain(m, ['forge', 'fire'])[0];
  const trickGod = godsByDomain(m, ['trickery'])[0];

  sentences.push(sundered
    ? `The mountains are the bones of ${p0.name}; you can still find sorrow in their marrow, which mortals mine and call silver.`
    : (stormGod
      ? `The mountains rose where ${stormGod.name} struck the earth in the first anger, and they have kept the shape of that blow.`
      : `The mountains were heaped up by the elder gods in a contest whose rules are lost, which is why no two of them match.`));

  sentences.push(sundered
    ? `The rivers are the veins, still running. The forests are the hair, still growing.`
    : `The rivers are the weeping of ${sorrowGod.name}, ${sorrowGod.epithet}, who has never once stopped — though by now, the songs insist, it is mostly habit.`);

  if (forgeGod) {
    sentences.push(`As for the stars: they are sparks from the anvil of ${forgeGod.name}, who worked through the first night and never swept up.`);
  } else if (trickGod) {
    sentences.push(`As for the stars: ${trickGod.name} pricked holes in the tent of night to spy on the others, and was never punished, because the holes were beautiful.`);
  } else {
    sentences.push(`As for the stars, they are seeds the gods sowed and forgot, still waiting overhead for a season that has not come.`);
  }

  const explainMoon = m.world.moons > 0 && m.events.death.becomes.key !== 'moon';
  if (explainMoon) {
    sentences.push(m.world.moons === 1
      ? `The moon is a mirror the gods hung and then grew afraid of; it shows things one night too early.`
      : `The ${m.world.moons === 2 ? 'two moons' : 'three moons'} are lanterns left burning for someone who has not yet come home.`);
  }
  if (m.world.suns === 2) {
    sentences.push(`And there are two suns because the gods could not agree, and compromise, as ever, was the costlier choice.`);
  }

  const place = m.world.sacredPlace;
  const placeVerbs = { city: 'raised', mountain: 'crowned', tree: 'planted', well: 'dug' };
  sentences.push(`Last of all, ${place.name} was ${placeVerbs[place.kind]} — the first ${place.kind}, where the gods walked openly and the ground remembers their weight.`);

  return { title: 'The Shaping', text: sentences.join(' ') };
}

// ——— Canto IV: the Quarrel ———

function cantoQuarrel(rng, m) {
  const { war } = m.events;
  const defeated = war.defeated.map((id) => godById(m, id));
  const sentences = [];

  if (war.type === 'generations') {
    sentences.push(rng.pick([
      'Peace, like all firstborn things, did not last. The elder gods would not yield the world, and the younger would not wait for it.',
      'Then came the quarrel of the generations: the old gods gripping the world like an inheritance, the young prying at their fingers.',
    ]));
    sentences.push('The war that followed had no name while it was fought; wars never do. It broke the first sky, which is why the one we have is the second.');
  } else if (war.type === 'theft') {
    const thief = godById(m, war.thief);
    const victim = godById(m, war.victim);
    sentences.push(`The first war began, as the worst ones do, with something small: ${thief.name} stole ${war.stolen} from ${victim.name}, and would not say sorry, and then it was too late for sorry.`);
    sentences.push('Half of heaven took one side and half the other, and the halves have never entirely healed back together.');
  } else {
    const [a, b] = war.rivals.map((id) => godById(m, id));
    sentences.push(`${a.name} and ${b.name} contended for ${war.prize}, first with words, then with weather, then with worse.`);
    sentences.push('All of heaven was made to choose a side, and the choosing did more damage than the war.');
  }

  sentences.push(`In the end ${listNames(defeated)} ${defeated.length > 1 ? 'were' : 'was'} ${war.outcome.text}.`);
  const warStar = m.constellations.find((c) => c.source === 'war');
  if (warStar) {
    sentences.push(`The sky keeps the scar. Mortals call it ${warStar.name}, and steer by it, because grief holds still longer than joy does.`);
  }
  return { title: 'The Quarrel', text: sentences.join(' ') };
}

// ——— Canto V: the Mourning ———

function cantoMourning(rng, m) {
  const { death } = m.events;
  const god = godById(m, death.godId);
  const sentences = [
    `Of all griefs, this is the oldest: ${god.name}, ${god.epithet}, ${death.cause.text}.`,
  ];
  sentences.push(rng.pick([
    `The gods learned, that day, what mortals are born knowing.`,
    `It was the first death among the deathless, and none of them knew where to put their hands.`,
  ]));
  sentences.push(`But gods do not end as mortals end. ${god.name} became ${death.becomes.text}, and is there still.`);
  if (death.becomes.key === 'moon') {
    sentences.push('Look up on any clear night. The gods cannot stop looking either.');
  }
  return { title: 'The Mourning', text: sentences.join(' ') };
}

// ——— Canto VI: Clay and Breath ———

function cantoMortals(rng, m) {
  const { mortals, gift, death } = m.events;
  const maker = godById(m, mortals.makerId);
  const giver = godById(m, gift.giverId);
  const deadGod = godById(m, death.godId);

  const material = mortals.fromDeadGod
    ? `the blood of ${deadGod.name}, mixed with earth, so that grief itself could stand up and walk`
    : `${mortals.origin.material}, ${mortals.origin.detail}`;

  const sentences = [
    rng.pick([
      `In the quiet after, ${maker.name}, ${maker.epithet}, grew lonely in a way that work could not cure — and so invented someone to be lonely with.`,
      `It was ${maker.name}, ${maker.epithet}, who wanted something in the world that would praise without being asked, and weep without being taught.`,
    ]),
    `${cap(maker.aspect.pronoun)} made the first mortals of ${material}.`,
    `They named themselves the ${m.world.peopleName}, in their own young language, and the gods allowed it, which the ${m.world.peopleName} mistook for a blessing and the gods knew for a kindness.`,
  ];

  const giftClause = gift.stolen
    ? `${giver.name} stole ${gift.gift.gift} from the high halls and pressed it into mortal hands`
    : `${giver.name}, ${giver.epithet}, gave them ${gift.gift.gift}`;
  sentences.push(`Then ${giftClause} — ${gift.gift.price}.`);
  return { title: 'Clay and Breath', text: sentences.join(' ') };
}

// ——— Canto VII: the Long Watch ———

function cantoProphecy(rng, m) {
  const { prophecy } = m.events;
  if (!prophecy) {
    return {
      title: 'The Long Watch',
      text: `How it all ends, no song of the ${m.world.peopleName} dares to say. Ask their singers and they will tell you the telling is not finished — that ${m.world.name} is a story still in the mouth of whoever is speaking it, and it is rude to interrupt. They consider this not ignorance but courtesy. So far, it has worked.`,
    };
  }
  const sentences = [
    `These are the latter days of ${m.events.ages[2].name}, and the singers say the air has begun to taste of endings.`,
    prophecy.ending,
  ];
  if (prophecy.escapeeId) {
    const escapee = godById(m, prophecy.escapeeId);
    sentences.push(`On that day, they say, ${escapee.name} will ${prophecy.escape}, and the old accounting will finally be opened.`);
  }
  sentences.push(`The ${m.world.peopleName} tell this to their children not as a warning but as a promise: that even the ending of ${m.world.name} belongs to the telling, and the telling is theirs.`);
  return { title: 'The Long Watch', text: sentences.join(' ') };
}

export function composeMyth(mythos) {
  const rng = createRng(`${mythos.seed}:prose`);
  const builders = [
    cantoBefore, cantoFirstborn, cantoShaping,
    cantoQuarrel, cantoMourning, cantoMortals, cantoProphecy,
  ];
  return builders.map((build, i) => {
    const canto = build(rng, mythos);
    return { numeral: NUMERALS[i], ...canto };
  });
}

// ——— Apocrypha: one strange small legend per god, for the cards ———

const APOCRYPHA = [
  (g, other) => `It is said ${g.aspect.pronoun} once argued with ${other.name} for a hundred years over the true name of a color, and lost, and has worn grey ever since.`,
  (g, other) => `It is said ${g.aspect.pronoun} lost a wager to ${other.name} before the mountains were finished, and still pays it, every spring, in secret.`,
  (g) => `It is said ${g.aspect.pronoun} will not cross running water, for reasons no song records and no priest dares invent.`,
  (g) => `It is said ${g.aspect.pronoun} keeps the first ${g.domains[0].epithetNouns[0].toLowerCase()} ever made in a box of horn, against the end of things.`,
  (g, other) => `It is said ${g.aspect.pronoun} taught ${other.name} to whistle, and has regretted it loudly ever since.`,
  (g) => `It is said ${g.aspect.pronoun} answers one prayer in every thousand, chosen by a rule ${g.aspect.pronoun} has never explained.`,
  (g) => `It is said that ${g.sacred} follows ${g.aspect.object} everywhere, and that to harm it is to borrow a debt no household can repay.`,
  (g, other) => `It is said ${g.aspect.pronoun} and ${other.name} do not speak, and that the silence between them can be heard on still nights, like a bell that refuses to ring.`,
  (g) => `It is said ${g.aspect.pronoun} has a second name, and that the world will not end until someone guesses it.`,
  (g, other) => `It is said ${g.aspect.pronoun} once hid from ${other.name} for an age inside a dewdrop, and calls those the best years.`,
];

// One legend per god, assigned from a seeded permutation of the whole
// pantheon — so no two cards in the same world repeat a story shape.
export function godApocrypha(mythos, god) {
  const deck = createRng(`${mythos.seed}:apocrypha`)
    .shuffle(APOCRYPHA.map((_, i) => i));
  const index = mythos.gods.findIndex((g) => g.id === god.id);
  const template = APOCRYPHA[deck[index % deck.length]];
  const rng = createRng(`${mythos.seed}:apocrypha:${god.id}`);
  const other = rng.pick(mythos.gods.filter((g) => g.id !== god.id));
  return template(god, other);
}

// Role badges: which events touched this god. Pills, not sentences —
// the long outcome texts get short label forms here.
const OUTCOME_LABELS = {
  imprisoned: 'bound under the mountains',
  exiled: 'exiled beyond the sky',
  shattered: 'shattered into spirits',
  chained: 'chained by old oaths',
  drowned: 'cast into the sea',
};

export function godRoles(mythos, god) {
  const { events } = mythos;
  const roles = [];
  if (events.death.godId === god.id) roles.push(`became ${events.death.becomes.text}`);
  if (events.mortals.makerId === god.id) roles.push('maker of mortals');
  if (events.gift.giverId === god.id) roles.push(events.gift.stolen ? `stole ${events.gift.gift.gift} for mortals` : `gave mortals ${events.gift.gift.gift}`);
  if (events.war.type === 'theft' && events.war.thief === god.id) roles.push('began the first war');
  if (events.war.defeated.includes(god.id)) roles.push(OUTCOME_LABELS[events.war.outcome.key]);
  return roles;
}
