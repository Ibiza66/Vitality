/* =========================================================================
   SERVICIO: PERFIL DE USUARIO
   =========================================================================
   Maneja guardar y obtener el perfil desde /api/perfiles.

   Formulario en perfil.html:
   - id="perfilForm"     → el formulario de edición
   - id="categoria"      → select con Niño / Adolescente / Adulto
   - id="actividades"    → textarea con actividades favoritas

   Elementos de visualización en perfil.html:
   - id="perfilNombre"       → nombre del usuario
   - id="perfilCategoria"    → categoría actual
   - id="perfilActividades"  → actividades favoritas actuales
   ========================================================================= */

import { API_URL } from '../config.js';
import { mostrarToastVitality, guardarJSON, leerJSON } from '../utils.js';

/* ─────────────────────────────────────────
   OBTENER PERFIL
───────────────────────────────────────────*/

/**
 * Trae el perfil del usuario desde MongoDB.
 * Guarda una copia en localStorage para uso rápido.
 * @returns {Promise<object|null>} El perfil o null si falla.
 */
export async function obtenerPerfilVitality() {
  const usuario = leerJSON("usuarioVitality", null);
  if (!usuario || !usuario.id) return null;

  try {
    const respuesta = await fetch(`${API_URL}/api/perfiles/${usuario.id}`);
    const data = await respuesta.json();

    if (!respuesta.ok) {
      console.error("[perfil] Error al obtener perfil:", data.mensaje);
      return null;
    }

    // Guardar copia local
    guardarJSON("perfilVitality", data.perfil || data);
    return data.perfil || data;

  } catch (error) {
    console.error("[perfil] Error de red:", error);
    // Si falla la red, intentar desde caché local
    return leerJSON("perfilVitality", null);
  }
}

/* ─────────────────────────────────────────
   GUARDAR PERFIL
   Formulario en: perfil.html
   IDs: categoria, actividades
───────────────────────────────────────────*/

/**
 * Guarda los cambios del formulario de perfil en MongoDB.
 * @param {Event} event - Evento submit del formulario.
 */
export async function guardarPerfilVitality(event) {
  event.preventDefault();

  const usuario = leerJSON("usuarioVitality", null);
  if (!usuario || !usuario.id) {
    mostrarToastVitality("No hay sesión activa. Por favor inicia sesión.");
    return;
  }

  // Leer campos del formulario por sus IDs reales en perfil.html
  const categoria  = document.getElementById("categoria")?.value.trim();
  const actividades = document.getElementById("actividades")?.value.trim();

  if (!categoria || !actividades) {
    mostrarToastVitality("Por favor completa todos los campos del perfil.");
    return;
  }

  try {
    const respuesta = await fetch(`${API_URL}/api/perfiles/${usuario.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoria, actividades })
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      mostrarToastVitality(data.mensaje || "Error al guardar el perfil.");
      return;
    }

    // Actualizar caché local con los datos guardados
    const perfilGuardado = data.perfil || data;
    guardarJSON("perfilVitality", perfilGuardado);

    // Reflejar los cambios en los elementos de visualización
    mostrarDatosPerfilVitality();

    mostrarToastVitality("¡Perfil guardado correctamente!");

  } catch (error) {
    console.error("[perfil] Error al guardar:", error);
    mostrarToastVitality("No se pudo conectar con el servidor.");
  }
}

/* ─────────────────────────────────────────
   MOSTRAR DATOS EN PANTALLA
───────────────────────────────────────────*/

/**
 * Rellena los elementos de visualización del perfil con los datos actuales.
 * Lee desde localStorage si ya hay datos cargados.
 * Se llama al cargar perfil.html y después de guardar cambios.
 */
export function mostrarDatosPerfilVitality() {
  const usuario = leerJSON("usuarioVitality", null);
  const perfil  = leerJSON("perfilVitality", null);

  // Nombre del usuario (viene del objeto de sesión, no del perfil)
  const nombreEl = document.getElementById("perfilNombre");
  if (nombreEl && usuario?.nombre) {
    nombreEl.textContent = usuario.nombre;
  }

  // Categoría y actividades (vienen del perfil guardado en MongoDB)
  const categoriaEl   = document.getElementById("perfilCategoria");
  const actividadesEl = document.getElementById("perfilActividades");

  if (perfil) {
    if (categoriaEl)   categoriaEl.textContent   = perfil.categoria   || "Sin categoría";
    if (actividadesEl) actividadesEl.textContent = perfil.actividades || "Sin actividades registradas";

    // También prellenar el formulario de edición con los valores actuales
    const categoriaInput   = document.getElementById("categoria");
    const actividadesInput = document.getElementById("actividades");

    if (categoriaInput && perfil.categoria)     categoriaInput.value   = perfil.categoria;
    if (actividadesInput && perfil.actividades) actividadesInput.value = perfil.actividades;
  }
}