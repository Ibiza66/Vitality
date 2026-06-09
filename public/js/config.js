/* =========================================================================
   CONFIGURACIÓN GENERAL: DETECCIÓN DE ENTORNO Y ENDPOINTS
   ========================================================================= */

/**
 * URL base dinámica para interactuar con la API REST en MongoDB.
 * Detecta automáticamente si la aplicación corre nativa en celular (Capacitor)
 * o local en web para ajustar la ruta de red.
 * @type {string}
 */
export const API_URL = (() => {
  const esAppMovil =
    window.Capacitor ||
    window.location.protocol === "capacitor:" ||
    (window.location.hostname === "localhost" && window.location.port !== "3000");

  // Reemplaza esta IP por la IP local de tu servidor Node cuando pruebes la APK física
  return esAppMovil ? "http://10.41.0.140:3000" : "";
})();