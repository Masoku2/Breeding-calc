# Breeding-calc

A web page for planning **PokeMMO** breeding paths and seeing the **profit** at a glance.

Build up a breeding tree for a competitive Pokémon, record each parent's gender,
target IVs and held item, then plug in the current market prices to instantly see
whether the path makes money.

## Features

- **Saved breeding paths** — create, rename and delete named paths. Everything is
  stored in your browser (localStorage), so paths persist between visits.
- **Breeding tree** — the final product sits at the top; each Pokémon can be *split
  into two parents*, down to the leaf Pokémon you actually buy. For every Pokémon
  you record:
  - **Species** (with autocomplete for common breeders)
  - **Gender** (♂ / ♀ / Ditto / Genderless)
  - **31 IVs** — click the HP / Atk / Def / SpA / SpD / Spe chips to mark perfect IVs
  - **Held item** — Everstone (nature) or the six Power items (PokeMMO uses
    Power items for IV inheritance; there is no Destiny Knot)
- **Profit calculation** — enter a sell price for the final Pokémon and buy costs for
  each leaf Pokémon, plus shared item prices in the sidebar. The summary shows profit,
  margin, total cost, number of base Pokémon, number of breeds, and items consumed.
  Held items are counted as consumed on every breed (each non-final parent's item).
- **Quick tree** — generate a binary breeding-tree skeleton for a 2–6 IV target as a
  starting point, then fill in the IVs and items to match your strategy.
- **Export / import** — back up or share all paths and prices as a JSON file.

## Usage

No build step and no server required — it's plain HTML/CSS/JS.

- Open `index.html` directly in your browser, **or**
- Serve the folder (e.g. `python3 -m http.server`) and open the shown URL, **or**
- Host it anywhere static (GitHub Pages, etc.).

## Notes on prices

Prices are entered as plain numbers (shown with a ¥ symbol). Item prices are shared
across all paths since the market price of an Everstone / Power item is the same
regardless of the path. Buy costs are set per leaf Pokémon because those vary.
