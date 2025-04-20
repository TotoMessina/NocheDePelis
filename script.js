const API_KEY = "31841cf8ea5ec78f32d856ec6e773ea0";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";
const DEFAULT_IMG = "https://via.placeholder.com/500x750?text=Sin+Imagen"; // Imagen predeterminada

const generoSelect = document.getElementById("genero");
const plataformaSelect = document.getElementById("plataforma");
const buscarBtn = document.getElementById("buscar");
const resultados = document.getElementById("resultados");

async function cargarGeneros() {
  const res = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=es-ES`);
  const data = await res.json();
  data.genres.forEach(genero => {
    const option = document.createElement("option");
    option.value = genero.id;
    option.textContent = genero.name;
    generoSelect.appendChild(option);
  });
}

async function buscarPeliculas() {
  const nombre = document.getElementById("nombre").value;
  const anio = document.getElementById("anio").value;
  const persona = document.getElementById("persona").value;
  const genero = generoSelect.value;
  const plataforma = plataformaSelect.value;
  const orden = document.getElementById("orden").value;

  resultados.innerHTML = "Cargando...";

  let personaID = "";
  if (persona) {
    const resPersona = await fetch(`${BASE_URL}/search/person?api_key=${API_KEY}&language=es-ES&query=${persona}`);
    const dataPersona = await resPersona.json();
    if (dataPersona.results.length > 0) {
      personaID = dataPersona.results[0].id;
    }
  }

  const url = new URL(`${BASE_URL}/discover/movie`);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("language", "es-ES");
  if (nombre) url.searchParams.set("query", nombre);
  if (anio) url.searchParams.set("primary_release_year", anio);
  if (genero) url.searchParams.set("with_genres", genero);
  if (orden) url.searchParams.set("sort_by", orden);
  if (personaID) url.searchParams.set("with_people", personaID);

  // Filtrar por plataforma seleccionada
  if (plataforma) {
    url.searchParams.set("with_watch_providers", plataforma);
  }

  const res = nombre
    ? await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${nombre}`)
    : await fetch(url);

  const data = await res.json();

  if (!data.results || data.results.length === 0) {
    resultados.innerHTML = "<p>No se encontraron películas.</p>";
    return;
  }

  resultados.innerHTML = "";

  for (const pelicula of data.results) {
    const proveedorRes = await fetch(`${BASE_URL}/movie/${pelicula.id}/watch/providers?api_key=${API_KEY}`);
    const proveedorData = await proveedorRes.json();
    const plataformasDisponibles = proveedorData.results?.AR?.flatrate?.map(p => p.provider_name).join(", ") || "No disponible";

    const div = document.createElement("div");
    div.classList.add("pelicula");

    div.innerHTML = `
      <img src="${pelicula.poster_path ? IMG_URL + pelicula.poster_path : DEFAULT_IMG}" alt="${pelicula.title}">
      <div class="pelicula-info">
        <h3>${pelicula.title}</h3>
        <p>Estreno: ${pelicula.release_date || "Desconocido"}</p>
        <p class="descripcion-corta">${pelicula.overview ? pelicula.overview.slice(0, 120) + "..." : "Sin descripción."}</p>
        <button class="ver-mas">Ver más</button>
        <p class="plataformas">Disponible en: ${plataformasDisponibles}</p>
      </div>
    `;

    // Mostrar más descripción
    const botonVerMas = div.querySelector(".ver-mas");
    botonVerMas.addEventListener("click", () => {
      const descripcionCorta = div.querySelector(".descripcion-corta");
      descripcionCorta.textContent = pelicula.overview || "Sin descripción.";
      botonVerMas.style.display = "none";

      // Agregar opción de ver menos
      const botonVerMenos = document.createElement("button");
      botonVerMenos.textContent = "Ver menos";
      botonVerMenos.classList.add("ver-menos");
      div.querySelector(".pelicula-info").appendChild(botonVerMenos);

      botonVerMenos.addEventListener("click", () => {
        descripcionCorta.textContent = pelicula.overview.slice(0, 120) + "...";
        botonVerMas.style.display = "inline-block";
        botonVerMenos.remove();
      });
    });

    resultados.appendChild(div);
  }
}

buscarBtn.addEventListener("click", buscarPeliculas);
window.addEventListener("DOMContentLoaded", cargarGeneros);
