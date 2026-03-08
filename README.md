<div align="center">

# 🔴 Pokédex
### Full Pokémon Encyclopedia

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![PokéAPI](https://img.shields.io/badge/PokéAPI-EF5350?style=for-the-badge&logo=pokemon&logoColor=white)

A complete Pokédex built with Vanilla JS consuming the public PokéAPI. Includes all 1,025 Pokémon from Generation I to IX plus special forms, real-time search, type and generation filters, detailed stats, evolution chains, and a side-by-side comparator.

[Report Bug](https://github.com/vddeseifecastro/pokedex/issues) · [Request Feature](https://github.com/vddeseifecastro/pokedex/issues)

</div>

---

## 📸 Screenshots

### 🏠 Catálogo Principal

![Catalog 1](URL_IMAGEN_1)

![Catalog 2](URL_IMAGEN_2)

### 🔍 Detalle de Pokémon

![Detail 1](URL_IMAGEN_3)

![Detail 2](URL_IMAGEN_4)

### ⚔️ Comparador

![Comparator](URL_IMAGEN_5)

---

## ✨ Features

### 📋 Catálogo
- 1,025 Pokémon de las Generaciones I a IX
- Búsqueda en tiempo real por nombre o número
- Filtro por tipo (18 tipos disponibles)
- Filtro por generación (Gen I — Gen IX)
- Formas especiales: Mega, Gigamax, Primal, Alola, Galar, Hisui, Paldea
- Paginación de 24 Pokémon por página
- Filtros persistidos en localStorage

### 📄 Detalle de Pokémon
- Estadísticas base con barras de progreso
- Cadena de evolución completa
- Habilidades con descripciones
- Traducciones al español
- Tipos con colores oficiales
- Sprites animados

### ⚔️ Comparador
- Comparación lado a lado de dos Pokémon
- Detección automática del ganador por estadística
- Badges de formas especiales
- Estadísticas totales

### 🎨 General
- Tema oscuro / tema claro
- Diseño completamente responsive
- Sin frameworks — Vanilla JS puro

---

## 🖥️ Tech Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Vanilla JS (ES6+), HTML5, CSS3 |
| API | PokéAPI v2 (pokeapi.co) — pública y gratuita |
| Almacenamiento | localStorage (filtros persistidos) |
| Fuentes | Google Fonts |

> La PokéAPI es una API pública, open source y gratuita. No requiere API key ni registro.

---

## 🚀 Getting Started

No se necesita instalación ni servidor. Abre directamente en el navegador:

```
index.html
```

O usa la extensión **Live Server** de VS Code (clic derecho → Open with Live Server).

> **Nota:** La aplicación consume la PokéAPI en tiempo real. Necesitas conexión a internet para que los datos y las imágenes carguen correctamente.

---

## 📁 Project Structure

```
pokedex/
│
├── index.html           ← Catálogo principal
├── pokemon.html         ← Página de detalle de Pokémon
├── comparador.html      ← Comparador de dos Pokémon
│
├── css/
│   └── style.css        ← Estilos completos + temas dark/light
│
├── js/
│   ├── app.js           ← Catálogo, filtros, búsqueda, paginación
│   ├── pokemon.js       ← Detalle, stats, evoluciones, habilidades
│   └── comparador.js    ← Comparador lado a lado
│
└── README.md
```

---

## 🌐 API Reference

Este proyecto usa la **[PokéAPI](https://pokeapi.co/)** — una API RESTful completamente pública, gratuita y open source. No requiere autenticación ni API key.

| Endpoint | Uso |
|----------|-----|
| `/api/v2/pokemon/{id}` | Stats, sprites, tipos, habilidades |
| `/api/v2/pokemon-species/{id}` | Nombres en español, flavor text |
| `/api/v2/evolution-chain/{id}` | Cadena de evolución |
| `/api/v2/type/{name}` | Pokémon por tipo |

---

## 🌱 Upcoming Features

- [ ] Deploy en GitHub Pages
- [ ] Modo favoritos con localStorage
- [ ] Filtro por estadística base
- [ ] Sonido del grito de cada Pokémon

---

## 👨‍💻 Author

**Victor Dominic Deseife Castro**

[![GitHub](https://img.shields.io/badge/GitHub-vddeseifecastro-181717?style=for-the-badge&logo=github)](https://github.com/vddeseifecastro)

---

<div align="center">
  <p>Built with ❤️ by Victor Dominic Deseife Castro</p>
  <p>⭐ Star this repo if you found it useful!</p>
</div>