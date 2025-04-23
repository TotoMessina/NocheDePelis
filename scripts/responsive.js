const menuToggle = document.getElementById("menu-toggle");
const nav = document.getElementById("nav");

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("nav");

  toggle.addEventListener("click", () => {
    nav.classList.toggle("active");
    toggle.classList.toggle("open"); // Esta clase activa la animación CSS
  });
});


document.addEventListener("DOMContentLoaded", () => {
  const toggleFiltrosBtn = document.getElementById("toggle-filtros");
  const filtros = document.getElementById("filtros-container");

  toggleFiltrosBtn.addEventListener("click", () => {
    filtros.classList.toggle("oculto");

    toggleFiltrosBtn.textContent = filtros.classList.contains("oculto")
      ? "🎛 Mostrar filtros"
      : "🎛 Ocultar filtros";
  });
});
