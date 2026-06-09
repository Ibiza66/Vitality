/* =========================================================================
   MÓDULO: UTILIDADES GLOBALMENTE COMPARTIDAS (HELPERS)
   ========================================================================= */

/**
 * Lee de forma segura una cadena en LocalStorage y la transforma en objeto/arreglo JSON.
 * @param {string} clave - Identificador en el almacenamiento del navegador.
 * @param {*} valorPorDefecto - Qué retornar en caso de que no exista el registro.
 * @returns {*} Datos procesados o el valor por defecto.
 */
export function leerJSON(clave, valorPorDefecto) {
  try {
    const data = localStorage.getItem(clave);
    return data ? JSON.parse(data) : valorPorDefecto;
  } catch (error) {
    console.error(`Error leyendo la clave "${clave}" en LocalStorage:`, error);
    return valorPorDefecto;
  }
}

/**
 * Serializa y guarda cualquier estructura de datos dentro del LocalStorage.
 * @param {string} clave - Identificador en el almacenamiento.
 * @param {*} valor - Estructura de datos a guardar (Objeto, Arreglo, Número, etc).
 */
export function guardarJSON(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch (error) {
    console.error(`Error escribiendo la clave "${clave}" en LocalStorage:`, error);
  }
}

/**
 * Elimina por completo las credenciales locales y estados almacenados del usuario.
 */
export function limpiarDatosLocalesUsuario() {
  localStorage.removeItem("usuarioVitality");
  localStorage.removeItem("perfilVitality");
  localStorage.removeItem("tokenVitality"); // Por si añades JWT en el futuro
}

/**
 * Sanitiza un texto para prevenir inyecciones de código malicioso (XSS) en la interfaz.
 * @param {string} texto - Cadena de texto provista por un usuario o IA.
 * @returns {string} Texto limpio seguro para renderizar.
 */
export function escaparHTML(texto) {
  if (!texto) return "";
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

/**
 * Crea e inyecta dinámicamente un aviso flotante visual (Toast) en la pantalla.
 * Reubicado aquí para ser consumido tanto por plugins como por servicios REST.
 * @param {string} mensaje - Contenido textual que se va a desplegar.
 */
export function mostrarToastVitality(mensaje) {
  const texto = String(mensaje || "").trim();
  if (!texto) return;

  let contenedor = document.getElementById("toastVitalityContainer");
  if (!contenedor) {
    contenedor = document.createElement("div");
    contenedor.id = "toastVitalityContainer";
    contenedor.className = "toast-vitality-container";
    document.body.appendChild(contenedor);
  }

  const toast = document.createElement("div");
  toast.className = "toast-vitality";
  toast.textContent = texto;
  contenedor.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-vitality-salida");
  }, 2600);

  setTimeout(() => {
    toast.remove();
  }, 3100);
}



/**
 * Compara de forma segura dos identificadores convirtiéndolos a string.
 */
export function compararId(a, b) {
  return String(a) === String(b);
}

/**
 * Formatea un rango horario legible para las tarjetas de la agenda.
 */
export function obtenerRangoHora(inicio, fin) {
  if (inicio && fin) return `${inicio} - ${fin}`;
  if (inicio) return inicio;
  return "Sin hora";
}

/**
 * Valida que la hora de finalización no sea menor o igual a la de inicio.
 */
export function validarRangoHoras(horaInicio, horaFin) {
  if (!horaInicio || !horaFin) return false;
  if (horaFin <= horaInicio) {
    let contenedor = document.getElementById("toastVitalityContainer");
    if(contenedor) {
      // Usamos el toast dinámico que ya tiene el archivo
      const toast = document.createElement("div");
      toast.className = "toast-vitality";
      toast.textContent = "La hora de término debe ser posterior a la hora de inicio.";
      contenedor.appendChild(toast);
      setTimeout(() => toast.remove(), 3100);
    }
    return false;
  }
  return true;
}