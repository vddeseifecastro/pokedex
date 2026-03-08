// =============================================
//   POKÉDEX — comparador.js
//   Comparador de dos Pokémon
// =============================================

const API = "https://pokeapi.co/api/v2";

// Tema
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

const TYPE_COLORS = {
    fire: "#ff6b35", water: "#4a9eff", grass: "#3ecf8e",
    electric: "#f7c94b", psychic: "#ff7eb3", ice: "#74d4e8",
    dragon: "#7b68ee", dark: "#6b5a7e", fairy: "#ffb3e6",
    fighting: "#e8734a", poison: "#b97fc9", ground: "#d4a76a",
    rock: "#b8a038", bug: "#8bc34a", ghost: "#7b62a3",
    steel: "#9eb8d9", flying: "#89aaff", normal: "#a8a878"
};

const STAT_NAMES = {
    "hp": "HP", "attack": "Ataque", "defense": "Defensa",
    "special-attack": "Atq. Esp.", "special-defense": "Def. Esp.", "speed": "Velocidad"
};

// Estado
let pokemon1 = null;
let pokemon2 = null;
let allPokemonList = [];
let searchTimeout = {};

// Cargar lista completa para sugerencias
async function loadList() {
    try {
        const res = await fetch(`${API}/pokemon?limit=1025`);
        const data = await res.json();
        allPokemonList = data.results.map((p, i) => ({ name: p.name, id: i + 1 }));
    } catch {}
}

// ===== BÚSQUEDA CON SUGERENCIAS =====
function searchPokemon(slot) {
    const input = document.getElementById(`search-${slot}`).value.toLowerCase().trim();
    const suggestionsEl = document.getElementById(`suggestions-${slot}`);

    clearTimeout(searchTimeout[slot]);

    if (input.length < 2) {
        suggestionsEl.classList.add("hidden");
        return;
    }

    searchTimeout[slot] = setTimeout(() => {
        const matches = allPokemonList
            .filter(p => p.name.includes(input) || String(p.id).startsWith(input))
            .slice(0, 8);

        if (matches.length === 0) {
            suggestionsEl.classList.add("hidden");
            return;
        }

        suggestionsEl.innerHTML = matches.map(p => `
            <div class="suggestion-item" onclick="selectPokemon(${slot}, ${p.id}, '${p.name}')">
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png"
                     alt="${p.name}"
                     onerror="this.style.display='none'">
                <span>#${String(p.id).padStart(3, "0")} — ${p.name}</span>
            </div>
        `).join("");

        suggestionsEl.classList.remove("hidden");
    }, 250);
}

async function selectPokemon(slot, id, name) {
    // Cerrar sugerencias
    document.getElementById(`suggestions-${slot}`).classList.add("hidden");
    document.getElementById(`search-${slot}`).value = name;

    // Cargar datos
    const card = document.getElementById(`card-${slot}`);
    card.innerHTML = `<div class="loader"><div class="loader-ball"></div></div>`;

    try {
        const res = await fetch(`${API}/pokemon/${id}`);
        const data = await res.json();

        const pokemon = {
            id: data.id,
            name: data.name,
            types: data.types.map(t => t.type.name),
            sprite: data.sprites.other["official-artwork"].front_default
                || data.sprites.front_default,
            stats: data.stats
        };

        if (slot === 1) pokemon1 = pokemon;
        else pokemon2 = pokemon;

        renderSlotCard(slot, pokemon);

        // Si ambos están cargados, mostrar comparación
        if (pokemon1 && pokemon2) {
            renderComparison();
        }

    } catch {
        card.innerHTML = `<div class="slot-empty"><p>Error al cargar</p></div>`;
    }
}

function renderSlotCard(slot, pokemon) {
    const mainType = pokemon.types[0];
    const typeColor = TYPE_COLORS[mainType] || "#9aa0b4";

    const types = pokemon.types
        .map(t => `<span class="type-badge type-${t}">${translateType(t)}</span>`)
        .join("");

    document.getElementById(`card-${slot}`).innerHTML = `
        <div class="slot-pokemon">
            <img class="slot-pokemon-img"
                src="${pokemon.sprite}"
                alt="${pokemon.name}"
                onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png'">
            <div class="slot-pokemon-name">${pokemon.name}</div>
            <div class="card-types" style="justify-content:center;margin-bottom:12px">${types}</div>
            <a href="pokemon.html?id=${pokemon.id}"
               style="font-size:12px;color:var(--text-3);text-decoration:none;border:1px solid var(--border);padding:4px 12px;border-radius:20px;transition:all 0.2s"
               onmouseover="this.style.color='var(--accent)'"
               onmouseout="this.style.color='var(--text-3)'">
               Ver detalle →
            </a>
        </div>
    `;
}

function renderComparison() {
    const section = document.getElementById("stats-comparison");
    section.classList.remove("hidden");

    const stats1 = {};
    const stats2 = {};

    pokemon1.stats.forEach(s => stats1[s.stat.name] = s.base_stat);
    pokemon2.stats.forEach(s => stats2[s.stat.name] = s.base_stat);

    const statKeys = ["hp", "attack", "defense", "special-attack", "special-defense", "speed"];
    const maxVal = 255;

    const total1 = Object.values(stats1).reduce((a, b) => a + b, 0);
    const total2 = Object.values(stats2).reduce((a, b) => a + b, 0);

    const color1 = TYPE_COLORS[pokemon1.types[0]] || "#4a9eff";
    const color2 = TYPE_COLORS[pokemon2.types[0]] || "#ff6b35";

    const rows = statKeys.map(key => {
        const v1 = stats1[key] || 0;
        const v2 = stats2[key] || 0;
        const pct1 = (v1 / maxVal) * 100;
        const pct2 = (v2 / maxVal) * 100;
        const winner1 = v1 >= v2;
        const winner2 = v2 >= v1;

        return `
            <div class="comparison-row">
                <div class="comparison-bar-wrap-left">
                    <span class="comparison-val ${winner1 ? "winner" : "loser"}">${v1}</span>
                    <div style="flex:1;background:var(--bg-3);border-radius:5px;height:10px;overflow:hidden">
                        <div style="height:100%;border-radius:5px;background:${color1};width:0%;transition:width 1s ease;margin-left:auto"
                             data-pct="${pct1}" class="comp-bar-left"></div>
                    </div>
                </div>
                <div class="comparison-stat-name">${STAT_NAMES[key] || key}</div>
                <div class="comparison-bar-wrap-right">
                    <div style="flex:1;background:var(--bg-3);border-radius:5px;height:10px;overflow:hidden">
                        <div style="height:100%;border-radius:5px;background:${color2};width:0%;transition:width 1s ease"
                             data-pct="${pct2}" class="comp-bar-right"></div>
                    </div>
                    <span class="comparison-val ${winner2 ? "winner" : "loser"}">${v2}</span>
                </div>
            </div>
        `;
    }).join("");

    section.innerHTML = `
        <h2 class="comparison-title">Comparación de estadísticas</h2>
        <div style="display:flex;justify-content:space-between;margin-bottom:16px">
            <span style="font-family:'Syne',sans-serif;font-weight:700;color:${color1};text-transform:capitalize">${pokemon1.name}</span>
            <span style="font-family:'Syne',sans-serif;font-weight:700;color:${color2};text-transform:capitalize">${pokemon2.name}</span>
        </div>
        ${rows}
        <div class="comparison-total">
            <span class="comparison-total-val ${total1 >= total2 ? "winner" : ""}">${total1}</span>
            <span class="comparison-total-label">Total stats</span>
            <span class="comparison-total-val ${total2 >= total1 ? "winner" : ""}">${total2}</span>
        </div>
    `;

    // Animar barras
    setTimeout(() => {
        document.querySelectorAll(".comp-bar-left").forEach(bar => {
            const pct = parseFloat(bar.dataset.pct);
            bar.style.width = pct + "%";
            bar.style.marginLeft = "auto";
        });
        document.querySelectorAll(".comp-bar-right").forEach(bar => {
            bar.style.width = parseFloat(bar.dataset.pct) + "%";
        });
    }, 100);
}

// ===== HELPERS =====
function translateType(type) {
    const types = {
        fire: "Fuego", water: "Agua", grass: "Planta", electric: "Eléctrico",
        psychic: "Psíquico", ice: "Hielo", dragon: "Dragón", dark: "Siniestro",
        fairy: "Hada", fighting: "Lucha", poison: "Veneno", ground: "Tierra",
        rock: "Roca", bug: "Bicho", ghost: "Fantasma", steel: "Acero",
        flying: "Volador", normal: "Normal"
    };
    return types[type] || type;
}

// Cerrar sugerencias al hacer click fuera
document.addEventListener("click", (e) => {
    [1, 2].forEach(slot => {
        const input = document.getElementById(`search-${slot}`);
        const suggestions = document.getElementById(`suggestions-${slot}`);
        if (input && !input.contains(e.target)) {
            suggestions.classList.add("hidden");
        }
    });
});

// ===== INIT =====
loadList();