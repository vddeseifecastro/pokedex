// =============================================
//   POKÉDEX — app.js FINAL
//   Formas: Mega, Gigamax, Primigenias,
//           Alola, Galar, Hisui, Paldea
// =============================================

const API          = "https://pokeapi.co/api/v2";
const ITEMS_PER_PAGE = 24;

const GEN_RANGES = {
    "1":[1,151],"2":[152,251],"3":[252,386],
    "4":[387,493],"5":[494,649],"6":[650,721],
    "7":[722,809],"8":[810,905],"9":[906,1025]
};

// Palabras clave exactas por categoría
const FORM_KEYWORDS = {
    mega:    ["-mega"],
    gmax:    ["-gmax"],
    primal:  ["-primal"],
    alola:   ["-alola"],
    galar:   ["-galar"],
    hisui:   ["-hisui"],
    paldea:  ["-paldea"]
};

// Todos los keywords juntos para filtrar de la API
const ALL_KEYWORDS = Object.values(FORM_KEYWORDS).flat();

// Estado
let allPokemon      = [];
let specialForms    = [];
let filteredPokemon = [];
let currentPage     = 1;
let activeForm      = "";   // clave activa: "mega"|"gmax"|etc o ""

// ===== TEMA =====
const savedTheme = localStorage.getItem("theme") || "dark";
document.body.setAttribute("data-theme", savedTheme);
updateThemeIcon();

function toggleTheme() {
    const next = document.body.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.body.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    updateThemeIcon();
}
function updateThemeIcon() {
    document.querySelectorAll(".theme-icon").forEach(el => {
        el.textContent = document.body.getAttribute("data-theme") === "dark" ? "☀" : "☾";
    });
}

// ===== PERSISTENCIA =====
function saveState() {
    localStorage.setItem("pdx_search",  document.getElementById("search-input").value);
    localStorage.setItem("pdx_type",    document.getElementById("filter-type").value);
    localStorage.setItem("pdx_gen",     document.getElementById("filter-gen").value);
    localStorage.setItem("pdx_page",    currentPage);
    localStorage.setItem("pdx_form",    activeForm);
}

function restoreState() {
    document.getElementById("search-input").value = localStorage.getItem("pdx_search") || "";
    document.getElementById("filter-type").value  = localStorage.getItem("pdx_type")   || "";
    document.getElementById("filter-gen").value   = localStorage.getItem("pdx_gen")    || "";
    activeForm = localStorage.getItem("pdx_form") || "";

    if (document.getElementById("search-input").value)
        document.getElementById("search-clear").classList.remove("hidden");

    highlightFormBtn(activeForm);
    return parseInt(localStorage.getItem("pdx_page")) || 1;
}

function highlightFormBtn(key) {
    document.querySelectorAll(".special-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.key === key);
    });
}

// ===== INIT =====
async function init() {
    showLoader(true);
    try {
        // 1. Pokémon normales
        const res  = await fetch(`${API}/pokemon?limit=1025&offset=0`);
        const data = await res.json();
        allPokemon = data.results.map((p, i) => ({ id: i + 1, name: p.name }));

        // 2. Formas especiales en paralelo sin bloquear UI
        loadSpecialForms();

        // 3. Restaurar estado y renderizar
        const savedPage = restoreState();
        await applyFilters(savedPage);

    } catch (e) {
        document.getElementById("pokemon-grid").innerHTML =
            `<div style="grid-column:1/-1;text-align:center;padding:80px;color:var(--text-2)">
                <div style="font-size:3rem;margin-bottom:12px">⚠️</div>
                <p>Error al conectar con la PokéAPI.<br>Revisa tu conexión a internet.</p>
            </div>`;
    } finally {
        showLoader(false);
    }
}

async function loadSpecialForms() {
    try {
        // La PokéAPI guarda formas alternativas en offsets altos
        // Probamos offset 10000 con limite alto para capturar todas
        const res  = await fetch(`${API}/pokemon?limit=500&offset=10000`);
        const data = await res.json();

        specialForms = data.results
            .filter(p => ALL_KEYWORDS.some(kw => p.name.includes(kw)))
            .map(p => {
                const idMatch = p.url.match(/\/(\d+)\/$/);
                return idMatch ? { id: parseInt(idMatch[1]), name: p.name } : null;
            })
            .filter(Boolean);

    } catch {
        specialForms = [];
    }
}

// ===== RENDER PÁGINA =====
async function renderPage(page) {
    currentPage = page;
    showLoader(true);

    const start     = (page - 1) * ITEMS_PER_PAGE;
    const pageItems = filteredPokemon.slice(start, start + ITEMS_PER_PAGE);

    document.getElementById("results-count").textContent =
        `${filteredPokemon.length} pokémon encontrados`;

    const details = await Promise.all(pageItems.map(p => fetchDetail(p.id)));
    renderGrid(details.filter(Boolean));
    renderPagination();
    showLoader(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    saveState();
}

// ===== CACHÉ + FETCH =====
const cache = {};

async function fetchDetail(id) {
    if (cache[id]) return cache[id];
    try {
        const res = await fetch(`${API}/pokemon/${id}`);
        if (!res.ok) return null;
        const d   = await res.json();
        const obj = {
            id:      d.id,
            name:    d.name,
            types:   d.types.map(t => t.type.name),
            sprite:  d.sprites.other?.["official-artwork"]?.front_default
                     || d.sprites.front_default,
            formTag: getFormTag(d.name)
        };
        cache[id] = obj;
        return obj;
    } catch { return null; }
}

// ===== GRID =====
const TAG_COLORS = {
    "MEGA":"#e63946","G-MAX":"#7b68ee","PRIMIGENIO":"#3ecf8e",
    "ALOLA":"#f7c94b","GALAR":"#4a9eff","HISUI":"#ff7eb3","PALDEA":"#ff6b35"
};

function renderGrid(list) {
    const grid = document.getElementById("pokemon-grid");

    if (!list.length) {
        grid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:80px 20px;color:var(--text-3)">
                <div style="font-size:3rem;margin-bottom:12px">🔍</div>
                <p>No se encontró ningún pokémon con esos filtros</p>
            </div>`;
        return;
    }

    grid.innerHTML = list.map((p, i) => `
        <div class="pokemon-card" data-type="${p.types[0]}"
             onclick="goToDetail(${p.id})"
             style="animation-delay:${i * 0.03}s; position:relative; overflow:hidden">

            ${p.formTag ? `
                <span style="position:absolute;top:8px;right:8px;font-size:10px;
                    background:${TAG_COLORS[p.formTag] || "var(--accent)"};
                    color:white;padding:2px 8px;border-radius:20px;
                    font-weight:700;z-index:1;letter-spacing:0.3px">
                    ${p.formTag}
                </span>` : ""}

            <span class="card-number">#${String(p.id).padStart(p.id > 9999 ? 5 : 3, "0")}</span>

            <div class="card-img-wrap">
                <img class="card-img"
                    src="${p.sprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}"
                    alt="${p.name}" loading="lazy"
                    onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png'">
            </div>

            <div class="card-name">${formatName(p.name)}</div>

            <div class="card-types">
                ${p.types.map(t => `<span class="type-badge type-${t}">${translateType(t)}</span>`).join("")}
            </div>
        </div>
    `).join("");
}

// ===== PAGINACIÓN =====
function renderPagination() {
    const total = Math.ceil(filteredPokemon.length / ITEMS_PER_PAGE);
    const pag   = document.getElementById("pagination");
    if (total <= 1) { pag.innerHTML = ""; return; }

    let html = `<button class="page-btn" onclick="renderPage(${currentPage - 1})"
        ${currentPage === 1 ? "disabled" : ""}>←</button>`;
    html += `<span class="page-info">Página ${currentPage} de ${total}</span>`;

    getPageRange(currentPage, total).forEach(p => {
        html += p === "..."
            ? `<span class="page-info">…</span>`
            : `<button class="page-btn ${p === currentPage ? "active" : ""}"
               onclick="renderPage(${p})">${p}</button>`;
    });

    html += `<button class="page-btn" onclick="renderPage(${currentPage + 1})"
        ${currentPage === total ? "disabled" : ""}>→</button>`;
    pag.innerHTML = html;
}

function getPageRange(cur, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (cur <= 4)        return [1, 2, 3, 4, 5, "...", total];
    if (cur >= total - 3) return [1, "...", total-4, total-3, total-2, total-1, total];
    return [1, "...", cur-1, cur, cur+1, "...", total];
}

// ===== BÚSQUEDA =====
function handleSearch() {
    const val = document.getElementById("search-input").value.trim();
    document.getElementById("search-clear").classList.toggle("hidden", !val);
    applyFilters(1);
}
function clearSearch() {
    document.getElementById("search-input").value = "";
    document.getElementById("search-clear").classList.add("hidden");
    applyFilters(1);
}

// ===== BOTONES FORMAS ESPECIALES =====
function toggleSpecial(key) {
    // Si ya está activo lo desactiva, si no activa el nuevo
    activeForm = activeForm === key ? "" : key;
    highlightFormBtn(activeForm);

    // Al activar forma especial, quitar filtro de generación
    if (activeForm) document.getElementById("filter-gen").value = "";

    applyFilters(1);
}

// ===== FILTROS =====
async function applyFilters(page = 1) {
    const search = document.getElementById("search-input").value.toLowerCase().trim();
    const type   = document.getElementById("filter-type").value;
    const gen    = document.getElementById("filter-gen").value;

    // Elegir base según si hay forma activa o no
    let base;
    if (activeForm) {
        const keywords = FORM_KEYWORDS[activeForm] || [];
        // Esperar a que carguen las formas especiales si aún no están
        if (!specialForms.length) {
            showLoader(true);
            await loadSpecialForms();
            showLoader(false);
        }
        base = specialForms.filter(p =>
            keywords.some(kw => p.name.includes(kw))
        );
    } else {
        base = [...allPokemon];
    }

    // Filtro nombre / número
    let result = base.filter(p => {
        const matchSearch = !search ||
            p.name.includes(search) ||
            String(p.id).includes(search);
        const matchGen = !gen || activeForm ? true :
            (p.id >= GEN_RANGES[gen]?.[0] && p.id <= GEN_RANGES[gen]?.[1]);
        return matchSearch && matchGen;
    });

    // Filtro tipo (necesita fetch de detalles)
    if (type) {
        showLoader(true);
        const details = await Promise.all(result.map(p => fetchDetail(p.id)));
        result = details
            .filter(d => d && d.types.includes(type))
            .map(d => base.find(p => p.id === d.id))
            .filter(Boolean);
        showLoader(false);
    }

    filteredPokemon = result;
    await renderPage(page);
}

function resetFilters() {
    document.getElementById("search-input").value = "";
    document.getElementById("filter-type").value  = "";
    document.getElementById("filter-gen").value   = "";
    document.getElementById("search-clear").classList.add("hidden");
    activeForm = "";
    highlightFormBtn("");
    filteredPokemon = [...allPokemon];
    renderPage(1);
}

// ===== NAVEGACIÓN =====
function goToDetail(id) {
    saveState();
    window.location.href = `pokemon.html?id=${id}`;
}

// ===== HELPERS =====
function showLoader(show) {
    document.getElementById("loader").classList.toggle("hidden", !show);
    document.getElementById("pokemon-grid").style.opacity = show ? "0.4" : "1";
}

function getFormTag(name) {
    if (name.includes("-mega"))   return "MEGA";
    if (name.includes("-gmax"))   return "G-MAX";
    if (name.includes("-primal")) return "PRIMIGENIO";
    if (name.includes("-alola"))  return "ALOLA";
    if (name.includes("-galar"))  return "GALAR";
    if (name.includes("-hisui"))  return "HISUI";
    if (name.includes("-paldea")) return "PALDEA";
    return "";
}

function formatName(name) {
    return name
        .replace(/-mega-x$/,  " Mega X")
        .replace(/-mega-y$/,  " Mega Y")
        .replace(/-mega$/,    " Mega")
        .replace(/-gmax$/,    " Gigamax")
        .replace(/-primal$/,  " Primigenio")
        .replace(/-alola$/,   " (Alola)")
        .replace(/-galar$/,   " (Galar)")
        .replace(/-hisui$/,   " (Hisui)")
        .replace(/-paldea$/,  " (Paldea)")
        .replace(/-/g, " ")
        .replace(/\b\w/g, l => l.toUpperCase());
}

function translateType(type) {
    const map = {
        fire:"Fuego", water:"Agua", grass:"Planta", electric:"Eléctrico",
        psychic:"Psíquico", ice:"Hielo", dragon:"Dragón", dark:"Siniestro",
        fairy:"Hada", fighting:"Lucha", poison:"Veneno", ground:"Tierra",
        rock:"Roca", bug:"Bicho", ghost:"Fantasma", steel:"Acero",
        flying:"Volador", normal:"Normal"
    };
    return map[type] || type;
}

init();