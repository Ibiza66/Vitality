/* =========================================================================
   SERVICIO FRONTEND: IA
   Wrapper para llamar al backend de IA desde el browser.
   
   Este archivo reemplaza el anterior routes/ia.js que estaba
   incorrectamente colocado en la carpeta de servicios frontend.
   ========================================================================= */

import { API_URL } from '../config.js';

/**
 * Envía un mensaje al chat de IA de Vitality.
 * @param {string} mensaje - Texto del usuario
 * @param {object} contexto - { checkin, actividadesHoy, objetivos, usuarioId }
 * @returns {Promise<{respuesta: string, recomendacionId: string|null}>}
 */
export async function enviarMensajeIA(mensaje, contexto = {}) {
  const res = await fetch(`${API_URL}/api/ia/chat`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mensaje,
      usuarioId:      contexto.usuarioId      || null,
      checkin:        contexto.checkin        || null,
      actividadesHoy: contexto.actividadesHoy || null,
      objetivos:      contexto.objetivos      || []
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.mensaje || `Error IA: ${res.status}`);
  }

  return res.json();
}

/**
 * Acepta una recomendación de la IA.
 * @param {string} recomendacionId
 * @param {string} usuarioId
 */
export async function aceptarRecomendacion(recomendacionId, usuarioId) {
  const res = await fetch(`${API_URL}/api/recomendaciones-ia/${recomendacionId}/aceptar`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuarioId })
  });
  return res.json();
}

/**
 * Rechaza una recomendación de la IA.
 * @param {string} recomendacionId
 * @param {string} usuarioId
 */
export async function rechazarRecomendacion(recomendacionId, usuarioId) {
  const res = await fetch(`${API_URL}/api/recomendaciones-ia/${recomendacionId}/rechazar`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuarioId })
  });
  return res.json();
}
