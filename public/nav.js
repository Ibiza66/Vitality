/* =========================
   FUNCIONES BASE DE NAVEGACIÓN VITALITY
========================= */
function toggleMenu() {
  const menu = document.getElementById("menu");
  const profileMenu = document.getElementById("profileMenu");

  if (!menu) return;

  if (profileMenu) {
    profileMenu.style.display = "none";
  }

  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

function toggleProfileMenu() {
  const profileMenu = document.getElementById("profileMenu");
  const menu = document.getElementById("menu");

  if (!profileMenu) return;

  if (menu) {
    menu.style.display = "none";
  }

  profileMenu.style.display =
    profileMenu.style.display === "block" ? "none" : "block";
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
}

function irASeccion(idSeccion) {
  const seccion = document.getElementById(idSeccion);

  if (seccion) {
    seccion.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

function cerrarSesion() {
  localStorage.removeItem("usuarioVitality");
  localStorage.removeItem("perfilVitality");
  localStorage.removeItem("checkinVitality");
  localStorage.removeItem("actividadesFijasVitality");
  localStorage.removeItem("actividadesEspecialesVitality");
  localStorage.removeItem("editandoActividadFijaId");
  localStorage.removeItem("editandoActividadEspecialId");

  sessionStorage.removeItem("notificacionesVitalityCerradas");

  alert("Sesión cerrada correctamente.");
  window.location.href = "index.html";
}

function obtenerPaginaActualNav() {
  const ruta = window.location.pathname;
  const pagina = ruta.substring(ruta.lastIndexOf("/") + 1);

  return pagina || "index.html";
}

function paginaLibreNav(pagina) {
  const paginasLibres = [
    "",
    "index.html",
    "registro.html"
  ];

  return paginasLibres.includes(pagina);
}

function paginaRequiereSesionNav(pagina) {
  const paginasProtegidas = [
    "perfil.html",
    "checkin.html",
    "horario.html",
    "organizar_horario.html",
    "alertas.html",
    "chat.html"
  ];

  return paginasProtegidas.includes(pagina);
}

function protegerPaginaActualNav() {
  const pagina = obtenerPaginaActualNav();

  if (paginaLibreNav(pagina)) {
    return;
  }

  const usuarioGuardado = localStorage.getItem("usuarioVitality");

  if (paginaRequiereSesionNav(pagina) && !usuarioGuardado) {
    window.location.href = "index.html";
  }
}

window.addEventListener("click", function (e) {
  const menu = document.getElementById("menu");
  const profileMenu = document.getElementById("profileMenu");
  const menuBtn = document.querySelector(".menu-btn");
  const profileBtn = document.querySelector(".profile-btn");

  if (
    menu &&
    menuBtn &&
    !menuBtn.contains(e.target) &&
    !menu.contains(e.target)
  ) {
    menu.style.display = "none";
  }

  if (
    profileMenu &&
    profileBtn &&
    !profileBtn.contains(e.target) &&
    !profileMenu.contains(e.target)
  ) {
    profileMenu.style.display = "none";
  }
});

window.addEventListener("DOMContentLoaded", function () {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  }

  protegerPaginaActualNav();
});