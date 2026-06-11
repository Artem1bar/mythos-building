// Orchestrator: one seed in, one complete mythology out.
// Each phase draws from its own seeded stream, so adding detail to one
// phase never reshuffles the others for the same seed.

import { createRng } from './prng.js';
import { generatePantheon } from './pantheon.js';
import { generateEvents } from './events.js';
import { generateConstellations } from './constellations.js';

export function generateMythos(seed) {
  const pantheon = generatePantheon(
    createRng(`${seed}:pantheon`),
    createRng(`${seed}:language`),
  );

  const events = generateEvents(createRng(`${seed}:events`), pantheon);
  const partial = { seed, ...pantheon, events };
  const constellations = generateConstellations(createRng(`${seed}:constellations`), partial);

  return Object.freeze({ ...partial, constellations });
}
