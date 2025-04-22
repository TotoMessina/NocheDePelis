const randomBtn = document.getElementById("random-btn");

randomBtn.addEventListener("click", async () => {
  resultados.innerHTML = "Buscando película aleatoria...";

  const genero = generoSelect.value;
  const plataforma = plataformaSelect.value;
  const orden = document.getElementById("orden").value;
  const minRating = document.getElementById("min-rating").value;
  const desde = rangoDesde.value;
  const hasta = rangoHasta.value;

  const url = new URL(`${BASE_URL}/discover/movie`);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("language", "es-ES");
  url.searchParams.set("page", Math.floor(Math.random() * 500) + 1);

  if (genero) url.searchParams.set("with_genres", genero);
  if (orden) url.searchParams.set("sort_by", orden);
  if (plataforma && plataforma !== "__ninguna__") {
    url.searchParams.set("with_watch_providers", plataforma);
    url.searchParams.set("watch_region", "AR");
  }
  if (desde) url.searchParams.set("primary_release_date.gte", `${desde}-01-01`);
  if (hasta) url.searchParams.set("primary_release_date.lte", `${hasta}-12-31`);

  const res = await fetch(url.toString());
  const data = await res.json();
  const posibles = minRating
    ? data.results.filter(p => p.vote_average >= parseFloat(minRating))
    : data.results;

  if (!posibles.length) {
    resultados.innerHTML = "<p>Volve a intentar</p>";
    return;
  }

  const peli = posibles[Math.floor(Math.random() * posibles.length)];
  renderPeliculas([peli]);
});
