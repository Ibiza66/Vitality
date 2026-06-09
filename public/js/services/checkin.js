/* =========================================================================
   SERVICIO: CHECK-IN DIARIO Y ESTADOS EMOCIONALES
   =========================================================================
   Lee los inputs del formulario en checkin.html y los envía al backend.

   El HTML tiene DOS tipos de inputs para el check-in:
   - Sliders visuales (estresRange, suenoRange, energiaRange): los mueve el usuario
   - Inputs hidden (nivelEstres, sueno, energia, estadoAnimo): contienen el
     valor ya convertido a texto (ej: "Alto", "Bien", "Media").
     Los actualiza el script inline de checkin.html al mover los sliders.

   Este módulo lee los inputs HIDDEN, que son los que tienen el valor final.
   ========================================================================= */

import { API_URL } from '../config.js';
import { mostrarToastVitality, guardarJSON, leerJSON } from '../utils.js';

/* ─────────────────────────────────────────
   REGISTRAR CHECK-IN
   Formulario en: checkin.html
   IDs hidden: estadoAnimo, nivelEstres, sueno, energia
───────────────────────────────────────────*/

/**
 * Guarda el check-in diario del usuario en MongoDB.
 * @param {Event} event - Evento submit del formulario.
 * @returns {Promise<object|null>} El check-in guardado, o null si falló.
 */
export async function registrarCheckinVitality(event) {
  if (event) event.preventDefault();

  // Verificar que hay sesión activa
  const usuario = leerJSON("usuarioVitality", null);
  if (!usuario || !usuario.id) {
    mostrarToastVitality("No hay sesión activa. Por favor inicia sesión.");
    return null;
  }

  // Leer los inputs hidden que contienen los valores convertidos
  const estadoAnimo = document.getElementById("estadoAnimo")?.value;
  const nivelEstres = document.getElementById("nivelEstres")?.value;
  const sueno       = document.getElementById("sueno")?.value;
  const energia     = document.getElementById("energia")?.value;

  // Validar que todos los campos tengan valor
  if (!estadoAnimo || !nivelEstres || !sueno || !energia) {
    mostrarToastVitality("Por favor completa todos los campos del check-in.");
    return null;
  }

  try {
    const respuesta = await fetch(`${API_URL}/api/checkins`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuarioId: usuario.id,
        estadoAnimo,
        nivelEstres,
        sueno,
        energia
      })
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      mostrarToastVitality(data.mensaje || "Error al guardar el check-in.");
      return null;
    }

    // Guardar copia local para uso inmediato (alertas, chat, perfil)
    guardarJSON("checkinVitality", data.checkin);
    guardarJSON("ultimoCheckinVitality", data.checkin);

    mostrarToastVitality("¡Check-in guardado correctamente!");
    return data.checkin;

  } catch (error) {
    console.error("[checkin] Error al registrar:", error);
    mostrarToastVitality("No se pudo conectar con el servidor.");
    return null;
  }
}

/* ─────────────────────────────────────────
   OBTENER HISTORIAL DE CHECK-INS
───────────────────────────────────────────*/

/**
 * Trae los últimos check-ins del usuario desde MongoDB.
 * Se usa en perfil.html para mostrar el historial emocional.
 * @returns {Promise<Array>} Lista de check-ins o arreglo vacío si falla.
 */
export async function obtenerHistorialCheckinsVitality() {
  const usuario = leerJSON("usuarioVitality", null);
  if (!usuario || !usuario.id) return [];

  try {
    const respuesta = await fetch(`${API_URL}/api/checkins/historial/${usuario.id}`);
    const data = await respuesta.json();

    if (!respuesta.ok) {
      console.error("[checkin] Error al obtener historial:", data.mensaje);
      return [];
    }

    return data;

  } catch (error) {
    console.error("[checkin] Error de red al obtener historial:", error);
    return [];
  }
}

/* ─────────────────────────────────────────
   OBTENER ÚLTIMO CHECK-IN
───────────────────────────────────────────*/

/**
 * Trae el check-in más reciente del usuario.
 * Primero intenta leerlo desde localStorage (caché local).
 * Si no hay caché, lo busca en MongoDB.
 * @returns {Promise<object|null>} El check-in más reciente o null.
 */
export async function obtenerUltimoCheckinVitality() {
  // Intentar desde caché local primero (más rápido)
  const cached = leerJSON("ultimoCheckinVitality", null);
  if (cached) return cached;

  const usuario = leerJSON("usuarioVitality", null);
  if (!usuario || !usuario.id) return null;

  try {
    const respuesta = await fetch(`${API_URL}/api/checkins/ultimo/${usuario.id}`);

    if (respuesta.status === 404) return null;

    const data = await respuesta.json();

    if (!respuesta.ok) return null;

    // Guardar en caché para próximas llamadas
    guardarJSON("ultimoCheckinVitality", data);
    return data;

  } catch (error) {
    console.error("[checkin] Error al obtener último check-in:", error);
    return null;
  }
}