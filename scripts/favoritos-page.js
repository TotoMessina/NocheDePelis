const IMG_URL = "https://image.tmdb.org/t/p/w500";
const DEFAULT_IMG = "https://via.placeholder.com/500x750?text=Sin+Imagen";

const contenedorFav = document.getElementById("favoritos-lista");
const contenedorEstrenos = document.getElementById("estrenos-lista");

function renderListaFavoritos(claves, contenedor, tipo = "normal") {
  if (claves.length === 0) {
    contenedor.innerHTML = "<p>No hay películas guardadas.</p>";
    return;
  }

  claves.forEach(clave => {
    const peli = JSON.parse(localStorage.getItem(clave));
    const div = document.createElement("div");
    div.classList.add("pelicula");

    div.innerHTML = `
      <img src="${peli.poster_path ? IMG_URL + peli.poster_path : DEFAULT_IMG}" alt="${peli.title}">
      <div class="pelicula-info">
        <h3>${peli.title}</h3>
        <span class="rating">⭐ ${peli.vote_average.toFixed(1)}</span>
        <p>${peli.release_date}</p>
        <p class="descripcion-corta">${peli.overview ? peli.overview.slice(0, 120) + "..." : "Sin descripción."}</p>
        <button class="ver-mas">Ver más</button>
        <button class="quitar-fav">💔 Quitar</button>
      </div>
    `;

    // Ver más / Ver menos
    const botonVerMas = div.querySelector(".ver-mas");
    botonVerMas.addEventListener("click", () => {
      const descripcion = div.querySelector(".descripcion-corta");
      descripcion.textContent = peli.overview || "Sin descripción.";
      botonVerMas.style.display = "none";

      const botonMenos = document.createElement("button");
      botonMenos.textContent = "Ver menos";
      botonMenos.classList.add("ver-menos");
      div.querySelector(".pelicula-info").appendChild(botonMenos);

      botonMenos.addEventListener("click", () => {
        descripcion.textContent = peli.overview.slice(0, 120) + "...";
        botonVerMas.style.display = "inline-block";
        botonMenos.remove();
      });
    });

    // Quitar favoritos
    div.querySelector(".quitar-fav").addEventListener("click", () => {
      localStorage.removeItem(clave);
      mostrarTodo();
    });

    contenedor.appendChild(div);
  });
}

function mostrarTodo() {
  contenedorFav.innerHTML = "";
  contenedorEstrenos.innerHTML = "";

  const clavesFavoritos = Object.keys(localStorage).filter(k => k.startsWith("fav_"));
  const clavesEstrenos = Object.keys(localStorage).filter(k => k.startsWith("estreno_"));

  renderListaFavoritos(clavesFavoritos, contenedorFav);
  renderListaFavoritos(clavesEstrenos, contenedorEstrenos, "estreno");
}

window.addEventListener("DOMContentLoaded", mostrarTodo);
