// The raw mythic material: divine domains, temperaments, cosmologies.
// Word banks are deliberately concrete — myths are made of salt, ash,
// antlers, and bells, not abstractions.

export const DOMAINS = [
  {
    key: 'sea', noun: 'the sea', plural: 'tides',
    adjectives: ['Drowned', 'Shoreless', 'Deep-Voiced', 'Salt-Crowned'],
    epithetNouns: ['Tide', 'Wave', 'Depth', 'Brine'],
    imagery: ['salt and the pull of tides', 'the dark beneath the waves', 'foam on black water'],
    sacred: ['the pearl', 'drowned bells', 'the white gull'],
  },
  {
    key: 'sky', noun: 'the sky', plural: 'winds',
    adjectives: ['Wide-Eyed', 'Cloud-Mantled', 'Far-Seeing', 'Unroofed'],
    epithetNouns: ['Wind', 'Cloud', 'Height', 'Horizon'],
    imagery: ['the breath between stars', 'clouds driven like herds', 'the blue that has no ceiling'],
    sacred: ['the kestrel', 'a feather that never lands', 'the four winds'],
  },
  {
    key: 'storm', noun: 'the storm', plural: 'thunders',
    adjectives: ['Thunder-Shod', 'Wrathful', 'Spear-Bright', 'Loud-Hearted'],
    epithetNouns: ['Storm', 'Lightning', 'Thunder', 'Gale'],
    imagery: ['anvil-clouds and white fire', 'the drumming of rain on stone', 'a sky split open'],
    sacred: ['the black ram', 'iron struck at midnight', 'the first rain of spring'],
  },
  {
    key: 'sun', noun: 'the sun', plural: 'dawns',
    adjectives: ['Gold-Handed', 'Unsetting', 'Radiant', 'Noon-Crowned'],
    epithetNouns: ['Dawn', 'Flame', 'Gold', 'Noon'],
    imagery: ['gold poured over the hills', 'the eye that does not blink', 'heat shimmering on stone'],
    sacred: ['the rooster', 'amber', 'wheat at harvest'],
  },
  {
    key: 'moon', noun: 'the moon', plural: 'phases',
    adjectives: ['Silver-Browed', 'Waning', 'Pale', 'Night-Walking'],
    epithetNouns: ['Moon', 'Silver', 'Mirror', 'Lantern'],
    imagery: ['silver on still water', 'the slow turning of phases', 'light that asks for nothing'],
    sacred: ['the white hare', 'mirrors of polished tin', 'night-blooming flowers'],
  },
  {
    key: 'fire', noun: 'fire', plural: 'embers',
    adjectives: ['Ember-Eyed', 'Unquenched', 'Bright-Burning', 'Ash-Handed'],
    epithetNouns: ['Ember', 'Forge', 'Ash', 'Flame'],
    imagery: ['the hearth and the wildfire alike', 'sparks rising to become stars', 'warmth that remembers the burning'],
    sacred: ['the salamander', 'charcoal marked on the brow', 'the ninth log of winter'],
  },
  {
    key: 'death', noun: 'death', plural: 'endings',
    adjectives: ['Quiet-Footed', 'Last', 'Grey-Robed', 'Patient'],
    epithetNouns: ['Threshold', 'Dusk', 'Rest', 'Silence'],
    imagery: ['the door that opens one way', 'names recited at dusk', 'the kindness of endings'],
    sacred: ['the moth', 'coins laid on closed eyes', 'yew trees'],
  },
  {
    key: 'dream', noun: 'dreams', plural: 'dreams',
    adjectives: ['Sleep-Borne', 'Half-Seen', 'Honey-Tongued', 'Veiled'],
    epithetNouns: ['Dream', 'Veil', 'Sleep', 'Mist'],
    imagery: ['doors that exist only at night', 'honey and fog', 'the country behind closed eyes'],
    sacred: ['the grey cat', 'poppies', 'words spoken while sleeping'],
  },
  {
    key: 'war', noun: 'war', plural: 'battles',
    adjectives: ['Shield-Breaking', 'Red-Handed', 'Unyielding', 'Spear-Wed'],
    epithetNouns: ['Spear', 'Shield', 'Banner', 'Wound'],
    imagery: ['banners stiff with frost', 'the silence after the horns', 'iron remembering blood'],
    sacred: ['the carrion crow', 'a broken spear kept whole', 'red thread'],
  },
  {
    key: 'harvest', noun: 'the harvest', plural: 'seasons',
    adjectives: ['Sickle-Bearing', 'Open-Handed', 'Golden', 'Field-Mother'],
    epithetNouns: ['Grain', 'Orchard', 'Furrow', 'Plenty'],
    imagery: ['bread broken among strangers', 'the heavy heads of wheat', 'orchards bowed with fruit'],
    sacred: ['the brown bee', 'the last sheaf of the field', 'bread and salt'],
  },
  {
    key: 'wisdom', noun: 'wisdom', plural: 'riddles',
    adjectives: ['Owl-Eyed', 'Deep-Thinking', 'Grey-Templed', 'Unhurried'],
    epithetNouns: ['Riddle', 'Lamp', 'Counsel', 'Memory'],
    imagery: ['questions sharper than answers', 'lamplight on old pages', 'the long patience of stone'],
    sacred: ['the horned owl', 'knots that teach', 'ink and ash'],
  },
  {
    key: 'trickery', noun: 'trickery', plural: 'lies',
    adjectives: ['Twice-Tongued', 'Laughing', 'Crooked', 'Door-Slipping'],
    epithetNouns: ['Fox', 'Knot', 'Mask', 'Crossroad'],
    imagery: ['laughter in the wrong room', 'a knot tied inside a knot', 'gifts with hidden teeth'],
    sacred: ['the magpie', 'dice carved from knucklebone', 'masks of birch bark'],
  },
  {
    key: 'love', noun: 'love', plural: 'longings',
    adjectives: ['Honey-Hearted', 'Unarmored', 'Rose-Crowned', 'Reckless'],
    epithetNouns: ['Rose', 'Hearth', 'Longing', 'Vow'],
    imagery: ['the ache of a closed door', 'two cups from one jug', 'vows whispered into hair'],
    sacred: ['the turtledove', 'knotted ribbons', 'apples split in half'],
  },
  {
    key: 'hunt', noun: 'the hunt', plural: 'trails',
    adjectives: ['Swift-Footed', 'Antlered', 'Keen-Scented', 'Silent'],
    epithetNouns: ['Arrow', 'Antler', 'Trail', 'Hound'],
    imagery: ['breath fogging in the pines', 'the courtesy owed to prey', 'a bowstring at full draw'],
    sacred: ['the white stag', 'arrows fletched with grey goose', 'the first snow’s tracks'],
  },
  {
    key: 'winter', noun: 'winter', plural: 'frosts',
    adjectives: ['Frost-Veined', 'White-Silent', 'Lean', 'Unforgiving'],
    epithetNouns: ['Frost', 'Snow', 'Famine', 'Stillness'],
    imagery: ['ice flowering on glass', 'the hunger month', 'silence deep as snowfall'],
    sacred: ['the white wolf', 'holly', 'the last candle'],
  },
  {
    key: 'fate', noun: 'fate', plural: 'threads',
    adjectives: ['Thread-Spinning', 'Unblinking', 'Inevitable', 'Loom-Bound'],
    epithetNouns: ['Thread', 'Loom', 'Knot', 'Measure'],
    imagery: ['the shears that wait', 'a tapestry seen from behind', 'threads crossing in the dark'],
    sacred: ['the spider', 'spindles of bone', 'red thread tied at birth'],
  },
  {
    key: 'forge', noun: 'the forge', plural: 'makings',
    adjectives: ['Hammer-Handed', 'Soot-Blackened', 'Cunning-Fingered', 'Anvil-Born'],
    epithetNouns: ['Anvil', 'Hammer', 'Spark', 'Chain'],
    imagery: ['the patience of folded steel', 'sparks like brief prayers', 'things made truer by fire'],
    sacred: ['the blind mule', 'the first nail', 'iron quenched in milk'],
  },
  {
    key: 'music', noun: 'music', plural: 'songs',
    adjectives: ['Sweet-Throated', 'String-Fingered', 'Echoing', 'Bell-Voiced'],
    epithetNouns: ['Harp', 'Bell', 'Echo', 'Song'],
    imagery: ['the note held past breath', 'bells answering bells', 'a tune older than its words'],
    sacred: ['the nightingale', 'harps strung with rain', 'the seventh bell'],
  },
  {
    key: 'shadow', noun: 'shadows', plural: 'shadows',
    adjectives: ['Unlit', 'Soft-Spoken', 'Hooded', 'Between'],
    epithetNouns: ['Shade', 'Hood', 'Curtain', 'Hollow'],
    imagery: ['the shapes light refuses', 'corners that keep secrets', 'the cool side of the wall'],
    sacred: ['the black moth', 'lamps left unlit', 'doorways at dusk'],
  },
  {
    key: 'time', noun: 'time', plural: 'hours',
    adjectives: ['Hourless', 'Sand-Counting', 'Ancient', 'Ever-Turning'],
    epithetNouns: ['Hour', 'Sand', 'Wheel', 'Door'],
    imagery: ['sand falling grain by grain', 'the wheel that grinds slowly', 'yesterday kept in a jar'],
    sacred: ['the tortoise', 'hourglasses of river sand', 'rings within the oak'],
  },
  {
    key: 'rivers', noun: 'the rivers', plural: 'currents',
    adjectives: ['Ever-Flowing', 'Green-Sleeved', 'Meandering', 'Cold-Sprung'],
    epithetNouns: ['Current', 'Ford', 'Spring', 'Reed'],
    imagery: ['water remembering the mountain', 'reeds bowing in agreement', 'the ford where bargains are struck'],
    sacred: ['the heron', 'smooth stones', 'the river’s first ice'],
  },
  {
    key: 'justice', noun: 'justice', plural: 'judgments',
    adjectives: ['Even-Handed', 'Unbribed', 'Stern', 'Oath-Keeping'],
    epithetNouns: ['Scale', 'Oath', 'Pillar', 'Sword'],
    imagery: ['scales that tremble at lies', 'oaths sworn on iron', 'the pillar that does not lean'],
    sacred: ['the grey goose', 'unbroken staffs', 'salt shared between rivals'],
  },
  {
    key: 'gates', noun: 'thresholds', plural: 'doors',
    adjectives: ['Key-Keeping', 'Twice-Facing', 'Hinged', 'Watchful'],
    epithetNouns: ['Gate', 'Key', 'Hinge', 'Crossing'],
    imagery: ['the moment between knocking and answer', 'keys that open both ways', 'roads beginning at doors'],
    sacred: ['the two-headed dog', 'iron keys worn smooth', 'bread left on doorsteps'],
  },
];

// Temperament lines may use {them}/{they}/{theirs}/{was} tokens,
// filled per-god from the aspect's pronouns.
export const TEMPERAMENTS = [
  { key: 'wrathful', line: 'quick to anger and slow to forget' },
  { key: 'gentle', line: 'gentle even with what fears {them}' },
  { key: 'capricious', line: 'kind or cruel as the mood takes {them}' },
  { key: 'sorrowful', line: 'carrying an old grief like a stone' },
  { key: 'laughing', line: 'laughing, even at the proper times' },
  { key: 'jealous', line: 'jealous of what {was} never {theirs}' },
  { key: 'patient', line: 'patient the way mountains are patient' },
  { key: 'proud', line: 'proud, and wounded easily through that pride' },
  { key: 'silent', line: 'speaking seldom, and never twice' },
  { key: 'wandering', line: 'never found where {they} {was} last seen' },
  { key: 'devoted', line: 'faithful past all sense and counsel' },
  { key: 'hungry', line: 'hungry for praise, for offerings, for more' },
];

export const ASPECTS = [
  { key: 'god', noun: 'god', pronoun: 'he', possessive: 'his', object: 'him', theirs: 'his', was: 'was' },
  { key: 'goddess', noun: 'goddess', pronoun: 'she', possessive: 'her', object: 'her', theirs: 'hers', was: 'was' },
  { key: 'twin-natured', noun: 'twin-natured one', pronoun: 'they', possessive: 'their', object: 'them', theirs: 'theirs', was: 'were' },
  { key: 'faceless', noun: 'faceless one', pronoun: 'it', possessive: 'its', object: 'it', theirs: 'its', was: 'was' },
];

export function fillPronouns(line, aspect) {
  return line
    .replaceAll('{them}', aspect.object)
    .replaceAll('{they}', aspect.pronoun)
    .replaceAll('{their}', aspect.possessive)
    .replaceAll('{theirs}', aspect.theirs)
    .replaceAll('{was}', aspect.was);
}

export const PRIMORDIAL_CONCEPTS = [
  'the Void', 'the First Sea', 'the Long Dark', 'the Unshaped', 'Mother Night',
  'the Silence', 'the First Flame', 'the Deep', 'the Breath', 'Old Chaos',
];

// Each cosmology shapes the creation story, the world's imagery,
// and — crucially — the prophecy of its ending, which mirrors its beginning.
export const COSMOLOGIES = [
  {
    key: 'world-egg',
    ending: 'One day the sky will craze like an eggshell, and what hatches next will not remember us.',
  },
  {
    key: 'sundered-primordial',
    ending: 'It is whispered that the sundered one is healing, and when the body is whole again the world will be unmade back into it.',
  },
  {
    key: 'world-dream',
    ending: 'Every prophecy agrees on one thing only: the sleeper is beginning to stir.',
  },
  {
    key: 'first-word',
    ending: 'At the end, they say, someone will speak the word backwards, and the silence before all things will return.',
  },
  {
    key: 'endless-sea',
    ending: 'The tide that gave the land will someday want it back, and the last mountain will go under without complaint.',
  },
  {
    key: 'world-tree',
    ending: 'The tree is shedding, say the wise. When the last leaf falls, the dark between its branches will be all that remains.',
  },
  {
    key: 'ember',
    ending: 'The world is an ember from an older fire, and embers do not burn forever. But embers, struck rightly, can also begin again.',
  },
];

export const MORTAL_ORIGINS = [
  { key: 'clay', material: 'river clay', detail: 'shaped on a potter’s wheel and woken with breath' },
  { key: 'blood', material: 'the blood of a slain god', detail: 'mixed with earth so that grief itself could walk' },
  { key: 'stars', material: 'fallen stars', detail: 'cooled and given hands, which is why they look upward' },
  { key: 'wood', material: 'two trees', detail: 'carved and called by name until they answered' },
  { key: 'ash', material: 'the ash of the first fire', detail: 'kneaded with rain and made to stand' },
  { key: 'tears', material: 'tears', detail: 'wept into the sea, where they learned to swim and then to walk' },
  { key: 'shadow', material: 'shadows', detail: 'given names, which is why they fade without one' },
];

export const GIFTS = [
  { key: 'fire', gift: 'fire', price: 'and for this theft, winter was loosed upon the world' },
  { key: 'writing', gift: 'the making of marks that speak', price: 'and with writing came the first lie that outlived its teller' },
  { key: 'music', gift: 'music', price: 'and with it the sorrow of songs ending' },
  { key: 'dreams', gift: 'the doors of dream', price: 'and through those same doors, nightmares learned the way in' },
  { key: 'seedcorn', gift: 'the first seedcorn', price: 'and so mortals were bound forever to the turning seasons' },
  { key: 'death-knowledge', gift: 'the knowledge of their own deaths', price: 'which is a bitter gift, but it is why mortals build, and gods do not' },
  { key: 'smithcraft', gift: 'smithcraft', price: 'and the first thing forged after the plough was a sword' },
];
