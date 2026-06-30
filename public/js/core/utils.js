// Funciones utilitarias huérfanas de interfaz.

// Contenido: leerJSON, guardarJSON, una única función escaparHTML y formateadores de fechas/horas.


// js/core/utils.js

/**
 * Sanitiza cadenas de texto para prevenir ataques XSS al renderizar en el DOM.
 * Consolida y reemplaza a las antiguas funciones duplicadas del script monolítico.
 * @param {string} texto 
 * @returns {string} Texto escapado de forma segura
 */
export function escaparHTML(texto) {
  if (!texto) return "";
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Proveedor de acceso seguro a localStorage.
 * Centraliza el formato de datos del usuario y unifica la lectura de IDs.
 */
export const storage = {
  getUsuario() {
    try {
      const data = localStorage.getItem("usuarioVitality");
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error al parsear el usuario de localStorage:", error);
      return null;
    }
  },

  setUsuario(usuarioDatos) {
    if (!usuarioDatos) return;
    localStorage.setItem("usuarioVitality", JSON.stringify(usuarioDatos));
  },

  eliminarUsuario() {
    localStorage.removeItem("usuarioVitality");
  },

  /**
   * Estandariza la obtención del ID del usuario.
   * Elimina los fallbacks redundantes (id || usuarioId) priorizando el _id de MongoDB.
   */
  obtenerIdUsuario() {
    const usuario = this.getUsuario();
    return usuario ? (usuario._id || usuario.id) : null;
  }
};

/**
 * Formatea fechas a una cadena legible en español de forma homogénea.
 * @param {string|Date} fecha 
 */
export function formatearFecha(fecha) {
  if (!fecha) return "Hoy";
  const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(fecha).toLocaleDateString('es-ES', opciones);
}