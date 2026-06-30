
// Encapsula el hardware y plugins de Capacitor.



//Linea 4
async function pedirPermisoNotificacionesVitality() {
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

//linea 29
async function enviarNotificacionCelularVitality(titulo, mensaje) {
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

// Linea 147
async function agregarEventoAlCalendarioVitality(datos) {
  try {
    const Calendar = obtenerPluginCalendarioVitality();

    if (!Calendar) {
      mostrarToastVitality("Calendario no disponible en esta plataforma.");
      return;
    }

    const permitido = await pedirPermisoCalendarioVitality();

    if (!permitido) {
      mostrarToastVitality("Permiso de calendario rechazado.");
      return;
    }

    const inicio = crearFechaCalendarioVitality(datos.fecha, datos.horaInicio);
    const termino = crearFechaCalendarioVitality(datos.fecha, datos.horaFin);

    if (termino <= inicio) {
      termino.setMinutes(inicio.getMinutes() + 60);
    }

    const evento = {
      title: datos.titulo || "Actividad Vitality",
      startDate: inicio.getTime(),
      endDate: termino.getTime(),
      isAllDay: false,
      description: "Actividad creada desde Vitality.",
      alerts: [-10]
    };

    if (typeof Calendar.createEventWithPrompt === "function") {
      await Calendar.createEventWithPrompt(evento);
      mostrarToastVitality("Abriendo calendario del celular.");
      return;
    }

    if (typeof Calendar.createEvent === "function") {
      await Calendar.createEvent(evento);
      mostrarToastVitality("Actividad agregada al calendario.");
      return;
    }

    mostrarToastVitality("Tu calendario no permite crear eventos desde Vitality.");
  } catch (error) {
    console.log("Error al agregar evento al calendario:", error);
    mostrarToastVitality("No se pudo agregar al calendario.");
  }
}