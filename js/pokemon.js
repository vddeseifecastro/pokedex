// =============================================
//   POKÉDEX — pokemon.js
//   Página de detalle: stats, evoluciones, info
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

// Colores por tipo
const TYPE_COLORS = {
    fire: "#ff6b35", water: "#4a9eff", grass: "#3ecf8e",
    electric: "#f7c94b", psychic: "#ff7eb3", ice: "#74d4e8",
    dragon: "#7b68ee", dark: "#6b5a7e", fairy: "#ffb3e6",
    fighting: "#e8734a", poison: "#b97fc9", ground: "#d4a76a",
    rock: "#b8a038", bug: "#8bc34a", ghost: "#7b62a3",
    steel: "#9eb8d9", flying: "#89aaff", normal: "#a8a878"
};

const STAT_NAMES = {
    "hp": "HP",
    "attack": "Ataque",
    "defense": "Defensa",
    "special-attack": "Atq. Esp.",
    "special-defense": "Def. Esp.",
    "speed": "Velocidad"
};

// Colores para barras de stats según valor
function getStatColor(value) {
    if (value >= 100) return "#3ecf8e";
    if (value >= 70) return "#4a9eff";
    if (value >= 50) return "#f7c94b";
    return "#ff6b35";
}

async function init() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        window.location.href = "index.html";
        return;
    }

    try {
        const [pokemonRes, speciesRes] = await Promise.all([
            fetch(`${API}/pokemon/${id}`),
            fetch(`${API}/pokemon-species/${id}`)
        ]);

        const pokemon = await pokemonRes.json();
        const species = await speciesRes.json();

        document.title = `${capitalize(pokemon.name)} — Pokédex`;

        renderDetail(pokemon, species);
        await renderEvolutions(species.evolution_chain.url);

        // Animar barras después de render
        setTimeout(() => animateStatBars(), 100);

    } catch (err) {
        document.getElementById("detail-container").innerHTML = `
            <div style="text-align:center;padding:80px;color:var(--text-2)">
                <div style="font-size:3rem;margin-bottom:12px">😵</div>
                <p>No se pudo cargar este Pokémon</p>
                <button onclick="window.history.back()" style="margin-top:16px;padding:10px 20px;background:var(--accent);border:none;border-radius:8px;color:white;cursor:pointer;font-family:inherit">
                    Volver
                </button>
            </div>`;
    }
}

function renderDetail(pokemon, species) {
    const mainType = pokemon.types[0].type.name;
    const typeColor = TYPE_COLORS[mainType] || "#9aa0b4";

    // Género del pokémon en español
    const genus = species.genera.find(g => g.language.name === "es")?.genus
        || species.genera.find(g => g.language.name === "en")?.genus
        || "";

    // Descripción
    const description = species.flavor_text_entries
        .find(e => e.language.name === "es")?.flavor_text
        || species.flavor_text_entries
        .find(e => e.language.name === "en")?.flavor_text
        || "";

    // Habilidades
    const abilities = pokemon.abilities
        .map(a => `<span class="ability-badge">${a.ability.name}${a.is_hidden ? " (oculta)" : ""}</span>`)
        .join("");

    // Tipos
    const types = pokemon.types
        .map(t => `<span class="detail-type-badge type-badge type-${t.type.name}">${translateType(t.type.name)}</span>`)
        .join("");

    // Stats
    const stats = pokemon.stats.map(s => `
        <div class="stat-row">
            <span class="stat-name">${STAT_NAMES[s.stat.name] || s.stat.name}</span>
            <span class="stat-value">${s.base_stat}</span>
            <div class="stat-bar-bg">
                <div class="stat-bar-fill"
                     data-value="${s.base_stat}"
                     style="background: ${getStatColor(s.base_stat)}; width: 0%">
                </div>
            </div>
        </div>
    `).join("");

    const totalStats = pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0);

    // Imagen oficial
    const img = pokemon.sprites.other["official-artwork"].front_default
        || pokemon.sprites.front_default;

    document.getElementById("detail-container").innerHTML = `

        <!-- Hero -->
        <div class="detail-hero">
            <div class="detail-img-panel">
                <div class="detail-bg-circle" style="background: ${typeColor}"></div>
                <span class="detail-number">#${String(pokemon.id).padStart(3, "0")}</span>
                <img class="detail-img" src="${img}" alt="${pokemon.name}"
                    onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png'">
            </div>
            <div class="detail-info-panel">
                <h1 class="detail-name">${pokemon.name}</h1>
                <p class="detail-genus">${genus}</p>
                <div class="detail-types">${types}</div>

                <div class="detail-measurements">
                    <div class="measurement-item">
                        <span class="measurement-label">Altura</span>
                        <span class="measurement-value">${(pokemon.height / 10).toFixed(1)} m</span>
                    </div>
                    <div class="measurement-item">
                        <span class="measurement-label">Peso</span>
                        <span class="measurement-value">${(pokemon.weight / 10).toFixed(1)} kg</span>
                    </div>
                    <div class="measurement-item">
                        <span class="measurement-label">Exp. base</span>
                        <span class="measurement-value">${pokemon.base_experience || "—"}</span>
                    </div>
                    <div class="measurement-item">
                        <span class="measurement-label">Generación</span>
                        <span class="measurement-value">${getRomanGen(species.generation.name)}</span>
                    </div>
                </div>

                <div style="margin-bottom:12px">
                    <span style="font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:0.5px;font-weight:600;display:block;margin-bottom:8px">Habilidades</span>
                    <div class="detail-abilities">${abilities}</div>
                </div>
            </div>
        </div>

        ${description ? `
        <div style="background:var(--bg-2);border:1px solid var(--border);border-radius:14px;padding:20px 24px;margin-bottom:24px">
            <p style="color:var(--text-2);font-size:14px;line-height:1.7;font-style:italic">
                "${description.replace(/\f/g, ' ')}"
            </p>
        </div>` : ""}

        <!-- Stats -->
        <div class="detail-stats">
            <h2 class="section-title">Estadísticas base</h2>
            ${stats}
            <div class="stat-row" style="margin-top:8px;padding-top:12px;border-top:1px solid var(--border)">
                <span class="stat-name" style="font-weight:700;color:var(--text)">Total</span>
                <span class="stat-value" style="color:var(--accent)">${totalStats}</span>
                <div></div>
            </div>
        </div>

        <!-- Evoluciones (placeholder, se llena después) -->
        <div class="detail-evolutions" id="evolutions-section">
            <h2 class="section-title">Cadena evolutiva</h2>
            <div class="loader" style="padding:20px">
                <div class="loader-ball"></div>
            </div>
        </div>
    `;
}

function animateStatBars() {
    document.querySelectorAll(".stat-bar-fill").forEach(bar => {
        const value = parseInt(bar.dataset.value);
        const pct = Math.min((value / 255) * 100, 100);
        bar.style.width = pct + "%";
    });
}

async function renderEvolutions(chainUrl) {
    try {
        const res = await fetch(chainUrl);
        const data = await res.json();

        const chain = [];
        let current = data.chain;

        while (current) {
            const idMatch = current.species.url.match(/\/(\d+)\/$/);
            const id = idMatch ? parseInt(idMatch[1]) : null;
            chain.push({ name: current.species.name, id });
            current = current.evolves_to[0] || null;
        }

        const currentId = parseInt(new URLSearchParams(window.location.search).get("id"));

        const evoHTML = chain.map((evo, i) => `
            ${i > 0 ? '<span class="evo-arrow">→</span>' : ""}
            <div class="evo-item ${evo.id === currentId ? "current" : ""}"
                 onclick="${evo.id !== currentId ? `window.location.href='pokemon.html?id=${evo.id}'` : ""}">
                <img class="evo-img"
                    src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evo.id}.png"
                    alt="${evo.name}"
                    onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png'">
                <span class="evo-name">${evo.name}</span>
            </div>
        `).join("");

        const section = document.getElementById("evolutions-section");
        if (section) {
            section.innerHTML = `
                <h2 class="section-title">Cadena evolutiva</h2>
                <div class="evolutions-chain">${evoHTML}</div>
            `;
        }
    } catch {
        const section = document.getElementById("evolutions-section");
        if (section) section.innerHTML = "";
    }
}

// ===== HELPERS =====
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getRomanGen(genName) {
    const map = {
        "generation-i": "I", "generation-ii": "II", "generation-iii": "III",
        "generation-iv": "IV", "generation-v": "V", "generation-vi": "VI",
        "generation-vii": "VII", "generation-viii": "VIII", "generation-ix": "IX"
    };
    return map[genName] || genName;
}

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

// ===== INIT =====
init();