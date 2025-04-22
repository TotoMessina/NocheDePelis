const menuToggle = document.getElementById("menu-toggle");
const nav = document.getElementById("nav");

menuToggle.addEventListener("click", () => {
  nav.classList.toggle("active");
});

const toggleFiltros = document.getElementById("toggle-filtros");
const filtrosContainer = document.getElementById("filtros-container");

toggleFiltros.addEventListener("click", () => {
  filtrosContainer.classList.toggle("oculto");
  toggleFiltros.textContent = filtrosContainer.classList.contains("oculto")
    ? "🎛 Mostrar filtros"
    : "🔽 Ocultar filtros";
});
