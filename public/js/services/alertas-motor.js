/* =========================================================================
   MÓDULO: MOTOR DE ALERTAS Y RECOMENDACIONES
   =========================================================================
   Lee el último check-in del usuario desde localStorage y genera
   alertas visuales en alertas.html según su estado emocional.

   Elemento en alertas.html:
   - id="alertasContainer" → donde se renderizan las alertas

   Lógica de alertas:
   - nivelEstres === "Alto"              → alerta de estrés
   - energia === "Baja"                  → alerta de energía
   - sueno === "Mal"                     → alerta de descanso
   - estadoAnimo === "Mal" o "Muy mal"   → alerta emocional
   - Sin ninguna de las anteriores       → mensaje positivo
   ========================================================================= */

import { leerJSON } from '../utils.js';

/* ─────────────────────────────────────────
   MOSTRAR ALERTAS EN PANTALLA
   Usada en: alertas.html
───────────────────────────────────────────*/

/**
 * Genera y renderiza las alertas del día en el contenedor de alertas.html.
 * Lee el check-in desde localStorage (guardado al hacer el check-in diario).
 */
export function mostrarAlertasVitality() {
  const contenedor = document.getElementById("alertasContainer");
  if (!contenedor) return;

  // Intentar leer el check-in desde las dos claves posibles
  const checkin = leerJSON("checkinVitality", null)
               || leerJSON("ultimoCheckinVitality", null);

  // Sin check-in → pedir al usuario que lo complete
  if (!checkin) {
    contenedor.innerHTML = `
      <div class="alerta">
        <p><strong>No hay check-in registrado.</strong></p>
        <p>Completa tu check-in diario para recibir alertas y recomendaciones personalizadas.</p>
        <p><a href="checkin.html">Ir al check-in</a></p>
      </div>
    `;
    return;
  }

  // Generar alertas según el estado del check-in
  const alertas = generarAlertasDesdeCheckin(checkin);
  contenedor.innerHTML = alertas;
}

/* ─────────────────────────────────────────
   GENERAR TEXTO DE ALERTAS
   Usada internamente y por el chat/perfil
───────────────────────────────────────────*/

/**
 * Genera el HTML de alertas a partir de un objeto check-in.
 * Se puede reutilizar desde otros módulos que necesiten mostrar alertas.
 * @param {object} checkin - Objeto con estadoAnimo, nivelEstres, sueno, energia.
 * @returns {string} HTML con las alertas generadas.
 */
export function generarAlertasDesdeCheckin(checkin) {
  let html = "";

  if (checkin.nivelEstres === "Alto") {
    html += `
      <div class="alerta">
        <p><strong>Estrés alto detectado.</strong> Hoy registraste un nivel de estrés alto.</p>
        <p><strong>Recomendación:</strong> Toma una pausa, sal a caminar o escucha música relajante.</p>
      </div>
    `;
  }

  if (checkin.energia === "Baja") {
    html += `
      <div class="alerta">
        <p><strong>Energía baja.</strong> Tu nivel de energía está bajo hoy.</p>
        <p><strong>Recomendación:</strong> Intenta descansar, hidratarte bien o hacer una actividad tranquila que disfrutes.</p>
      </div>
    `;
  }

  if (checkin.sueno === "Mal") {
    html += `
      <div class="alerta">
        <p><strong>Descanso insuficiente.</strong> Reportaste que dormiste mal.</p>
        <p><strong>Recomendación:</strong> Considera acostarte más temprano y reducir actividades exigentes esta noche.</p>
      </div>
    `;
  }

  if (checkin.estadoAnimo === "Mal" || checkin.estadoAnimo === "Muy mal") {
    html += `
      <div class="alerta">
        <p><strong>Estado emocional bajo.</strong> Hoy no te has sentido bien.</p>
        <p><strong>Recomendación:</strong> Date un momento para ti, habla con alguien de confianza o usa el chat de apoyo.</p>
      </div>
    `;
  }

  // Sin alertas → mensaje positivo
  if (!html) {
    html = `
      <div class="alerta">
        <p><strong>Buen trabajo.</strong> No detectamos alertas importantes en tu check-in de hoy.</p>
        <p><strong>Sugerencia:</strong> Mantén tu rutina, tus pausas y tus hábitos saludables.</p>
      </div>
    `;
  }

  // Siempre agregar acceso al chat al final
  html += `
    <div class="alerta">
      <p><strong>¿Necesitas apoyo?</strong> Puedes conversar con Vitality para recibir orientación personalizada.</p>
      <p><a href="chat.html">Hablar con Vitality</a></p>
    </div>
  `;

  return html;
}

/* ─────────────────────────────────────────
   INICIALIZACIÓN AUTOMÁTICA
   Se activa al cargar alertas.html
───────────────────────────────────────────*/
window.addEventListener("DOMContentLoaded", () => {
  // Solo ejecutar si estamos en alertas.html
  if (document.getElementById("alertasContainer")) {
    mostrarAlertasVitality();
  }
});