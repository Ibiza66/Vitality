/* =========================================================================
   MÓDULO: MONITOREO DE USO REAL DE APLICACIONES (SÓLO ANDROID NATIVO)
   ========================================================================= */

/**
 * Intenta capturar e inicializar de forma segura el plugin nativo de estadísticas de Android.
 * @returns {object|null} Instancia del plugin de estadísticas o null en navegadores/iOS.
 */
function obtenerPluginUsoAppsVitality() {
  if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.UsageStatsPlugin) {
    return window.Capacitor.Plugins.UsageStatsPlugin;
  }
  return null;
}

/**
 * Consulta de manera asíncrona al sistema operativo si el usuario otorgó el permiso 
 * especial de "Acceso a datos de uso" en los ajustes de Android.
 * @returns {Promise<boolean>} True si el permiso está activo y concedido.
 */
export async function permisoUsoAppsConcedidoVitality() {
  try {
    const UsageStats = obtenerPluginUsoAppsVitality();
    if (!UsageStats) return false;

    const resultado = await UsageStats.checkPermission();
    return resultado && resultado.granted === true;
  } catch (error) {
    console.error("Error al validar el estado del permiso de uso en Android:", error);
    return false;
  }
}

/**
 * Dispara una ventana nativa de configuración del sistema Android para que el usuario 
 * active manualmente el interruptor de rastreo para la app Vitality.
 */
export async function abrirAjustesPermisoUsoAppsVitality() {
  try {
    const UsageStats = obtenerPluginUsoAppsVitality();
    if (!UsageStats) return;

    await UsageStats.requestPermission();
  } catch (error) {
    console.error("No se pudo desplegar la pantalla de ajustes de Android:", error);
  }
}

/**
 * Extrae del sistema operativo el paquete (package name) oficial de Android a partir del 
 * nombre genérico o comercial de una red social o herramienta.
 * @param {string} nombreApp - Nombre legible (ej: "Instagram").
 * @param {string} porDefecto - Retorno de emergencia si no coincide ninguno.
 * @returns {string} El identificador del paquete (ej: "com.instagram.android").
 */
export function obtenerPackageAppVitality(nombreApp, porDefecto = "") {
  const limpio = String(nombreApp || "").trim().toLowerCase();

  switch (limpio) {
    case "instagram": return "com.instagram.android";
    case "tiktok": return "com.zhiliaoapp.musically";
    case "facebook": return "com.facebook.katana";
    case "youtube": return "com.google.android.youtube";
    case "x":
    case "twitter": return "com.twitter.android";
    case "whatsapp": return "com.whatsapp";
    default: return porDefecto;
  }
}

/**
 * Recopila un objeto con los minutos consumidos de cada app en lo que va del día actual.
 * @returns {Promise<object|null>} Diccionario estructurado { "com.instagram.android": 125000, ... } con milisegundos.
 */
export async function obtenerEstadisticasUsoHoyVitality() {
  try {
    const UsageStats = obtenerPluginUsoAppsVitality();
    if (!UsageStats) return null;

    const respuesta = await UsageStats.getTodayUsageStats();
    return respuesta && respuesta.stats ? respuesta.stats : null;
  } catch (error) {
    console.error("Error al extraer registros UsageStats de Android:", error);
    return null;
  }
}

/**
 * Mapea y calcula de milisegundos a minutos redondeados el tiempo en primer plano de una app específica.
 * @param {object} estadisticas - El mapa devuelto por obtenerEstadisticasUsoHoyVitality().
 * @param {string} packageName - ID del paquete de Android.
 * @returns {number} Minutos totales de uso en el día.
 */
export function calcularMinutosUsoRealVitality(estadisticas, packageName) {
  if (!estadisticas || !packageName) return 0;

  const uso = estadisticas[packageName];
  if (!uso || !uso.totalTimeInForeground) return 0;

  // Convertimos milisegundos nativos de Android a minutos enteros
  return Math.round(Number(uso.totalTimeInForeground) / 60000);
}

/**
 * Modifica dinámicamente el texto o etiqueta de la interfaz de usuario informando 
 * si el rastreo inteligente está activo, pendiente o no soportado.
 */
export async function actualizarEstadoPermisoUsoAppsVitality() {
  const texto = document.getElementById("estadoPermisoUsoApps");
  if (!texto) return;

  const UsageStats = obtenerPluginUsoAppsVitality();
  if (!UsageStats) {
    texto.textContent = "Uso real disponible solo en la APK Android.";
    return;
  }

  const permiso = await permisoUsoAppsConcedidoVitality();
  if (permiso) {
    texto.textContent = "Permiso activo. Vitality puede leer el uso real de apps.";
  } else {
    texto.textContent = "Permiso pendiente. Toca el botón para activar Acceso a uso.";
  }
}

/**
 * Intercepta un arreglo de usos de la base de datos y les inyecta/cruza los minutos 
 * reales obtenidos directamente de los sensores internos de Android en tiempo real.
 * @param {Array} usos - Lista de apps registradas en tu MongoDB.
 * @returns {Promise<Array>} El mismo arreglo enriquecido con minutos de uso físico real.
 */
export async function enriquecerUsoAppsConUsoRealVitality(usos) {
  const permiso = await permisoUsoAppsConcedidoVitality();
  if (!permiso) return usos;

  const estadisticas = await obtenerEstadisticasUsoHoyVitality();
  if (!estadisticas) return usos;

  return usos.map((uso) => {
    const packageName = uso.packageName || obtenerPackageAppVitality(uso.nombreApp, "");
    const minutosReales = calcularMinutosUsoRealVitality(estadisticas, packageName);

    return {
      ...uso,
      minutosReales: minutosReales || uso.minutosReal || 0
    };
  });
}