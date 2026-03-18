/**
 * LÓGICA DEL ÍNDICE
 */

const resultadoDiv = document.getElementById('resultado');
const buscador = document.getElementById('buscador');
const filtroTipo = document.getElementById('filtro-tipo');
const orden = document.getElementById('orden');

let todosLosPokemon = [];

// Función para cargar la lista inicial
async function inicializarPokedex() {
    // Seguridad: Si no estamos en el index, no ejecutar este script
    if (!resultadoDiv) return;

    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
        const data = await response.json();

        todosLosPokemon = data.results.map((p, index) => ({
            name: p.name,
            id: index + 1,
            img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${index + 1}.png`
        }));

        renderizar(todosLosPokemon);
    } catch (error) {
        console.error("Error:", error);
        resultadoDiv.innerHTML = '<p class="loader">Error al cargar los datos.</p>';
    }
}

function renderizar(lista) {
    if (!resultadoDiv) return;

    if (lista.length === 0) {
        resultadoDiv.innerHTML = '<p class="loader">No hay coincidencias.</p>';
        return;
    }

    // Al asignar esto, el mensaje de "Conectando..." se borra solo
    resultadoDiv.innerHTML = lista.map(p => `
        <article class="pokemon-card" onclick="location.href='detalle.html?name=${p.name}'">
            <span class="id-badge">#${p.id.toString().padStart(3, '0')}</span>
            <div class="img-wrapper">
                <img src="${p.img}" alt="${p.name}" loading="lazy">
            </div>
            <h3 class="pokemon-name capitalize">${p.name}</h3>
            <footer class="card-footer">
                Ver detalles <span style="color:var(--primary)">→</span>
            </footer>
        </article>
    `).join('');
}

async function filtrar() {
    const termino = buscador.value.toLowerCase();
    const tipo = filtroTipo.value;
    const criterio = orden.value;

    let filtrados = todosLosPokemon.filter(p => 
        p.name.includes(termino) || p.id.toString() === termino
    );

    if (tipo !== 'todos') {
        const res = await fetch(`https://pokeapi.co/api/v2/type/${tipo}`);
        const data = await res.json();
        const nombresEnTipo = data.pokemon.map(p => p.pokemon.name);
        filtrados = filtrados.filter(p => nombresEnTipo.includes(p.name));
    }

    if (criterio === 'nombre') {
        filtrados.sort((a, b) => a.name.localeCompare(b.name));
    } else {
        filtrados.sort((a, b) => a.id - b.id);
    }

    renderizar(filtrados);
}

// Eventos
if (buscador) {
    buscador.addEventListener('input', filtrar);
    filtroTipo.addEventListener('change', filtrar);
    orden.addEventListener('change', filtrar);
}

inicializarPokedex();