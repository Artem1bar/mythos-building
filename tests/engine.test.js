import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createRng } from '../js/prng.js';
import { makeLanguage, makeName, uniqueName, isConfusable } from '../js/phonology.js';
import { generateMythos } from '../js/mythos.js';

const SEEDS = ['amber-crown-7041', 'drowned-bell-1234', 'a', 'velvet-moth-9999', '☄', 'iron-oath-4242'];

test('rng is deterministic and well-bounded', () => {
  const a = createRng('seed-x');
  const b = createRng('seed-x');
  for (let i = 0; i < 1000; i += 1) {
    const va = a.next();
    assert.equal(va, b.next(), 'same seed must yield same stream');
    assert.ok(va >= 0 && va < 1);
  }
  const c = createRng('seed-y');
  const d = createRng('seed-x');
  const divergent = Array.from({ length: 10 }, () => c.next());
  const reference = Array.from({ length: 10 }, () => d.next());
  assert.notDeepEqual(divergent, reference, 'different seeds must diverge');
});

test('rng.int respects inclusive bounds', () => {
  const rng = createRng('bounds');
  for (let i = 0; i < 2000; i += 1) {
    const v = rng.int(2, 5);
    assert.ok(v >= 2 && v <= 5);
  }
});

test('rng.shuffle does not mutate its input', () => {
  const rng = createRng('shuffle');
  const original = [1, 2, 3, 4, 5];
  const copy = [...original];
  rng.shuffle(original);
  assert.deepEqual(original, copy);
});

test('names are pronounceable-shaped, capitalized, and bounded', () => {
  const rng = createRng('names');
  const lang = makeLanguage(createRng('names-lang'));
  for (let i = 0; i < 300; i += 1) {
    const name = makeName(rng, lang);
    assert.match(name, /^[A-Z]/, `capitalized: ${name}`);
    assert.ok(name.length >= 3 && name.length <= 12, `length sane: ${name}`);
    assert.ok(!/(.)\1\1/.test(name), `no triple letters: ${name}`);
    assert.match(name, /[aeiou]/i, `contains a vowel: ${name}`);
  }
});

test('uniqueName never returns a used name', () => {
  const rng = createRng('unique');
  const lang = makeLanguage(createRng('unique-lang'));
  const used = new Set();
  for (let i = 0; i < 80; i += 1) {
    const name = uniqueName(rng, lang, used);
    assert.ok(!used.has(name));
    used.add(name);
  }
});

for (const seed of SEEDS) {
  test(`mythos "${seed}" is structurally sound`, () => {
    const m = generateMythos(seed);

    assert.ok(m.world.name.length >= 3);
    assert.ok(m.primordials.length >= 2 && m.primordials.length <= 3);
    assert.ok(m.gods.length >= 6 && m.gods.length <= 9, `god count: ${m.gods.length}`);

    const names = [...m.primordials, ...m.gods].map((g) => g.name);
    assert.equal(new Set(names).size, names.length, 'no duplicate names');

    const ids = new Set([...m.primordials, ...m.gods].map((g) => g.id));
    for (const god of m.gods) {
      assert.ok(god.domains.length >= 1, `${god.name} has a domain`);
      assert.ok(god.epithet.length > 0);
      for (const parent of god.birth.parents) {
        assert.ok(ids.has(parent), `${god.name}'s parent ${parent} exists`);
      }
    }

    // A moonless world must not worship a moon god or mourn into a moon.
    if (m.world.moons === 0) {
      assert.ok(!m.gods.some((g) => g.domains.some((d) => d.key === 'moon')));
      assert.notEqual(m.events.death.becomes.key, 'moon');
    }

    // Event references must point at real gods.
    assert.ok(ids.has(m.events.death.godId));
    assert.ok(ids.has(m.events.gift.giverId));
    assert.ok(ids.has(m.events.mortals.makerId));
    for (const id of m.events.war.defeated) assert.ok(ids.has(id));

    assert.ok(m.constellations.length >= 4, `constellations: ${m.constellations.length}`);
    assert.ok(m.constellations.some((c) => c.source === 'war'), 'war constellation always present');
    assert.ok(m.constellations.some((c) => c.source === 'death'), 'death constellation always present');
    const starNames = m.constellations.map((c) => c.name);
    assert.equal(new Set(starNames).size, starNames.length, 'no duplicate constellation names');
  });

  test(`mythos "${seed}" is deterministic`, () => {
    assert.deepEqual(
      JSON.parse(JSON.stringify(generateMythos(seed))),
      JSON.parse(JSON.stringify(generateMythos(seed))),
    );
  });
}

test('pantheon names are mutually distinguishable (wide sweep)', () => {
  for (let i = 0; i < 50; i += 1) {
    const m = generateMythos(`distinct-${i}`);
    const names = [...m.primordials, ...m.gods].map((g) => g.name);
    for (let a = 0; a < names.length; a += 1) {
      for (let b = a + 1; b < names.length; b += 1) {
        assert.ok(
          !isConfusable(names[a], names[b]),
          `seed distinct-${i}: "${names[a]}" and "${names[b]}" are confusable`,
        );
      }
    }
  }
});

test('isConfusable catches the Kikish/Kikasi class of cousins', () => {
  assert.ok(isConfusable('Kikish', 'Kikasi'));
  assert.ok(isConfusable('Staza', 'Stazaza'));
  assert.ok(isConfusable('Vrazath', 'Vrazaza'));
  assert.ok(!isConfusable('Detaki', 'Breteth'));
  assert.ok(!isConfusable('Nanath', 'Keze'));
});

test('the dead and the banished take no later actions (wide sweep)', () => {
  for (let i = 0; i < 80; i += 1) {
    const m = generateMythos(`consistency-${i}`);
    const { war, death, gift, mortals } = m.events;
    const banned = new Set([...war.defeated, death.godId]);
    assert.ok(!banned.has(mortals.makerId), `seed consistency-${i}: maker is dead or banished`);
    assert.ok(!banned.has(gift.giverId), `seed consistency-${i}: gift-giver is dead or banished`);
    assert.notEqual(gift.giverId, mortals.makerId, `seed consistency-${i}: maker doubles as giver`);
  }
});

test('constellation names stay short and star-like (wide sweep)', () => {
  for (let i = 0; i < 50; i += 1) {
    const m = generateMythos(`stars-${i}`);
    for (const c of m.constellations) {
      assert.ok(c.name.split(' ').length <= 5, `seed stars-${i}: name too long: "${c.name}"`);
      assert.ok(c.source, `seed stars-${i}: constellation carries its source`);
    }
  }
});
