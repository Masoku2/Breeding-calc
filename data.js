// Static reference data for the breeding calculator.

// The six IVs, in PokeMMO's usual display order.
const IV_STATS = ["HP", "Atk", "Def", "SpA", "SpD", "Spe"];

// Held items relevant to breeding. Every non-final parent consumes its held
// item when bred, so each maps to one of the shared price buckets.
// priceKey: which entry in state.prices supplies the cost.
// passes:   the IV a Power item guarantees to pass down (for the tooltip).
const HELD_ITEMS = [
  { id: "none",         label: "None",              priceKey: null,         passes: null },
  { id: "destinyKnot",  label: "Destiny Knot",      priceKey: "destinyKnot", passes: null },
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
