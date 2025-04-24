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
  const res = await fetch(`${BASE_URL}/genre/tv/list?api_key=${API_KEY}&language=es-ES`);
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

// ========== Buscar series ========== 
async function buscarSeries(pagina = 1) {
  const nombre = document.getElementById("nombre").value;
  const persona = document.getElementById("persona").value;
  const genero = generoSelect.value;
  const plataforma = plataformaSelect.value;
  const orden = document.getElementById("orden").value;
  const desde = rangoDesde.value;
  const hasta = rangoHasta.value;
  const minRating = document.getElementById("min-rating").value;

  resultados.innerHTML = "Cargando...";

  const url = new URL(`${BASE_URL}/discover/tv`);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("language", "es-ES");
  url.searchParams.set("page", pagina);

  if (nombre) {
    const res = await fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(nombre)}&page=${pagina}`);
    const data = await res.json();
    renderSeries(data.results);
    totalPaginas = data.total_pages;
    paginaActual = pagina;
    renderizarPaginacion();
    return;
  }

  if (persona) {
    const resPersona = await fetch(`${BASE_URL}/search/person?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(persona)}`);
    const dataPersona = await resPersona.json();
    if (dataPersona.results.length > 0) {
      const personaId = dataPersona.results[0].id;
      url.searchParams.set("with_people", personaId);
      const res = await fetch(url.toString());
      const data = await res.json();
      renderSeries(data.results);
      totalPaginas = data.total_pages;
      paginaActual = pagina;
      renderizarPaginacion();
      return;
    } else {
      resultados.innerHTML = "<p>No se encontró esa persona.</p>";
      return;
    }
  }

  if (genero) url.searchParams.set("with_genres", genero);
  if (orden) url.searchParams.set("sort_by", orden);  // Aquí se incluye el orden
  if (plataforma && plataforma !== "__ninguna__") {
    url.searchParams.set("with_watch_providers", plataforma);
    url.searchParams.set("watch_region", "AR");
  }
  if (desde) url.searchParams.set("first_air_date.gte", `${desde}-01-01`);
  if (hasta) url.searchParams.set("first_air_date.lte", `${hasta}-12-31`);

  const res = await fetch(url.toString());
  const data = await res.json();

  const posibles = minRating
    ? data.results.filter(s => s.vote_average >= parseFloat(minRating))
    : data.results;

  renderSeries(posibles);

  totalPaginas = data.total_pages;
  paginaActual = pagina;
  renderizarPaginacion();
}

// ========== Renderizar series ========== 
function renderSeries(series) {
  resultados.innerHTML = "";
  series.forEach(serie => {
    const div = document.createElement("div");
    div.classList.add("serie");
    div.innerHTML = `
      <img src="${serie.poster_path ? IMG_URL + serie.poster_path : DEFAULT_IMG}" alt="${serie.name}">
      <h3>${serie.name}</h3>
      <p>${serie.overview}</p>
    `;
    resultados.appendChild(div);
  });
}

// ========== Paginación ========== 
function renderizarPaginacion() {
  paginacion.innerHTML = "";
  const crearBoton = (pagina, texto = null) => {
    const btn = document.createElement("button");
    btn.textContent = texto || pagina;
    if (pagina === paginaActual) btn.classList.add("active");
    btn.addEventListener("click", () => buscarSeries(pagina));
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

// ========== Serie aleatoria ========== 
const randomBtn = document.getElementById("random-btn");
randomBtn.addEventListener("click", async () => {
  resultados.innerHTML = "<div class='spinner'></div><p>Buscando serie sorpresa...</p>";

  const genero = generoSelect.value;
  const plataforma = plataformaSelect.value;
  const orden = document.getElementById("orden").value;
  const minRating = document.getElementById("min-rating").value;
  const desde = rangoDesde.value;
  const hasta = rangoHasta.value;

  const urlBase = new URL(`${BASE_URL}/discover/tv`);
  urlBase.searchParams.set("api_key", API_KEY);
  urlBase.searchParams.set("language", "es-ES");

  if (genero) urlBase.searchParams.set("with_genres", genero);
  if (orden) urlBase.searchParams.set("sort_by", orden); // Aquí también se incluye el orden
  if (plataforma && plataforma !== "__ninguna__") {
    urlBase.searchParams.set("with_watch_providers", plataforma);
    urlBase.searchParams.set("watch_region", "AR");
  }
  if (desde) urlBase.searchParams.set("first_air_date.gte", `${desde}-01-01`);
  if (hasta) urlBase.searchParams.set("first_air_date.lte", `${hasta}-12-31`);

  const res1 = await fetch(urlBase.toString());
  const data1 = await res1.json();
  const totalPages = Math.min(data1.total_pages, 500); 

  if (data1.total_results === 0) {
    resultados.innerHTML = "<p>No se encontraron series.</p>";
    return;
  }

  const paginaRandom = Math.floor(Math.random() * totalPages) + 1;
  urlBase.searchParams.set("page", paginaRandom);

  const res2 = await fetch(urlBase.toString());
  const data2 = await res2.json();
  const posibles = minRating
    ? data2.results.filter(s => s.vote_average >= parseFloat(minRating))
    : data2.results;

  if (!posibles.length) {
    return randomBtn.click();
  }

  const serie = posibles[Math.floor(Math.random() * posibles.length)];
  renderSeries([serie]);
});

// ========== Inicialización ========== 
buscarBtn.addEventListener("click", () => buscarSeries(1));
window.addEventListener("DOMContentLoaded", cargarGeneros);
