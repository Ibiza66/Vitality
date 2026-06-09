/* =========================================================================
   MÓDULO: NOTIFICACIONES NATIVAS Y TOASTS (CAPACITOR)
   ========================================================================= */

/**
 * Solicita de forma asíncrona permisos al sistema operativo para mostrar alertas locales.
 * @returns {Promise<boolean>} Retorna true si el permiso fue concedido.
 */
export async function pedirPermisoNotificacionesVitality() {
  try {
    if (!window.Capacitor || !window.Capacitor.Plugins) {
      return false;
    }

    const LocalNotifications = window.Capacitor.Plugins.LocalNotifications;

    if (!LocalNotifications) {
      return false;
    }

    let permiso = await LocalNotifications.checkPermissions();

    if (permiso.display !== "granted") {
      permiso = await LocalNotifications.requestPermissions();
    }

    return permiso.display === "granted";
  } catch (error) {
    console.log("No se pudo pedir permiso de notificaciones:", error);
    return false;
  }
}

/**
 * Programa una notificación push nativa en el dispositivo celular si los permisos están activos.
 * @param {string} titulo - Título de la alerta.
 * @param {string} mensaje - Cuerpo del recordatorio.
 */
export async function enviarNotificacionCelularVitality(titulo, mensaje) {
  try {
    const permitido = await pedirPermisoNotificacionesVitality();

    if (!permitido) {
      return;
    }

    const LocalNotifications = window.Capacitor.Plugins.LocalNotifications;

    await LocalNotifications.schedule({
      notifications: [
        {
          id: Date.now() % 100000,
          title: titulo,
          body: mensaje,
          smallIcon: "ic_stat_vitality",
          iconColor: "#115C67",
          schedule: {
            at: new Date(Date.now() + 1000)
          }
        }
      ]
    });
  } catch (error) {
    console.log("No se pudo enviar notificación del celular:", error);
  }
}

/**
 * Crea e inyecta dinámicamente un aviso flotante visual (Toast) en la parte inferior de la pantalla.
 * @param {string} mensaje - Contenido textual que se va a desplegar.
 */
export function mostrarToastVitality(mensaje) {
  const texto = String(mensaje || "").trim();

  if (!texto) {
    return;
  }

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