/* PokeMMO Breeding Profit Calculator
 * Pure client-side app. State persists to localStorage so saved paths and
 * item prices survive reloads. No build step or backend required.
 */

const STORAGE_KEY = "breeding-calc.v1";

/* ------------------------------------------------------------------ */
/* State                                                              */
/* ------------------------------------------------------------------ */

const defaultState = () => ({
  paths: [],
  prices: { everstone: 0, powerItem: 0 },
  activePathId: null,
  viewMode: "edit", // "edit" | "chart"
});

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed };
  } catch (e) {
    console.warn("Failed to load saved state:", e);
    return defaultState();
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Failed to save state:", e);
  }
}

const uid = () => Math.random().toString(36).slice(2, 10);

/* ------------------------------------------------------------------ */
/* Model helpers                                                      */
/* ------------------------------------------------------------------ */

function newNode(overrides = {}) {
  return {
    id: uid(),
    species: "",
    gender: "male",
    nature: "",
    ivs: IV_STATS.reduce((acc, s) => ((acc[s] = false), acc), {}),
    heldItem: "none",
    cost: 0,
    parents: [],
    ...overrides,
  };
}

function newPath() {
  return {
    id: uid(),
    name: "New breeding path",
    finalSpecies: "",
    sellPrice: 0,
    root: newNode(),
  };
}

const activePath = () => state.paths.find((p) => p.id === state.activePathId) || null;

const itemById = (id) => HELD_ITEMS.find((i) => i.id === id) || HELD_ITEMS[0];

function itemPrice(heldItemId) {
  const item = itemById(heldItemId);
  if (!item.priceKey) return 0;
  return Number(state.prices[item.priceKey]) || 0;
}

/* ------------------------------------------------------------------ */
/* Cost / profit calculation                                          */
/* ------------------------------------------------------------------ */

// Walk the tree once and gather every figure the summary needs.
function analyze(node, isRoot, acc) {
  const isLeaf = node.parents.length === 0;

  if (isLeaf) {
    acc.baseCount += 1;
    acc.baseCost += Number(node.cost) || 0;
  } else {
    acc.breeds += 1;
  }

  // Every parent (i.e. any non-root node) consumes its held item on breeding.
  if (!isRoot) {
    const price = itemPrice(node.heldItem);
    if (price > 0) {
      acc.itemCost += price;
      acc.itemCount += 1;
    }
  }

  node.parents.forEach((child) => analyze(child, false, acc));
  return acc;
}

function computeSummary(path) {
  const acc = analyze(path.root, true, {
    baseCount: 0,
    baseCost: 0,
    breeds: 0,
    itemCount: 0,
    itemCost: 0,
  });
  const totalCost = acc.baseCost + acc.itemCost;
  const sell = Number(path.sellPrice) || 0;
  return { ...acc, totalCost, sell, profit: sell - totalCost };
}

/* ------------------------------------------------------------------ */
/* Formatting                                                         */
/* ------------------------------------------------------------------ */

const nf = new Intl.NumberFormat("en-US");
const money = (n) => "¥" + nf.format(Math.round(Number(n) || 0));

/* ------------------------------------------------------------------ */
/* Rendering                                                          */
/* ------------------------------------------------------------------ */

const el = (id) => document.getElementById(id);

function render() {
  renderPathList();
  renderPrices();
  const path = activePath();
  el("emptyState").hidden = !!path;
  el("pathEditor").hidden = !path;
  if (path) renderEditor(path);
  save();
}

function renderPrices() {
  ["everstone", "powerItem"].forEach((key) => {
    const input = document.querySelector(`[data-price="${key}"]`);
    if (input) input.value = state.prices[key] ?? 0;
  });
}

function renderPathList() {
  const list = el("pathList");
  list.innerHTML = "";
  if (state.paths.length === 0) {
    const li = document.createElement("li");
    li.className = "hint";
    li.textContent = "No paths yet.";
    list.appendChild(li);
    return;
  }
  state.paths.forEach((p) => {
    const { profit } = computeSummary(p);
    const li = document.createElement("li");
    li.className = "path-item" + (p.id === state.activePathId ? " active" : "");
    li.innerHTML = `
      <span class="pi-name">${escapeHtml(p.name || "Untitled")}</span>
      <span class="pi-profit ${profit >= 0 ? "pos" : "neg"}">${money(profit)}</span>`;
    li.addEventListener("click", () => {
      state.activePathId = p.id;
      render();
    });
    list.appendChild(li);
  });
}

function renderEditor(path) {
  el("pathName").value = path.name;
  el("finalSpecies").value = path.finalSpecies;
  el("sellPrice").value = path.sellPrice || 0;

  renderSummary(path);

  // View toggle state.
  const chartMode = state.viewMode === "chart";
  el("editViewBtn").classList.toggle("active", !chartMode);
  el("chartViewBtn").classList.toggle("active", chartMode);
  el("treeRoot").hidden = chartMode;
  el("chartRoot").hidden = !chartMode;

  if (chartMode) {
    const chart = el("chartRoot");
    chart.innerHTML = "";
    chart.appendChild(renderChart(path.root));
  } else {
    const root = el("treeRoot");
    root.innerHTML = "";
    root.appendChild(renderNode(path.root, true));
  }
}

/* ------------------------------------------------------------------ */
/* Chart view (read-only tree diagram)                                */
/* ------------------------------------------------------------------ */

function renderChart(rootNode) {
  const ul = document.createElement("ul");
  ul.className = "chart-tree";
  ul.appendChild(chartLi(rootNode, true));
  return ul;
}

function chartLi(node, isRoot) {
  const li = document.createElement("li");
  li.appendChild(chartCard(node, isRoot));
  if (node.parents.length) {
    const ul = document.createElement("ul");
    node.parents.forEach((p) => ul.appendChild(chartLi(p, false)));
    li.appendChild(ul);
  }
  return li;
}

function chartCard(node, isRoot) {
  const isLeaf = node.parents.length === 0;
  const kind = isRoot ? "root" : isLeaf ? "leaf" : "bred";

  const card = document.createElement("div");
  card.className = `cnode ${kind}`;
  card.title = "Click to edit this Pokémon";

  // Name + gender line.
  const name = document.createElement("div");
  name.className = "cnode-name";
  const gender = GENDERS.find((g) => g.id === node.gender);
  const gIcon = { male: "♂", female: "♀", ditto: "Ditto", genderless: "⚲" }[node.gender] || "";
  name.innerHTML = `<span>${escapeHtml(node.species || "—")}</span>` +
    `<span class="cnode-gender">${gIcon}</span>`;
  card.appendChild(name);

  // IV pills — only the perfect ones, to stay compact.
  const onIvs = IV_STATS.filter((s) => node.ivs[s]);
  const ivs = document.createElement("div");
  ivs.className = "cnode-ivs";
  if (onIvs.length) {
    onIvs.forEach((s) => {
      const pill = document.createElement("span");
      pill.className = "cnode-iv";
      pill.textContent = s;
      ivs.appendChild(pill);
    });
  } else {
    ivs.innerHTML = `<span class="cnode-iv-none">no 31 IVs</span>`;
  }
  card.appendChild(ivs);

  // Meta: nature + held item.
  const metaBits = [];
  if (node.nature) metaBits.push(node.nature);
  if (!isRoot && node.heldItem && node.heldItem !== "none") {
    metaBits.push(itemById(node.heldItem).label.replace(/\s*\(.*\)/, ""));
  }
  if (isLeaf) metaBits.push(money(node.cost));
  if (metaBits.length) {
    const meta = document.createElement("div");
    meta.className = "cnode-meta";
    meta.textContent = metaBits.join(" · ");
    card.appendChild(meta);
  }

  // Clicking a chart node jumps to the editable view.
  card.addEventListener("click", () => {
    state.viewMode = "edit";
    render();
  });

  return card;
}

function renderSummary(path) {
  const s = computeSummary(path);
  const marginPct = s.sell > 0 ? Math.round((s.profit / s.sell) * 100) : 0;
  el("summary").innerHTML = `
    <div class="stat profit">
      <div class="label">Profit</div>
      <div class="value ${s.profit >= 0 ? "pos" : "neg"}">${money(s.profit)}</div>
      <div class="sub">${s.sell > 0 ? marginPct + "% margin" : "set a sell price"}</div>
    </div>
    <div class="stat">
      <div class="label">Sell price</div>
      <div class="value">${money(s.sell)}</div>
    </div>
    <div class="stat">
      <div class="label">Total cost</div>
      <div class="value">${money(s.totalCost)}</div>
    </div>
    <div class="stat">
      <div class="label">Base Pokémon</div>
      <div class="value">${s.baseCount}</div>
      <div class="sub">${money(s.baseCost)} to buy</div>
    </div>
    <div class="stat">
      <div class="label">Breeds</div>
      <div class="value">${s.breeds}</div>
    </div>
    <div class="stat">
      <div class="label">Items used</div>
      <div class="value">${s.itemCount}</div>
      <div class="sub">${money(s.itemCost)} consumed</div>
    </div>`;
}

function renderNode(node, isRoot) {
  const isLeaf = node.parents.length === 0;
  const kind = isRoot ? "root" : isLeaf ? "leaf" : "bred";
  const badgeText = isRoot ? "Final" : isLeaf ? "Buy" : "Bred";

  const wrap = document.createElement("div");
  wrap.className = `node ${kind}`;

  const top = document.createElement("div");
  top.className = "node-top";
  top.appendChild(makeBadge(badgeText, kind));

  // Species
  top.appendChild(
    field("Species", inputEl("text", node.species, (v) => set(node, "species", v), {
      list: "pokemonList",
      cls: "node-species",
      placeholder: "Species",
    }))
  );

  // Gender
  top.appendChild(
    field("Gender", selectEl(GENDERS, node.gender, (v) => set(node, "gender", v), "node-gender"))
  );

  // Nature
  top.appendChild(
    field(
      "Nature",
      selectEl(
        NATURES.map((nt) => ({ id: nt.id, label: nt.label })),
        node.nature,
        (v) => set(node, "nature", v),
        "node-nature"
      )
    )
  );

  // Held item — only meaningful when the node is used as a parent (not root).
  if (!isRoot) {
    top.appendChild(
      field(
        "Held item",
        selectEl(
          HELD_ITEMS.map((i) => ({ id: i.id, label: i.label })),
          node.heldItem,
          (v) => set(node, "heldItem", v),
          "node-item"
        )
      )
    );
  }

  // Cost — only leaves are purchased.
  if (isLeaf) {
    top.appendChild(
      field(
        "Buy cost",
        inputEl("number", node.cost, (v) => set(node, "cost", Number(v) || 0), {
          cls: "node-cost",
          min: 0,
        })
      )
    );
  }

  wrap.appendChild(top);

  // IV chips
  wrap.appendChild(renderIvs(node));

  // Actions
  const actions = document.createElement("div");
  actions.className = "node-actions";
  if (isLeaf) {
    actions.appendChild(
      button("Split into 2 parents", "small", () => {
        node.parents = [newNode(), newNode()];
        render();
      })
    );
  } else {
    actions.appendChild(
      button("Remove parents", "small ghost danger", () => {
        node.parents = [];
        render();
      })
    );
  }
  wrap.appendChild(actions);

  // Children
  if (node.parents.length) {
    const kids = document.createElement("div");
    kids.className = "children";
    node.parents.forEach((child) => kids.appendChild(renderNode(child, false)));
    wrap.appendChild(kids);
  }

  return wrap;
}

function renderIvs(node) {
  const row = document.createElement("div");
  row.className = "ivs";
  const label = document.createElement("span");
  label.className = "ivs-label";
  label.textContent = "31 IVs:";
  row.appendChild(label);
  IV_STATS.forEach((stat) => {
    const chip = document.createElement("span");
    chip.className = "iv-chip" + (node.ivs[stat] ? " on" : "");
    chip.textContent = stat;
    chip.addEventListener("click", () => {
      node.ivs[stat] = !node.ivs[stat];
      render();
    });
    row.appendChild(chip);
  });
  return row;
}

/* ------------------------------------------------------------------ */
/* Small DOM builders                                                 */
/* ------------------------------------------------------------------ */

function makeBadge(text, kind) {
  const b = document.createElement("span");
  b.className = `node-badge badge-${kind}`;
  b.textContent = text;
  return b;
}

function field(labelText, control) {
  const f = document.createElement("div");
  f.className = "field";
  const l = document.createElement("label");
  l.textContent = labelText;
  f.appendChild(l);
  f.appendChild(control);
  return f;
}

function inputEl(type, value, onChange, opts = {}) {
  const input = document.createElement("input");
  input.type = type;
  input.value = value;
  if (opts.cls) input.className = opts.cls;
  if (opts.list) input.setAttribute("list", opts.list);
  if (opts.placeholder) input.placeholder = opts.placeholder;
  if (opts.min != null) input.min = opts.min;
  input.addEventListener("input", () => onChange(input.value));
  input.addEventListener("change", () => onChange(input.value));
  return input;
}

function selectEl(options, value, onChange, cls) {
  const sel = document.createElement("select");
  if (cls) sel.className = cls;
  options.forEach((o) => {
    const opt = document.createElement("option");
    opt.value = o.id;
    opt.textContent = o.label;
    if (o.id === value) opt.selected = true;
    sel.appendChild(opt);
  });
  sel.addEventListener("change", () => onChange(sel.value));
  return sel;
}

function button(text, cls, onClick) {
  const b = document.createElement("button");
  b.className = "btn " + (cls || "");
  b.textContent = text;
  b.addEventListener("click", onClick);
  return b;
}

// Mutate a node field then re-render summary/list without rebuilding the whole
// tree (keeps input focus while typing). Full render only for structural change.
function set(node, key, value) {
  node[key] = value;
  const path = activePath();
  if (path) {
    renderSummary(path);
    renderPathList();
  }
  save();
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

/* ------------------------------------------------------------------ */
/* Quick-tree generator                                               */
/* ------------------------------------------------------------------ */

// Build a binary breeding-tree skeleton that produces an n-IV Pokémon: an
// n-IV offspring comes from two (n-1)-IV parents, recursively down to 1-IV
// leaves you buy. IVs/items are left blank for you to fill in per your plan.
function buildSkeleton(n, species) {
  const node = newNode({ species: species || "" });
  if (n > 1) node.parents = [buildSkeleton(n - 1, species), buildSkeleton(n - 1, species)];
  return node;
}

// Copy a species string into every node of a tree (most breeding trees use
// the same species throughout, aside from a Ditto).
function fillSpecies(node, species) {
  node.species = species;
  node.parents.forEach((p) => fillSpecies(p, species));
}

/* ------------------------------------------------------------------ */
/* Export / import                                                    */
/* ------------------------------------------------------------------ */

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "breeding-paths.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!parsed || !Array.isArray(parsed.paths)) throw new Error("Invalid file");
      state = { ...defaultState(), ...parsed };
      if (!state.paths.find((p) => p.id === state.activePathId)) {
        state.activePathId = state.paths[0]?.id || null;
      }
      render();
    } catch (e) {
      alert("Could not import file: " + e.message);
    }
  };
  reader.readAsText(file);
}

/* ------------------------------------------------------------------ */
/* Wiring                                                             */
/* ------------------------------------------------------------------ */

function createPath() {
  const p = newPath();
  state.paths.push(p);
  state.activePathId = p.id;
  render();
  el("pathName").focus();
  el("pathName").select();
}

function init() {
  // Populate species datalist.
  const dl = el("pokemonList");
  COMMON_SPECIES.forEach((s) => {
    const o = document.createElement("option");
    o.value = s;
    dl.appendChild(o);
  });

  // Sidebar + empty-state new-path buttons.
  el("newPathBtn").addEventListener("click", createPath);
  el("emptyNewBtn").addEventListener("click", createPath);

  // Path meta fields.
  el("pathName").addEventListener("input", (e) => {
    const p = activePath();
    if (p) { p.name = e.target.value; renderPathList(); save(); }
  });
  el("finalSpecies").addEventListener("input", (e) => {
    const p = activePath();
    if (p) { p.finalSpecies = e.target.value; p.root.species = e.target.value; save(); }
  });
  el("finalSpecies").addEventListener("change", () => render());
  el("sellPrice").addEventListener("input", (e) => {
    const p = activePath();
    if (p) { p.sellPrice = Number(e.target.value) || 0; renderSummary(p); renderPathList(); save(); }
  });

  el("deletePathBtn").addEventListener("click", () => {
    const p = activePath();
    if (!p) return;
    if (!confirm(`Delete path "${p.name}"?`)) return;
    state.paths = state.paths.filter((x) => x.id !== p.id);
    state.activePathId = state.paths[0]?.id || null;
    render();
  });

  el("genTreeBtn").addEventListener("click", () => {
    const p = activePath();
    if (!p) return;
    const n = Number(el("genIvCount").value);
    if (p.root.parents.length && !confirm("Replace the current tree with a fresh skeleton?")) return;
    p.root = buildSkeleton(n, p.finalSpecies);
    render();
  });

  // View toggle: Edit / Chart.
  el("editViewBtn").addEventListener("click", () => { state.viewMode = "edit"; render(); });
  el("chartViewBtn").addEventListener("click", () => { state.viewMode = "chart"; render(); });

  // Fill the final species into every node of the tree.
  el("fillSpeciesBtn").addEventListener("click", () => {
    const p = activePath();
    if (!p) return;
    const species = p.finalSpecies.trim();
    if (!species) { alert("Set the Final Pokémon first, then use this to copy it into every box."); return; }
    fillSpecies(p.root, species);
    render();
  });

  // Item prices.
  document.querySelectorAll("[data-price]").forEach((input) => {
    input.addEventListener("input", () => {
      state.prices[input.dataset.price] = Number(input.value) || 0;
      const p = activePath();
      if (p) renderSummary(p);
      renderPathList();
      save();
    });
  });

  // Export / import.
  el("exportBtn").addEventListener("click", exportData);
  el("importBtn").addEventListener("click", () => el("importFile").click());
  el("importFile").addEventListener("change", (e) => {
    if (e.target.files[0]) importData(e.target.files[0]);
    e.target.value = "";
  });

  render();
}

document.addEventListener("DOMContentLoaded", init);
