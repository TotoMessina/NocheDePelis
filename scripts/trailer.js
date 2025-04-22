function attachTrailerHandler(div, movieId) {
    const trailerBtn = div.querySelector(".trailer-btn");
  
    trailerBtn.addEventListener("click", async () => {
      const resVideo = await fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=es-ES`);
      const dataVideo = await resVideo.json();
      const trailer = dataVideo.results.find(v => v.type === "Trailer" && v.site === "YouTube");
  
      if (trailer) {
        window.open(`https://www.youtube.com/watch?v=${trailer.key}`, "_blank");
      } else {
        alert("Tráiler no disponible.");
      }
    });
  }
  