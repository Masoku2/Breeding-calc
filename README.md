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
  - **Nature** — all 25 natures, labelled with their stat boost/drop (passed down by
    a parent holding an Everstone)
  - **Ability** — free-text with autocomplete for common abilities
  - **Ability roll** — mark whether the ability is Guaranteed or a random **50/50** or
    **33/33/33** roll. A random roll adds its *expected* ability-fix cost (chance of a
    wrong roll × the shared Ability-change price, default ¥35,000) to the total.
  - **Egg moves** — a comma-separated list of the moves to breed onto that Pokémon
  - **31 IVs** — click the HP / Atk / Def / SpA / SpD / Spe chips to mark perfect IVs
  - **Held item** — Everstone (nature), Incense, or the six Power items (PokeMMO uses
    Power items for IV inheritance; there is no Destiny Knot)
- **Buy vs. breed** — every Pokémon you buy has a **Buy cost**. Beyond the bottom
  "Buy" Pokémon, any intermediate breeder can be flagged **"Buy this breeder instead
  of breeding it"** — that reveals its own buy cost and removes its sub-tree from the
  calculation, so you can price out buying a pre-made breeder off the market.
- **Profit calculation** — enter a sell price for the final Pokémon and buy costs for
  each Pokémon you purchase, plus shared item prices in the sidebar. The summary shows profit,
  margin, total cost, number of base Pokémon, number of breeds, and items consumed.
  Held items are counted as consumed on every breed (each non-final parent's item).
- **Two views** — toggle between:
  - **Edit** — the editable cards for building/adjusting a recipe.
  - **Chart** — a clean, read-only top-down tree diagram of the finished recipe
    (final product at the top, branching down to the Pokémon you buy). Click any
    node in the chart to jump back to editing it.
- **Quick tree** — generate a binary breeding-tree skeleton for a 2–6 IV target as a
  starting point; it pre-fills the final species into every box. **Fill species → all**
  copies the final Pokémon's species into every node in one click (most breeding
  trees use the same species throughout, aside from a Ditto).
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
