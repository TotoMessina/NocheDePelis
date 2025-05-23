const API_KEY = "31841cf8ea5ec78f32d856ec6e773ea0";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";
const DEFAULT_IMG = "https://via.placeholder.com/500x750?text=Sin+Imagen";

const generoSelect = document.getElementById("genero");
const plataformaSelect = document.getElementById("plataforma");
const buscarBtn = document.getElementById("buscar");
const resultados = document.getElementById("resultados");
const paginacion = document.getElementById("paginacion");

const rangoDesde = document.getElementById("rango-desde");
const rangoHasta = document.getElementById("rango-hasta");
const labelDesde = document.getElementById("anio-desde");
const labelHasta = document.getElementById("anio-hasta");

let paginaActual = 1;
let totalPaginas = 1;

// ========== Cargar géneros ==========
async function cargarGeneros() {
  const res = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=es-ES`);
  const data = await res.json();
  data.genres.forEach(g => {
    const option = document.createElement("option");
    option.value = g.id;
    option.textContent = g.name;
    generoSelect.appendChild(option);
  });
}

// ========== Sliders ==========
rangoDesde.addEventListener("input", () => {
  if (parseInt(rangoDesde.value) > parseInt(rangoHasta.value)) {
    rangoDesde.value = rangoHasta.value;
  }
  labelDesde.textContent = rangoDesde.value;
});

rangoHasta.addEventListener("input", () => {
  if (parseInt(rangoHasta.value) < parseInt(rangoDesde.value)) {
    rangoHasta.value = rangoDesde.value;
  }
  labelHasta.textContent = rangoHasta.value;
});

// ========== Buscar películas ==========
async function buscarPeliculas(pagina = 1) {
  const nombre = document.getElementById("nombre").value;
  const persona = document.getElementById("persona").value;
  const genero = generoSelect.value;
  const plataforma = plataformaSelect.value;
  const orden = document.getElementById("orden").value;
  const desde = rangoDesde.value;
  const hasta = rangoHasta.value;
  const minRating = document.getElementById("min-rating").value;

  resultados.innerHTML = "Cargando...";

  const url = new URL(`${BASE_URL}/discover/movie`);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("language", "es-ES");
  if (genero) url.searchParams.set("with_genres", genero);
  if (orden) url.searchParams.set("sort_by", orden);
  if (plataforma && plataforma !== "__ninguna__") {
    url.searchParams.set("with_watch_providers", plataforma);
    url.searchParams.set("watch_region", "AR");
  }
  if (desde) url.searchParams.set("primary_release_date.gte", `${desde}-01-01`);
  if (hasta) url.searchParams.set("primary_release_date.lte", `${hasta}-12-31`);

  // Búsqueda por nombre (search/movie) → no permite combinar con discover
  if (nombre) {
    const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(nombre)}&page=${pagina}`);
    const data = await res.json();
    renderPeliculas(data.results);
    totalPaginas = data.total_pages;
    paginaActual = pagina;
    renderizarPaginacion();
    return;
  }

  // Búsqueda por persona (actor/director)
  if (persona) {
    const resPersona = await fetch(`${BASE_URL}/search/person?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(persona)}`);
    const dataPersona = await resPersona.json();
    if (dataPersona.results.length > 0) {
      const personaId = dataPersona.results[0].id;
      url.searchParams.set("with_people", personaId);
    } else {
      resultados.innerHTML = "<p>No se encontró esa persona.</p>";
      return;
    }
  }

  try {
    // Primera página
    url.searchParams.set("page", pagina);
    const res1 = await fetch(url.toString());
    const data1 = await res1.json();

    // Segunda página
    url.searchParams.set("page", pagina + 1);
    const res2 = await fetch(url.toString());
    const data2 = await res2.json();

    // Juntar las primeras 20 + 4 de la siguiente
    let peliculas = [...data1.results, ...data2.results.slice(0, 4)];

    if (minRating) {
      peliculas = peliculas.filter(p => p.vote_average >= parseFloat(minRating));
    }

    renderPeliculas(peliculas);
    totalPaginas = data1.total_pages;
    paginaActual = pagina;
    renderizarPaginacion();
  } catch (error) {
    console.error("Error al buscar películas:", error);
    resultados.innerHTML = "<p>Error al buscar películas.</p>";
  }
}

// ========== Paginación ==========
function renderizarPaginacion() {
  paginacion.innerHTML = "";

  const crearBoton = (pagina, texto = null) => {
    const btn = document.createElement("button");
    btn.textContent = texto || pagina;
    if (pagina === paginaActual) btn.classList.add("active");
    btn.addEventListener("click", () => buscarPeliculas(pagina));
    return btn;
  };

  if (paginaActual > 1) {
    paginacion.appendChild(crearBoton(paginaActual - 1, "Anterior"));
  }

  for (let i = Math.max(1, paginaActual - 2); i <= Math.min(totalPaginas, paginaActual + 2); i++) {
    paginacion.appendChild(crearBoton(i));
  }

  if (paginaActual < totalPaginas) {
    paginacion.appendChild(crearBoton(paginaActual + 1, "Siguiente"));
  }
}

// ========== Película aleatoria ==========
const randomBtn = document.getElementById("random-btn");

randomBtn.addEventListener("click", async () => {
  resultados.innerHTML = "<div class='spinner'></div><p style='text-align:center;'>Buscando película sorpresa...</p>";

  const genero = generoSelect.value;
  const plataforma = plataformaSelect.value;
  const orden = document.getElementById("orden").value;
  const minRating = document.getElementById("min-rating").value;
  const desde = rangoDesde.value;
  const hasta = rangoHasta.value;

  const urlBase = new URL(`${BASE_URL}/discover/movie`);
  urlBase.searchParams.set("api_key", API_KEY);
  urlBase.searchParams.set("language", "es-ES");

  if (genero) urlBase.searchParams.set("with_genres", genero);
  if (orden) urlBase.searchParams.set("sort_by", orden);
  if (plataforma && plataforma !== "__ninguna__") {
    urlBase.searchParams.set("with_watch_providers", plataforma);
    urlBase.searchParams.set("watch_region", "AR");
  }
  if (desde) urlBase.searchParams.set("primary_release_date.gte", `${desde}-01-01`);
  if (hasta) urlBase.searchParams.set("primary_release_date.lte", `${hasta}-12-31`);

  // PRIMERA CONSULTA: sin página, solo para saber cuántas hay
  const res1 = await fetch(urlBase.toString());
  const data1 = await res1.json();
  const total = data1.total_results;
  const totalPages = Math.min(data1.total_pages, 500); // máximo 500 permitido por la API

  if (total === 0) {
    resultados.innerHTML = "<p>No se encontraron películas que coincidan con los filtros.</p>";
    return;
  }

  // Elegir una página al azar válida
  const paginaRandom = Math.floor(Math.random() * totalPages) + 1;
  urlBase.searchParams.set("page", paginaRandom);

  const res2 = await fetch(urlBase.toString());
  const data2 = await res2.json();

  // Aplicar filtro por rating si es necesario
  const posibles = minRating
    ? data2.results.filter(p => p.vote_average >= parseFloat(minRating))
    : data2.results;

  if (!posibles.length) {
    // Intentar otra página al azar si la actual no tiene resultados válidos
    return randomBtn.click();
  }

  const peli = posibles[Math.floor(Math.random() * posibles.length)];
  renderPeliculas([peli]);
});

// ========== Inicialización ==========
buscarBtn.addEventListener("click", () => buscarPeliculas(1));
window.addEventListener("DOMContentLoaded", cargarGeneros);

document.getElementById("compartir-noche").addEventListener("click", () => {
  const mensaje = "¡Estoy armando una noche de peli en https://noche-de-pelis.vercel.app! 🍿🎬";
  if (navigator.share) {
    navigator.share({
      title: "Noche de Pelis",
      text: mensaje,
      url: window.location.href
    }).catch(console.error);
  } else {
    navigator.clipboard.writeText(mensaje + "\n" + window.location.href);
    alert("¡Link copiado para compartir!");
  }
});
