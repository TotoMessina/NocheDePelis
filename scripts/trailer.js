function attachTrailerHandler(div, movieId) {
  const trailerBtn = div.querySelector(".trailer-btn");

  trailerBtn.addEventListener("click", async () => {
    try {
      const resVideo = await fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=es-ES`);
      const dataVideo = await resVideo.json();

      const trailer = dataVideo.results.find(v => v.type === "Trailer" && v.site === "YouTube");

      if (trailer) {
        // Creamos la URL y la guardamos
        const url = `https://www.youtube.com/watch?v=${trailer.key}`;

        // Ejecutamos window.open SIN await antes
        window.open(url, "_blank");
      } else {
        alert("Tráiler no disponible.");
      }
    } catch (error) {
      console.error("Error cargando tráiler:", error);
      alert("Error al cargar tráiler.");
    }
  });
}
