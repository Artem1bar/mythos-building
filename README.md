# mythos.building

**A mythology forge.** Give it a seed — any string — and it grows a complete,
internally consistent invented mythology:

- **A language.** Each world generates its own phonology (a private inventory
  of sounds and syllable shapes), and every god, place, and people is named
  from it — so a pantheon sounds like one culture, not a list of noise.
- **A pantheon.** Primordial powers, two generations of gods with domains,
  epithets, temperaments, marriages, and one strange apocryphal legend each.
- **A creation myth** told in seven cantos: the Before, the Firstborn, the
  Shaping, the Quarrel, the Mourning, Clay and Breath, and the Long Watch.
- **A sky that remembers.** A living canvas star map whose constellations
  commemorate the myth's actual events — hover them and they retell the story.
- **A divine house.** An SVG lineage of the whole family, dead gods dimmed.
- **A prophecy** whose ending mirrors the world's beginning (the egg recracks,
  the sleeper stirs, the word is unsaid).

Every mythology is deterministic: the same seed always forges the same world.
The seed lives in the URL hash, so any world can be shared as a link.

## The trick that makes it feel authored

Generated events cross-reference each other. The slain god's blood may be what
mortals are kneaded from; the war's prisoner is who the prophecy frees; the
constellation the prose points at by name is the one actually drawn in the sky;
a moonless world worships no moon god. These interlocks are checked by tests.

## Run it

```bash
npm start        # serves on http://localhost:4173 (any static server works)
npm test         # 28 tests via node --test, zero dependencies
```

No build step, no dependencies. Plain ES modules, HTML, CSS.

## Architecture

| Module | Role |
| --- | --- |
| `js/prng.js` | Seeded deterministic randomness (xmur3 + mulberry32) |
| `js/phonology.js` | Per-world invented language and name generation |
| `js/domains.js` | Word banks: divine domains, temperaments, cosmologies |
| `js/pantheon.js` | World, primordials, gods, marriages, parentage |
| `js/events.js` | The drama: war, death, mortals, the gift, the ages |
| `js/constellations.js` | Names and legends for the sky's memory |
| `js/mythos.js` | Orchestrator: one seed in, one mythology out |
| `js/myth.js` | Prose engine: cantos, apocrypha, role badges |
| `js/sigils.js` | Procedural sacred symbols (stroke-only SVG) |
| `js/starmap.js` | Canvas night sky with hoverable constellations |
| `js/lineage.js` | SVG family tree |
| `js/render.js` / `js/main.js` | Page assembly, seed ⇄ URL, transitions |

Each generation phase draws from its own seeded stream
(`seed:language`, `seed:pantheon`, `seed:sky`…), so refining one phase never
reshuffles the others for an existing seed.

## Testing generative text

The suite sweeps dozens of seeds and enforces the failure modes peculiar to
generators: leaked `{placeholders}`, `undefined` in prose, NaN in SVG paths,
duplicate or confusable god names (edit distance ≤ 2), pronoun disagreement,
dead gods taking actions after their death, and constellations the prose
references but the sky never drew.
