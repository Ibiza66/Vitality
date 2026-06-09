/* =========================================================================
   MÓDULO: INTEGRACIÓN CON CALENDARIO NATIVO (CAPACITOR)
   ========================================================================= */

/**
 * Verifica si el entorno móvil y el plugin CapacitorCalendar están listos.
 * @returns {object|null} Instancia del plugin o null si no está disponible.
 */
function obtenerPluginCalendarioVitality() {
  if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.CapacitorCalendar) {
    return window.Capacitor.Plugins.CapacitorCalendar;
  }
  return null;
}

/**
 * Solicita de forma asíncrona permisos al sistema operativo para leer/escribir en el calendario.
 * @returns {Promise<boolean>} Retorna true si el permiso de escritura fue concedido.
 */
export async function pedirPermisoCalendarioVitality() {
  try {
    const Calendar = obtenerPluginCalendarioVitality();
    if (!Calendar) return false;

    // Verificar permisos actuales
    const estado = await Calendar.checkAllPermissions();
    
    // Si ya tiene permisos de escritura, retornamos true
    if (estado.writeCalendar === "granted") {
      return true;
    }

    // Si no, solicitamos formalmente el acceso
    const resultado = await Calendar.requestWriteCalendarPermission();
    return resultado.result === "granted";
  } catch (error) {
    console.error("Error al solicitar permisos del calendario nativo:", error);
    return false;
  }
}

/**
 * Inserta de manera nativa un evento en la agenda por defecto del teléfono celular.
 * @param {string} titulo - Título del bloque (ej: "Estudiar Ingeniería de Software").
 * @param {Date} fechaInicio - Objeto Date con el inicio de la actividad.
 * @param {Date} fechaFin - Objeto Date con el fin de la actividad.
 * @returns {Promise<boolean>} True si el evento se guardó con éxito en el dispositivo.
 */
export async function agendarEventoCelularVitality(titulo, fechaInicio, fechaFin) {
  try {
    const Calendar = obtenerPluginCalendarioVitality();
    if (!Calendar) {
      console.log("Sincronización nativa omitida: No estás en un entorno móvil Android/iOS.");
      return false;
    }

    const tienePermiso = await pedirPermisoCalendarioVitality();
    if (!tienePermiso) {
      console.log("No se pudo agendar en el celular: Permiso denegado por el usuario.");
      return false;
    }

    // Crear el evento nativo en el dispositivo
    await Calendar.createEvent({
      title: titulo,
      startDate: fechaInicio.getTime(),
      endDate: fechaFin.getTime(),
      location: "Vitality App"
    });

    console.log(`¡Evento "${titulo}" sincronizado con éxito en el calendario nativo!`);
    return true;
  } catch (error) {
    console.error("Error al inyectar evento en el calendario nativo:", error);
    return false;
  }
}