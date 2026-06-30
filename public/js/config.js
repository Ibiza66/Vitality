/* =========================================================================
   CONFIGURACIÓN GENERAL: DETECCIÓN DE ENTORNO Y ENDPOINTS
   ========================================================================= */

export const API_URL = (() => {
  const API_EMULADOR = "http://10.0.2.2:3000";

  const esAppMovil =
    window.Capacitor ||
    window.location.protocol === "capacitor:" ||
    window.location.hostname !== "localhost";

  return esAppMovil ? API_EMULADOR : "";
})();