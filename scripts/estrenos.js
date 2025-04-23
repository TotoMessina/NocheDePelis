const API_KEY = "31841cf8ea5ec78f32d856ec6e773ea0";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";
const DEFAULT_IMG = "https://via.placeholder.com/500x750?text=Sin+Imagen";

const generoSelect = document.getElementById("genero");
const buscarBtn = document.getElementById("buscar-estrenos");
const resultados = document.getElementById("resultados");
const paginacion = document.getElementById("paginacion");
const minRating = document.getElementById("min-rating");
const orden = document.getElementById("orden");
const fechaDesde = document.getElementById("fecha-desde");
const fechaHasta = document.getElementById("fecha-hasta");
const compania = document.getElementById("compania");
const filtrarConocidas = document.getElementById("filtrar-conocidas");


let paginaActual = 1;
let totalPaginas = 1;

function cargarGeneros() {
  fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=es-ES`)
    .then(res => res.json())
    .then(data => {
      data.genres.forEach(g => {
        const option = document.createElement("option");
        option.value = g.id;
        option.textContent = g.name;
        generoSelect.appendChild(option);
      });
    });
}

async function buscarEstrenos(pagina = 1) {
  resultados.innerHTML = "Cargando...";
  const hoy = new Date().toISOString().split("T")[0];

  const url = new URL(`${BASE_URL}/discover/movie`);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("language", "es-ES");
  url.searchParams.set("page", pagina);
  url.searchParams.set("sort_by", orden.value || "release_date.asc");
  url.searchParams.set("primary_release_date.gte", hoy);
  if (fechaDesde.value) url.searchParams.set("primary_release_date.gte", fechaDesde.value);
    if (fechaHasta.value) url.searchParams.set("primary_release_date.lte", fechaHasta.value);
    if (compania.value) url.searchParams.set("with_companies", compania.value);
  if (generoSelect.value) url.searchParams.set("with_genres", generoSelect.value);

  const res = await fetch(url.toString());
  const data = await res.json();

  const filtradas = data.results.filter(p => {
    const cumpleRating = !minRating.value || p.vote_average >= parseFloat(minRating.value);
    const esConocida = !filtrarConocidas.checked || (p.popularity > 20 && p.vote_count > 10);
    return cumpleRating && esConocida;
  });  

  mostrarEstrenos(filtradas);

  totalPaginas = data.total_pages;
  paginaActual = pagina;
  renderizarPaginacion();
}

function mostrarEstrenos(peliculas) {
  resultados.innerHTML = "";

  peliculas.forEach(pelicula => {
    const div = document.createElement("div");
    div.classList.add("pelicula");

    div.innerHTML = `
      <img src="${pelicula.poster_path ? IMG_URL + pelicula.poster_path : DEFAULT_IMG}" alt="${pelicula.title}">
      <div class="pelicula-info">
        <h3>${pelicula.title}</h3>
        <p>Estreno: ${pelicula.release_date || "Desconocido"}</p>
        <p class="descripcion-corta">${pelicula.overview ? pelicula.overview.slice(0, 120) + "..." : "Sin descripción."}</p>
        <button class="ver-mas">Ver más</button>
        <button class="estreno-fav">⭐ Guardar</button>
      </div>
    `;

    // Descripción extendida
    const verMasBtn = div.querySelector(".ver-mas");
    verMasBtn.addEventListener("click", () => {
      const descripcion = div.querySelector(".descripcion-corta");
      descripcion.textContent = pelicula.overview || "Sin descripción.";
      verMasBtn.style.display = "none";

      const verMenos = document.createElement("button");
      verMenos.textContent = "Ver menos";
      verMenos.classList.add("ver-menos");
      div.querySelector(".pelicula-info").appendChild(verMenos);

      verMenos.addEventListener("click", () => {
        descripcion.textContent = pelicula.overview.slice(0, 120) + "...";
        verMasBtn.style.display = "inline-block";
        verMenos.remove();
      });
    });

    // Guardar como favorito "estreno"
    const clave = `estreno_${pelicula.id}`;
    const btnFav = div.querySelector(".estreno-fav");

    if (localStorage.getItem(clave)) {
      btnFav.textContent = "💾 Guardado";
    }

    btnFav.addEventListener("click", () => {
      if (localStorage.getItem(clave)) {
        localStorage.removeItem(clave);
        btnFav.textContent = "⭐ Guardar";
      } else {
        localStorage.setItem(clave, JSON.stringify(pelicula));
        btnFav.textContent = "💾 Guardado";
      }
    });

    resultados.appendChild(div);
  });
}

function renderizarPaginacion() {
  paginacion.innerHTML = "";

  const crearBoton = (pagina, texto = null) => {
    const btn = document.createElement("button");
    btn.textContent = texto || pagina;
    if (pagina === paginaActual) btn.classList.add("active");
    btn.addEventListener("click", () => buscarEstrenos(pagina));
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

document.addEventListener("DOMContentLoaded", () => {
  cargarGeneros();
  buscarBtn.addEventListener("click", () => buscarEstrenos(1));
});
