/* =========================================================================
   MÓDULO DE INTERFAZ DE USUARIO (UI)
   Menús, navegación, temas visuales y protección de sesión.
   =========================================================================
   IMPORTANTE: Al final del archivo se exponen las funciones al objeto
   global `window` para que los onclick="" del HTML puedan llamarlas.
   ========================================================================= */

import { mostrarToastVitality } from './utils.js';

/* ─────────────────────────────────────────
   MENÚS
───────────────────────────────────────────*/

/**
 * Muestra u oculta el menú principal (hamburguesa).
 */
export function toggleMenu() {
  const menu = document.getElementById("menu");
  const profileMenu = document.getElementById("profileMenu");

  if (!menu) return;
  if (profileMenu) profileMenu.style.display = "none";

  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

/**
 * Muestra u oculta el menú desplegable del perfil.
 */
export function toggleProfileMenu() {
  const profileMenu = document.getElementById("profileMenu");
  const menu = document.getElementById("menu");

  if (!profileMenu) return;
  if (menu) menu.style.display = "none";

  profileMenu.style.display = profileMenu.style.display === "block" ? "none" : "block";
}

/* ─────────────────────────────────────────
   TEMA VISUAL
───────────────────────────────────────────*/

/**
 * Alterna entre modo oscuro y claro.
 */
export function toggleTheme() {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
}

/* ─────────────────────────────────────────
   NAVEGACIÓN
───────────────────────────────────────────*/

/**
 * Scroll suave hacia una sección de la página por su ID.
 * @param {string} idSeccion - ID del elemento HTML destino.
 */
export function irASeccion(idSeccion) {
  const seccion = document.getElementById(idSeccion);
  if (seccion) {
    seccion.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/* ─────────────────────────────────────────
   SESIÓN
───────────────────────────────────────────*/

/**
 * Detecta el nombre de la página actual desde la URL.
 * @returns {string} Ej: "horario.html", "index.html"
 */
function obtenerPaginaActual() {
  const ruta = window.location.pathname;
  const pagina = ruta.substring(ruta.lastIndexOf("/") + 1);
  return pagina || "index.html";
}

/**
 * Devuelve true si la página NO requiere sesión iniciada.
 * @param {string} pagina
 */
function esPaginaLibre(pagina) {
  const libres = ["", "index.html", "registro.html"];
  return libres.includes(pagina);
}

/**
 * Devuelve true si la página SÍ requiere sesión iniciada.
 * @param {string} pagina
 */
function esPaginaProtegida(pagina) {
  const protegidas = [
    "perfil.html",
    "checkin.html",
    "horario.html",
    "organizar_horario.html",
    "alertas.html",
    "chat.html",
    "uso_apps.html"
  ];
  return protegidas.includes(pagina);
}

/**
 * Si el usuario ya tiene sesión activa y está en login/registro,
 * lo manda directo al horario (evita volver al login innecesariamente).
 */
function redirigirSiSesionActiva() {
  const pagina = obtenerPaginaActual();
  const sesionActiva = localStorage.getItem("usuarioVitality");

  if (sesionActiva && esPaginaLibre(pagina)) {
    window.location.href = "horario.html";
  }
}

/**
 * Si la página requiere sesión y el usuario no está logueado,
 * lo manda al login.
 */
function protegerPagina() {
  const pagina = obtenerPaginaActual();

  if (esPaginaLibre(pagina)) return;

  const sesionActiva = localStorage.getItem("usuarioVitality");

  if (esPaginaProtegida(pagina) && !sesionActiva) {
    window.location.href = "index.html";
  }
}

/**
 * Cierra la sesión del usuario: limpia localStorage/sessionStorage
 * y redirige al login.
 */
export function cerrarSesion() {
  localStorage.removeItem("usuarioVitality");
  localStorage.removeItem("perfilVitality");
  localStorage.removeItem("checkinVitality");
  localStorage.removeItem("ultimoCheckinVitality");
  localStorage.removeItem("actividadesFijasVitality");
  localStorage.removeItem("actividadesEspecialesVitality");
  localStorage.removeItem("editandoActividadFijaId");
  localStorage.removeItem("editandoActividadEspecialId");
  localStorage.removeItem("usoAppsVitality");
  localStorage.removeItem("editandoUsoAppId");

  sessionStorage.removeItem("notificacionesVitalityCerradas");
  sessionStorage.removeItem("notificacionNativaVitalityEnviada");

  mostrarToastVitality("Sesión cerrada correctamente.");

  setTimeout(() => {
    window.location.href = "index.html";
  }, 500);
}

/* ─────────────────────────────────────────
   EVENTOS GLOBALES
───────────────────────────────────────────*/

// Cerrar menús al hacer clic fuera de ellos
window.addEventListener("click", function (e) {
  const menu = document.getElementById("menu");
  const profileMenu = document.getElementById("profileMenu");
  const menuBtn = document.querySelector(".menu-btn");
  const profileBtn = document.querySelector(".profile-btn");

  if (menu && menuBtn && !menuBtn.contains(e.target) && !menu.contains(e.target)) {
    menu.style.display = "none";
  }

  if (profileMenu && profileBtn && !profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
    profileMenu.style.display = "none";
  }
});

// Al cargar la página: aplicar tema guardado + protección de sesión
window.addEventListener("DOMContentLoaded", function () {
  const temaGuardado = localStorage.getItem("theme");
  if (temaGuardado === "dark") {
    document.body.classList.add("dark-mode");
  }

  redirigirSiSesionActiva();
  protegerPagina();
});

/* ─────────────────────────────────────────
   EXPONER FUNCIONES AL OBJETO WINDOW
   
   Los HTML usan onclick="toggleMenu()" directamente en el atributo.
   Como este archivo es un módulo (type="module"), sus funciones no son
   globales por defecto. Esta sección las expone para que el HTML las encuentre.
───────────────────────────────────────────*/
window.toggleMenu        = toggleMenu;
window.toggleProfileMenu = toggleProfileMenu;
window.toggleTheme       = toggleTheme;
window.irASeccion        = irASeccion;
window.cerrarSesion      = cerrarSesion;