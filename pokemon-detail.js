/**
 * LÓGICA DE DETALLE: Sonido, Interacciones y Motor de Tipos
 */

const params = new URLSearchParams(window.location.search);
const pName = params.get('name');

const TYPES = { 
    fire: ['Fuego', '#F08030'], water: ['Agua', '#6890F0'], grass: ['Planta', '#78C850'], 
    electric: ['Eléctrico', '#F8D030'], ice: ['Hielo', '#98D8D8'], fighting: ['Lucha', '#C03028'], 
    poison: ['Veneno', '#A040A0'], ground: ['Tierra', '#E0C068'], flying: ['Volador', '#A890F0'], 
    psychic: ['Psíquico', '#F85888'], bug: ['Bicho', '#A8B820'], rock: ['Roca', '#B8A038'], 
    ghost: ['Fantasma', '#705898'], dragon: ['Dragón', '#7038F8'], dark: ['Siniestro', '#705848'], 
    steel: ['Acero', '#B8B8D0'], fairy: ['Hada', '#EE99AC'], normal: ['Normal', '#A8A878'] 
};

const getData = async (url) => (await fetch(url)).json();

async function cargarDetalle() {
    if (!pName) return;
    const content = document.getElementById('content');

    try {
        const p = await getData(`https://pokeapi.co/api/v2/pokemon/${pName}`);
        const s = await getData(p.species.url);
        
        const mainColor = TYPES[p.types[0].type.name][1];
        document.documentElement.style.setProperty('--type-color', mainColor);
        document.documentElement.style.setProperty('--type-bg', mainColor + '15');

        const desc = s.flavor_text_entries.find(e => e.language.name === 'es')?.flavor_text.replace(/[\f\n\r\t\v]/g, ' ') || "...";

        content.innerHTML = `
            <div class="detail-card">
                <header class="hero-section">
                    <div class="visual-side">
                        <img src="${p.sprites.other['official-artwork'].front_default}" id="pokemonImg" alt="${p.name}">
                        <button id="shinyBtn" title="Ver Shiny" onclick="window.toggleShiny('${p.sprites.other['official-artwork'].front_default}', '${p.sprites.other['official-artwork'].front_shiny}')">✨</button>
                        <button id="soundBtn" style="bottom:20px; right:20px;" title="Escuchar Grito" onclick="window.reproducirSonido('${p.cries.latest}')">🔊</button>
                    </div>
                    <div class="info-side">
                        <a href="index.html" class="back-btn">VOLVER</a>
                        <h2 class="capitalize">${p.name}</h2>
                        <div class="chip-container">
                            ${p.types.map(t => `<span class="type-chip" style="background:${TYPES[t.type.name][1]}">${TYPES[t.type.name][0]}</span>`).join('')}
                        </div>
                        <p class="description">"${desc}"</p>
                    </div>
                </header>

                <div class="details-grid">
                    <section><canvas id="stats-radar"></canvas></section>
                    <section>
                        <span class="section-label">Habilidades Especiales</span>
                        <div class="chip-container" id="habilidades-list"></div>
                        <span class="section-label">Movimientos Clave</span>
                        <div class="moves-grid" id="moves-container"></div>
                    </section>
                </div>

                <section class="efficacy-section">
                    <span class="section-label center">Eficacia en Combate</span>
                    <div class="efficacy-grid">
                        <div class="efficacy-group">
                            <span class="efficacy-title text-danger">Debilidades (x2 / x4)</span>
                            <div class="efficacy-list" id="weak-list"></div>
                        </div>
                        <div class="efficacy-group">
                            <span class="efficacy-title text-success">Resistencias</span>
                            <div class="efficacy-list" id="res-list"></div>
                        </div>
                    </div>
                </section>

                <footer class="evolution-section">
                    <span class="section-label center">Línea Evolutiva</span>
                    <div class="evo-container" id="evo-chain"></div>
                </footer>
            </div>
        `;

        renderRadar(p.stats, mainColor);
        renderHabilidades(p.abilities);
        renderMovimientos(p.moves.slice(0, 4));
        renderEficacias(p.types);
        renderEvoluciones(s.evolution_chain.url, p.id);

    } catch (e) {
        console.error(e);
        content.innerHTML = `<div class="loader">Error al cargar los datos de ${pName}.</div>`;
    }
}

// --- FUNCIONES GLOBALES (Restauradas para onclick) ---
window.reproducirSonido = (url) => {
    const audio = new Audio(url);
    audio.volume = 0.5;
    audio.play();
};

window.toggleShiny = (def, shi) => {
    const img = document.getElementById('pokemonImg');
    img.src = img.src === def ? (shi || def) : def;
};

window.showModal = (title, text) => {
    document.getElementById('modalTitle').innerText = title.toUpperCase();
    document.getElementById('modalDesc').innerText = text.replace(/[\f\n\r\t\v]/g, ' ');
    document.getElementById('modal').style.display = 'flex';
};

window.cerrarModal = () => document.getElementById('modal').style.display = 'none';

// --- RENDERIZADO SECUNDARIO ---
function renderRadar(stats, color) {
    new Chart(document.getElementById('stats-radar'), {
        type: 'radar',
        data: {
            labels: ['PS', 'ATK', 'DEF', 'VEL', 'D.ESP', 'A.ESP'],
            datasets: [{ data: stats.map(s => s.base_stat), backgroundColor: color + '40', borderColor: color, borderWidth: 3 }]
        },
        options: { scales: { r: { min: 0, max: 150, ticks: { display: false } } }, plugins: { legend: { display: false } } }
    });
}

async function renderHabilidades(abs) {
    const list = document.getElementById('habilidades-list');
    for (const a of abs) {
        const data = await getData(a.ability.url);
        const name = data.names.find(n => n.language.name === 'es')?.name || a.ability.name;
        const desc = data.flavor_text_entries.find(e => e.language.name === 'es')?.flavor_text || "...";
        const span = document.createElement('span');
        span.className = 'type-chip pointer';
        span.style.background = 'var(--type-color)';
        span.innerText = name;
        span.onclick = () => window.showModal(name, desc);
        list.appendChild(span);
    }
}

async function renderMovimientos(moves) {
    const container = document.getElementById('moves-container');
    for (const m of moves) {
        const data = await getData(m.move.url);
        const color = TYPES[data.type.name][1];
        const name = data.names.find(n => n.language.name === 'es')?.name || m.move.name;
        const desc = data.flavor_text_entries.find(e => e.language.name === 'es')?.flavor_text || "...";
        const div = document.createElement('div');
        div.className = 'move-card';
        div.style.background = color;
        div.innerText = name;
        div.onclick = () => window.showModal(name, desc);
        container.appendChild(div);
    }
}

async function renderEficacias(pTypes) {
    const rels = {};
    for (const t of pTypes) {
        const d = await getData(t.type.url);
        d.damage_relations.double_damage_from.forEach(x => rels[x.name] = (rels[x.name] || 1) * 2);
        d.damage_relations.half_damage_from.forEach(x => rels[x.name] = (rels[x.name] || 1) * 0.5);
        d.damage_relations.no_damage_from.forEach(x => rels[x.name] = 0);
    }
    const wL = document.getElementById('weak-list'), rL = document.getElementById('res-list');
    Object.entries(rels).forEach(([type, mult]) => {
        if (mult === 1) return;
        const b = document.createElement('div');
        b.className = 'type-badge'; b.style.background = TYPES[type][1];
        b.innerHTML = `${TYPES[type][0]} <span class="multiplier">x${mult}</span>`;
        if (mult > 1) wL.appendChild(b); else rL.appendChild(b);
    });
}

async function renderEvoluciones(url, currentId) {
    const data = await getData(url);
    const container = document.getElementById('evo-chain');
    const recorrer = async (nodo) => {
        const id = nodo.species.url.split('/').filter(Boolean).pop();
        const p = await getData(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const isCurrent = Number(p.id) === Number(currentId);
        const div = document.createElement('div');
        div.className = `evo-item ${isCurrent ? 'current' : ''}`;
        div.innerHTML = `<img src="${p.sprites.other['official-artwork'].front_default}" class="evo-img"><div>${p.name}</div>`;
        if(!isCurrent) div.onclick = () => location.href = `detalle.html?name=${p.name}`;
        container.appendChild(div);
        for (const prox of nodo.evolves_to) await recorrer(prox);
    };
    await recorrer(data.chain);
}

cargarDetalle();