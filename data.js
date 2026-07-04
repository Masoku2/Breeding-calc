// Static reference data for the breeding calculator.

// The six IVs, in PokeMMO's usual display order.
const IV_STATS = ["HP", "Atk", "Def", "SpA", "SpD", "Spe"];

// Held items relevant to breeding. Every non-final parent consumes its held
// item when bred, so each maps to one of the shared price buckets.
// priceKey: which entry in state.prices supplies the cost.
// passes:   the IV a Power item guarantees to pass down (for the tooltip).
const HELD_ITEMS = [
  { id: "none",         label: "None",              priceKey: null,         passes: null },
  { id: "everstone",    label: "Everstone (nature)", priceKey: "everstone",  passes: null },
  { id: "powerWeight",  label: "Power Weight (HP)",  priceKey: "powerItem",  passes: "HP" },
  { id: "powerBracer",  label: "Power Bracer (Atk)", priceKey: "powerItem",  passes: "Atk" },
  { id: "powerBelt",    label: "Power Belt (Def)",   priceKey: "powerItem",  passes: "Def" },
  { id: "powerLens",    label: "Power Lens (SpA)",   priceKey: "powerItem",  passes: "SpA" },
  { id: "powerBand",    label: "Power Band (SpD)",   priceKey: "powerItem",  passes: "SpD" },
  { id: "powerAnklet",  label: "Power Anklet (Spe)", priceKey: "powerItem",  passes: "Spe" },
];

const GENDERS = [
  { id: "male",       label: "♂ Male" },
  { id: "female",     label: "♀ Female" },
  { id: "ditto",      label: "Ditto" },
  { id: "genderless", label: "Genderless" },
];

// The 25 natures. Nature is passed down by a parent holding an Everstone.
// Labels note the boosted/lowered stat (neutral natures change nothing).
const NATURES = [
  { id: "",         label: "Any / unset" },
  { id: "Adamant",  label: "Adamant (+Atk −SpA)" },
  { id: "Bashful",  label: "Bashful (neutral)" },
  { id: "Bold",     label: "Bold (+Def −Atk)" },
  { id: "Brave",    label: "Brave (+Atk −Spe)" },
  { id: "Calm",     label: "Calm (+SpD −Atk)" },
  { id: "Careful",  label: "Careful (+SpD −SpA)" },
  { id: "Docile",   label: "Docile (neutral)" },
  { id: "Gentle",   label: "Gentle (+SpD −Def)" },
  { id: "Hardy",    label: "Hardy (neutral)" },
  { id: "Hasty",    label: "Hasty (+Spe −Def)" },
  { id: "Impish",   label: "Impish (+Def −SpA)" },
  { id: "Jolly",    label: "Jolly (+Spe −SpA)" },
  { id: "Lax",      label: "Lax (+Def −SpD)" },
  { id: "Lonely",   label: "Lonely (+Atk −Def)" },
  { id: "Mild",     label: "Mild (+SpA −Def)" },
  { id: "Modest",   label: "Modest (+SpA −Atk)" },
  { id: "Naive",    label: "Naive (+Spe −SpD)" },
  { id: "Naughty",  label: "Naughty (+Atk −SpD)" },
  { id: "Quiet",    label: "Quiet (+SpA −Spe)" },
  { id: "Quirky",   label: "Quirky (neutral)" },
  { id: "Rash",     label: "Rash (+SpA −SpD)" },
  { id: "Relaxed",  label: "Relaxed (+Def −Spe)" },
  { id: "Sassy",    label: "Sassy (+SpD −Spe)" },
  { id: "Serious",  label: "Serious (neutral)" },
  { id: "Timid",    label: "Timid (+Spe −Atk)" },
];

// A non-exhaustive list of frequently bred species for the autocomplete.
// The species field is free text, so anything can be typed in.
const COMMON_SPECIES = [
  "Ditto", "Larvitar", "Pupitar", "Tyranitar", "Bagon", "Shelgon", "Salamence",
  "Gible", "Gabite", "Garchomp", "Beldum", "Metang", "Metagross", "Dratini",
  "Dragonair", "Dragonite", "Charmander", "Charmeleon", "Charizard", "Squirtle",
  "Bulbasaur", "Chikorita", "Cyndaquil", "Totodile", "Treecko", "Torchic",
  "Mudkip", "Turtwig", "Chimchar", "Piplup", "Eevee", "Vaporeon", "Jolteon",
  "Flareon", "Espeon", "Umbreon", "Leafeon", "Glaceon", "Scyther", "Scizor",
  "Gligar", "Gliscor", "Riolu", "Lucario", "Rotom", "Snorlax", "Machop",
  "Machoke", "Machamp", "Abra", "Kadabra", "Alakazam", "Gastly", "Haunter",
  "Gengar", "Magikarp", "Gyarados", "Aron", "Lairon", "Aggron", "Trapinch",
  "Vibrava", "Flygon", "Ralts", "Kirlia", "Gardevoir", "Gallade", "Numel",
  "Camerupt", "Swinub", "Piloswine", "Mamoswine", "Chansey", "Blissey",
  "Togepi", "Togetic", "Togekiss", "Elekid", "Electabuzz", "Electivire",
  "Magby", "Magmar", "Magmortar", "Rhyhorn", "Rhydon", "Rhyperior",
];

// A non-exhaustive list of abilities for the autocomplete. The ability field is
// free text, so any ability (including ones not listed) can be typed in.
const COMMON_ABILITIES = [
  "Adaptability", "Aerilate", "Aftermath", "Air Lock", "Analytic", "Anger Point",
  "Anticipation", "Arena Trap", "Bad Dreams", "Battle Armor", "Blaze", "Chlorophyll",
  "Clear Body", "Cloud Nine", "Competitive", "Compound Eyes", "Contrary", "Cursed Body",
  "Cute Charm", "Damp", "Defiant", "Download", "Drizzle", "Drought", "Dry Skin",
  "Early Bird", "Effect Spore", "Filter", "Flame Body", "Flash Fire", "Flower Gift",
  "Forewarn", "Frisk", "Gluttony", "Guts", "Harvest", "Heatproof", "Huge Power",
  "Hustle", "Hydration", "Hyper Cutter", "Ice Body", "Immunity", "Inner Focus",
  "Insomnia", "Intimidate", "Iron Barbs", "Iron Fist", "Keen Eye", "Levitate",
  "Lightning Rod", "Limber", "Liquid Ooze", "Magic Bounce", "Magic Guard", "Magnet Pull",
  "Marvel Scale", "Moody", "Mold Breaker", "Moxie", "Multiscale", "Natural Cure",
  "No Guard", "Overgrow", "Own Tempo", "Poison Heal", "Poison Point", "Prankster",
  "Pressure", "Pure Power", "Quick Feet", "Rain Dish", "Reckless", "Regenerator",
  "Rock Head", "Rough Skin", "Sand Force", "Sand Rush", "Sand Stream", "Sand Veil",
  "Sap Sipper", "Scrappy", "Serene Grace", "Shadow Tag", "Sheer Force", "Shell Armor",
  "Shield Dust", "Simple", "Skill Link", "Snow Warning", "Solar Power", "Solid Rock",
  "Soundproof", "Speed Boost", "Stall", "Static", "Steadfast", "Stench", "Sticky Hold",
  "Storm Drain", "Sturdy", "Suction Cups", "Super Luck", "Swarm", "Swift Swim",
  "Synchronize", "Technician", "Thick Fat", "Tinted Lens", "Torrent", "Tough Claws",
  "Trace", "Truant", "Unaware", "Unburden", "Unnerve", "Volt Absorb", "Water Absorb",
  "Water Veil", "White Smoke", "Wonder Guard", "Wonder Skin",
];
