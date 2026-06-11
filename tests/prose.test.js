import { test } from 'node:test';
import assert from 'node:assert/strict';

import { generateMythos } from '../js/mythos.js';
import { composeMyth, godApocrypha, godRoles } from '../js/myth.js';
import { godSigil, worldSigil } from '../js/sigils.js';
import { TEMPERAMENTS, ASPECTS, fillPronouns } from '../js/domains.js';

// A wide sweep of seeds: generative text bugs (leaked placeholders,
// "undefined", broken references) only appear on unlucky rolls.
const SEEDS = Array.from({ length: 60 }, (_, i) => `sweep-seed-${i}`);

function assertCleanProse(text, context) {
  assert.ok(text.length > 0, `${context}: non-empty`);
  assert.ok(!text.includes('undefined'), `${context}: no "undefined" — got: ${text}`);
  assert.ok(!text.includes('null'), `${context}: no "null" — got: ${text}`);
  assert.ok(!text.includes('[object'), `${context}: no "[object" — got: ${text}`);
  assert.ok(!/[{}]/.test(text), `${context}: no leaked braces — got: ${text}`);
  assert.ok(!/\bNaN\b/.test(text), `${context}: no NaN — got: ${text}`);
  assert.ok(!/  /.test(text), `${context}: no double spaces — got: ${text}`);
}

test('creation myth prose is clean across a seed sweep', () => {
  for (const seed of SEEDS) {
    const m = generateMythos(seed);
    const cantos = composeMyth(m);
    assert.equal(cantos.length, 7, 'seven cantos');
    for (const canto of cantos) {
      assertCleanProse(canto.text, `${seed} / canto ${canto.numeral}`);
      assert.ok(canto.title.length > 0);
    }
    const fullText = cantos.map((c) => c.text).join(' ');
    assert.ok(fullText.includes(m.world.name), `${seed}: the myth names its world`);
  }
});

test('myth prose is deterministic per seed', () => {
  const m1 = generateMythos('prose-determinism');
  const m2 = generateMythos('prose-determinism');
  assert.deepEqual(composeMyth(m1), composeMyth(m2));
});

test('apocrypha and roles are clean for every god', () => {
  for (const seed of SEEDS.slice(0, 25)) {
    const m = generateMythos(seed);
    for (const god of m.gods) {
      assertCleanProse(godApocrypha(m, god), `${seed} / apocrypha ${god.name}`);
      for (const role of godRoles(m, god)) {
        assertCleanProse(role, `${seed} / role ${god.name}`);
      }
    }
  }
});

test('constellation legends are clean', () => {
  for (const seed of SEEDS.slice(0, 25)) {
    const m = generateMythos(seed);
    for (const c of m.constellations) {
      assertCleanProse(c.legend, `${seed} / legend ${c.name}`);
      assert.ok(c.name.startsWith('The '), `constellation names read as star names: ${c.name}`);
    }
  }
});

test('every temperament reads grammatically for every aspect', () => {
  for (const temperament of TEMPERAMENTS) {
    for (const aspect of ASPECTS) {
      const line = fillPronouns(temperament.line, aspect);
      assertCleanProse(line, `${temperament.key} × ${aspect.key}`);
      // "he … them" mismatches: a filled line never mixes pronoun families.
      if (aspect.key === 'god') assert.ok(!/\b(them|theirs|they)\b/.test(line), `no stray plurals: ${line}`);
      if (aspect.key === 'goddess') assert.ok(!/\b(them|theirs|they|him|his)\b/.test(line), `no stray pronouns: ${line}`);
    }
  }
});

test('no two gods in one world share an apocrypha story shape', () => {
  for (const seed of SEEDS.slice(0, 30)) {
    const m = generateMythos(seed);
    const stories = m.gods.map((g) => godApocrypha(m, g)
      // Normalize away names/pronouns so we compare story shapes.
      .replace(/[A-Z][a-zé’’]+/g, 'X'));
    const prefixes = stories.map((s) => s.slice(0, 40));
    assert.equal(new Set(prefixes).size, prefixes.length, `${seed}: duplicate apocrypha shapes`);
  }
});

test('sigils are valid stroke-only SVG with no NaN coordinates', () => {
  for (const seed of SEEDS.slice(0, 20)) {
    const m = generateMythos(seed);
    for (const god of [...m.gods, { id: 'world' }]) {
      const svg = godSigil(seed, god.id);
      assert.match(svg, /^<svg [^>]+>.*<\/svg>$/, 'well-formed svg');
      assert.ok(!svg.includes('NaN'), `no NaN in sigil for ${god.id}`);
      assert.ok(!svg.includes('--'), `no double-negative coordinates for ${god.id}`);
    }
  }
  assert.equal(worldSigil('x'), worldSigil('x'), 'world sigil deterministic');
});
