function renderPeliculas(lista) {
    resultados.innerHTML = "";
    let visibles = 0;
  
    lista.forEach(async pelicula => {
      if (visibles >= 20) return;
  
      const div = document.createElement("div");
      div.classList.add("pelicula");
  
      div.innerHTML = `
        <img src="${pelicula.poster_path ? IMG_URL + pelicula.poster_path : DEFAULT_IMG}" alt="${pelicula.title}">
        <div class="pelicula-info">
          <h3>${pelicula.title}</h3>
          <div class="hover-overlay">
            <span class="rating">⭐ ${pelicula.vote_average.toFixed(1)}</span>
          </div>
          <p>${pelicula.release_date || "Desconocido"}</p>
          <p class="descripcion-corta">${pelicula.overview ? pelicula.overview.slice(0, 120) + "..." : "Sin descripción."}</p>
          <button class="ver-mas">Ver más</button>
          <button class="favorito-btn">❤️ Favorito</button>
          <button class="trailer-btn">🎬 Ver tráiler</button>
          <p class="plataformas">Cargando plataformas...</p>
        </div>
      `;
  
      // Obtener plataformas
      const proveedorRes = await fetch(`${BASE_URL}/movie/${pelicula.id}/watch/providers?api_key=${API_KEY}`);
      const proveedorData = await proveedorRes.json();
      const plataformas = proveedorData.results?.AR?.flatrate;
      const plataformasDisponibles = plataformas?.map(p => p.provider_name).join(", ") || "No disponible";
      div.querySelector(".plataformas").textContent = `Disponible en: ${plataformasDisponibles}`;
  
      // Favoritos
      const clave = `fav_${pelicula.id}`;
      const favoritoBtn = div.querySelector(".favorito-btn");
  
      if (localStorage.getItem(clave)) {
        favoritoBtn.textContent = "💔 Quitar";
      }
  
      favoritoBtn.addEventListener("click", () => {
        if (localStorage.getItem(clave)) {
          localStorage.removeItem(clave);
          favoritoBtn.textContent = "❤️ Favorito";
        } else {
          localStorage.setItem(clave, JSON.stringify(pelicula));
          favoritoBtn.textContent = "💔 Quitar";
        }
      });
  
      // Tráiler
      attachTrailerHandler(div, pelicula.id);
  
      resultados.appendChild(div);
      visibles++;
    });
  }
  
  function mostrarFavoritos() {
    const contenedor = document.getElementById("favoritos-lista");
    const favoritosSection = document.getElementById("favoritos");
    contenedor.innerHTML = "";
  
    const claves = Object.keys(localStorage).filter(k => k.startsWith("fav_"));
    if (claves.length === 0) {
      contenedor.innerHTML = "<p>No tenés películas favoritas aún.</p>";
      favoritosSection.classList.remove("oculto");
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
          <button class="quitar-fav">💔 Quitar</button>
        </div>
      `;
  
      div.querySelector(".quitar-fav").addEventListener("click", () => {
        localStorage.removeItem(clave);
        mostrarFavoritos();
      });
  
      contenedor.appendChild(div);
    });
  
    favoritosSection.classList.remove("oculto");
  }
  
  document.getElementById("link-favoritos").addEventListener("click", (e) => {
    e.preventDefault();
    mostrarFavoritos();
  });
  
  document.getElementById("cerrar-favoritos").addEventListener("click", () => {
    document.getElementById("favoritos").classList.add("oculto");
  });
  