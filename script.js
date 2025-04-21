const API_KEY = "31841cf8ea5ec78f32d856ec6e773ea0";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";
const DEFAULT_IMG = "https://via.placeholder.com/500x750?text=Sin+Imagen";

const generoSelect = document.getElementById("genero");
const plataformaSelect = document.getElementById("plataforma");
const buscarBtn = document.getElementById("buscar");
const resultados = document.getElementById("resultados");

const rangoDesde = document.getElementById("rango-desde");
const rangoHasta = document.getElementById("rango-hasta");
const labelDesde = document.getElementById("anio-desde");
const labelHasta = document.getElementById("anio-hasta");

const paginacion = document.getElementById("paginacion");

let paginaActual = 1;
let totalPaginas = 1;

// Mostrar valores del slider
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

async function buscarPeliculas(pagina = 1) {
  paginaActual = pagina;

  const nombre = document.getElementById("nombre").value;
  const persona = document.getElementById("persona").value;
  const genero = generoSelect.value;
  const plataforma = plataformaSelect.value;
  const orden = document.getElementById("orden").value;

  const desde = rangoDesde.value;
  const hasta = rangoHasta.value;

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
  url.searchParams.set("page", pagina);

  if (genero) url.searchParams.set("with_genres", genero);
  if (orden) url.searchParams.set("sort_by", orden);
  if (personaID) url.searchParams.set("with_people", personaID);
  if (plataforma) {
    url.searchParams.set("with_watch_providers", plataforma);
    url.searchParams.set("watch_region", "AR");
  }
  if (desde) url.searchParams.set("primary_release_date.gte", `${desde}-01-01`);
  if (hasta) url.searchParams.set("primary_release_date.lte", `${hasta}-12-31`);

  let res;
  if (nombre && !plataforma) {
    res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${nombre}&page=${pagina}`);
  } else {
    res = await fetch(url.toString());
  }

  const data = await res.json();

  if (!data.results || data.results.length === 0) {
    resultados.innerHTML = "<p>No se encontraron películas para los filtros seleccionados.</p>";
    paginacion.innerHTML = "";
    return;
  }

  resultados.innerHTML = "";
  totalPaginas = data.total_pages;

  for (const pelicula of data.results) {
    const proveedorRes = await fetch(`${BASE_URL}/movie/${pelicula.id}/watch/providers?api_key=${API_KEY}`);
    const proveedorData = await proveedorRes.json();
    const plataformas = proveedorData.results?.AR?.flatrate;

    // NUEVO: Si no se seleccionó plataforma, solo mostrar si tiene al menos una disponible
    if (!plataforma && (!plataformas || plataformas.length === 0)) {
      continue;
    }

    const plataformasDisponibles = plataformas?.map(p => p.provider_name).join(", ") || "No disponible";

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

    const botonVerMas = div.querySelector(".ver-mas");
    botonVerMas.addEventListener("click", () => {
      const descripcionCorta = div.querySelector(".descripcion-corta");
      descripcionCorta.textContent = pelicula.overview || "Sin descripción.";
      botonVerMas.style.display = "none";

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

  renderizarPaginacion();
}

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

buscarBtn.addEventListener("click", () => buscarPeliculas(1));
window.addEventListener("DOMContentLoaded", cargarGeneros);

// ==================== CHATGPT CON OPENAI ====================

const enviarBtn = document.getElementById("enviar");
const mensajeInput = document.getElementById("mensaje");
const chatLog = document.getElementById("chat-log");

enviarBtn.addEventListener("click", async () => {
  const mensaje = mensajeInput.value.trim();
  if (!mensaje) return;

  chatLog.innerHTML += `<p><strong>Tú:</strong> ${mensaje}</p>`;
  mensajeInput.value = "Cargando...";

  const respuesta = await obtenerRespuestaChatGPT(mensaje);

  chatLog.innerHTML += `<p><strong>ChatGPT:</strong> ${respuesta}</p>`;
  mensajeInput.value = "";
  chatLog.scrollTop = chatLog.scrollHeight;
});

async function obtenerRespuestaChatGPT(pregunta) {
  const OPENAI_API_KEY = "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"; // Reemplazá con tu clave

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Eres un asistente experto en cine. Solo puedes responder preguntas relacionadas con películas. Responde siempre en español."
        },
        {
          role: "user",
          content: pregunta
        }
      ]
    })
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "Lo siento, no pude procesar tu consulta.";
}
