/* =========================
   NOTIFICACIONES NATIVAS ANDROID
========================= */
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
function mostrarToastVitality(mensaje) {
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
/* =========================
   CALENDARIO NATIVO ANDROID / IOS
========================= */
function obtenerPluginCalendarioVitality() {
  if (!window.Capacitor || !window.Capacitor.Plugins) {
    return null;
  }

  return (
    window.Capacitor.Plugins.CapacitorCalendar ||
    window.Capacitor.Plugins.Calendar ||
    window.Capacitor.Plugins.EbarooniCapacitorCalendar ||
    null
  );
}

async function pedirPermisoCalendarioVitality() {
  try {
    const Calendar = obtenerPluginCalendarioVitality();

    if (!Calendar) {
      mostrarToastVitality("Calendario no disponible en esta plataforma.");
      return false;
    }

    if (typeof Calendar.requestWriteOnlyCalendarAccess === "function") {
      const permiso = await Calendar.requestWriteOnlyCalendarAccess();
      return permiso.result === "granted";
    }

    if (typeof Calendar.requestFullCalendarAccess === "function") {
      const permiso = await Calendar.requestFullCalendarAccess();
      return permiso.result === "granted";
    }

    if (typeof Calendar.requestAllPermissions === "function") {
      const permiso = await Calendar.requestAllPermissions();
      return true;
    }

    return true;
  } catch (error) {
    console.log("No se pudo pedir permiso de calendario:", error);
    mostrarToastVitality("No se pudo acceder al calendario.");
    return false;
  }
}

function crearFechaCalendarioVitality(fecha, hora) {
  const fechaBase = fecha || new Date().toISOString().slice(0, 10);
  const horaBase = hora || "09:00";

  return new Date(`${fechaBase}T${horaBase}:00`);
}

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
/* =========================
   CONFIGURACIÓN GENERAL
========================= */
const API_URL = (() => {
  const esAppMovil =
    window.Capacitor ||
    window.location.protocol === "capacitor:" ||
    (
      window.location.hostname === "localhost" &&
      window.location.port !== "3000"
    );

  if (esAppMovil) {
    return "http://10.30.16.154:3000";
  }

  return "";
})();

/* =========================
   FUNCIONES GENERALES
========================= */
function leerJSON(clave, valorPorDefecto) {
  try {
    const data = localStorage.getItem(clave);
    return data ? JSON.parse(data) : valorPorDefecto;
  } catch (error) {
    console.error("Error leyendo localStorage:", error);
    return valorPorDefecto;
  }
}

function guardarJSON(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}

function escaparHTML(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function compararId(a, b) {
  return String(a) === String(b);
}

function obtenerRangoHora(inicio, fin) {
  if (inicio && fin) return `${inicio} - ${fin}`;
  if (inicio) return inicio;
  return "Sin hora";
}

function validarRangoHoras(horaInicio, horaFin) {
  if (!horaInicio || !horaFin) return false;

  if (horaFin <= horaInicio) {
    mostrarToastVitality("La hora de término debe ser posterior a la hora de inicio.");
    return false;
  }

  return true;
}

function limpiarDatosLocalesUsuario() {
  localStorage.removeItem("perfilVitality");
  localStorage.removeItem("checkinVitality");
  localStorage.removeItem("actividadesFijasVitality");
  localStorage.removeItem("actividadesEspecialesVitality");
  localStorage.removeItem("editandoActividadFijaId");
  localStorage.removeItem("editandoActividadEspecialId");
  localStorage.removeItem("onboardingVitality");
  sessionStorage.removeItem("notificacionesVitalityCerradas");
}
/* =========================
   MENÚ HAMBURGUESA Y PERFIL
========================= */
function toggleMenu() {
  const menu = document.getElementById("menu");
  const profileMenu = document.getElementById("profileMenu");

  if (!menu) return;

  if (profileMenu) {
    profileMenu.style.display = "none";
  }

  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

function toggleProfileMenu() {
  const profileMenu = document.getElementById("profileMenu");
  const menu = document.getElementById("menu");

  if (!profileMenu) return;

  if (menu) {
    menu.style.display = "none";
  }

  profileMenu.style.display =
    profileMenu.style.display === "block" ? "none" : "block";
}

window.addEventListener("click", function (e) {
  const menu = document.getElementById("menu");
  const profileMenu = document.getElementById("profileMenu");
  const menuBtn = document.querySelector(".menu-btn");
  const profileBtn = document.querySelector(".profile-btn");

  if (
    menu &&
    menuBtn &&
    !menuBtn.contains(e.target) &&
    !menu.contains(e.target)
  ) {
    menu.style.display = "none";
  }

  if (
    profileMenu &&
    profileBtn &&
    !profileBtn.contains(e.target) &&
    !profileMenu.contains(e.target)
  ) {
    profileMenu.style.display = "none";
  }
});

/* =========================
   MODO OSCURO / CLARO
========================= */
function toggleTheme() {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
}

/* =========================
   NAVEGACIÓN EN HORARIO
========================= */
function irASeccion(idSeccion) {
  const seccion = document.getElementById(idSeccion);

  if (seccion) {
    seccion.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

/* =========================
   USUARIO, REGISTRO E INICIO DE SESIÓN
========================= */
function guardarUsuario(usuario) {
  guardarJSON("usuarioVitality", usuario);
}

function obtenerUsuario() {
  return leerJSON("usuarioVitality", null);
}

async function registrarUsuario(event) {
  event.preventDefault();

  const nombreInput = document.getElementById("nombre");
  const correoInput = document.getElementById("correo");
  const passwordInput = document.getElementById("password");
  const confirmarPasswordInput = document.getElementById("confirmarPassword");
  const edadInput = document.getElementById("edad");
  const ocupacionInput = document.getElementById("ocupacion");
  const ocupacionDetalleInput = document.getElementById("ocupacionDetalle");

  if (
    !nombreInput ||
    !correoInput ||
    !passwordInput ||
    !confirmarPasswordInput ||
    !edadInput ||
    !ocupacionInput
  ) {
    return;
  }

  const nombre = nombreInput.value.trim();
  const correo = correoInput.value.trim().toLowerCase();
  const password = passwordInput.value.trim();
  const confirmarPassword = confirmarPasswordInput.value.trim();
  const edad = Number(edadInput.value);
  const ocupacionBase = ocupacionInput.value.trim();
  const ocupacionDetalle = ocupacionDetalleInput
    ? ocupacionDetalleInput.value.trim()
    : "";

  if (!nombre || !correo || !password || !confirmarPassword || !edad || !ocupacionBase) {
    mostrarToastVitality("Por favor completa todos los campos.");
    return;
  }

  if (password !== confirmarPassword) {
    mostrarToastVitality("Las contraseñas no coinciden.");
    return;
  }

  if (password.length < 6) {
    mostrarToastVitality("La contraseña debe tener al menos 6 caracteres.");
    return;
  }

  if (Number.isNaN(edad) || edad < 1 || edad > 120) {
    mostrarToastVitality("Ingresa una edad válida.");
    return;
  }

  if (
    (ocupacionBase === "Estudiante universitario" ||
      ocupacionBase === "Trabajador" ||
      ocupacionBase === "Otra") &&
    !ocupacionDetalle
  ) {
    mostrarToastVitality("Completa el detalle de tu ocupación.");
    return;
  }

 const ocupacion = ocupacionBase;

const actividadesFavoritas = ocupacionDetalle
  ? ocupacionDetalle
  : "Se definirá en el onboarding inicial.";

  try {
    const respuesta = await fetch(`${API_URL}/api/usuarios/registro`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nombre,
        correo,
        password,
        edad,
        ocupacion,
        actividadesFavoritas
      })
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      mostrarToastVitality(data.mensaje || "No se pudo registrar el usuario.");
      return;
    }

    limpiarDatosLocalesUsuario();
guardarUsuario(data.usuario);

guardarJSON("detalleOcupacionVitality", {
  ocupacion: ocupacionBase,
  detalle: ocupacionDetalle
});

mostrarToastVitality("Cuenta creada con éxito.");
window.location.href = "onboarding.html";
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    mostrarToastVitality(
      "Error al conectar con el servidor. Detalle: " +
        error.message +
        " | API_URL: " +
        API_URL
    );
  }
}
async function iniciarSesion(event) {
  event.preventDefault();

  const correoInput = document.getElementById("correoLogin");
  const passwordInput = document.getElementById("passwordLogin");

  if (!correoInput || !passwordInput) return;

  const correo = correoInput.value.trim().toLowerCase();
  const password = passwordInput.value.trim();

  if (!correo || !password) {
    mostrarToastVitality("Por favor ingresa tu correo y contraseña.");
    return;
  }

  try {
    const respuesta = await fetch(`${API_URL}/api/usuarios/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        correo,
        password
      })
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      mostrarToastVitality(data.mensaje || "Correo o contraseña incorrectos.");
      return;
    }

    limpiarDatosLocalesUsuario();
    guardarUsuario(data.usuario);

   await redirigirDespuesDeLoginSegunCheckin();
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    mostrarToastVitality("Error al conectar con el servidor. Detalle: " + error.message + " | API_URL: " + API_URL);
  }
}

/* =========================
   PERFIL DEL USUARIO
========================= */
function guardarPerfilLocal(categoria, actividades) {
  guardarJSON("perfilVitality", { categoria, actividades });
}

function obtenerPerfil() {
  return leerJSON("perfilVitality", null);
}

async function guardarPerfilBackend(categoria, actividades) {
  const usuario = obtenerUsuario();

  if (!usuario || !usuario.id) {
    guardarPerfilLocal(categoria, actividades);
    return {
      ok: false,
      mensaje: "No hay usuario conectado al backend. Perfil guardado solo localmente."
    };
  }

  try {
    const respuesta = await fetch(`${API_URL}/api/perfiles/${usuario.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        categoria,
        actividades
      })
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      return {
        ok: false,
        mensaje: data.mensaje || "No se pudo guardar el perfil en MongoDB."
      };
    }

    guardarPerfilLocal(data.perfil.categoria, data.perfil.actividades);

    return {
      ok: true,
      perfil: data.perfil
    };
  } catch (error) {
    console.error("Error al guardar perfil en backend:", error);
    guardarPerfilLocal(categoria, actividades);

    return {
      ok: false,
      mensaje: "No se pudo conectar con el servidor. Perfil guardado solo localmente."
    };
  }
}

async function obtenerPerfilBackend() {
  const usuario = obtenerUsuario();

  if (!usuario || !usuario.id) {
    return obtenerPerfil();
  }

  try {
    const respuesta = await fetch(`${API_URL}/api/perfiles/${usuario.id}`);

    if (respuesta.status === 404) {
      return obtenerPerfil();
    }

    const data = await respuesta.json();

    if (!respuesta.ok) {
      return obtenerPerfil();
    }

    const perfil = {
      categoria: data.categoria,
      actividades: data.actividades
    };

    guardarJSON("perfilVitality", perfil);
    return perfil;
  } catch (error) {
    console.error("Error al obtener perfil desde backend:", error);
    return obtenerPerfil();
  }
}

async function guardarDatosPerfil(event) {
  event.preventDefault();

  const categoriaInput = document.getElementById("categoria");
  const actividadesInput = document.getElementById("actividades");

  if (!categoriaInput || !actividadesInput) return;

  const categoria = categoriaInput.value.trim();
  const actividades = actividadesInput.value.trim();

  if (!categoria || !actividades) {
    mostrarToastVitality("Por favor completa todos los campos del perfil.");
    return;
  }

  const resultado = await guardarPerfilBackend(categoria, actividades);

  await mostrarDatosPerfil();
  mostrarPanelPerfilAvanzado();

  if (resultado.ok) {
    mostrarToastVitality("Perfil guardado con éxito en MongoDB.");
  } else {
    mostrarToastVitality(resultado.mensaje);
  }
}

async function mostrarDatosPerfil() {
  const usuario = obtenerUsuario();
  const perfil = await obtenerPerfilBackend();

  const nombreSpan = document.getElementById("perfilNombre");
  const categoriaSpan = document.getElementById("perfilCategoria");
  const actividadesSpan = document.getElementById("perfilActividades");

  if (usuario && nombreSpan) {
    nombreSpan.textContent = usuario.nombre;
  }

  if (perfil && categoriaSpan) {
    categoriaSpan.textContent = perfil.categoria;
  }

  if (perfil && actividadesSpan) {
    actividadesSpan.textContent = perfil.actividades;
  }

  const categoriaInput = document.getElementById("categoria");
  const actividadesInput = document.getElementById("actividades");

  if (perfil && categoriaInput) {
    categoriaInput.value = perfil.categoria;
  }

  if (perfil && actividadesInput) {
    actividadesInput.value = perfil.actividades;
  }
}

/* =========================
   CHECK-IN DIARIO
========================= */
function guardarCheckinLocal(
  estadoAnimo,
  nivelEstres,
  sueno,
  energia,
  fecha = new Date().toLocaleDateString()
) {
  guardarJSON("checkinVitality", {
    estadoAnimo,
    nivelEstres,
    sueno,
    energia,
    fecha
  });
}

function obtenerCheckin() {
  return leerJSON("checkinVitality", null);
}

function obtenerUsuarioIdVitality() {
  const usuario = obtenerUsuario();

  if (!usuario) {
    return null;
  }

  return usuario.id || usuario._id || usuario.usuarioId || null;
}

async function guardarCheckinBackend(estadoAnimo, nivelEstres, sueno, energia) {
  const usuario = obtenerUsuario();
  const usuarioId = obtenerUsuarioIdVitality();

  console.log("Usuario actual para check-in:", usuario);
  console.log("ID detectado para check-in:", usuarioId);

  if (!usuarioId) {
    return {
      ok: false,
      mensaje: "No se encontró el ID del usuario. Cierra sesión e inicia sesión nuevamente."
    };
  }

  try {
    const respuesta = await fetch(`${API_URL}/api/checkins`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        usuarioId,
        estadoAnimo,
        nivelEstres,
        sueno,
        energia
      })
    });

    const data = await respuesta.json();

    console.log("Respuesta check-in backend:", data);

    if (!respuesta.ok) {
      return {
        ok: false,
        mensaje: data.mensaje || "No se pudo guardar el check-in en MongoDB."
      };
    }

    guardarCheckinLocal(
      data.checkin.estadoAnimo,
      data.checkin.nivelEstres,
      data.checkin.sueno,
      data.checkin.energia,
      new Date(
        data.checkin.createdAt ||
          data.checkin.fecha ||
          data.checkin.updatedAt
      ).toLocaleDateString()
    );

    return {
      ok: true,
      checkin: data.checkin
    };
  } catch (error) {
    console.error("Error al guardar check-in en backend:", error);

    return {
      ok: false,
      mensaje:
        "No se pudo conectar con el servidor para guardar el check-in. Detalle: " +
        error.message +
        " | API_URL: " +
        API_URL
    };
  }
}

async function obtenerUltimoCheckinBackend() {
  const usuarioId = obtenerUsuarioIdVitality();

  if (!usuarioId) {
    return obtenerCheckin();
  }

  try {
    const respuesta = await fetch(`${API_URL}/api/checkins/ultimo/${usuarioId}`);

    if (respuesta.status === 404) {
      return obtenerCheckin();
    }

    const data = await respuesta.json();

    if (!respuesta.ok) {
      return obtenerCheckin();
    }

    const checkinLocal = {
      estadoAnimo: data.estadoAnimo,
      nivelEstres: data.nivelEstres,
      sueno: data.sueno,
      energia: data.energia,
      fecha: new Date(
        data.createdAt ||
          data.fecha ||
          data.updatedAt
      ).toLocaleDateString()
    };

    guardarJSON("checkinVitality", checkinLocal);
    return checkinLocal;
  } catch (error) {
    console.error("Error al obtener check-in desde backend:", error);
    return obtenerCheckin();
  }
}

async function guardarDatosCheckin(event) {
  event.preventDefault();

  const estadoAnimoInput = document.getElementById("estadoAnimo");
  const nivelEstresInput = document.getElementById("nivelEstres");
  const suenoInput = document.getElementById("sueno");
  const energiaInput = document.getElementById("energia");

  if (!estadoAnimoInput || !nivelEstresInput || !suenoInput || !energiaInput) {
    mostrarToastVitality("No se encontraron todos los campos del check-in.");
    return;
  }

  const estadoAnimo = estadoAnimoInput.value.trim();
  const nivelEstres = nivelEstresInput.value.trim();
  const sueno = suenoInput.value.trim();
  const energia = energiaInput.value.trim();

  if (!estadoAnimo || !nivelEstres || !sueno || !energia) {
    mostrarToastVitality("Por favor completa todo el check-in.");
    return;
  }

  const resultado = await guardarCheckinBackend(
    estadoAnimo,
    nivelEstres,
    sueno,
    energia
  );

  if (!resultado.ok) {
    mostrarToastVitality(resultado.mensaje);
    return;
  }

  mostrarToastVitality("Check-in guardado correctamente.");
  window.location.href = "horario.html";
}

async function sincronizarCheckinBackendConInterfaz() {
  await obtenerUltimoCheckinBackend();

  mostrarResumenCheckinEnPerfil();
  mostrarPanelPerfilAvanzado();
  mostrarAlertas();

  const chatBox = document.getElementById("chatBox");
  if (chatBox) {
    iniciarChatInteligente();
  }
}
/* =========================
   ALERTAS SEGÚN CHECK-IN
========================= */
function mostrarAlertas() {
  const alertasContainer = document.getElementById("alertasContainer");
  if (!alertasContainer) return;

  const checkin = obtenerCheckin();

  if (!checkin) {
    alertasContainer.innerHTML = `
      <div class="alerta">
        <p><strong>No hay check-in registrado.</strong></p>
        <p>Completa tu check-in diario para recibir alertas y recomendaciones personalizadas.</p>
      </div>
    `;
    return;
  }

  let alertasHTML = "";

  if (checkin.nivelEstres === "Alto") {
    alertasHTML += `
      <div class="alerta">
        <p><strong>Estado detectado:</strong> Hoy registraste un nivel de estrés alto.</p>
        <p><strong>Recomendación:</strong> Te recomendamos tomar una pausa, salir a caminar o escuchar música relajante.</p>
      </div>
    `;
  }

  if (checkin.energia === "Baja") {
    alertasHTML += `
      <div class="alerta">
        <p><strong>Consejo de bienestar:</strong> Tu nivel de energía está bajo.</p>
        <p><strong>Recomendación:</strong> Intenta descansar, hidratarte bien o hacer una actividad tranquila que te guste.</p>
      </div>
    `;
  }

  if (checkin.sueno === "Mal") {
    alertasHTML += `
      <div class="alerta">
        <p><strong>Descanso insuficiente:</strong> Reportaste que dormiste mal.</p>
        <p><strong>Recomendación:</strong> Considera acostarte más temprano hoy y reducir actividades exigentes esta noche.</p>
      </div>
    `;
  }

  if (checkin.estadoAnimo === "Mal" || checkin.estadoAnimo === "Muy mal") {
    alertasHTML += `
      <div class="alerta">
        <p><strong>Estado emocional:</strong> Hoy no te has sentido bien.</p>
        <p><strong>Recomendación:</strong> Date un momento para ti, habla con alguien de confianza o usa el chat de apoyo de Vitality.</p>
      </div>
    `;
  }

  if (alertasHTML === "") {
    alertasHTML = `
      <div class="alerta">
        <p><strong>Buen trabajo.</strong> No detectamos alertas importantes en tu check-in de hoy.</p>
        <p><strong>Sugerencia:</strong> Mantén tu rutina, tus pausas y tus hábitos saludables.</p>
      </div>
    `;
  }

  alertasHTML += `
    <div class="alerta">
      <p><strong>¿Necesitas apoyo?</strong> Puedes conversar con Vitality para recibir orientación y sugerencias personalizadas.</p>
      <p><a href="chat.html">Hablar con Vitality</a></p>
    </div>
  `;

  alertasContainer.innerHTML = alertasHTML;
}

/* =========================
   GRÁFICO DEL PERFIL SEGÚN CHECK-IN
========================= */
function obtenerClaseBarra(estadoAnimo) {
  switch (estadoAnimo) {
    case "Muy mal":
      return "barra-1";
    case "Mal":
      return "barra-2";
    case "Normal":
      return "barra-3";
    case "Bien":
      return "barra-4";
    case "Muy bien":
      return "barra-5";
    default:
      return "barra-3";
  }
}

function mostrarResumenCheckinEnPerfil() {
  const checkin = obtenerCheckin();
  if (!checkin) return;

  const barraEstado = document.getElementById("barraEstado");
  const textoEstado = document.getElementById("textoEstado");

  const resumenEstado = document.getElementById("resumenEstado");
  const resumenEstres = document.getElementById("resumenEstres");
  const resumenSueno = document.getElementById("resumenSueno");
  const resumenEnergia = document.getElementById("resumenEnergia");

  if (barraEstado) {
    barraEstado.className = "barra " + obtenerClaseBarra(checkin.estadoAnimo);
  }

  if (textoEstado) {
    textoEstado.textContent = checkin.estadoAnimo;
  }

  if (resumenEstado) {
    resumenEstado.textContent = checkin.estadoAnimo;
  }

  if (resumenEstres) {
    resumenEstres.textContent = checkin.nivelEstres;
  }

  if (resumenSueno) {
    resumenSueno.textContent = checkin.sueno;
  }

  if (resumenEnergia) {
    resumenEnergia.textContent = checkin.energia;
  }
}

/* =========================
   HORARIO: ACTIVIDADES FIJAS Y ESPECIALES
========================= */
function obtenerActividadesFijas() {
  return leerJSON("actividadesFijasVitality", []);
}

function guardarActividadesFijas(lista) {
  guardarJSON("actividadesFijasVitality", lista);
}

function obtenerActividadesEspeciales() {
  return leerJSON("actividadesEspecialesVitality", []);
}

function guardarActividadesEspeciales(lista) {
  guardarJSON("actividadesEspecialesVitality", lista);
}

function obtenerUsuarioBackendActual() {
  const usuario = obtenerUsuario();
  return usuario && usuario.id ? usuario : null;
}

function transformarActividadBackendParaLocal(item) {
  if (item.tipoActividad === "fija") {
    return {
      id: item._id,
      dia: item.dia,
      hora: item.hora,
      horaFin: item.horaFin,
      actividad: item.actividad,
      completada: item.completada
    };
  }

  return {
    id: item._id,
    tipo: item.tipoEspecial,
    fecha: item.fecha,
    hora: item.hora,
    horaFin: item.horaFin,
    actividad: item.actividad,
    completada: item.completada
  };
}

async function obtenerActividadesBackend() {
  const usuario = obtenerUsuarioBackendActual();

  if (!usuario) {
    return {
      ok: false,
      mensaje: "No hay usuario conectado.",
      fijas: obtenerActividadesFijas(),
      especiales: obtenerActividadesEspeciales()
    };
  }

  try {
    const respuesta = await fetch(`${API_URL}/api/actividades/${usuario.id}`);
    const data = await respuesta.json();

    if (!respuesta.ok) {
      return {
        ok: false,
        mensaje: data.mensaje || "No se pudieron obtener las actividades.",
        fijas: obtenerActividadesFijas(),
        especiales: obtenerActividadesEspeciales()
      };
    }

    const fijas = data
      .filter((item) => item.tipoActividad === "fija")
      .map(transformarActividadBackendParaLocal);

    const especiales = data
      .filter((item) => item.tipoActividad === "especial")
      .map(transformarActividadBackendParaLocal);

    guardarActividadesFijas(fijas);
    guardarActividadesEspeciales(especiales);

    return {
      ok: true,
      fijas,
      especiales
    };
  } catch (error) {
    console.error("Error al obtener actividades desde backend:", error);

    return {
      ok: false,
      mensaje: "No se pudo conectar con el servidor.",
      fijas: obtenerActividadesFijas(),
      especiales: obtenerActividadesEspeciales()
    };
  }
}

async function sincronizarActividadesBackendConInterfaz() {
  await obtenerActividadesBackend();

  mostrarActividadesFijas();
  mostrarActividadesEspeciales();
  mostrarActividadesHoy();
  mostrarEventosEspecialesHoy();
  rellenarTablaHorarioSemanal();
  mostrarPanelPerfilAvanzado();
}

async function guardarActividadFijaBackend(dia, hora, horaFin, actividad, editandoId) {
  const usuario = obtenerUsuarioBackendActual();

  if (!usuario) {
    return {
      ok: false,
      mensaje: "No hay usuario conectado al backend."
    };
  }

  const cuerpo = {
    usuarioId: usuario.id,
    tipoActividad: "fija",
    dia,
    fecha: "",
    tipoEspecial: "",
    hora,
    horaFin,
    actividad
  };

  try {
    const url = editandoId
      ? `${API_URL}/api/actividades/${editandoId}`
      : `${API_URL}/api/actividades`;

    const metodo = editandoId ? "PUT" : "POST";

    const respuesta = await fetch(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(cuerpo)
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      return {
        ok: false,
        mensaje: data.mensaje || "No se pudo guardar la actividad fija."
      };
    }

    return {
      ok: true,
      data
    };
  } catch (error) {
    console.error("Error al guardar actividad fija:", error);

    return {
      ok: false,
      mensaje: "No se pudo conectar con el servidor."
    };
  }
}

async function guardarActividadEspecialBackend(tipo, fecha, hora, horaFin, actividad, editandoId) {
  const usuario = obtenerUsuarioBackendActual();

  if (!usuario) {
    return {
      ok: false,
      mensaje: "No hay usuario conectado al backend."
    };
  }

  const cuerpo = {
    usuarioId: usuario.id,
    tipoActividad: "especial",
    dia: "",
    fecha,
    tipoEspecial: tipo,
    hora,
    horaFin,
    actividad
  };

  try {
    const url = editandoId
      ? `${API_URL}/api/actividades/${editandoId}`
      : `${API_URL}/api/actividades`;

    const metodo = editandoId ? "PUT" : "POST";

    const respuesta = await fetch(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(cuerpo)
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      return {
        ok: false,
        mensaje: data.mensaje || "No se pudo guardar la actividad especial."
      };
    }

    return {
      ok: true,
      data
    };
  } catch (error) {
    console.error("Error al guardar actividad especial:", error);

    return {
      ok: false,
      mensaje: "No se pudo conectar con el servidor."
    };
  }
}

/* =========================
   EDITAR ACTIVIDADES
========================= */
function editarActividadFija(id) {
  localStorage.setItem("editandoActividadFijaId", String(id));
  window.location.href = "organizar_horario.html";
}

function editarActividadEspecial(id) {
  localStorage.setItem("editandoActividadEspecialId", String(id));
  window.location.href = "organizar_horario.html";
}

function mostrarBotonCancelarFija() {
  const botonCancelar = document.getElementById("btnCancelarEdicionFija");
  if (botonCancelar) {
    botonCancelar.style.display = "block";
  }
}

function ocultarBotonCancelarFija() {
  const botonCancelar = document.getElementById("btnCancelarEdicionFija");
  if (botonCancelar) {
    botonCancelar.style.display = "none";
  }
}

function mostrarBotonCancelarEspecial() {
  const botonCancelar = document.getElementById("btnCancelarEdicionEspecial");
  if (botonCancelar) {
    botonCancelar.style.display = "block";
  }
}

function ocultarBotonCancelarEspecial() {
  const botonCancelar = document.getElementById("btnCancelarEdicionEspecial");
  if (botonCancelar) {
    botonCancelar.style.display = "none";
  }
}

function cargarEdicionActividadFija() {
  const idGuardado = localStorage.getItem("editandoActividadFijaId");
  if (!idGuardado) return;

  const actividadesFijas = obtenerActividadesFijas();
  const actividad = actividadesFijas.find((item) => compararId(item.id, idGuardado));
  if (!actividad) return;

  const titulo = document.getElementById("tituloActividadFija");
  const inputId = document.getElementById("editandoActividadFijaId");
  const dia = document.getElementById("diaFijo");
  const hora = document.getElementById("horaFija");
  const horaFin = document.getElementById("horaFinFija");
  const actividadInput = document.getElementById("actividadFija");
  const boton = document.getElementById("btnGuardarActividadFija");

  if (titulo) titulo.textContent = "Editar actividad fija";
  if (inputId) inputId.value = actividad.id;
  if (dia) dia.value = actividad.dia;
  if (hora) hora.value = actividad.hora || "";
  if (horaFin) horaFin.value = actividad.horaFin || "";
  if (actividadInput) actividadInput.value = actividad.actividad;
  if (boton) boton.textContent = "Guardar cambios";

  mostrarBotonCancelarFija();
}

function cargarEdicionActividadEspecial() {
  const idGuardado = localStorage.getItem("editandoActividadEspecialId");
  if (!idGuardado) return;

  const actividadesEspeciales = obtenerActividadesEspeciales();
  const actividad = actividadesEspeciales.find((item) => compararId(item.id, idGuardado));
  if (!actividad) return;

  const titulo = document.getElementById("tituloActividadEspecial");
  const inputId = document.getElementById("editandoActividadEspecialId");
  const tipo = document.getElementById("tipoEspecial");
  const fecha = document.getElementById("fechaEspecial");
  const hora = document.getElementById("horaEspecial");
  const horaFin = document.getElementById("horaFinEspecial");
  const actividadInput = document.getElementById("actividadEspecial");
  const boton = document.getElementById("btnGuardarActividadEspecial");

  if (titulo) titulo.textContent = "Editar actividad especial";
  if (inputId) inputId.value = actividad.id;
  if (tipo) tipo.value = actividad.tipo;
  if (fecha) fecha.value = actividad.fecha;
  if (hora) hora.value = actividad.hora || "";
  if (horaFin) horaFin.value = actividad.horaFin || "";
  if (actividadInput) actividadInput.value = actividad.actividad;
  if (boton) boton.textContent = "Guardar cambios";

  mostrarBotonCancelarEspecial();
}

function limpiarEdicionActividadFija() {
  localStorage.removeItem("editandoActividadFijaId");

  const titulo = document.getElementById("tituloActividadFija");
  const inputId = document.getElementById("editandoActividadFijaId");
  const boton = document.getElementById("btnGuardarActividadFija");

  if (titulo) titulo.textContent = "Agregar actividad fija";
  if (inputId) inputId.value = "";
  if (boton) boton.textContent = "Guardar actividad fija";

  ocultarBotonCancelarFija();
}

function limpiarEdicionActividadEspecial() {
  localStorage.removeItem("editandoActividadEspecialId");

  const titulo = document.getElementById("tituloActividadEspecial");
  const inputId = document.getElementById("editandoActividadEspecialId");
  const boton = document.getElementById("btnGuardarActividadEspecial");

  if (titulo) titulo.textContent = "Agregar actividad especial";
  if (inputId) inputId.value = "";
  if (boton) boton.textContent = "Guardar actividad especial";

  ocultarBotonCancelarEspecial();
}

function cancelarEdicionActividadFija() {
  const form = document.getElementById("actividadFijaForm");
  if (form) form.reset();

  limpiarEdicionActividadFija();
}

function cancelarEdicionActividadEspecial() {
  const form = document.getElementById("actividadEspecialForm");
  if (form) form.reset();

  limpiarEdicionActividadEspecial();
}

async function guardarActividadFija(event) {
  event.preventDefault();

  const diaInput = document.getElementById("diaFijo");
  const horaInput = document.getElementById("horaFija");
  const horaFinInput = document.getElementById("horaFinFija");
  const actividadInput = document.getElementById("actividadFija");
  const editandoIdInput = document.getElementById("editandoActividadFijaId");

  if (!diaInput || !horaInput || !horaFinInput || !actividadInput) return;

  const dia = diaInput.value.trim();
  const hora = horaInput.value.trim();
  const horaFin = horaFinInput.value.trim();
  const actividad = actividadInput.value.trim();
  const editandoId = editandoIdInput ? editandoIdInput.value.trim() : "";

  if (!dia || !hora || !horaFin || !actividad) {
    mostrarToastVitality("Por favor completa todos los campos de la actividad fija.");
    return;
  }

  if (!validarRangoHoras(hora, horaFin)) return;

  const resultado = await guardarActividadFijaBackend(
    dia,
    hora,
    horaFin,
    actividad,
    editandoId
  );

  if (!resultado.ok) {
    mostrarToastVitality(resultado.mensaje);
    return;
  }

  event.target.reset();
  limpiarEdicionActividadFija();
  await sincronizarActividadesBackendConInterfaz();

  mostrarToastVitality(editandoId ? "Actividad fija actualizada en MongoDB." : "Actividad fija guardada en MongoDB.");
}

async function guardarActividadEspecial(event) {
  event.preventDefault();

  const tipoInput = document.getElementById("tipoEspecial");
  const fechaInput = document.getElementById("fechaEspecial");
  const horaInput = document.getElementById("horaEspecial");
  const horaFinInput = document.getElementById("horaFinEspecial");
  const actividadInput = document.getElementById("actividadEspecial");
  const editandoIdInput = document.getElementById("editandoActividadEspecialId");

  if (!tipoInput || !fechaInput || !horaInput || !horaFinInput || !actividadInput) return;

  const tipo = tipoInput.value.trim();
  const fecha = fechaInput.value.trim();
  const hora = horaInput.value.trim();
  const horaFin = horaFinInput.value.trim();
  const actividad = actividadInput.value.trim();
  const editandoId = editandoIdInput ? editandoIdInput.value.trim() : "";

  if (!tipo || !fecha || !hora || !horaFin || !actividad) {
    mostrarToastVitality("Por favor completa todos los campos de la actividad especial.");
    return;
  }

  if (!validarRangoHoras(hora, horaFin)) return;

  const resultado = await guardarActividadEspecialBackend(
    tipo,
    fecha,
    hora,
    horaFin,
    actividad,
    editandoId
  );

  if (!resultado.ok) {
    mostrarToastVitality(resultado.mensaje);
    return;
  }

  event.target.reset();
  limpiarEdicionActividadEspecial();
  await sincronizarActividadesBackendConInterfaz();

  mostrarToastVitality(editandoId ? "Actividad especial actualizada en MongoDB." : "Actividad especial guardada en MongoDB.");
}

async function alternarActividadFija(id) {
  try {
    const respuesta = await fetch(`${API_URL}/api/actividades/${id}/completar`, {
      method: "PATCH"
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      mostrarToastVitality(data.mensaje || "No se pudo actualizar la actividad.");
      return;
    }

    await sincronizarActividadesBackendConInterfaz();
  } catch (error) {
    console.error("Error al completar actividad fija:", error);
    mostrarToastVitality("No se pudo conectar con el servidor. Detalle: " + error.message + " | API_URL: " + API_URL);
  }
}

async function alternarActividadEspecial(id) {
  try {
    const respuesta = await fetch(`${API_URL}/api/actividades/${id}/completar`, {
      method: "PATCH"
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      mostrarToastVitality(data.mensaje || "No se pudo actualizar la actividad.");
      return;
    }

    await sincronizarActividadesBackendConInterfaz();
  } catch (error) {
    console.error("Error al completar actividad especial:", error);
    mostrarToastVitality("No se pudo conectar con el servidor. Detalle: " + error.message + " | API_URL: " + API_URL);
  }
}

async function eliminarActividadFija(id) {
  const confirmar = confirm("¿Seguro que quieres eliminar esta actividad fija?");
  if (!confirmar) return;

  try {
    const respuesta = await fetch(`${API_URL}/api/actividades/${id}`, {
      method: "DELETE"
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      mostrarToastVitality(data.mensaje || "No se pudo eliminar la actividad.");
      return;
    }

    await sincronizarActividadesBackendConInterfaz();
  } catch (error) {
    console.error("Error al eliminar actividad fija:", error);
    mostrarToastVitality("No se pudo conectar con el servidor. Detalle: " + error.message + " | API_URL: " + API_URL);
  }
}

async function eliminarActividadEspecial(id) {
  const confirmar = confirm("¿Seguro que quieres eliminar esta actividad especial?");
  if (!confirmar) return;

  try {
    const respuesta = await fetch(`${API_URL}/api/actividades/${id}`, {
      method: "DELETE"
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      mostrarToastVitality(data.mensaje || "No se pudo eliminar la actividad.");
      return;
    }

    await sincronizarActividadesBackendConInterfaz();
  } catch (error) {
    console.error("Error al eliminar actividad especial:", error);
    mostrarToastVitality("No se pudo conectar con el servidor. Detalle: " + error.message + " | API_URL: " + API_URL);
  }
}

function mostrarActividadesFijas() {
  const contenedor = document.getElementById("listaActividadesFijas");
  if (!contenedor) return;

  const actividadesFijas = obtenerActividadesFijas();

  if (actividadesFijas.length === 0) {
    contenedor.innerHTML = `
      <div class="actividad-card">
        <p>No hay actividades fijas guardadas todavía.</p>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = actividadesFijas
    .map(
      (item) => `
        <div class="actividad-card ${item.completada ? "actividad-completada" : ""}">
          <strong>${escaparHTML(item.dia)}</strong>
          <p><strong>Horario:</strong> ${escaparHTML(obtenerRangoHora(item.hora, item.horaFin))}</p>
          <p>${escaparHTML(item.actividad)}</p>
          <p><strong>Estado:</strong> ${item.completada ? "Realizada" : "Pendiente"}</p>
          <div class="acciones-actividad">
            <button type="button" onclick="alternarActividadFija('${escaparHTML(item.id)}')">
              ${item.completada ? "Desmarcar" : "Completar"}
            </button>
            <button type="button" onclick="editarActividadFija('${escaparHTML(item.id)}')">Editar</button>
            <button type="button" onclick="eliminarActividadFija('${escaparHTML(item.id)}')">Eliminar</button>
          </div>
        </div>
      `
    )
    .join("");
}

function mostrarActividadesEspeciales() {
  const contenedor = document.getElementById("listaActividadesEspeciales");
  if (!contenedor) return;

  const actividadesEspeciales = obtenerActividadesEspeciales();

  if (actividadesEspeciales.length === 0) {
    contenedor.innerHTML = `
      <div class="actividad-card">
        <p>No hay actividades especiales guardadas todavía.</p>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = actividadesEspeciales
    .map(
      (item) => `
        <div class="actividad-card ${item.completada ? "actividad-completada" : ""}">
          <strong>${escaparHTML(item.tipo)}</strong>
          <p>${escaparHTML(item.fecha)}</p>
          <p><strong>Horario:</strong> ${escaparHTML(obtenerRangoHora(item.hora, item.horaFin))}</p>
          <p>${escaparHTML(item.actividad)}</p>
          <p><strong>Estado:</strong> ${item.completada ? "Realizada" : "Pendiente"}</p>
          <div class="acciones-actividad">
            <button type="button" onclick="alternarActividadEspecial('${escaparHTML(item.id)}')">
              ${item.completada ? "Desmarcar" : "Completar"}
            </button>
            <button type="button" onclick="editarActividadEspecial('${escaparHTML(item.id)}')">Editar</button>
            <button type="button" onclick="eliminarActividadEspecial('${escaparHTML(item.id)}')">Eliminar</button>
          </div>
        </div>
      `
    )
    .join("");
}

/* =========================
   ACTIVIDADES DE HOY
========================= */
function obtenerNombreDiaHoy() {
  const dias = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado"
  ];

  const hoy = new Date();
  return dias[hoy.getDay()];
}

function obtenerFechaHoyFormatoInput() {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function obtenerResumenHorarioHoy() {
  const diaHoy = obtenerNombreDiaHoy();
  const fechaHoy = obtenerFechaHoyFormatoInput();

  const actividadesFijasHoy = obtenerActividadesFijas().filter(
    (item) => item.dia === diaHoy
  );

  const actividadesEspecialesHoy = obtenerActividadesEspeciales().filter(
    (item) => item.fecha === fechaHoy
  );

  return {
    fijas: actividadesFijasHoy,
    especiales: actividadesEspecialesHoy,
    total: actividadesFijasHoy.length + actividadesEspecialesHoy.length
  };
}

function obtenerMensajeHorarioHoy() {
  const resumen = obtenerResumenHorarioHoy();

  if (resumen.especiales.length > 0) {
    return "Además, vi que hoy tienes un evento especial en tu horario. Si quieres, también puedo ayudarte a organizar ese día.";
  }

  if (resumen.total >= 4) {
    return "También noto que hoy tienes varias actividades en tu horario. Podemos ordenar tu día para que no se sienta tan pesado.";
  }

  if (resumen.total > 0) {
    return "Veo que hoy tienes algunas actividades registradas. Si quieres, puedo ayudarte a priorizarlas.";
  }

  return "";
}

function mostrarSoloActividadesDeHoy() {
  mostrarActividadesHoy();
  irASeccion("seccionHoy");
}

function mostrarActividadesHoy() {
  const contenedor = document.getElementById("listaActividadesHoy");
  if (!contenedor) return;

  const diaHoy = obtenerNombreDiaHoy();
  const fechaHoy = obtenerFechaHoyFormatoInput();

  const actividadesFijas = obtenerActividadesFijas().filter(
    (item) => item.dia === diaHoy
  );

  const actividadesEspeciales = obtenerActividadesEspeciales().filter(
    (item) => item.fecha === fechaHoy
  );

  const actividadesHoy = [];

  actividadesFijas.forEach((item) => {
    actividadesHoy.push({
      origen: "fija",
      id: item.id,
      tipo: "Fija",
      titulo: `${item.dia} | ${obtenerRangoHora(item.hora, item.horaFin)}`,
      descripcion: item.actividad,
      estado: item.completada ? "Realizada" : "Pendiente",
      completada: item.completada,
      hora: item.hora
    });
  });

  actividadesEspeciales.forEach((item) => {
    actividadesHoy.push({
      origen: "especial",
      id: item.id,
      tipo: item.tipo,
      titulo: `${item.fecha} | ${obtenerRangoHora(item.hora, item.horaFin)}`,
      descripcion: item.actividad,
      estado: item.completada ? "Realizada" : "Pendiente",
      completada: item.completada,
      hora: item.hora
    });
  });

  actividadesHoy.sort((a, b) => (a.hora || "").localeCompare(b.hora || ""));

  if (actividadesHoy.length === 0) {
    contenedor.innerHTML = `
      <div class="actividad-card">
        <p>No hay actividades para hoy.</p>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = actividadesHoy
    .map((item) => {
      const idSeguro = escaparHTML(item.id);
      const botonCompletar =
        item.origen === "fija"
          ? `onclick="alternarActividadFija('${idSeguro}')"`
          : `onclick="alternarActividadEspecial('${idSeguro}')"`;

      const botonEliminar =
        item.origen === "fija"
          ? `onclick="eliminarActividadFija('${idSeguro}')"`
          : `onclick="eliminarActividadEspecial('${idSeguro}')"`;

      const botonEditar =
        item.origen === "fija"
          ? `onclick="editarActividadFija('${idSeguro}')"`
          : `onclick="editarActividadEspecial('${idSeguro}')"`;

      return `
        <div class="actividad-card ${item.completada ? "actividad-completada" : ""}">
          <strong>${escaparHTML(item.tipo)}</strong>
          <p>${escaparHTML(item.titulo)}</p>
          <p>${escaparHTML(item.descripcion)}</p>
          <p><strong>Estado:</strong> ${escaparHTML(item.estado)}</p>
          <div class="acciones-actividad">
            <button type="button" ${botonCompletar}>
              ${item.completada ? "Desmarcar" : "Completar"}
            </button>
            <button type="button" ${botonEditar}>Editar</button>
            <button type="button" ${botonEliminar}>Eliminar</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function mostrarEventosEspecialesHoy() {
  const contenedor = document.getElementById("listaEventosHoy");
  if (!contenedor) return;

  const fechaHoy = obtenerFechaHoyFormatoInput();

  const eventosHoy = obtenerActividadesEspeciales()
    .filter((item) => item.fecha === fechaHoy)
    .sort((a, b) => (a.hora || "").localeCompare(b.hora || ""));

  if (eventosHoy.length === 0) {
    contenedor.innerHTML = `
      <div class="actividad-card">
        <p>No hay eventos especiales para hoy.</p>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = eventosHoy
    .map(
      (item) => `
        <div class="actividad-card evento-destacado ${item.completada ? "actividad-completada" : ""}">
          <strong>${escaparHTML(item.tipo)}</strong>
          <p><strong>Horario:</strong> ${escaparHTML(obtenerRangoHora(item.hora, item.horaFin))}</p>
          <p>${escaparHTML(item.actividad)}</p>
          <p><strong>Estado:</strong> ${item.completada ? "Realizada" : "Pendiente"}</p>
          <div class="acciones-actividad">
            <button type="button" onclick="alternarActividadEspecial('${escaparHTML(item.id)}')">
              ${item.completada ? "Desmarcar" : "Completar"}
            </button>
            <button type="button" onclick="editarActividadEspecial('${escaparHTML(item.id)}')">Editar</button>
            <button type="button" onclick="eliminarActividadEspecial('${escaparHTML(item.id)}')">Eliminar</button>
          </div>
        </div>
      `
    )
    .join("");
}

/* =========================
   CHAT DE APOYO INTELIGENTE
========================= */
let chatState = "inicio";

function obtenerSaludoInicialChat() {
  const checkin = obtenerCheckin();

  if (!checkin) {
    return [
      "Hola, soy Vitality 💚",
      "No encontré un check-in reciente. ¿Te gustaría conversar, organizar tu día o recibir una recomendación?"
    ];
  }

  let mensajePrincipal = "Hola, soy Vitality 💚";
  let mensajeSecundario = "";

  if (checkin.estadoAnimo === "Muy mal" || checkin.estadoAnimo === "Mal") {
    mensajeSecundario = `Vi que hoy te has sentido ${checkin.estadoAnimo.toLowerCase()}. ¿Te gustaría conversar, organizar tu día o recibir una recomendación?`;
  } else if (checkin.nivelEstres === "Alto") {
    mensajeSecundario = "Noté que hoy marcaste estrés alto. ¿Te gustaría conversar, organizar tu día o recibir una recomendación?";
  } else if (checkin.energia === "Baja") {
    mensajeSecundario = "Vi que hoy tienes energía baja. ¿Te gustaría conversar, organizar tu día o recibir una recomendación?";
  } else if (checkin.sueno === "Mal") {
    mensajeSecundario = "Noté que dormiste mal. ¿Te gustaría conversar, organizar tu día o recibir una recomendación?";
  } else if (checkin.estadoAnimo === "Bien" || checkin.estadoAnimo === "Muy bien") {
    mensajeSecundario = `Qué bueno que hoy te sientes ${checkin.estadoAnimo.toLowerCase()}. ¿Te gustaría conversar, organizar tu día o recibir una recomendación?`;
  } else {
    mensajeSecundario = "Gracias por completar tu check-in. ¿Te gustaría conversar, organizar tu día o recibir una recomendación?";
  }

  const mensajeHorario = obtenerMensajeHorarioHoy();

  if (mensajeHorario) {
    return [mensajePrincipal, mensajeSecundario, mensajeHorario];
  }

  return [mensajePrincipal, mensajeSecundario];
}

function iniciarChatInteligente() {
  const chatBox = document.getElementById("chatBox");
  if (!chatBox) return;

  chatState = "inicio";
  const mensajes = obtenerSaludoInicialChat();
  chatBox.innerHTML = "";

  mensajes.forEach((texto) => {
    addMessage(texto, "bot");
  });

  actualizarBotonesChat();
}

async function obtenerRespuestaIAChat(texto) {
  const checkin = obtenerCheckin();

  let actividadesHoy = null;
  let objetivos = [];
  let onboarding = null;

  try {
    if (typeof obtenerResumenHorarioHoy === "function") {
      actividadesHoy = obtenerResumenHorarioHoy();
    }

    if (typeof obtenerObjetivosBackend === "function") {
      objetivos = await obtenerObjetivosBackend();
    }

    if (typeof obtenerOnboardingBackendVitality === "function") {
      onboarding = await obtenerOnboardingBackendVitality();
    }
  } catch (error) {
    console.error("Error preparando contexto para IA:", error);
  }

  const respuesta = await fetch(`${API_URL}/api/ia/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      usuarioId: obtenerUsuarioIdVitality(),
      mensaje: texto,
      checkin,
      actividadesHoy,
      objetivos,
      onboarding
    })
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || "No se pudo obtener respuesta de IA.");
  }

  return {
    respuesta: data.respuesta,
    recomendacionId: data.recomendacionId || null,
    recomendacion: data.recomendacion || null
  };
}
async function sendMessage(event) {
  event.preventDefault();

  const input = document.getElementById("userInput");
  const chatBox = document.getElementById("chatBox");

  if (!input || !chatBox) return;

  const text = input.value.trim();
  if (text === "") return;

  addMessage(text, "user");
  input.value = "";

  const mensajeCargando = document.createElement("div");
  mensajeCargando.classList.add("message", "bot");
  mensajeCargando.innerHTML = "<p>Vitality está pensando...</p>";
  chatBox.appendChild(mensajeCargando);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const resultadoIA = await obtenerRespuestaIAChat(text);

    mensajeCargando.remove();

    addMessage(
      resultadoIA.respuesta,
      "bot",
      resultadoIA.recomendacionId,
      resultadoIA.recomendacion
    );

    actualizarBotonesChat();
  } catch (error) {
    console.error("Error usando IA, se usará respuesta local:", error);

    mensajeCargando.remove();

    const response = generateSupportResponse(text);
    addMessage(response, "bot");
    actualizarBotonesChat();
  }
}function usarOpcionRapida(opcion) {
  const input = document.getElementById("userInput");
  if (!input) return;

  input.value = opcion;

  const eventoFalso = {
    preventDefault: function () {}
  };

  sendMessage(eventoFalso);
}

function actualizarBotonesChat() {
  const contenedor = document.getElementById("chatQuickActions");

  if (!contenedor) {
    return;
  }

  contenedor.innerHTML = "";
  contenedor.style.display = "none";
}

function reiniciarChat() {
  iniciarChatInteligente();
  actualizarBotonesChat();
}

function formatearTextoChat(texto) {
  const textoLimpio = String(texto || "")
    .trim()
    .replace(/\s+([1-9]\))/g, "\n$1")
    .replace(/\s+-\s+/g, "\n- ")
    .replace(/\n{3,}/g, "\n\n");

  return escaparHTML(textoLimpio).replace(/\n/g, "<br>");
}

function addMessage(text, sender, recomendacionId = null, recomendacion = null, guardarMongo = true) {
  const chatBox = document.getElementById("chatBox");

  if (!chatBox) {
    return;
  }

  const message = document.createElement("div");
  message.classList.add("message", sender);

  const paragraph = document.createElement("p");
  paragraph.innerHTML = formatearTextoChat(text);

  message.appendChild(paragraph);

  if (sender === "bot" && recomendacionId) {
    const acciones = crearAccionesRecomendacionChat(
      recomendacionId,
      recomendacion
    );

    message.appendChild(acciones);
  }

  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (guardarMongo && typeof guardarMensajeChatMongoVitality === "function") {
    guardarMensajeChatMongoVitality(
      sender,
      text,
      recomendacionId,
      recomendacion
    );
  }

  if (typeof bajarChatAlUltimoMensajeVitality === "function") {
    bajarChatAlUltimoMensajeVitality();
  }
}function crearAccionesRecomendacionChat(recomendacionId, recomendacion) {
  const contenedor = document.createElement("div");
  contenedor.className = "chat-recomendacion-acciones";

  const texto = document.createElement("p");
  texto.className = "chat-recomendacion-texto";
  texto.textContent = "¿Quieres aplicar esta recomendación?";

  const botonAceptar = document.createElement("button");
  botonAceptar.type = "button";
  botonAceptar.textContent = "Aceptar recomendación";
  botonAceptar.className = "btn-aceptar-recomendacion";
  botonAceptar.addEventListener("click", () => {
    aceptarRecomendacionIAChat(recomendacionId, contenedor);
  });

  const botonRechazar = document.createElement("button");
  botonRechazar.type = "button";
  botonRechazar.textContent = "Rechazar";
  botonRechazar.className = "btn-rechazar-recomendacion";
  botonRechazar.addEventListener("click", () => {
    rechazarRecomendacionIAChat(recomendacionId, contenedor);
  });

  contenedor.appendChild(texto);
  contenedor.appendChild(botonAceptar);
  contenedor.appendChild(botonRechazar);

  return contenedor;
}

function bloquearBotonesRecomendacion(contenedor) {
  const botones = contenedor.querySelectorAll("button");

  botones.forEach((boton) => {
    boton.disabled = true;
  });
}

async function aceptarRecomendacionIAChat(recomendacionId, contenedor) {
  try {
    bloquearBotonesRecomendacion(contenedor);

    const respuesta = await fetch(
      `${API_URL}/api/recomendaciones-ia/${recomendacionId}/aceptar`,
      {
        method: "PATCH"
      }
    );

    const data = await respuesta.json();

    if (!respuesta.ok) {
      mostrarToastVitality(data.mensaje || "No se pudo aceptar la recomendación.");
      return;
    }

    const estado = data.recomendacion?.estado || "aceptada";

    contenedor.innerHTML = `
      <p class="chat-recomendacion-aplicada">
        Recomendación ${estado === "aplicada" ? "aplicada" : "aceptada"} correctamente.
      </p>
    `;

    if (data.resultadoAplicado) {
      mostrarToastVitality("Recomendación aplicada. Revisa tu horario u objetivos.");

      if (typeof sincronizarActividadesBackendConInterfaz === "function") {
        await sincronizarActividadesBackendConInterfaz();
      }

      if (typeof mostrarObjetivosPersonales === "function") {
        await mostrarObjetivosPersonales();
      }
    } else {
      mostrarToastVitality("Recomendación aceptada correctamente.");
    }
  } catch (error) {
    console.error("Error al aceptar recomendación IA:", error);
    mostrarToastVitality("No se pudo conectar con el servidor.");
  }
}

async function rechazarRecomendacionIAChat(recomendacionId, contenedor) {
  try {
    bloquearBotonesRecomendacion(contenedor);

    const respuesta = await fetch(
      `${API_URL}/api/recomendaciones-ia/${recomendacionId}/rechazar`,
      {
        method: "PATCH"
      }
    );

    const data = await respuesta.json();

    if (!respuesta.ok) {
      mostrarToastVitality(data.mensaje || "No se pudo rechazar la recomendación.");
      return;
    }

    contenedor.innerHTML = `
      <p class="chat-recomendacion-rechazada">
        Recomendación rechazada.
      </p>
    `;

    mostrarToastVitality("Recomendación rechazada.");
  } catch (error) {
    console.error("Error al rechazar recomendación IA:", error);
    mostrarToastVitality("No se pudo conectar con el servidor.");
  }
}
function detectarIntencionPrincipal(msg) {
  if (
    msg.includes("organizar") ||
    msg.includes("organización") ||
    msg.includes("horario") ||
    msg.includes("pendiente") ||
    msg.includes("actividad") ||
    msg.includes("solemne") ||
    msg.includes("prueba")
  ) {
    return "organizacion";
  }

  if (
    msg.includes("recomend") ||
    msg.includes("consejo") ||
    msg.includes("suger") ||
    msg.includes("qué hago") ||
    msg.includes("que hago")
  ) {
    return "recomendacion";
  }

  if (
    msg.includes("convers") ||
    msg.includes("hablar") ||
    msg.includes("acompaña") ||
    msg.includes("acompana") ||
    msg.includes("escuchar")
  ) {
    return "conversacion";
  }

  return null;
}

function responderSegunCheckin() {
  const checkin = obtenerCheckin();

  if (!checkin) {
    return "Cuéntame un poco más sobre cómo te has sentido hoy.";
  }

  if (checkin.nivelEstres === "Alto") {
    return "Como hoy marcaste estrés alto, quiero ir con calma contigo. ¿Qué te está pesando más ahora mismo?";
  }

  if (checkin.estadoAnimo === "Mal" || checkin.estadoAnimo === "Muy mal") {
    return "Estoy aquí contigo. ¿Quieres contarme qué fue lo más difícil de tu día?";
  }

  if (checkin.energia === "Baja") {
    return "Noté que hoy tienes poca energía. ¿Sientes más cansancio físico o mental?";
  }

  if (checkin.sueno === "Mal") {
    return "Dormir mal afecta bastante el día. ¿Has sentido más sueño, irritación o poca concentración?";
  }

  return "Cuéntame, ¿qué ha sido lo más importante de tu día?";
}

function responderOrganizacion() {
  const resumenHorario = obtenerResumenHorarioHoy();

  if (resumenHorario.especiales.length > 0) {
    return "Hoy tienes un evento especial en tu horario. Yo te recomendaría partir por eso, luego dejar una tarea importante y después una pausa breve. ¿Quieres que lo ordenemos juntas?";
  }

  if (resumenHorario.total >= 4) {
    return "Hoy tienes varias actividades. Lo mejor sería dividir tu día en tres partes: primero lo urgente, después lo importante y luego lo que puede esperar. ¿Quieres empezar por identificar qué es urgente?";
  }

  if (resumenHorario.total > 0) {
    return "Veo que hoy tienes algunas actividades registradas. Puedes partir por la más importante o por la más corta, según cómo te sientas ahora. ¿Qué prefieres?";
  }

  return "No veo muchas actividades registradas para hoy. Podemos armar una mini planificación simple: una tarea importante, una secundaria y un momento de descanso. ¿Te gustaría eso?";
}

function responderRecomendacion() {
  const checkin = obtenerCheckin();

  if (!checkin) {
    return "Te recomendaría algo simple para hoy: respirar un poco, tomar agua, y darte un momento para bajar el ritmo. Después puedes decidir qué hacer con más calma.";
  }

  if (checkin.nivelEstres === "Alto") {
    return "Mi recomendación para hoy sería bajar un poco la carga del momento: respira profundo, aléjate unos minutos de lo que te tensiona y enfócate solo en una cosa a la vez.";
  }

  if (checkin.energia === "Baja") {
    return "Como hoy tienes energía baja, te recomendaría no exigirte con todo al mismo tiempo. Parte por una tarea pequeña, luego descansa un poco y después evalúa cómo sigues.";
  }

  if (checkin.sueno === "Mal") {
    return "Como dormiste mal, hoy te conviene priorizar lo esencial, hidratarte bien y evitar sobrecargarte más de la cuenta.";
  }

  if (checkin.estadoAnimo === "Mal" || checkin.estadoAnimo === "Muy mal") {
    return "Hoy te recomendaría darte un espacio amable: hacer una pausa, escuchar música tranquila, conversar con alguien de confianza o simplemente bajar la exigencia por un rato.";
  }

  return "Como hoy te has sentido relativamente bien, te recomendaría aprovechar este momento para organizar una o dos cosas importantes y dejar también un espacio para algo que disfrutes.";
}

function generateSupportResponse(text) {
  const msg = text.toLowerCase().trim();
  const intencion = detectarIntencionPrincipal(msg);

  if (chatState === "inicio") {
    if (intencion === "conversacion") {
      chatState = "conversacion";
      return responderSegunCheckin();
    }

    if (intencion === "organizacion") {
      chatState = "organizacion";
      return responderOrganizacion();
    }

    if (intencion === "recomendacion") {
      chatState = "recomendacion";
      return responderRecomendacion();
    }

    if (msg.includes("sí") || msg.includes("si")) {
      return "Perfecto. Puedes elegir entre conversar, organizar tu día o recibir una recomendación.";
    }

    return "Puedo ayudarte de tres formas: conversar, organizar tu día o darte una recomendación. ¿Cuál prefieres?";
  }

  if (chatState === "conversacion") {
    if (msg.includes("organizar") || msg.includes("horario") || msg.includes("pendiente")) {
      chatState = "organizacion";
      return responderOrganizacion();
    }

    if (msg.includes("recomend") || msg.includes("consejo") || msg.includes("suger")) {
      chatState = "recomendacion";
      return responderRecomendacion();
    }

    if (
      msg.includes("triste") ||
      msg.includes("mal") ||
      msg.includes("cansad") ||
      msg.includes("estres") ||
      msg.includes("estrés") ||
      msg.includes("ansiedad")
    ) {
      return "Gracias por contármelo. No tienes que resolver todo ahora mismo. Podemos seguir hablando o, si prefieres, también puedo ayudarte a ordenar tu día.";
    }

    return "Te estoy leyendo. Si quieres, puedes contarme un poco más, o también puedo cambiar y ayudarte a organizar tu día o darte una recomendación.";
  }

  if (chatState === "organizacion") {
    if (msg.includes("sí") || msg.includes("si")) {
      return "Perfecto. Entonces partamos por esto: dime cuál es tu tarea o actividad más urgente de hoy.";
    }

    if (msg.includes("no")) {
      return "Está bien. Entonces podemos volver a conversar con calma o puedo darte una recomendación simple para hoy.";
    }

    if (msg.includes("prueba") || msg.includes("solemne")) {
      return "Si tienes una prueba o solemne, esa debería ir primero. Después intenta dejar solo una tarea importante más y no llenarte de cosas secundarias.";
    }

    return "Para organizarte mejor, piensa en este orden: primero lo urgente, luego lo importante y después lo opcional. Si quieres, dime qué tienes pendiente y te ayudo a priorizar.";
  }

  if (chatState === "recomendacion") {
    if (msg.includes("otra")) {
      return "Claro. Otra recomendación útil para hoy sería bajar un poco el ritmo y elegir solo una meta pequeña y realista para sentir más control.";
    }

    if (msg.includes("gracias")) {
      return "De nada 💚 Si quieres después podemos seguir conversando o ayudarte a organizar lo que te queda del día.";
    }

    return "Si quieres, también puedo darte una recomendación más emocional o una más práctica para organizar tu día. ¿Cuál prefieres?";
  }

  return "Estoy aquí para ayudarte. ¿Prefieres conversar, organizar tu día o recibir una recomendación?";
}

/* =========================
   NOTIFICACIONES VISUALES
========================= */
function crearContenedorNotificaciones() {
  let contenedor = document.getElementById("notificacionesVitality");

  if (!contenedor) {
    contenedor = document.createElement("div");
    contenedor.id = "notificacionesVitality";
    contenedor.className = "notificaciones-vitality";
    document.body.appendChild(contenedor);
  }

  return contenedor;
}

function cerrarNotificacionVitality(boton) {
  sessionStorage.setItem("notificacionesVitalityCerradas", "true");

  const notificacion = boton.closest(".notificacion-vitality");

  if (notificacion) {
    notificacion.remove();
  }

  const contenedor = document.getElementById("notificacionesVitality");

  if (contenedor && contenedor.children.length === 0) {
    contenedor.remove();
  }
}

function mostrarNotificacionVitality(titulo, mensaje, tipo = "info") {
  const notificacionesCerradas = sessionStorage.getItem("notificacionesVitalityCerradas");

  if (notificacionesCerradas === "true") {
    return;
  }

  const contenedor = crearContenedorNotificaciones();

  const notificacion = document.createElement("div");
  notificacion.className = `notificacion-vitality notificacion-${tipo}`;

  notificacion.innerHTML = `
    <div class="notificacion-header">
      <strong>${escaparHTML(titulo)}</strong>
      <button
        type="button"
        class="cerrar-notificacion"
        onclick="cerrarNotificacionVitality(this)"
        aria-label="Cerrar notificación"
      >
        ×
      </button>
    </div>
    <p>${escaparHTML(mensaje)}</p>
  `;

  contenedor.appendChild(notificacion);

  setTimeout(() => {
    if (notificacion.parentElement) {
      notificacion.remove();
    }

    if (contenedor.children.length === 0) {
      contenedor.remove();
    }
  }, 7000);
}

function obtenerActividadesHoyOrdenadas() {
  const resumenHorario = obtenerResumenHorarioHoy();
  const actividadesHoy = [];

  resumenHorario.fijas.forEach((actividad) => {
    if (!actividad.completada) {
      actividadesHoy.push({
        tipo: "Actividad fija",
        hora: actividad.hora,
        horaFin: actividad.horaFin,
        nombre: actividad.actividad
      });
    }
  });

  resumenHorario.especiales.forEach((actividad) => {
    if (!actividad.completada) {
      actividadesHoy.push({
        tipo: actividad.tipo || "Actividad especial",
        hora: actividad.hora,
        horaFin: actividad.horaFin,
        nombre: actividad.actividad
      });
    }
  });

  actividadesHoy.sort((a, b) => (a.hora || "").localeCompare(b.hora || ""));

  return actividadesHoy;
}

function generarNotificacionesAutomaticas() {
  const notificacionesCerradas = sessionStorage.getItem("notificacionesVitalityCerradas");

  if (notificacionesCerradas === "true") {
    return;
  }

  const checkin = obtenerCheckin();
  const actividadesHoy = obtenerActividadesHoyOrdenadas();

  if (actividadesHoy.length > 0) {
    const primeraActividad = actividadesHoy[0];

    mostrarNotificacionVitality(
      "📅 Próxima actividad",
      `De ${obtenerRangoHora(primeraActividad.hora, primeraActividad.horaFin)} tienes: ${primeraActividad.nombre}.`,
      "info"
    );

    if (actividadesHoy.length > 1) {
      mostrarNotificacionVitality(
        "🔔 Actividades pendientes",
        `Además tienes ${actividadesHoy.length - 1} actividad(es) más pendiente(s) para hoy.`,
        "info"
      );
    }
  }

  if (checkin) {
    if (checkin.nivelEstres === "Alto" && actividadesHoy.length > 0) {
      mostrarNotificacionVitality(
        "⚠️ Recomendación Vitality",
        "Como hoy registraste estrés alto, intenta hacer una pausa breve antes de comenzar tu próxima actividad.",
        "alerta"
      );
    } else if (checkin.nivelEstres === "Alto") {
      mostrarNotificacionVitality(
        "⚠️ Estrés alto detectado",
        "Hoy registraste estrés alto. Te recomendamos hacer una pausa breve antes de continuar.",
        "alerta"
      );
    }

    if (checkin.energia === "Baja" && actividadesHoy.length > 0) {
      mostrarNotificacionVitality(
        "💡 Energía baja",
        "Tu energía está baja hoy. Prioriza la actividad más importante y deja espacio para descansar.",
        "info"
      );
    } else if (checkin.energia === "Baja") {
      mostrarNotificacionVitality(
        "💡 Energía baja",
        "Tu energía está baja hoy. Intenta priorizar solo lo más importante.",
        "info"
      );
    }

    if (checkin.sueno === "Mal") {
      mostrarNotificacionVitality(
        "😴 Descanso insuficiente",
        "Dormiste mal. Trata de no sobrecargarte y organiza tu día con calma.",
        "alerta"
      );
    }

    if (checkin.estadoAnimo === "Mal" || checkin.estadoAnimo === "Muy mal") {
      mostrarNotificacionVitality(
        "💚 Apoyo emocional",
        "Hoy no te has sentido bien. Puedes usar el chat de apoyo para conversar un momento.",
        "peligro"
      );
    }
  }

  if (!checkin && actividadesHoy.length === 0) {
    mostrarNotificacionVitality(
      "💚 Bienvenida a Vitality",
      "Completa tu check-in y agrega actividades para recibir recomendaciones personalizadas.",
      "info"
    );
  }
}

/* =========================
   PANEL AVANZADO DEL PERFIL
========================= */
function contarActividadesHoyPerfil() {
  const resumen = obtenerResumenHorarioHoy();

  const actividadesHoy = [
    ...resumen.fijas,
    ...resumen.especiales
  ];

  const completadas = actividadesHoy.filter((item) => item.completada).length;
  const pendientes = actividadesHoy.filter((item) => !item.completada).length;

  return {
    total: actividadesHoy.length,
    completadas,
    pendientes
  };
}

function obtenerProximaActividadPerfil() {
  const actividadesHoy = obtenerActividadesHoyOrdenadas();

  if (actividadesHoy.length === 0) {
    return null;
  }

  return actividadesHoy[0];
}

function obtenerRecomendacionPerfil(checkin, pendientes) {
  if (!checkin) {
    return "Completa tu check-in diario para que Vitality pueda entregarte una recomendación según tu estado emocional, energía, sueño y nivel de estrés.";
  }

  if (checkin.nivelEstres === "Alto" && checkin.energia === "Baja") {
    return "Hoy registraste estrés alto y energía baja. Te recomendamos priorizar solo lo más importante, tomar una pausa breve y evitar sobrecargarte.";
  }

  if (checkin.nivelEstres === "Alto" && pendientes > 0) {
    return "Hoy tienes estrés alto y actividades pendientes. Intenta ordenar tu día empezando por una sola tarea importante y dejando pausas entre actividades.";
  }

  if (checkin.sueno === "Mal") {
    return "Como dormiste mal, te recomendamos reducir la exigencia del día, hidratarte bien y dejar espacio para descansar.";
  }

  if (checkin.estadoAnimo === "Mal" || checkin.estadoAnimo === "Muy mal") {
    return "Hoy no te has sentido bien. Puede ayudarte hablar con alguien de confianza, tomar una pausa o usar el chat de apoyo de Vitality.";
  }

  if (checkin.energia === "Baja") {
    return "Tu energía está baja hoy. Parte por una tarea pequeña y realista, luego descansa antes de continuar.";
  }

  if (pendientes > 0) {
    return "Tienes actividades pendientes para hoy. Te recomendamos comenzar por la más importante y marcarla como completada cuando termines.";
  }

  return "Tu check-in no muestra alertas importantes. Mantén tus hábitos, organiza tus tiempos y deja un espacio para algo que disfrutes.";
}

function obtenerNivelBienestar(checkin) {
  if (!checkin) {
    return {
      nivel: "Sin datos suficientes",
      descripcion: "Completa tu check-in para estimar tu nivel de bienestar del día."
    };
  }

  let puntaje = 0;

  if (checkin.estadoAnimo === "Muy bien") puntaje += 2;
  if (checkin.estadoAnimo === "Bien") puntaje += 1;
  if (checkin.estadoAnimo === "Mal") puntaje -= 1;
  if (checkin.estadoAnimo === "Muy mal") puntaje -= 2;

  if (checkin.nivelEstres === "Bajo") puntaje += 1;
  if (checkin.nivelEstres === "Alto") puntaje -= 2;

  if (checkin.sueno === "Bien") puntaje += 1;
  if (checkin.sueno === "Mal") puntaje -= 1;

  if (checkin.energia === "Alta") puntaje += 1;
  if (checkin.energia === "Baja") puntaje -= 1;

  if (puntaje >= 3) {
    return {
      nivel: "Alto",
      descripcion: "Hoy tu bienestar general se ve favorable según tu último check-in."
    };
  }

  if (puntaje >= 0) {
    return {
      nivel: "Medio",
      descripcion: "Tu bienestar se ve estable, aunque podrías cuidar tus pausas y tu organización."
    };
  }

  return {
    nivel: "Bajo",
    descripcion: "Tu check-in muestra señales de cansancio, estrés o bajo ánimo. Conviene bajar la carga y buscar apoyo si lo necesitas."
  };
}

function mostrarPanelPerfilAvanzado() {
  const checkin = obtenerCheckin();
  const conteo = contarActividadesHoyPerfil();
  const proxima = obtenerProximaActividadPerfil();
  const bienestar = obtenerNivelBienestar(checkin);

  const perfilEstadoActual = document.getElementById("perfilEstadoActual");

  const perfilResumenEstado = document.getElementById("perfilResumenEstado");
  const perfilResumenEstres = document.getElementById("perfilResumenEstres");
  const perfilResumenSueno = document.getElementById("perfilResumenSueno");
  const perfilResumenEnergia = document.getElementById("perfilResumenEnergia");

  const perfilTotalActividades = document.getElementById("perfilTotalActividades");
  const perfilActividadesPendientes = document.getElementById("perfilActividadesPendientes");
  const perfilActividadesCompletadas = document.getElementById("perfilActividadesCompletadas");

  const perfilProximaActividad = document.getElementById("perfilProximaActividad");
  const perfilProximaHora = document.getElementById("perfilProximaHora");
  const perfilProximaTipo = document.getElementById("perfilProximaTipo");

  const perfilRecomendacion = document.getElementById("perfilRecomendacion");
  const perfilNivelBienestar = document.getElementById("perfilNivelBienestar");
  const perfilDescripcionBienestar = document.getElementById("perfilDescripcionBienestar");

  if (checkin) {
    if (perfilEstadoActual) perfilEstadoActual.textContent = checkin.estadoAnimo;
    if (perfilResumenEstado) perfilResumenEstado.textContent = checkin.estadoAnimo;
    if (perfilResumenEstres) perfilResumenEstres.textContent = checkin.nivelEstres;
    if (perfilResumenSueno) perfilResumenSueno.textContent = checkin.sueno;
    if (perfilResumenEnergia) perfilResumenEnergia.textContent = checkin.energia;
  }

  if (perfilTotalActividades) perfilTotalActividades.textContent = conteo.total;
  if (perfilActividadesPendientes) perfilActividadesPendientes.textContent = conteo.pendientes;
  if (perfilActividadesCompletadas) perfilActividadesCompletadas.textContent = conteo.completadas;

  if (proxima) {
    if (perfilProximaActividad) perfilProximaActividad.textContent = proxima.nombre;
    if (perfilProximaHora) perfilProximaHora.textContent = obtenerRangoHora(proxima.hora, proxima.horaFin);
    if (perfilProximaTipo) perfilProximaTipo.textContent = proxima.tipo;
  } else {
    if (perfilProximaActividad) perfilProximaActividad.textContent = "No hay actividades pendientes para hoy";
    if (perfilProximaHora) perfilProximaHora.textContent = "Sin horario";
    if (perfilProximaTipo) perfilProximaTipo.textContent = "Sin tipo";
  }

  if (perfilRecomendacion) {
    perfilRecomendacion.textContent = obtenerRecomendacionPerfil(checkin, conteo.pendientes);
  }

  if (perfilNivelBienestar) {
    perfilNivelBienestar.textContent = bienestar.nivel;
  }

  if (perfilDescripcionBienestar) {
    perfilDescripcionBienestar.textContent = bienestar.descripcion;
  }
}

/* =========================
   TABLA SEMANAL DINÁMICA
========================= */
function obtenerIndiceDia(dia) {
  const dias = {
    "Lunes": 1,
    "Martes": 2,
    "Miércoles": 3,
    "Jueves": 4,
    "Viernes": 5,
    "Sábado": 6,
    "Domingo": 7
  };

  return dias[dia] || null;
}

function obtenerHorasActividadesFijas() {
  const actividadesFijas = obtenerActividadesFijas();

  const horas = actividadesFijas
    .map((actividad) => actividad.hora)
    .filter((hora) => hora && hora.trim() !== "");

  const horasUnicas = [...new Set(horas)];
  horasUnicas.sort((a, b) => a.localeCompare(b));

  return horasUnicas;
}

function crearFilaHorario(hora) {
  return `
    <tr>
      <td>${escaparHTML(hora)}</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
  `;
}

function rellenarTablaHorarioSemanal() {
  const tabla = document.getElementById("tablaHorarioSemanal");
  if (!tabla) return;

  const tbody = tabla.querySelector("tbody");
  if (!tbody) return;

  const actividadesFijas = obtenerActividadesFijas();
  const horas = obtenerHorasActividadesFijas();

  if (actividadesFijas.length === 0 || horas.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">No hay actividades fijas registradas.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = horas.map((hora) => crearFilaHorario(hora)).join("");

  const filas = tbody.querySelectorAll("tr");

  actividadesFijas.forEach((actividad) => {
    const indiceDia = obtenerIndiceDia(actividad.dia);
    if (!indiceDia) return;

    filas.forEach((fila) => {
      const celdas = fila.querySelectorAll("td");
      const horaFila = celdas[0]?.textContent.trim();

      if (horaFila === actividad.hora && celdas[indiceDia]) {
        const textoActividad = actividad.completada
          ? `${actividad.actividad} (${obtenerRangoHora(actividad.hora, actividad.horaFin)}) ✓`
          : `${actividad.actividad} (${obtenerRangoHora(actividad.hora, actividad.horaFin)})`;

        if (celdas[indiceDia].textContent.trim() !== "") {
          celdas[indiceDia].textContent += " / " + textoActividad;
        } else {
          celdas[indiceDia].textContent = textoActividad;
        }
      }
    });
  });
}

/* =========================
   CARGA INICIAL
========================= */
window.addEventListener("DOMContentLoaded", async () => {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  }

  const registroForm = document.getElementById("registroForm");
  if (registroForm) {
    registroForm.addEventListener("submit", registrarUsuario);
  }

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", iniciarSesion);
  }

  const perfilForm = document.getElementById("perfilForm");
  if (perfilForm) {
    perfilForm.addEventListener("submit", guardarDatosPerfil);
  }

  const checkinForm = document.getElementById("checkinForm");
  if (checkinForm) {
    checkinForm.addEventListener("submit", guardarDatosCheckin);
  }

  const actividadFijaForm = document.getElementById("actividadFijaForm");
  if (actividadFijaForm) {
    actividadFijaForm.addEventListener("submit", guardarActividadFija);
  }

  const actividadEspecialForm = document.getElementById("actividadEspecialForm");
  if (actividadEspecialForm) {
    actividadEspecialForm.addEventListener("submit", guardarActividadEspecial);
  }

  await obtenerPerfilBackend();
  await obtenerUltimoCheckinBackend();
  await obtenerActividadesBackend();

  cargarEdicionActividadFija();
  cargarEdicionActividadEspecial();

  await mostrarDatosPerfil();
  mostrarResumenCheckinEnPerfil();
  mostrarPanelPerfilAvanzado();
  mostrarAlertas();
  mostrarActividadesFijas();
  mostrarActividadesEspeciales();
  mostrarActividadesHoy();
  mostrarEventosEspecialesHoy();
  rellenarTablaHorarioSemanal();
  iniciarChatInteligente();
  const paginaActualNotificaciones = obtenerPaginaActual();
  const paginasConNotificaciones = [
    "horario.html",
    "perfil.html",
    "alertas.html",
    "chat.html",
    "uso_apps.html"
  ];

  if (paginasConNotificaciones.includes(paginaActualNotificaciones)) {
    generarNotificacionesAutomaticas();
  }
});
/* =========================
   CONTROL DE SESIÓN Y PROTECCIÓN DE PÁGINAS
========================= */
function obtenerPaginaActual() {
  const ruta = window.location.pathname;
  const pagina = ruta.substring(ruta.lastIndexOf("/") + 1);

  return pagina || "index.html";
}

function paginaRequiereSesion(pagina) {
  const paginasProtegidas = [
    "perfil.html",
    "checkin.html",
    "horario.html",
    "organizar_horario.html",
    "alertas.html",
    "chat.html"
  ];

  return paginasProtegidas.includes(pagina);
}

function protegerPaginaActual() {
  const pagina = obtenerPaginaActual();
  const usuario = obtenerUsuario();

  if (paginaRequiereSesion(pagina) && !usuario) {
    mostrarToastVitality("Debes iniciar sesión para acceder a esta página.");
    window.location.href = "index.html";
  }
}

function cerrarSesion() {
  localStorage.removeItem("usuarioVitality");
  localStorage.removeItem("perfilVitality");
  localStorage.removeItem("checkinVitality");
  localStorage.removeItem("actividadesFijasVitality");
  localStorage.removeItem("actividadesEspecialesVitality");
  localStorage.removeItem("editandoActividadFijaId");
  localStorage.removeItem("editandoActividadEspecialId");

  sessionStorage.removeItem("notificacionesVitalityCerradas");

  mostrarToastVitality("Sesión cerrada correctamente.");
  window.location.href = "index.html";
}

window.addEventListener("DOMContentLoaded", () => {
  protegerPaginaActual();
});
/* =========================
   HISTORIAL EMOCIONAL EN PERFIL
========================= */
function historialEscaparTexto(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function historialFormatearFecha(fecha) {
  if (!fecha) return "Sin fecha";

  const fechaObjeto = new Date(fecha);

  if (Number.isNaN(fechaObjeto.getTime())) {
    return "Sin fecha";
  }

  return fechaObjeto.toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

async function obtenerHistorialCheckinsBackend() {
  const usuarioId = obtenerUsuarioIdVitality();

if (!usuarioId) {
  return false;
}

  try {
    const respuesta = await fetch(`${API_URL}/api/checkins/historial/${usuario.id}`);
    const data = await respuesta.json();

    if (!respuesta.ok) {
      console.error("Error al obtener historial emocional:", data);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Error al conectar con el historial emocional:", error);
    return [];
  }
}

async function mostrarHistorialCheckins() {
  const contenedor = document.getElementById("historialCheckinsContainer");

  if (!contenedor) return;

  const historial = await obtenerHistorialCheckinsBackend();

  if (!historial || historial.length === 0) {
    contenedor.innerHTML = `
      <div class="historial-item">
        <p>No hay check-ins registrados todavía.</p>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = historial
    .map((checkin) => {
      const fecha = historialFormatearFecha(checkin.createdAt || checkin.fecha);

      return `
        <div class="historial-item">
          <h3>${historialEscaparTexto(fecha)}</h3>
          <p><strong>Estado emocional:</strong> ${historialEscaparTexto(checkin.estadoAnimo)}</p>
          <p><strong>Estrés:</strong> ${historialEscaparTexto(checkin.nivelEstres)}</p>
          <p><strong>Sueño:</strong> ${historialEscaparTexto(checkin.sueno)}</p>
          <p><strong>Energía:</strong> ${historialEscaparTexto(checkin.energia)}</p>
        </div>
      `;
    })
    .join("");
}

window.addEventListener("DOMContentLoaded", () => {
  mostrarHistorialCheckins();
});
/* =========================
   ESTADÍSTICAS EMOCIONALES EN PERFIL
========================= */
function estadisticasEscaparTexto(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function estadisticasFormatearFecha(fecha) {
  if (!fecha) return "Sin fecha";

  const fechaObjeto = new Date(fecha);

  if (Number.isNaN(fechaObjeto.getTime())) {
    return "Sin fecha";
  }

  return fechaObjeto.toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function obtenerUsuarioEstadisticas() {
  try {
    const usuarioGuardado = localStorage.getItem("usuarioVitality");
    return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  } catch (error) {
    console.error("Error al obtener usuario para estadísticas:", error);
    return null;
  }
}

async function obtenerHistorialCheckinsParaEstadisticas() {
  const usuario = obtenerUsuarioEstadisticas();

  if (!usuario || !usuario.id) {
    return [];
  }

  try {
    const respuesta = await fetch(`${API_URL}/api/checkins/historial/${usuario.id}`);
    const data = await respuesta.json();

    if (!respuesta.ok) {
      console.error("Error al obtener historial emocional:", data);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Error al conectar con historial emocional:", error);
    return [];
  }
}

function obtenerValorMasFrecuente(lista) {
  if (!lista || lista.length === 0) {
    return "Sin datos";
  }

  const conteo = {};

  lista.forEach((valor) => {
    if (!valor) return;
    conteo[valor] = (conteo[valor] || 0) + 1;
  });

  let valorMasFrecuente = "Sin datos";
  let mayorCantidad = 0;

  Object.entries(conteo).forEach(([valor, cantidad]) => {
    if (cantidad > mayorCantidad) {
      valorMasFrecuente = valor;
      mayorCantidad = cantidad;
    }
  });

  return valorMasFrecuente;
}

function calcularPorcentaje(cantidad, total) {
  if (!total || total === 0) return 0;
  return Math.round((cantidad / total) * 100);
}

function generarLecturaEstadisticas(historial) {
  if (!historial || historial.length === 0) {
    return "Aún no hay información suficiente para generar una lectura emocional.";
  }

  const total = historial.length;

  const estresAlto = historial.filter((item) => item.nivelEstres === "Alto").length;
  const energiaBaja = historial.filter((item) => item.energia === "Baja").length;
  const malSueno = historial.filter((item) => item.sueno === "Mal").length;
  const animoBajo = historial.filter(
    (item) => item.estadoAnimo === "Mal" || item.estadoAnimo === "Muy mal"
  ).length;

  if (estresAlto >= Math.ceil(total / 2)) {
    return "En varios check-ins aparece estrés alto. Sería recomendable cuidar las pausas y evitar sobrecargar el día.";
  }

  if (energiaBaja >= Math.ceil(total / 2)) {
    return "Se observa energía baja de forma frecuente. Podría ser útil priorizar tareas importantes y dejar espacios de descanso.";
  }

  if (malSueno >= Math.ceil(total / 2)) {
    return "El sueño aparece como un factor importante. Dormir mejor podría ayudarte a mejorar tu energía y concentración.";
  }

  if (animoBajo >= Math.ceil(total / 2)) {
    return "Tu historial muestra varios registros de bajo ánimo. Puede ayudarte conversar con alguien de confianza o usar el chat de apoyo.";
  }

  return "Tu historial emocional se ve relativamente estable. Sigue registrando tus check-ins para tener una visión más completa.";
}

async function mostrarEstadisticasEmocionales() {
  const contenedor = document.getElementById("estadisticasEmocionalesContainer");

  if (!contenedor) return;

  const historial = await obtenerHistorialCheckinsParaEstadisticas();

  if (!historial || historial.length === 0) {
    contenedor.innerHTML = `
      <div class="estadistica-emocional-item">
        <h3>Sin datos</h3>
        <p>Completa tu check-in diario para generar estadísticas emocionales.</p>
      </div>
    `;
    return;
  }

  const total = historial.length;
  const ultimoCheckin = historial[0];

  const estados = historial.map((item) => item.estadoAnimo);
  const estadoMasFrecuente = obtenerValorMasFrecuente(estados);

  const cantidadEstresAlto = historial.filter(
    (item) => item.nivelEstres === "Alto"
  ).length;

  const cantidadEnergiaBaja = historial.filter(
    (item) => item.energia === "Baja"
  ).length;

  const porcentajeEstresAlto = calcularPorcentaje(cantidadEstresAlto, total);
  const porcentajeEnergiaBaja = calcularPorcentaje(cantidadEnergiaBaja, total);

  const ultimaFecha = estadisticasFormatearFecha(
    ultimoCheckin.createdAt || ultimoCheckin.fecha
  );

  const lectura = generarLecturaEstadisticas(historial);

  contenedor.innerHTML = `
    <div class="estadistica-emocional-item">
      <h3>${total}</h3>
      <p>Total de check-ins mostrados</p>
    </div>

    <div class="estadistica-emocional-item">
      <h3>${estadisticasEscaparTexto(estadoMasFrecuente)}</h3>
      <p>Estado emocional más frecuente</p>
    </div>

    <div class="estadistica-emocional-item">
      <h3>${cantidadEstresAlto}</h3>
      <p>Veces con estrés alto (${porcentajeEstresAlto}%)</p>
    </div>

    <div class="estadistica-emocional-item">
      <h3>${cantidadEnergiaBaja}</h3>
      <p>Veces con energía baja (${porcentajeEnergiaBaja}%)</p>
    </div>

    <div class="estadistica-emocional-item estadistica-emocional-ancha">
      <h3>Último registro</h3>
      <p>${estadisticasEscaparTexto(ultimaFecha)}</p>
    </div>

    <div class="estadistica-emocional-item estadistica-emocional-ancha">
      <h3>Lectura general</h3>
      <p>${estadisticasEscaparTexto(lectura)}</p>
    </div>
  `;
}

function iniciarEstadisticasEmocionales() {
  mostrarEstadisticasEmocionales();
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", iniciarEstadisticasEmocionales);
} else {
  iniciarEstadisticasEmocionales();
}
/* =========================
   TENDENCIA EMOCIONAL EN PERFIL
========================= */
function obtenerPuntajeEstadoEmocional(estado) {
  const valores = {
    "Muy mal": 1,
    "Mal": 2,
    "Normal": 3,
    "Bien": 4,
    "Muy bien": 5
  };

  return valores[estado] || 3;
}

function obtenerColorClaseEstado(estado) {
  if (estado === "Muy mal") return "tendencia-muy-mal";
  if (estado === "Mal") return "tendencia-mal";
  if (estado === "Normal") return "tendencia-normal";
  if (estado === "Bien") return "tendencia-bien";
  if (estado === "Muy bien") return "tendencia-muy-bien";

  return "tendencia-normal";
}

function formatearFechaTendencia(fecha) {
  if (!fecha) return "Sin fecha";

  const fechaObjeto = new Date(fecha);

  if (Number.isNaN(fechaObjeto.getTime())) {
    return "Sin fecha";
  }

  return fechaObjeto.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit"
  });
}

function escaparTextoTendencia(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function obtenerHistorialCheckinsParaTendencia() {
  const usuario = obtenerUsuario();

  if (!usuario || !usuario.id) {
    return [];
  }

  try {
    const respuesta = await fetch(`${API_URL}/api/checkins/historial/${usuario.id}`);
    const data = await respuesta.json();

    if (!respuesta.ok) {
      console.error("Error al obtener historial para tendencia:", data);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Error al conectar con tendencia emocional:", error);
    return [];
  }
}

async function mostrarTendenciaEmocional() {
  const contenedor = document.getElementById("tendenciaEmocionalContainer");

  if (!contenedor) return;

  const historial = await obtenerHistorialCheckinsParaTendencia();

  if (!historial || historial.length === 0) {
    contenedor.innerHTML = `
      <div class="tendencia-vacia">
        <p>No hay check-ins suficientes para mostrar la tendencia emocional.</p>
      </div>
    `;
    return;
  }

  const ultimosRegistros = historial
    .slice(0, 7)
    .reverse();

  contenedor.innerHTML = ultimosRegistros
    .map((checkin) => {
      const estado = checkin.estadoAnimo || "Normal";
      const puntaje = obtenerPuntajeEstadoEmocional(estado);
      const altura = puntaje * 20;
      const claseEstado = obtenerColorClaseEstado(estado);
      const fecha = formatearFechaTendencia(checkin.createdAt || checkin.fecha);

      return `
        <div class="tendencia-item">
          <div class="tendencia-barra-contenedor">
            <div
              class="tendencia-barra ${claseEstado}"
              style="height: ${altura}%;"
              title="${escaparTextoTendencia(estado)}"
            ></div>
          </div>

          <small>${escaparTextoTendencia(fecha)}</small>
          <span>${escaparTextoTendencia(estado)}</span>
        </div>
      `;
    })
    .join("");
}

function iniciarTendenciaEmocional() {
  mostrarTendenciaEmocional();
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", iniciarTendenciaEmocional);
} else {
  iniciarTendenciaEmocional();
}
/* =========================
   ELIMINAR CHECK-IN DESDE HISTORIAL
========================= */
async function eliminarCheckinHistorial(checkinId) {
  const confirmar = confirm("¿Seguro que quieres eliminar este check-in del historial?");

  if (!confirmar) return;

  try {
    const respuesta = await fetch(`${API_URL}/api/checkins/${checkinId}`, {
      method: "DELETE"
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      mostrarToastVitality(data.mensaje || "No se pudo eliminar el check-in.");
      return;
    }

    mostrarToastVitality("Check-in eliminado correctamente.");

    await obtenerUltimoCheckinBackend();

    if (typeof mostrarHistorialCheckins === "function") {
      await mostrarHistorialCheckins();
    }

    if (typeof mostrarEstadisticasEmocionales === "function") {
      await mostrarEstadisticasEmocionales();
    }

    if (typeof mostrarTendenciaEmocional === "function") {
      await mostrarTendenciaEmocional();
    }

    mostrarResumenCheckinEnPerfil();
    mostrarPanelPerfilAvanzado();
    mostrarAlertas();
  } catch (error) {
    console.error("Error al eliminar check-in:", error);
    mostrarToastVitality("No se pudo conectar con el servidor. Detalle: " + error.message + " | API_URL: " + API_URL);
  }
}

/* =========================
   HISTORIAL EMOCIONAL CON BOTÓN ELIMINAR
========================= */
async function mostrarHistorialCheckins() {
  const contenedor = document.getElementById("historialCheckinsContainer");

  if (!contenedor) return;

  const historial = await obtenerHistorialCheckinsBackend();

  if (!historial || historial.length === 0) {
    contenedor.innerHTML = `
      <div class="historial-item">
        <p>No hay check-ins registrados todavía.</p>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = historial
    .map((checkin) => {
      const fecha = historialFormatearFecha(checkin.createdAt || checkin.fecha);

      return `
        <div class="historial-item">
          <h3>${historialEscaparTexto(fecha)}</h3>
          <p><strong>Estado emocional:</strong> ${historialEscaparTexto(checkin.estadoAnimo)}</p>
          <p><strong>Estrés:</strong> ${historialEscaparTexto(checkin.nivelEstres)}</p>
          <p><strong>Sueño:</strong> ${historialEscaparTexto(checkin.sueno)}</p>
          <p><strong>Energía:</strong> ${historialEscaparTexto(checkin.energia)}</p>

          <div class="acciones-historial">
            <button
              type="button"
              class="btn-eliminar-checkin"
              onclick="eliminarCheckinHistorial('${historialEscaparTexto(checkin._id)}')"
            >
              Eliminar check-in
            </button>
          </div>
        </div>
      `;
    })
    .join("");
}
/* =========================
   RACHA DE CHECK-INS EN PERFIL
========================= */
function rachaEscaparTexto(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function obtenerFechaSimpleCheckin(fecha) {
  const fechaObjeto = new Date(fecha);

  if (Number.isNaN(fechaObjeto.getTime())) {
    return null;
  }

  const anio = fechaObjeto.getFullYear();
  const mes = String(fechaObjeto.getMonth() + 1).padStart(2, "0");
  const dia = String(fechaObjeto.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function restarDiasFechaSimple(fechaSimple, dias) {
  const fecha = new Date(`${fechaSimple}T00:00:00`);
  fecha.setDate(fecha.getDate() - dias);

  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function calcularRachaCheckins(historial) {
  if (!historial || historial.length === 0) {
    return {
      rachaActual: 0,
      totalDiasRegistrados: 0,
      ultimoDiaRegistrado: "Sin datos"
    };
  }

  const diasUnicos = [
    ...new Set(
      historial
        .map((item) => obtenerFechaSimpleCheckin(item.createdAt || item.fecha))
        .filter(Boolean)
    )
  ].sort((a, b) => b.localeCompare(a));

  if (diasUnicos.length === 0) {
    return {
      rachaActual: 0,
      totalDiasRegistrados: 0,
      ultimoDiaRegistrado: "Sin datos"
    };
  }

  const hoy = obtenerFechaSimpleCheckin(new Date());
  const ayer = restarDiasFechaSimple(hoy, 1);

  let inicioRacha = null;

  if (diasUnicos.includes(hoy)) {
    inicioRacha = hoy;
  } else if (diasUnicos.includes(ayer)) {
    inicioRacha = ayer;
  } else {
    return {
      rachaActual: 0,
      totalDiasRegistrados: diasUnicos.length,
      ultimoDiaRegistrado: diasUnicos[0]
    };
  }

  let racha = 0;
  let diaEsperado = inicioRacha;

  while (diasUnicos.includes(diaEsperado)) {
    racha += 1;
    diaEsperado = restarDiasFechaSimple(diaEsperado, 1);
  }

  return {
    rachaActual: racha,
    totalDiasRegistrados: diasUnicos.length,
    ultimoDiaRegistrado: diasUnicos[0]
  };
}

function obtenerMensajeRacha(rachaActual) {
  if (rachaActual === 0) {
    return "Completa tu check-in de hoy para comenzar una nueva racha.";
  }

  if (rachaActual === 1) {
    return "Bien. Ya registraste tu check-in más reciente. Intenta repetirlo mañana para formar el hábito.";
  }

  if (rachaActual < 4) {
    return "Vas construyendo una buena constancia. Sigue completando tu check-in diario.";
  }

  if (rachaActual < 7) {
    return "Muy bien. Tu racha muestra compromiso con tu bienestar emocional.";
  }

  return "Excelente. Mantienes una racha sólida de check-ins. Sigue así.";
}

async function mostrarRachaCheckins() {
  const contenedor = document.getElementById("rachaCheckinContainer");

  if (!contenedor) return;

  const historial = await obtenerHistorialCheckinsBackend();

  if (!historial || historial.length === 0) {
    contenedor.innerHTML = `
      <div class="racha-checkin-item">
        <h3>Sin datos</h3>
        <p>Completa tu primer check-in para comenzar una racha.</p>
      </div>
    `;
    return;
  }

  const datosRacha = calcularRachaCheckins(historial);
  const mensaje = obtenerMensajeRacha(datosRacha.rachaActual);

  contenedor.innerHTML = `
    <div class="racha-checkin-item">
      <h3>${datosRacha.rachaActual}</h3>
      <p>Racha actual de días</p>
    </div>

    <div class="racha-checkin-item">
      <h3>${datosRacha.totalDiasRegistrados}</h3>
      <p>Días distintos registrados</p>
    </div>

    <div class="racha-checkin-item racha-checkin-ancha">
      <h3>Último día registrado</h3>
      <p>${rachaEscaparTexto(datosRacha.ultimoDiaRegistrado)}</p>
    </div>

    <div class="racha-checkin-item racha-checkin-ancha">
      <h3>Mensaje Vitality</h3>
      <p>${rachaEscaparTexto(mensaje)}</p>
    </div>
  `;
}

function iniciarRachaCheckins() {
  mostrarRachaCheckins();
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", iniciarRachaCheckins);
} else {
  iniciarRachaCheckins();
}
/* =========================
   OBJETIVOS PERSONALES EN PERFIL
========================= */
function objetivosEscaparTexto(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function obtenerFechaHoyObjetivo() {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function obtenerUsuarioObjetivos() {
  try {
    const usuarioGuardado = localStorage.getItem("usuarioVitality");
    return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  } catch (error) {
    console.error("Error al obtener usuario para objetivos:", error);
    return null;
  }
}

async function obtenerObjetivosBackend() {
  const usuario = obtenerUsuarioObjetivos();

  if (!usuario || !usuario.id) {
    return [];
  }

  try {
    const respuesta = await fetch(`${API_URL}/api/objetivos/${usuario.id}`);
    const data = await respuesta.json();

    if (!respuesta.ok) {
      console.error("Error al obtener objetivos:", data);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Error al conectar con objetivos:", error);
    return [];
  }
}

async function guardarObjetivoBackend(event) {
  event.preventDefault();

  const usuario = obtenerUsuarioObjetivos();

  if (!usuario || !usuario.id) {
    mostrarToastVitality("Debes iniciar sesión para guardar objetivos.");
    return;
  }

  const tituloInput = document.getElementById("objetivoTitulo");
  const descripcionInput = document.getElementById("objetivoDescripcion");
  const fechaInput = document.getElementById("objetivoFecha");

  if (!tituloInput || !descripcionInput || !fechaInput) {
    return;
  }

  const titulo = tituloInput.value.trim();
  const descripcion = descripcionInput.value.trim();
  const fecha = fechaInput.value;

  if (!titulo || !fecha) {
    mostrarToastVitality("Completa el título y la fecha del objetivo.");
    return;
  }

  try {
    const respuesta = await fetch(`${API_URL}/api/objetivos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        usuarioId: usuario.id,
        titulo,
        descripcion,
        fecha
      })
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      mostrarToastVitality(data.mensaje || "No se pudo guardar el objetivo.");
      return;
    }

    mostrarToastVitality("Objetivo guardado correctamente.");

    event.target.reset();

    const fechaInputActualizada = document.getElementById("objetivoFecha");
    if (fechaInputActualizada) {
      fechaInputActualizada.value = obtenerFechaHoyObjetivo();
    }

    await mostrarObjetivosPersonales();
  } catch (error) {
    console.error("Error al guardar objetivo:", error);
    mostrarToastVitality("No se pudo conectar con el servidor. Detalle: " + error.message + " | API_URL: " + API_URL);
  }
}

async function alternarObjetivoPersonal(objetivoId) {
  try {
    const respuesta = await fetch(`${API_URL}/api/objetivos/${objetivoId}/completar`, {
      method: "PATCH"
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      mostrarToastVitality(data.mensaje || "No se pudo actualizar el objetivo.");
      return;
    }

    await mostrarObjetivosPersonales();
  } catch (error) {
    console.error("Error al actualizar objetivo:", error);
    mostrarToastVitality("No se pudo conectar con el servidor. Detalle: " + error.message + " | API_URL: " + API_URL);
  }
}

async function eliminarObjetivoPersonal(objetivoId) {
  const confirmar = confirm("¿Seguro que quieres eliminar este objetivo?");

  if (!confirmar) return;

  try {
    const respuesta = await fetch(`${API_URL}/api/objetivos/${objetivoId}`, {
      method: "DELETE"
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      mostrarToastVitality(data.mensaje || "No se pudo eliminar el objetivo.");
      return;
    }

    await mostrarObjetivosPersonales();
  } catch (error) {
    console.error("Error al eliminar objetivo:", error);
    mostrarToastVitality("No se pudo conectar con el servidor. Detalle: " + error.message + " | API_URL: " + API_URL);
  }
}

async function mostrarObjetivosPersonales() {
  const contenedor = document.getElementById("objetivosContainer");

  if (!contenedor) return;

  const objetivos = await obtenerObjetivosBackend();

  if (!objetivos || objetivos.length === 0) {
    contenedor.innerHTML = `
      <div class="objetivo-item">
        <p>No hay objetivos personales registrados todavía.</p>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = objetivos
    .map((objetivo) => {
      const claseCompletado = objetivo.completado ? "objetivo-completado" : "";
      const textoBoton = objetivo.completado ? "Desmarcar" : "Completar";
      const estado = objetivo.completado ? "Cumplido" : "Pendiente";

      return `
        <div class="objetivo-item ${claseCompletado}">
          <h3>${objetivosEscaparTexto(objetivo.titulo)}</h3>
          <p><strong>Fecha:</strong> ${objetivosEscaparTexto(objetivo.fecha)}</p>
          <p>${objetivosEscaparTexto(objetivo.descripcion || "Sin descripción")}</p>
          <p><strong>Estado:</strong> ${estado}</p>

          <div class="objetivo-acciones">
            <button
              type="button"
              onclick="alternarObjetivoPersonal('${objetivosEscaparTexto(objetivo._id)}')"
            >
              ${textoBoton}
            </button>

            <button
              type="button"
              class="btn-eliminar-objetivo"
              onclick="eliminarObjetivoPersonal('${objetivosEscaparTexto(objetivo._id)}')"
            >
              Eliminar
            </button>
          </div>
        </div>
      `;
    })
    .join("");
}

function iniciarObjetivosPersonales() {
  const objetivoForm = document.getElementById("objetivoForm");
  const objetivoFecha = document.getElementById("objetivoFecha");

  if (objetivoFecha && !objetivoFecha.value) {
    objetivoFecha.value = obtenerFechaHoyObjetivo();
  }

  if (objetivoForm) {
    objetivoForm.addEventListener("submit", guardarObjetivoBackend);
  }

  mostrarObjetivosPersonales();
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", iniciarObjetivosPersonales);
} else {
  iniciarObjetivosPersonales();
}
/* =========================
   CHECK-IN DIARIO OBLIGATORIO
========================= */
function obtenerFechaISOHoyCheckinDiario() {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function convertirFechaAISOCheckinDiario(fecha) {
  if (!fecha) return null;

  const fechaObjeto = new Date(fecha);

  if (Number.isNaN(fechaObjeto.getTime())) {
    return null;
  }

  const anio = fechaObjeto.getFullYear();
  const mes = String(fechaObjeto.getMonth() + 1).padStart(2, "0");
  const dia = String(fechaObjeto.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function obtenerPaginaActualCheckinDiario() {
  const ruta = window.location.pathname;
  const pagina = ruta.substring(ruta.lastIndexOf("/") + 1);

  return pagina || "index.html";
}

function paginaLibreCheckinDiario(pagina) {
  const paginasLibres = [
    "",
    "index.html",
    "registro.html",
    "onboarding.html",
    "checkin.html"
  ];

  return paginasLibres.includes(pagina);
}
async function usuarioTieneCheckinDeHoy() {
  const fechaHoy = obtenerFechaISOHoyCheckinDiario();

  const checkinLocal = obtenerCheckin();

  if (checkinLocal) {
    const fechaLocal =
      checkinLocal.fechaISO ||
      convertirFechaAISOCheckinDiario(checkinLocal.fecha);

    if (fechaLocal === fechaHoy) {
      return true;
    }
  }

  const usuarioId = obtenerUsuarioIdVitality();

  if (!usuarioId) {
    return false;
  }

  try {
    const respuesta = await fetch(`${API_URL}/api/checkins/ultimo/${usuarioId}`);

    if (respuesta.status === 404) {
      return false;
    }

    const data = await respuesta.json();

    if (!respuesta.ok) {
      return false;
    }

    const fechaCheckin = convertirFechaAISOCheckinDiario(
      data.createdAt || data.fecha || data.updatedAt
    );

    if (fechaCheckin === fechaHoy) {
      guardarCheckinLocal(
        data.estadoAnimo,
        data.nivelEstres,
        data.sueno,
        data.energia,
        new Date(
          data.createdAt ||
            data.fecha ||
            data.updatedAt
        ).toLocaleDateString()
      );

      return true;
    }

    return false;
  } catch (error) {
    console.error("Error al verificar check-in diario:", error);
    return false;
  }
}
async function redirigirDespuesDeLoginSegunCheckin() {
  const tieneCheckinHoy = await usuarioTieneCheckinDeHoy();

  if (tieneCheckinHoy) {
    window.location.href = "horario.html";
  } else {
    window.location.href = "checkin.html";
  }
}

async function protegerCheckinDiario() {
  const pagina = obtenerPaginaActualCheckinDiario();

  if (paginaLibreCheckinDiario(pagina)) {
    return;
  }

  const usuario = obtenerUsuario();

  if (!usuario || !usuario.id) {
    return;
  }

  const tieneCheckinHoy = await usuarioTieneCheckinDeHoy();

  if (!tieneCheckinHoy) {
    mostrarToastVitality("Antes de continuar, completa tu check-in diario.");
    window.location.href = "checkin.html";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  protegerCheckinDiario();
});




/* =========================
   CONTROL DE USO DE APPS
========================= */
function seleccionarAppUsoVitality(nombreApp, boton) {
  const input = document.getElementById("usoAppNombre");
  const texto = document.getElementById("usoAppSeleccionadaTexto");

  if (input) {
    input.value = nombreApp;
  }

  if (texto) {
    texto.textContent = `App seleccionada: ${nombreApp}`;
  }

  const botones = document.querySelectorAll(".uso-app-opcion");

  botones.forEach((item) => {
    item.classList.remove("uso-app-opcion-activa");
  });

  if (boton) {
    boton.classList.add("uso-app-opcion-activa");
  }
}

function obtenerUsuarioUsoApps() {
  try {
    const usuarioGuardado = localStorage.getItem("usuarioVitality");
    return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  } catch (error) {
    console.error("Error al obtener usuario para uso de apps:", error);
    return null;
  }
}



function usoAppsEscaparTexto(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function usoAppExcedida(usoApp) {
  return Number(usoApp.minutosUsados) > Number(usoApp.limiteMinutos);
}

async function obtenerUsoAppsBackend() {
  const usuario = obtenerUsuarioUsoApps();

  if (!usuario || !usuario.id) {
    return [];
  }

  try {
    const respuesta = await fetch(`${API_URL}/api/uso-apps/${usuario.id}`);
    const data = await respuesta.json();

    if (!respuesta.ok) {
      console.error("Error al obtener uso de apps:", data);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Error al conectar con uso de apps:", error);
    return [];
  }
}

async function guardarUsoAppBackend(event) {
  event.preventDefault();

  const usuario = obtenerUsuarioUsoApps();

  if (!usuario || !usuario.id) {
    mostrarToastVitality("Debes iniciar sesión para monitorear apps.");
    return;
  }

  const nombreInput = document.getElementById("usoAppNombre");
  const limiteInput = document.getElementById("usoAppLimite");

  if (!nombreInput || !limiteInput) {
    return;
  }

  const nombreApp = nombreInput.value.trim();
  const limiteMinutos = Number(limiteInput.value);
  const packageName = obtenerPackageAppVitality(nombreApp, "");

  if (!nombreApp) {
    mostrarToastVitality("Selecciona una app para monitorear.");
    return;
  }

  if (Number.isNaN(limiteMinutos) || limiteMinutos <= 0) {
    mostrarToastVitality("Ingresa un límite diario válido.");
    return;
  }

  if (!packageName) {
    mostrarToastVitality("Esta app todavía no está disponible para monitoreo.");
    return;
  }

  const permiso = await permisoUsoAppsConcedidoVitality();

  if (!permiso) {
    mostrarToastVitality("Primero activa el permiso de uso de apps.");
    await abrirPermisoUsoAppsVitality();
    return;
  }

  const minutosUsados = await obtenerMinutosUsoRealHoyVitality(packageName);

  try {
    const respuesta = await fetch(`${API_URL}/api/uso-apps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        usuarioId: usuario.id,
        nombreApp,
        packageName,
        limiteMinutos,
        minutosUsados
      })
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      mostrarToastVitality(data.mensaje || "No se pudo guardar el monitoreo.");
      return;
    }

    event.target.reset();

    const texto = document.getElementById("usoAppSeleccionadaTexto");
    if (texto) {
      texto.textContent = "Selecciona una app para monitorear.";
    }

    const botones = document.querySelectorAll(".uso-app-opcion");
    botones.forEach((item) => item.classList.remove("uso-app-opcion-activa"));

    await mostrarUsoApps();

    if (minutosUsados > limiteMinutos) {
      enviarNotificacionCelularVitality(
        "Uso excesivo detectado",
        `Llevas ${minutosUsados} minutos en ${nombreApp}. Superaste tu límite de ${limiteMinutos} minutos.`
      );

      mostrarToastVitality("Uso excesivo detectado. Se envió una notificación.");
    } else {
      mostrarToastVitality(`Monitoreo guardado. Uso real hoy: ${minutosUsados} min.`);
    }
  } catch (error) {
    console.error("Error al guardar uso de app:", error);

    mostrarToastVitality(
      "No se pudo conectar con el servidor. Detalle: " +
        error.message +
        " | API_URL: " +
        API_URL
    );
  }
}
async function eliminarUsoApp(usoAppId) {
  const confirmar = confirm("¿Seguro que quieres eliminar esta app del monitoreo?");

  if (!confirmar) return;

  try {
    const respuesta = await fetch(`${API_URL}/api/uso-apps/${usoAppId}`, {
      method: "DELETE"
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      mostrarToastVitality(data.mensaje || "No se pudo eliminar la app monitoreada.");
      return;
    }

    await mostrarUsoApps();
  } catch (error) {
    console.error("Error al eliminar uso de app:", error);
    mostrarToastVitality("No se pudo conectar con el servidor. Detalle: " + error.message + " | API_URL: " + API_URL);
  }
}

async function mostrarUsoApps() {
  const contenedor = document.getElementById("listaUsoApps");

  if (!contenedor) return;

  let usos = await obtenerUsoAppsBackend();
  usos = await enriquecerUsoAppsConUsoRealVitality(usos);

  if (!usos || usos.length === 0) {
    contenedor.innerHTML = `
      <div class="uso-app-item">
        <p>No hay apps monitoreadas todavía.</p>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = usos
    .map((uso) => {
      const excedida = usoAppExcedida(uso);
      const clase = excedida ? "uso-app-excedida" : "";
      const estado = excedida ? "Exceso detectado" : "Dentro del límite";
      const origen = uso.usoRealAndroid
        ? "Uso real leído desde Android"
        : "Uso guardado manualmente";

      if (excedida && !alertaUsoAppsEstaPausada()) {
  enviarNotificacionCelularVitality(
    "Uso excesivo detectado",
    `${uso.nombreApp}: ${uso.minutosUsados} min de ${uso.limiteMinutos} min permitidos.`
  );
}

      return `
        <div class="uso-app-item ${clase}">
          <h3>${usoAppsEscaparTexto(uso.nombreApp)}</h3>
          <p><strong>Límite diario:</strong> ${usoAppsEscaparTexto(uso.limiteMinutos)} minutos</p>
          <p><strong>Uso real hoy:</strong> ${usoAppsEscaparTexto(uso.minutosUsados)} minutos</p>
          <p><strong>Estado:</strong> ${estado}</p>
          <p><small>${usoAppsEscaparTexto(origen)}</small></p>

          ${
            excedida
              ? `<p class="uso-app-alerta-texto">Superaste el límite. Vitality recomienda tomar una pausa.</p>`
              : `<p>Uso dentro de un rango saludable.</p>`
          }

          <div class="uso-app-acciones">
            <button type="button" onclick="eliminarUsoApp('${usoAppsEscaparTexto(uso._id)}')">
              Eliminar
            </button>
          </div>
        </div>
      `;
    })
    .join("");
}
function crearContenedorAlertaUsoApps() {
  let alerta = document.getElementById("alertaUsoAppsGlobal");

  if (!alerta) {
    alerta = document.createElement("div");
    alerta.id = "alertaUsoAppsGlobal";
    alerta.className = "alerta-uso-apps-global";
    document.body.prepend(alerta);
  }

  return alerta;
}

function cerrarAlertaUsoApps() {
  const alerta = document.getElementById("alertaUsoAppsGlobal");

  if (alerta) {
    alerta.remove();
  }

  const treintaMinutos = 30 * 60 * 1000;
  const fechaReactivacion = Date.now() + treintaMinutos;

  localStorage.setItem(
    "alertaUsoAppsPausadaHasta",
    String(fechaReactivacion)
  );

  mostrarToastVitality("Alerta pausada por 30 minutos.");
}
function alertaUsoAppsEstaPausada() {
  const pausadaHasta = Number(
    localStorage.getItem("alertaUsoAppsPausadaHasta") || 0
  );

  if (!pausadaHasta) {
    return false;
  }

  if (Date.now() >= pausadaHasta) {
    localStorage.removeItem("alertaUsoAppsPausadaHasta");
    return false;
  }

  return true;
}

function obtenerMinutosRestantesPausaUsoApps() {
  const pausadaHasta = Number(
    localStorage.getItem("alertaUsoAppsPausadaHasta") || 0
  );

  if (!pausadaHasta) {
    return 0;
  }

  const diferencia = pausadaHasta - Date.now();

  if (diferencia <= 0) {
    return 0;
  }

  return Math.ceil(diferencia / 60000);
}
function mostrarAlertaUsoExcesivoGlobal(usoApp) {
  const alerta = crearContenedorAlertaUsoApps();

  alerta.innerHTML = `
    <div>
      <strong>⚠️ Uso excesivo detectado</strong>
      <p>
        Llevas ${usoAppsEscaparTexto(usoApp.minutosUsados)} minutos en
        ${usoAppsEscaparTexto(usoApp.nombreApp)}. Superaste tu límite de
        ${usoAppsEscaparTexto(usoApp.limiteMinutos)} minutos.
      </p>
      <small>Vitality recomienda hacer una pausa y volver a tu horario.</small>
    </div>

    <button type="button" onclick="cerrarAlertaUsoApps()">×</button>
  `;
}

async function revisarUsoExcesivoGlobal() {
  const usuario = obtenerUsuarioUsoApps();

  if (!usuario || !usuario.id) return;

  if (alertaUsoAppsEstaPausada()) {
    const alerta = document.getElementById("alertaUsoAppsGlobal");

    if (alerta) {
      alerta.remove();
    }

    return;
  }

  let usos = await obtenerUsoAppsBackend();
  usos = await enriquecerUsoAppsConUsoRealVitality(usos);

  const usoExcesivo = usos.find((uso) => usoAppExcedida(uso));

  if (usoExcesivo) {
    mostrarAlertaUsoExcesivoGlobal(usoExcesivo);
  }
}
function iniciarControlUsoApps() {
  const usoAppForm = document.getElementById("usoAppForm");

  if (usoAppForm) {
    usoAppForm.addEventListener("submit", guardarUsoAppBackend);
  }

  actualizarEstadoPermisoUsoAppsVitality();
  mostrarUsoApps();
  revisarUsoExcesivoGlobal();

  if (!window.__intervaloUsoAppsVitalityActivo) {
    window.__intervaloUsoAppsVitalityActivo = true;

    setInterval(() => {
      revisarUsoExcesivoGlobal();
    }, 30 * 60 * 1000);
  }
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", iniciarControlUsoApps);
} else {
  iniciarControlUsoApps();
}







/* =========================
   PUENTE: ALERTAS VISUALES -> NOTIFICACIÓN DEL CELULAR
========================= */
function iniciarPuenteNotificacionesNativasVitality() {
  if (window.__puenteNotificacionesVitalityActivo) {
    return;
  }

  window.__puenteNotificacionesVitalityActivo = true;

  const notificacionesPendientes = [];
  let temporizadorNotificacion = null;

  function limpiarTextoNotificacion(texto) {
    return String(texto || "")
      .replace(/×/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function programarEnvioNotificacion() {
    clearTimeout(temporizadorNotificacion);

    temporizadorNotificacion = setTimeout(() => {
      if (notificacionesPendientes.length === 0) {
        return;
      }

      const yaEnviada = sessionStorage.getItem("notificacionNativaVitalityEnviada");

      if (yaEnviada === "true") {
        notificacionesPendientes.length = 0;
        return;
      }

      const resumen = notificacionesPendientes
        .slice(0, 3)
        .map((texto) => "• " + texto)
        .join("\n");

      sessionStorage.setItem("notificacionNativaVitalityEnviada", "true");

      enviarNotificacionCelularVitality(
        "Alertas de Vitality",
        resumen
      );

      notificacionesPendientes.length = 0;
    }, 900);
  }

  const observador = new MutationObserver((mutaciones) => {
    mutaciones.forEach((mutacion) => {
      mutacion.addedNodes.forEach((nodo) => {
        if (!(nodo instanceof HTMLElement)) {
          return;
        }

        const estaEnContenedor =
          nodo.id === "notificacionesVitality" ||
          nodo.closest("#notificacionesVitality") ||
          nodo.classList.contains("notificaciones-vitality");

        if (!estaEnContenedor) {
          return;
        }

        const texto = limpiarTextoNotificacion(nodo.innerText || nodo.textContent);

        if (
          texto &&
          texto.length > 5 &&
          !notificacionesPendientes.includes(texto)
        ) {
          notificacionesPendientes.push(texto);
          programarEnvioNotificacion();
        }
      });
    });
  });

  observador.observe(document.body, {
    childList: true,
    subtree: true
  });
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", iniciarPuenteNotificacionesNativasVitality);
} else {
  iniciarPuenteNotificacionesNativasVitality();
}
/* =========================
   INICIALES DEL USUARIO
========================= */
function obtenerInicialesUsuarioVitality(nombre) {
  const partes = String(nombre || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (partes.length === 0) {
    return "U";
  }

  if (partes.length === 1) {
    return partes[0].charAt(0).toUpperCase();
  }

  return (
    partes[0].charAt(0) + partes[partes.length - 1].charAt(0)
  ).toUpperCase();
}

function aplicarInicialesUsuarioVitality() {
  const usuario = obtenerUsuario();

  if (!usuario || !usuario.nombre) {
    return;
  }

  const iniciales = obtenerInicialesUsuarioVitality(usuario.nombre);

  const botonesPerfil = document.querySelectorAll(".profile-btn");

  botonesPerfil.forEach((boton) => {
    boton.textContent = iniciales;
    boton.classList.add("profile-initials-btn");
  });

  const avatarPerfil = document.querySelector(".perfil-avatar-app");

  if (avatarPerfil) {
    avatarPerfil.textContent = iniciales;
    avatarPerfil.classList.add("perfil-avatar-iniciales");
  }
}

function iniciarInicialesUsuarioVitality() {
  aplicarInicialesUsuarioVitality();

  setTimeout(aplicarInicialesUsuarioVitality, 300);
  setTimeout(aplicarInicialesUsuarioVitality, 1000);
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", iniciarInicialesUsuarioVitality);
} else {
  iniciarInicialesUsuarioVitality();
}
/* =========================
   USO REAL DE APPS ANDROID
========================= */
const PACKAGES_APPS_VITALITY = {
  Instagram: "com.instagram.android",
  TikTok: "com.zhiliaoapp.musically",
  YouTube: "com.google.android.youtube",
  WhatsApp: "com.whatsapp",
  Spotify: "com.spotify.music",
  Chrome: "com.android.chrome",
  Gmail: "com.google.android.gm",
  Facebook: "com.facebook.katana",
  Messenger: "com.facebook.orca",
  Netflix: "com.netflix.mediaclient",
  X: "com.twitter.android"
};
function obtenerPluginUsoAppsVitality() {
  if (!window.Capacitor || !window.Capacitor.Plugins) {
    return null;
  }

  return (
    window.Capacitor.Plugins.CapacitorUsageStatsManager ||
    window.CapacitorUsageStatsManager ||
    null
  );
}

async function permisoUsoAppsConcedidoVitality() {
  try {
    const UsageStats = obtenerPluginUsoAppsVitality();

    if (!UsageStats) {
      return false;
    }

    const resultado = await UsageStats.isUsageStatsPermissionGranted();
    return resultado && resultado.granted === true;
  } catch (error) {
    console.error("Error revisando permiso de uso de apps:", error);
    return false;
  }
}

async function abrirPermisoUsoAppsVitality() {
  try {
    const UsageStats = obtenerPluginUsoAppsVitality();

    if (!UsageStats) {
      mostrarToastVitality("Uso real de apps disponible solo en APK Android.");
      return;
    }

    await UsageStats.openUsageStatsSettings();

    mostrarToastVitality(
      "Activa Vitality en Acceso a uso y vuelve a la app."
    );
  } catch (error) {
    console.error("Error abriendo permiso de uso de apps:", error);
    mostrarToastVitality("No se pudo abrir la configuración de uso de apps.");
  }
}

function obtenerInicioDiaActualVitality() {
  const fecha = new Date();
  fecha.setHours(0, 0, 0, 0);
  return fecha.getTime();
}

async function obtenerEstadisticasUsoHoyVitality() {
  const UsageStats = obtenerPluginUsoAppsVitality();

  if (!UsageStats) {
    return null;
  }

  const permiso = await permisoUsoAppsConcedidoVitality();

  if (!permiso) {
    return null;
  }

  const beginTime = obtenerInicioDiaActualVitality();
  const endTime = Date.now();

  return UsageStats.queryAndAggregateUsageStats({
    beginTime,
    endTime
  });
}

function obtenerPackageAppVitality(nombreApp, packageManual = "") {
  if (packageManual && packageManual.trim() !== "") {
    return packageManual.trim();
  }

  return PACKAGES_APPS_VITALITY[nombreApp] || "";
}

async function obtenerMinutosUsoRealHoyVitality(packageName) {
  if (!packageName) {
    return 0;
  }

  const estadisticas = await obtenerEstadisticasUsoHoyVitality();

  if (!estadisticas) {
    return 0;
  }

  const uso = estadisticas[packageName];

  if (!uso || !uso.totalTimeInForeground) {
    return 0;
  }

  return Math.round(Number(uso.totalTimeInForeground) / 60000);
}

async function actualizarEstadoPermisoUsoAppsVitality() {
  const texto = document.getElementById("estadoPermisoUsoApps");

  if (!texto) {
    return;
  }

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

async function enriquecerUsoAppsConUsoRealVitality(usos) {
  const permiso = await permisoUsoAppsConcedidoVitality();

  if (!permiso) {
    return usos;
  }

  const estadisticas = await obtenerEstadisticasUsoHoyVitality();

  if (!estadisticas) {
    return usos;
  }

  return usos.map((uso) => {
    const packageName = uso.packageName || obtenerPackageAppVitality(uso.nombreApp, "");

    const usoReal = estadisticas[packageName];
    const minutosReales = usoReal && usoReal.totalTimeInForeground
      ? Math.round(Number(usoReal.totalTimeInForeground) / 60000)
      : 0;

    return {
      ...uso,
      packageName,
      minutosUsados: minutosReales,
      usoRealAndroid: true
    };
  });
}
/* =========================
   RECOMENDACIÓN IA EN INICIO
========================= */
async function obtenerRecomendacionesIAInicio() {
  const usuarioId = obtenerUsuarioIdVitality();

  if (!usuarioId) {
    return [];
  }

  try {
    const respuesta = await fetch(`${API_URL}/api/recomendaciones-ia/${usuarioId}`);
    const data = await respuesta.json();

    if (!respuesta.ok) {
      console.error("Error al obtener recomendaciones IA:", data);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Error al conectar con recomendaciones IA:", error);
    return [];
  }
}

async function mostrarRecomendacionIAInicio() {
  const contenedor = document.getElementById("recomendacionIAInicioContainer");

  if (!contenedor) {
    return;
  }

  const recomendaciones = await obtenerRecomendacionesIAInicio();

  if (!recomendaciones || recomendaciones.length === 0) {
    contenedor.innerHTML = `
      <div class="recomendacion-inicio-vacia">
        <p>No hay recomendaciones recientes todavía.</p>
        <button type="button" onclick="window.location.href='chat.html'">
          Hablar con Vitality
        </button>
      </div>
    `;
    return;
  }

  const recomendacion = recomendaciones[0];

  const estado = recomendacion.estado || "pendiente";
  const categoria = recomendacion.categoriaBarrera || "SIN_BARRERA_CLARA";
  const accion = recomendacion.accionSugerida || {};

  const tituloAccion =
    accion.titulo ||
    accion.tipo ||
    "Recomendación personalizada";

  let textoCategoria = "Recomendación general";

  if (categoria === "DISTRACCION_DIGITAL") {
    textoCategoria = "Distracción digital";
  }

  if (categoria === "BARRERA_INTERNA_EMOCIONAL") {
    textoCategoria = "Cansancio o bienestar emocional";
  }

  if (categoria === "BARRERA_INTERNA_COGNITIVA") {
    textoCategoria = "Organización y foco";
  }

  contenedor.innerHTML = `
    <div class="recomendacion-inicio-item">
      <div class="recomendacion-inicio-header">
        <div>
          <span class="recomendacion-inicio-etiqueta">IA adaptativa</span>
          <h3>${escaparHTML(textoCategoria)}</h3>
        </div>

        <span class="recomendacion-inicio-estado estado-${escaparHTML(estado)}">
          ${escaparHTML(estado)}
        </span>
      </div>

      <p class="recomendacion-inicio-accion">
        ${escaparHTML(tituloAccion)}
      </p>

      ${
        estado === "pendiente"
          ? `
            <div class="recomendacion-inicio-acciones">
              <button type="button" onclick="aceptarRecomendacionIAInicio('${escaparHTML(recomendacion._id)}')">
                Aceptar
              </button>

              <button type="button" class="btn-rechazar-inicio" onclick="rechazarRecomendacionIAInicio('${escaparHTML(recomendacion._id)}')">
                Rechazar
              </button>

              <button type="button" class="btn-eliminar-recomendacion" onclick="eliminarRecomendacionIA('${escaparHTML(recomendacion._id)}')">
                Eliminar
              </button>
            </div>
          `
          : `
            <div class="recomendacion-inicio-acciones">
              <button type="button" class="btn-ir-chat-recomendacion" onclick="window.location.href='chat.html?recomendacionId=${escaparHTML(recomendacion._id)}'">
                Ver en el chat
              </button>

              <button type="button" class="btn-eliminar-recomendacion" onclick="eliminarRecomendacionIA('${escaparHTML(recomendacion._id)}')">
                Eliminar
              </button>
            </div>
          `
      }
    </div>
  `;
}
async function aceptarRecomendacionIAInicio(recomendacionId) {
  try {
    const respuesta = await fetch(
      `${API_URL}/api/recomendaciones-ia/${recomendacionId}/aceptar`,
      { method: "PATCH" }
    );

    const data = await respuesta.json();

    if (!respuesta.ok) {
      mostrarToastVitality(data.mensaje || "No se pudo aceptar la recomendación.");
      return;
    }

    mostrarToastVitality("Recomendación aceptada.");

    await mostrarRecomendacionIAInicio();

    if (typeof sincronizarActividadesBackendConInterfaz === "function") {
      await sincronizarActividadesBackendConInterfaz();
    }
  } catch (error) {
    console.error("Error al aceptar recomendación desde inicio:", error);
    mostrarToastVitality("No se pudo conectar con el servidor.");
  }
}

async function rechazarRecomendacionIAInicio(recomendacionId) {
  try {
    const respuesta = await fetch(
      `${API_URL}/api/recomendaciones-ia/${recomendacionId}/rechazar`,
      { method: "PATCH" }
    );

    const data = await respuesta.json();

    if (!respuesta.ok) {
      mostrarToastVitality(data.mensaje || "No se pudo rechazar la recomendación.");
      return;
    }

    mostrarToastVitality("Recomendación rechazada.");
    await mostrarRecomendacionIAInicio();
  } catch (error) {
    console.error("Error al rechazar recomendación desde inicio:", error);
    mostrarToastVitality("No se pudo conectar con el servidor.");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  setTimeout(mostrarRecomendacionIAInicio, 800);
});
/* =========================
   VER Y ELIMINAR RECOMENDACIÓN IA
========================= */
function obtenerParametroURLVitality(nombre) {
  const parametros = new URLSearchParams(window.location.search);
  return parametros.get(nombre);
}

async function eliminarRecomendacionIA(recomendacionId) {
  const confirmar = confirm("¿Seguro que quieres eliminar esta recomendación IA?");

  if (!confirmar) {
    return;
  }

  try {
    const respuesta = await fetch(
      `${API_URL}/api/recomendaciones-ia/${recomendacionId}`,
      {
        method: "DELETE"
      }
    );

    const data = await respuesta.json();

    if (!respuesta.ok) {
      mostrarToastVitality(data.mensaje || "No se pudo eliminar la recomendación.");
      return;
    }

    mostrarToastVitality("Recomendación eliminada correctamente.");

    if (typeof mostrarRecomendacionIAInicio === "function") {
      await mostrarRecomendacionIAInicio();
    }
  } catch (error) {
    console.error("Error al eliminar recomendación IA:", error);
    mostrarToastVitality("No se pudo conectar con el servidor.");
  }
}

async function obtenerRecomendacionIASeleccionada(recomendacionId) {
  const usuarioId = obtenerUsuarioIdVitality();

  if (!usuarioId || !recomendacionId) {
    return null;
  }

  try {
    const respuesta = await fetch(`${API_URL}/api/recomendaciones-ia/${usuarioId}`);
    const data = await respuesta.json();

    if (!respuesta.ok) {
      return null;
    }

    return data.find((item) => String(item._id) === String(recomendacionId)) || null;
  } catch (error) {
    console.error("Error al buscar recomendación IA:", error);
    return null;
  }
}

function crearTarjetaRecomendacionChat(recomendacion) {
  const tarjeta = document.createElement("div");
  tarjeta.className = "message bot recomendacion-chat-detalle";

  const estado = recomendacion.estado || "pendiente";
  const categoria = recomendacion.categoriaBarrera || "SIN_BARRERA_CLARA";
  const accion = recomendacion.accionSugerida || {};

  tarjeta.innerHTML = `
    <p class="recomendacion-chat-label">Recomendación IA seleccionada</p>
    <h3>${escaparHTML(accion.titulo || "Recomendación personalizada")}</h3>
    <p><strong>Categoría:</strong> ${escaparHTML(categoria)}</p>
    <p><strong>Estado:</strong> ${escaparHTML(estado)}</p>
    <p>${escaparHTML(accion.descripcion || recomendacion.mensajeIA || "Sin descripción.")}</p>
  `;

  if (estado === "pendiente") {
    const acciones = crearAccionesRecomendacionChat(
      recomendacion._id,
      recomendacion
    );

    tarjeta.appendChild(acciones);
  }

  const botonEliminar = document.createElement("button");
  botonEliminar.type = "button";
  botonEliminar.textContent = "Eliminar recomendación";
  botonEliminar.className = "btn-eliminar-recomendacion-chat";

  botonEliminar.addEventListener("click", async () => {
    const confirmar = confirm("¿Seguro que quieres eliminar esta recomendación IA?");

    if (!confirmar) {
      return;
    }

    try {
      const respuesta = await fetch(
        `${API_URL}/api/recomendaciones-ia/${recomendacion._id}`,
        {
          method: "DELETE"
        }
      );

      const data = await respuesta.json();

      if (!respuesta.ok) {
        mostrarToastVitality(data.mensaje || "No se pudo eliminar la recomendación.");
        return;
      }

      tarjeta.remove();
      mostrarToastVitality("Recomendación eliminada correctamente.");
    } catch (error) {
      console.error("Error al eliminar recomendación desde chat:", error);
      mostrarToastVitality("No se pudo conectar con el servidor.");
    }
  });

  tarjeta.appendChild(botonEliminar);

  return tarjeta;
}

async function mostrarRecomendacionSeleccionadaEnChat() {
  const pagina = obtenerPaginaActual();

  if (pagina !== "chat.html") {
    return;
  }

  if (window.__recomendacionChatMostrada) {
    return;
  }

  const recomendacionId = obtenerParametroURLVitality("recomendacionId");

  if (!recomendacionId) {
    return;
  }

  const chatBox = document.getElementById("chatBox");

  if (!chatBox) {
    return;
  }

  const recomendacion = await obtenerRecomendacionIASeleccionada(recomendacionId);

  if (!recomendacion) {
    addMessage("No pude encontrar esa recomendación IA.", "bot");
    window.__recomendacionChatMostrada = true;
    return;
  }

  const tarjeta = crearTarjetaRecomendacionChat(recomendacion);

  chatBox.appendChild(tarjeta);
  chatBox.scrollTop = chatBox.scrollHeight;

  window.__recomendacionChatMostrada = true;
}

window.addEventListener("DOMContentLoaded", () => {
  setTimeout(mostrarRecomendacionSeleccionadaEnChat, 1200);
});
/* =========================
   ONBOARDING INICIAL DE USUARIO
========================= */
let pasoOnboardingVitality = 1;

function obtenerDatosOnboardingVitality() {
  return leerJSON("onboardingVitality", {
    objetivos: [],
    identidad: "",
    estres: [],
    completado: false
  });
}

function guardarDatosOnboardingVitality(datos) {
  guardarJSON("onboardingVitality", datos);
}

function inicializarOnboardingVitality() {
  const pagina = obtenerPaginaActual();

  if (pagina !== "onboarding.html") {
    return;
  }

  const usuario = obtenerUsuario();

  if (!usuario || !usuario.id) {
    window.location.href = "index.html";
    return;
  }

  const datos = obtenerDatosOnboardingVitality();

  if (datos.completado) {
    window.location.href = "checkin.html";
    return;
  }

  document.querySelectorAll(".onboarding-option").forEach((boton) => {
    boton.addEventListener("click", () => {
      alternarOpcionOnboardingVitality(boton);
    });
  });

  const identidadInput = document.getElementById("identidadVitalityInput");

  if (identidadInput) {
    identidadInput.addEventListener("input", actualizarContadorIdentidadVitality);
  }

  mostrarPasoOnboardingVitality(1);
}

function alternarOpcionOnboardingVitality(boton) {
  boton.classList.toggle("seleccionada");
}

function obtenerSeleccionadosOnboardingVitality(grupo) {
  return Array.from(
    document.querySelectorAll(`.onboarding-option[data-grupo="${grupo}"].seleccionada`)
  ).map((item) => item.dataset.valor);
}

function guardarPasoActualOnboardingVitality() {
  const datos = obtenerDatosOnboardingVitality();

  if (pasoOnboardingVitality === 1) {
    datos.objetivos = obtenerSeleccionadosOnboardingVitality("objetivos");
  }

  if (pasoOnboardingVitality === 2) {
    const identidadInput = document.getElementById("identidadVitalityInput");
    datos.identidad = identidadInput ? identidadInput.value.trim() : "";
  }

  if (pasoOnboardingVitality === 3) {
    datos.estres = obtenerSeleccionadosOnboardingVitality("estres");
  }

  guardarDatosOnboardingVitality(datos);
}

function mostrarPasoOnboardingVitality(paso) {
  pasoOnboardingVitality = paso;

  document.querySelectorAll(".onboarding-step").forEach((seccion) => {
    seccion.classList.remove("activa");
  });

  const stepText = document.getElementById("onboardingStepText");
  const backBtn = document.getElementById("onboardingBackBtn");
  const nextBtn = document.getElementById("onboardingNextBtn");
  const skipBtn = document.getElementById("onboardingSkipBtn");

  document.querySelectorAll(".onboarding-dot").forEach((dot) => {
    dot.classList.remove("activa");
  });

  if (paso <= 3) {
    const seccion = document.getElementById(`onboardingStep${paso}`);
    const dot = document.getElementById(`onboardingDot${paso}`);

    if (seccion) seccion.classList.add("activa");
    if (dot) dot.classList.add("activa");

    if (stepText) stepText.textContent = `${paso} / 3`;
    if (backBtn) backBtn.style.display = paso === 1 ? "none" : "block";
    if (nextBtn) nextBtn.textContent = paso === 3 ? "Continuar" : "Siguiente";
    if (skipBtn) skipBtn.style.display = paso === 2 ? "block" : "none";
    return;
  }

  const final = document.getElementById("onboardingFinal");
  const datos = obtenerDatosOnboardingVitality();
  const resumen = document.getElementById("onboardingIdentidadResumen");

  if (final) final.classList.add("activa");
  if (stepText) stepText.textContent = "";
  if (backBtn) backBtn.style.display = "none";
  if (skipBtn) skipBtn.style.display = "none";

  if (nextBtn) {
    nextBtn.textContent = "Ver mi día →";
  }

  if (resumen) {
    resumen.textContent = datos.identidad
      ? `“${datos.identidad}”`
      : "“Tu identidad”";
  }
}

function avanzarOnboarding() {
  guardarPasoActualOnboardingVitality();

  if (pasoOnboardingVitality < 3) {
    mostrarPasoOnboardingVitality(pasoOnboardingVitality + 1);
    return;
  }

  if (pasoOnboardingVitality === 3) {
    mostrarPasoOnboardingVitality(4);
    return;
  }

  finalizarOnboardingVitality();
}

function retrocederOnboarding() {
  if (pasoOnboardingVitality > 1) {
    mostrarPasoOnboardingVitality(pasoOnboardingVitality - 1);
  }
}

function saltarPreguntaOnboarding() {
  const identidadInput = document.getElementById("identidadVitalityInput");

  if (identidadInput) {
    identidadInput.value = "";
  }

  actualizarContadorIdentidadVitality();
  avanzarOnboarding();
}

function actualizarContadorIdentidadVitality() {
  const identidadInput = document.getElementById("identidadVitalityInput");
  const contador = document.getElementById("contadorIdentidadVitality");

  if (!identidadInput || !contador) {
    return;
  }

  contador.textContent = `${identidadInput.value.length} / 240`;
}

async function finalizarOnboardingVitality() {
  const datos = obtenerDatosOnboardingVitality();

  datos.completado = true;
  datos.fecha = new Date().toISOString();

  guardarDatosOnboardingVitality(datos);

  const resultado = await guardarOnboardingBackendVitality(datos);

  if (resultado.ok) {
    mostrarToastVitality("Perfil inicial guardado correctamente.");
  } else {
    mostrarToastVitality(resultado.mensaje);
  }

  window.location.href = "checkin.html";
}

window.addEventListener("DOMContentLoaded", inicializarOnboardingVitality);
/* =========================
   REGISTRO - INTERACCIONES
========================= */
function alternarVisibilidadPassword(inputId, boton) {
  const input = document.getElementById(inputId);

  if (!input) {
    return;
  }

  if (input.type === "password") {
    input.type = "text";
    if (boton) boton.textContent = "Ocultar";
  } else {
    input.type = "password";
    if (boton) boton.textContent = "Ver";
  }
}

function actualizarCampoDetalleOcupacion() {
  const ocupacion = document.getElementById("ocupacion");
  const grupo = document.getElementById("ocupacionDetalleGroup");
  const label = document.getElementById("ocupacionDetalleLabel");
  const input = document.getElementById("ocupacionDetalle");

  if (!ocupacion || !grupo || !label || !input) {
    return;
  }

  const valor = ocupacion.value;

  if (valor === "Estudiante universitario") {
    grupo.style.display = "block";
    label.textContent = "Carrera";
    input.placeholder = "Ej: Ingeniería civil informática";
    input.required = true;
    return;
  }

  if (valor === "Trabajador") {
    grupo.style.display = "block";
    label.textContent = "Área o cargo";
    input.placeholder = "Ej: Atención al cliente, ventas, informática";
    input.required = true;
    return;
  }

  if (valor === "Otra") {
    grupo.style.display = "block";
    label.textContent = "Cuéntanos tu ocupación";
    input.placeholder = "Ej: emprendedora, deportista, cuidadora";
    input.required = true;
    return;
  }

  grupo.style.display = "none";
  input.value = "";
  input.required = false;
}
/* =========================
   ONBOARDING EN BACKEND
========================= */
async function guardarOnboardingBackendVitality(datos) {
  const usuarioId = obtenerUsuarioIdVitality();

  if (!usuarioId) {
    return {
      ok: false,
      mensaje: "No se encontró el usuario para guardar el onboarding."
    };
  }

  try {
    const respuesta = await fetch(`${API_URL}/api/onboarding`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        usuarioId,
        objetivos: datos.objetivos || [],
        identidad: datos.identidad || "",
        estres: datos.estres || [],
        completado: true
      })
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      return {
        ok: false,
        mensaje: data.mensaje || "No se pudo guardar el onboarding."
      };
    }

    return {
      ok: true,
      onboarding: data.onboarding
    };
  } catch (error) {
    console.error("Error al guardar onboarding en backend:", error);

    return {
      ok: false,
      mensaje: "No se pudo conectar con el servidor para guardar el onboarding."
    };
  }
}

async function obtenerOnboardingBackendVitality() {
  const usuarioId = obtenerUsuarioIdVitality();

  if (!usuarioId) {
    return obtenerDatosOnboardingVitality();
  }

  try {
    const respuesta = await fetch(`${API_URL}/api/onboarding/${usuarioId}`);

    if (respuesta.status === 404) {
      return obtenerDatosOnboardingVitality();
    }

    const data = await respuesta.json();

    if (!respuesta.ok) {
      return obtenerDatosOnboardingVitality();
    }

    const onboarding = {
      objetivos: data.objetivos || [],
      identidad: data.identidad || "",
      estres: data.estres || [],
      completado: data.completado || false
    };

    guardarDatosOnboardingVitality(onboarding);

    return onboarding;
  } catch (error) {
    console.error("Error al obtener onboarding desde backend:", error);
    return obtenerDatosOnboardingVitality();
  }
}
/* =========================
   INICIO WARM REDISEÑADO
========================= */
function formatearFechaHomeVitality() {
  const fecha = new Date();

  return fecha.toLocaleDateString("es-CL", {
    weekday: "long",
    day: "2-digit",
    month: "long"
  });
}

function obtenerInicialNombreHomeVitality(nombre) {
  return String(nombre || "U").trim().charAt(0).toUpperCase() || "U";
}

async function obtenerIdentidadHomeVitality() {
  try {
    if (typeof obtenerOnboardingBackendVitality === "function") {
      const onboarding = await obtenerOnboardingBackendVitality();

      if (onboarding && onboarding.identidad) {
        return onboarding.identidad;
      }
    }
  } catch (error) {
    console.error("Error obteniendo identidad para inicio:", error);
  }

  const local = leerJSON("onboardingVitality", null);

  if (local && local.identidad) {
    return local.identidad;
  }

  return "Construyendo tu identidad";
}

function obtenerAccionesHomeVitality() {
  const diaHoy = obtenerNombreDiaHoy();
  const fechaHoy = obtenerFechaHoyFormatoInput();

  const fijas = obtenerActividadesFijas()
    .filter((item) => item.dia === diaHoy)
    .map((item) => ({
      ...item,
      origen: "fija",
      tipo: "Meta",
      titulo: item.actividad,
      hora: item.hora,
      horaFin: item.horaFin
    }));

  const especiales = obtenerActividadesEspeciales()
    .filter((item) => item.fecha === fechaHoy)
    .map((item) => ({
      ...item,
      origen: "especial",
      tipo: item.tipo || "Identidad",
      titulo: item.actividad,
      hora: item.hora,
      horaFin: item.horaFin
    }));

  return [...fijas, ...especiales].sort((a, b) =>
    (a.hora || "").localeCompare(b.hora || "")
  );
}

function obtenerProximaAccionHomeVitality(acciones) {
  const pendientes = acciones.filter((item) => !item.completada);

  if (pendientes.length === 0) {
    return null;
  }

  return pendientes[0];
}

async function completarAccionHomeVitality(origen, id) {
  if (origen === "fija") {
    await alternarActividadFija(id);
  } else {
    await alternarActividadEspecial(id);
  }

  iniciarHomeWarmVitality();
}

function pintarAccionesHomeVitality(acciones) {
  const lista = document.getElementById("homeAccionesLista");

  if (!lista) {
    return;
  }

  if (!acciones || acciones.length === 0) {
    lista.innerHTML = `
      <article class="home-action-item">
        <div class="home-action-check"></div>
        <div class="home-action-content">
          <h3>No hay acciones para hoy</h3>
          <div class="home-action-meta">
            <span>Agrega una actividad para organizar tu día.</span>
          </div>
        </div>
      </article>
    `;
    return;
  }

  lista.innerHTML = acciones
    .map((item) => {
      const idSeguro = escaparHTML(item.id);
      const origenSeguro = escaparHTML(item.origen);
      const clase = item.completada ? "completada" : "";

      return `
        <article class="home-action-item ${clase}">
          <button
            type="button"
            class="home-action-check"
            onclick="completarAccionHomeVitality('${origenSeguro}', '${idSeguro}')"
          >
            ✓
          </button>

          <div class="home-action-content">
            <h3>${escaparHTML(item.titulo)}</h3>

            <div class="home-action-meta">
              <span>${escaparHTML(obtenerRangoHora(item.hora, item.horaFin))}</span>
              <span class="home-action-tag">${escaparHTML(item.tipo)}</span>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

async function iniciarHomeWarmVitality() {
  const pagina = obtenerPaginaActual();

  if (pagina !== "horario.html") {
    return;
  }

  await obtenerActividadesBackend();

  const usuario = obtenerUsuario();
  const acciones = obtenerAccionesHomeVitality();
  const completadas = acciones.filter((item) => item.completada).length;
  const total = acciones.length;
  const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;
  const proxima = obtenerProximaAccionHomeVitality(acciones);

  const fecha = document.getElementById("homeFechaActual");
  const saludo = document.getElementById("homeSaludoUsuario");
  const avatar = document.querySelector(".home-avatar-btn");
  const identidad = document.getElementById("homeIdentidadUsuario");
  const porcentajeSemana = document.getElementById("homePorcentajeSemana");
  const circulo = document.querySelector(".home-progress-circle");
  const accionesNumero = document.getElementById("homeAccionesNumero");
  const accionesResumen = document.getElementById("homeAccionesResumen");

  if (fecha) {
    fecha.textContent = formatearFechaHomeVitality();
  }

  if (saludo) {
    const primerNombre = usuario && usuario.nombre
      ? usuario.nombre.split(" ")[0]
      : "Usuario";

    saludo.textContent = `Hola, ${primerNombre}`;
  }

  if (avatar && usuario) {
    avatar.textContent = obtenerInicialNombreHomeVitality(usuario.nombre);
  }

  if (identidad) {
    identidad.textContent = await obtenerIdentidadHomeVitality();
  }

  if (porcentajeSemana) {
    porcentajeSemana.textContent = `${porcentaje}%`;
  }

  if (circulo) {
    circulo.style.setProperty("--avance", `${porcentaje}%`);
  }

  if (accionesNumero) {
    accionesNumero.textContent = `${completadas}/${total}`;
  }

  if (accionesResumen) {
    accionesResumen.textContent = `${completadas} de ${total} hechas`;
  }

  const focoHora = document.getElementById("homeFocoHora");
  const focoTitulo = document.getElementById("homeFocoTitulo");
  const focoDetalle = document.getElementById("homeFocoDetalle");
  const focoBtn = document.getElementById("homeFocoCompletarBtn");

  if (proxima) {
    if (focoHora) focoHora.textContent = proxima.hora || "Sin hora";
    if (focoTitulo) focoTitulo.textContent = proxima.titulo;
    if (focoDetalle) {
      focoDetalle.textContent = `Un paso pequeño hacia tu meta · ${obtenerRangoHora(
        proxima.hora,
        proxima.horaFin
      )}`;
    }

    if (focoBtn) {
      focoBtn.disabled = false;
      focoBtn.textContent = "▶ Empezar";
      focoBtn.onclick = () => completarAccionHomeVitality(proxima.origen, proxima.id);
    }
  } else {
    if (focoHora) focoHora.textContent = "Hoy";
    if (focoTitulo) focoTitulo.textContent = "Día organizado";
    if (focoDetalle) focoDetalle.textContent = "No tienes acciones pendientes por ahora.";

    if (focoBtn) {
      focoBtn.disabled = true;
      focoBtn.textContent = "Completado";
    }
  }

  pintarAccionesHomeVitality(acciones);
}

window.addEventListener("DOMContentLoaded", iniciarHomeWarmVitality);
/* =========================
   HOME WARM V2 - IA, RACHA, CHECKINS Y ACCIONES
========================= */
function obtenerFechaSimpleHomeVitality(fecha) {
  const fechaObjeto = new Date(fecha);

  if (Number.isNaN(fechaObjeto.getTime())) {
    return null;
  }

  const anio = fechaObjeto.getFullYear();
  const mes = String(fechaObjeto.getMonth() + 1).padStart(2, "0");
  const dia = String(fechaObjeto.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function restarDiasHomeVitality(fechaSimple, dias) {
  const fecha = new Date(`${fechaSimple}T00:00:00`);
  fecha.setDate(fecha.getDate() - dias);

  return obtenerFechaSimpleHomeVitality(fecha);
}

function obtenerUltimos7DiasHomeVitality() {
  const hoy = obtenerFechaSimpleHomeVitality(new Date());
  const dias = [];

  for (let i = 6; i >= 0; i--) {
    dias.push(restarDiasHomeVitality(hoy, i));
  }

  return dias;
}

function obtenerPuntajeHomeCheckin(estado) {
  const valores = {
    "Muy mal": 25,
    "Mal": 38,
    "Normal": 52,
    "Bien": 70,
    "Muy bien": 88
  };

  return valores[estado] || 55;
}

async function obtenerHistorialHomeVitality() {
  try {
    if (typeof obtenerHistorialCheckinsBackend === "function") {
      return await obtenerHistorialCheckinsBackend();
    }
  } catch (error) {
    console.error("Error obteniendo historial para inicio:", error);
  }

  return [];
}

function calcularRachaHomeVitality(historial) {
  if (!historial || historial.length === 0) {
    return 0;
  }

  const diasUnicos = [
    ...new Set(
      historial
        .map((item) => obtenerFechaSimpleHomeVitality(item.createdAt || item.fecha))
        .filter(Boolean)
    )
  ];

  const hoy = obtenerFechaSimpleHomeVitality(new Date());

  if (!diasUnicos.includes(hoy)) {
    return 0;
  }

  let racha = 0;
  let diaEsperado = hoy;

  while (diasUnicos.includes(diaEsperado)) {
    racha += 1;
    diaEsperado = restarDiasHomeVitality(diaEsperado, 1);
  }

  return racha;
}

function pintarRachaHomeVitality(historial) {
  const racha = calcularRachaHomeVitality(historial);

  const badge = document.getElementById("homeRachaBadge");
  const numero = document.getElementById("homeRachaNumero");

  if (!badge || !numero) {
    return;
  }

  numero.textContent = String(racha);

  badge.classList.remove("racha-activa", "racha-inactiva");

  if (racha > 0) {
    badge.classList.add("racha-activa");
  } else {
    badge.classList.add("racha-inactiva");
  }
}

function pintarGraficoCheckinsHomeVitality(historial) {
  const contenedor = document.getElementById("homeMiniBars");
  const porcentajeTexto = document.getElementById("homePorcentajeSemana");

  if (!contenedor) {
    return;
  }

  const ultimos7Dias = obtenerUltimos7DiasHomeVitality();
  const hoy = obtenerFechaSimpleHomeVitality(new Date());

  const historialPorDia = {};

  historial.forEach((item) => {
    const fechaSimple = obtenerFechaSimpleHomeVitality(item.createdAt || item.fecha);

    if (fechaSimple) {
      historialPorDia[fechaSimple] = item;
    }
  });

  const diasConCheckin = ultimos7Dias.filter((dia) => historialPorDia[dia]).length;
  const porcentaje = Math.round((diasConCheckin / 7) * 100);

  if (porcentajeTexto) {
    porcentajeTexto.textContent = `${porcentaje}%`;
  }

  contenedor.innerHTML = ultimos7Dias
    .map((dia) => {
      const checkin = historialPorDia[dia];

      if (!checkin) {
        return `<span class="sin-checkin" style="height: 18%;"></span>`;
      }

      const altura = obtenerPuntajeHomeCheckin(checkin.estadoAnimo);
      const clase = dia === hoy ? "hoy" : "con-checkin";

      return `<span class="${clase}" style="height: ${altura}%;"></span>`;
    })
    .join("");
}

async function obtenerUltimaRecomendacionIAHomeVitality() {
  const usuarioId = obtenerUsuarioIdVitality();

  if (!usuarioId) {
    return null;
  }

  try {
    const respuesta = await fetch(`${API_URL}/api/recomendaciones-ia/${usuarioId}`);

    if (!respuesta.ok) {
      return null;
    }

    const data = await respuesta.json();

    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    const recomendacionesValidas = data
      .filter((item) => item.estado !== "rechazada")
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return recomendacionesValidas[0] || null;
  } catch (error) {
    console.error("Error obteniendo recomendación IA para inicio:", error);
    return null;
  }
}

async function obtenerObjetivoPendienteHomeVitality() {
  try {
    if (typeof obtenerObjetivosBackend !== "function") {
      return null;
    }

    const objetivos = await obtenerObjetivosBackend();

    if (!Array.isArray(objetivos)) {
      return null;
    }

    return objetivos.find((item) => !item.completado) || null;
  } catch (error) {
    console.error("Error obteniendo objetivo para inicio:", error);
    return null;
  }
}

function obtenerAccionesHomeVitality() {
  const diaHoy = obtenerNombreDiaHoy();
  const fechaHoy = obtenerFechaHoyFormatoInput();

  const fijas = obtenerActividadesFijas()
    .filter((item) => item.dia === diaHoy)
    .map((item) => ({
      ...item,
      origen: "fija",
      tipo: "Rutina",
      titulo: item.actividad,
      hora: item.hora,
      horaFin: item.horaFin
    }));

  const especiales = obtenerActividadesEspeciales()
    .filter((item) => item.fecha === fechaHoy)
    .map((item) => ({
      ...item,
      origen: "especial",
      tipo: item.tipo || "Evento",
      titulo: item.actividad,
      hora: item.hora,
      horaFin: item.horaFin
    }));

  return [...fijas, ...especiales].sort((a, b) =>
    (a.hora || "").localeCompare(b.hora || "")
  );
}

function obtenerProximaAccionHomeVitality(acciones) {
  return acciones.find((item) => !item.completada) || null;
}

async function completarAccionHomeVitality(origen, id) {
  if (origen === "fija") {
    await alternarActividadFija(id);
  } else {
    await alternarActividadEspecial(id);
  }

  setTimeout(iniciarHomeWarmVitality, 300);
}

function pintarAccionesHomeVitality(acciones) {
  const lista = document.getElementById("homeAccionesLista");

  if (!lista) {
    return;
  }

  if (!acciones || acciones.length === 0) {
    lista.innerHTML = `
      <article class="home-action-item">
        <div class="home-action-check"></div>
        <div class="home-action-content">
          <h3>No hay acciones para hoy</h3>
          <div class="home-action-meta">
            <span>Agrega una actividad para organizar tu día.</span>
          </div>
        </div>
      </article>
    `;
    return;
  }

  lista.innerHTML = acciones
    .map((item) => {
      const idSeguro = escaparHTML(item.id);
      const origenSeguro = escaparHTML(item.origen);
      const clase = item.completada ? "completada" : "";

      return `
        <article class="home-action-item ${clase}">
          <button
            type="button"
            class="home-action-check"
            onclick="completarAccionHomeVitality('${origenSeguro}', '${idSeguro}')"
          >
            ✓
          </button>

          <div class="home-action-content">
            <h3>${escaparHTML(item.titulo)}</h3>

            <div class="home-action-meta">
              <span>${escaparHTML(obtenerRangoHora(item.hora, item.horaFin))}</span>
              <span class="home-action-tag">${escaparHTML(item.tipo)}</span>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

async function pintarFocoHomeVitality(acciones) {
  const focoHora = document.getElementById("homeFocoHora");
  const focoTitulo = document.getElementById("homeFocoTitulo");
  const focoDetalle = document.getElementById("homeFocoDetalle");
  const focoBtn = document.getElementById("homeFocoCompletarBtn");

  const recomendacion = await obtenerUltimaRecomendacionIAHomeVitality();

  if (recomendacion) {
    const accion = recomendacion.accionSugerida || {};

    if (focoHora) {
      focoHora.textContent = accion.hora || "IA";
    }

    if (focoTitulo) {
      focoTitulo.textContent =
        accion.titulo ||
        accion.tipo ||
        "Recomendación de Vitality";
    }

    if (focoDetalle) {
      focoDetalle.textContent =
        accion.descripcion ||
        recomendacion.mensajeIA ||
        "Vitality generó una recomendación personalizada según tus datos.";
    }

    if (focoBtn) {
      focoBtn.disabled = false;
      focoBtn.textContent = "Ver recomendación";
      focoBtn.onclick = () => {
        window.location.href = `chat.html?recomendacionId=${recomendacion._id}`;
      };
    }

    return;
  }

  const objetivo = await obtenerObjetivoPendienteHomeVitality();

  if (objetivo) {
    if (focoHora) focoHora.textContent = objetivo.fecha || "Meta";
    if (focoTitulo) focoTitulo.textContent = objetivo.titulo;
    if (focoDetalle) focoDetalle.textContent = objetivo.descripcion || "Objetivo personal pendiente.";

    if (focoBtn) {
      focoBtn.disabled = false;
      focoBtn.textContent = "Ver objetivo";
      focoBtn.onclick = () => {
        window.location.href = "perfil.html";
      };
    }

    return;
  }

  const proxima = obtenerProximaAccionHomeVitality(acciones);

  if (proxima) {
    if (focoHora) focoHora.textContent = proxima.hora || "Hoy";
    if (focoTitulo) focoTitulo.textContent = proxima.titulo;
    if (focoDetalle) {
      focoDetalle.textContent = `Próxima acción · ${obtenerRangoHora(
        proxima.hora,
        proxima.horaFin
      )}`;
    }

    if (focoBtn) {
      focoBtn.disabled = false;
      focoBtn.textContent = "Completar";
      focoBtn.onclick = () => completarAccionHomeVitality(proxima.origen, proxima.id);
    }

    return;
  }

  if (focoHora) focoHora.textContent = "Hoy";
  if (focoTitulo) focoTitulo.textContent = "Día organizado";
  if (focoDetalle) focoDetalle.textContent = "No tienes acciones pendientes por ahora.";

  if (focoBtn) {
    focoBtn.disabled = true;
    focoBtn.textContent = "Completado";
  }
}

async function iniciarHomeWarmVitality() {
  const pagina = obtenerPaginaActual();

  if (pagina !== "horario.html") {
    return;
  }

  await obtenerActividadesBackend();

  const usuario = obtenerUsuario();
  const historial = await obtenerHistorialHomeVitality();
  const acciones = obtenerAccionesHomeVitality();

  const completadas = acciones.filter((item) => item.completada).length;
  const total = acciones.length;
  const porcentajeAcciones = total > 0 ? Math.round((completadas / total) * 100) : 0;

  const fecha = document.getElementById("homeFechaActual");
  const saludo = document.getElementById("homeSaludoUsuario");
  const avatar = document.querySelector(".home-avatar-btn");
  const identidad = document.getElementById("homeIdentidadUsuario");
  const circulo = document.querySelector(".home-progress-circle");
  const accionesNumero = document.getElementById("homeAccionesNumero");
  const accionesResumen = document.getElementById("homeAccionesResumen");

  if (fecha) {
    fecha.textContent = formatearFechaHomeVitality();
  }

  if (saludo) {
    const primerNombre = usuario && usuario.nombre
      ? usuario.nombre.split(" ")[0]
      : "Usuario";

    saludo.textContent = `Hola, ${primerNombre}`;
  }

  if (avatar && usuario) {
    avatar.textContent = obtenerInicialNombreHomeVitality(usuario.nombre);
  }

  if (identidad) {
    identidad.textContent = await obtenerIdentidadHomeVitality();
  }

  pintarGraficoCheckinsHomeVitality(historial);
  pintarRachaHomeVitality(historial);

  if (circulo) {
    circulo.style.setProperty("--avance", `${porcentajeAcciones}%`);
  }

  if (accionesNumero) {
    accionesNumero.textContent = `${completadas}/${total}`;
  }

  if (accionesResumen) {
    accionesResumen.textContent = `${completadas} de ${total} hechas`;
  }

  pintarAccionesHomeVitality(acciones);
  await pintarFocoHomeVitality(acciones);
}

window.addEventListener("DOMContentLoaded", () => {
  setTimeout(iniciarHomeWarmVitality, 600);
});
/* =========================
   HISTORIAL CHECK-INS PARA HOME
========================= */
async function obtenerHistorialCheckinsBackend() {
  const usuarioId = obtenerUsuarioIdVitality();

  if (!usuarioId) {
    return [];
  }

  try {
    const respuesta = await fetch(`${API_URL}/api/checkins/historial/${usuarioId}`);

    if (!respuesta.ok) {
      return [];
    }

    const data = await respuesta.json();

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error obteniendo historial de check-ins:", error);
    return [];
  }
}
/* =========================
   FIX FINAL HOME - CHECKINS, RACHA Y GRAFICO
========================= */
async function obtenerHistorialCheckinsBackend() {
  const usuarioId = obtenerUsuarioIdVitality();

  if (!usuarioId) {
    console.warn("No hay usuarioId para historial de check-ins.");
    return [];
  }

  try {
    const url = `${API_URL}/api/checkins/historial/${usuarioId}`;
    console.log("Consultando historial de check-ins:", url);

    const respuesta = await fetch(url);

    if (!respuesta.ok) {
      console.warn("No se pudo obtener historial:", respuesta.status);
      return [];
    }

    const data = await respuesta.json();

    console.log("Historial recibido:", data);

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error obteniendo historial de check-ins:", error);
    return [];
  }
}

async function obtenerHistorialHomeVitality() {
  let historial = [];

  try {
    historial = await obtenerHistorialCheckinsBackend();
  } catch (error) {
    console.error("Error obteniendo historial home:", error);
  }

  if (!Array.isArray(historial)) {
    historial = [];
  }

  const checkinLocal = obtenerCheckin();

  if (checkinLocal) {
    const fechaLocal =
      checkinLocal.fechaISO ||
      obtenerFechaSimpleHomeVitality(checkinLocal.fecha) ||
      obtenerFechaSimpleHomeVitality(new Date());

    const yaExiste = historial.some((item) => {
      const fechaItem = obtenerFechaSimpleHomeVitality(
        item.createdAt || item.fecha || item.fechaISO
      );

      return fechaItem === fechaLocal;
    });

    if (!yaExiste) {
      historial.push({
        ...checkinLocal,
        fechaISO: fechaLocal,
        fecha: fechaLocal,
        createdAt: `${fechaLocal}T12:00:00`
      });
    }
  }

  console.log("Historial final usado por home:", historial);

  return historial;
}

function obtenerFechaSimpleHomeVitality(fecha) {
  if (!fecha) {
    return null;
  }

  if (typeof fecha === "string" && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return fecha;
  }

  const fechaObjeto = new Date(fecha);

  if (Number.isNaN(fechaObjeto.getTime())) {
    return null;
  }

  const anio = fechaObjeto.getFullYear();
  const mes = String(fechaObjeto.getMonth() + 1).padStart(2, "0");
  const dia = String(fechaObjeto.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function pintarGraficoCheckinsHomeVitality(historial) {
  const contenedor = document.getElementById("homeMiniBars");
  const porcentajeTexto = document.getElementById("homePorcentajeSemana");

  if (!contenedor) {
    return;
  }

  const ultimos7Dias = obtenerUltimos7DiasHomeVitality();
  const hoy = obtenerFechaSimpleHomeVitality(new Date());

  const historialPorDia = {};

  historial.forEach((item) => {
    const fechaSimple = obtenerFechaSimpleHomeVitality(
      item.createdAt || item.fecha || item.fechaISO
    );

    if (fechaSimple) {
      historialPorDia[fechaSimple] = item;
    }
  });

  const diasConCheckin = ultimos7Dias.filter((dia) => historialPorDia[dia]).length;
  const porcentaje = Math.round((diasConCheckin / 7) * 100);

  if (porcentajeTexto) {
    porcentajeTexto.textContent = `${porcentaje}%`;
  }

  contenedor.innerHTML = ultimos7Dias
    .map((dia) => {
      const checkin = historialPorDia[dia];

      if (!checkin) {
        return `<span class="sin-checkin" style="height: 18%;"></span>`;
      }

      const altura = obtenerPuntajeHomeCheckin(checkin.estadoAnimo);
      const clase = dia === hoy ? "hoy" : "con-checkin";

      return `<span class="${clase}" style="height: ${altura}%;"></span>`;
    })
    .join("");
}

function calcularRachaHomeVitality(historial) {
  if (!Array.isArray(historial) || historial.length === 0) {
    return 0;
  }

  const diasUnicos = [
    ...new Set(
      historial
        .map((item) =>
          obtenerFechaSimpleHomeVitality(item.createdAt || item.fecha || item.fechaISO)
        )
        .filter(Boolean)
    )
  ];

  const hoy = obtenerFechaSimpleHomeVitality(new Date());

  if (!diasUnicos.includes(hoy)) {
    return 0;
  }

  let racha = 0;
  let diaEsperado = hoy;

  while (diasUnicos.includes(diaEsperado)) {
    racha += 1;
    diaEsperado = restarDiasHomeVitality(diaEsperado, 1);
  }

  return racha;
}

function pintarRachaHomeVitality(historial) {
  const racha = calcularRachaHomeVitality(historial);

  const badge = document.getElementById("homeRachaBadge");
  const numero = document.getElementById("homeRachaNumero");

  if (!badge || !numero) {
    return;
  }

  numero.textContent = String(racha);

  badge.classList.remove("racha-activa", "racha-inactiva");

  if (racha > 0) {
    badge.classList.add("racha-activa");
  } else {
    badge.classList.add("racha-inactiva");
  }

  console.log("Racha calculada:", racha);
}

window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    iniciarHomeWarmVitality();
  }, 1000);
});
/* =========================
   ORGANIZAR - LISTA ACTIVIDADES FIJAS
========================= */
function obtenerActividadesFijasOrganizarVitality() {
  try {
    if (typeof obtenerActividadesFijas === "function") {
      return obtenerActividadesFijas();
    }

    return leerJSON("actividadesFijasVitality", []);
  } catch (error) {
    console.error("Error obteniendo actividades fijas:", error);
    return [];
  }
}

function mostrarActividadesFijasOrganizarVitality() {
  const contenedor = document.getElementById("listaActividadesFijasOrganizar");

  if (!contenedor) {
    return;
  }

  const actividades = obtenerActividadesFijasOrganizarVitality();

  if (!Array.isArray(actividades) || actividades.length === 0) {
    contenedor.innerHTML = `
      <div class="organizar-fija-item">
        <h3>No hay actividades fijas guardadas</h3>
        <p>Agrega una rutina semanal para verla luego en tu inicio.</p>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = actividades
    .map((actividad) => {
      const id = escaparHTML(actividad.id || actividad._id || "");
      const titulo = escaparHTML(actividad.actividad || actividad.titulo || "Actividad");
      const dia = escaparHTML(actividad.dia || "Sin día");
      const horario = escaparHTML(obtenerRangoHora(actividad.hora, actividad.horaFin));

      return `
        <article class="organizar-fija-item">
          <h3>${titulo}</h3>
          <p>${dia} · ${horario}</p>

          <div class="organizar-fija-actions">
            <button
              type="button"
              class="organizar-fija-edit"
              onclick="editarActividadFijaOrganizarVitality('${id}')"
            >
              Editar
            </button>

            <button
              type="button"
              class="organizar-fija-delete"
              onclick="eliminarActividadFijaOrganizarVitality('${id}')"
            >
              Eliminar
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function editarActividadFijaOrganizarVitality(id) {
  const actividades = obtenerActividadesFijasOrganizarVitality();
  const actividad = actividades.find((item) => String(item.id || item._id) === String(id));

  if (!actividad) {
    mostrarToastVitality("No se encontró la actividad.");
    return;
  }

  const idInput = document.getElementById("editandoActividadFijaId");
  const diaInput = document.getElementById("diaFijo");
  const horaInput = document.getElementById("horaFija");
  const horaFinInput = document.getElementById("horaFinFija");
  const actividadInput = document.getElementById("actividadFija");
  const titulo = document.getElementById("tituloActividadFija");
  const botonGuardar = document.getElementById("btnGuardarActividadFija");
  const botonCancelar = document.getElementById("btnCancelarEdicionFija");

  if (idInput) idInput.value = actividad.id || actividad._id || "";
  if (diaInput) diaInput.value = actividad.dia || "";
  if (horaInput) horaInput.value = actividad.hora || "";
  if (horaFinInput) horaFinInput.value = actividad.horaFin || "";
  if (actividadInput) actividadInput.value = actividad.actividad || actividad.titulo || "";

  if (titulo) titulo.textContent = "Editar actividad fija";
  if (botonGuardar) botonGuardar.textContent = "Guardar cambios";
  if (botonCancelar) botonCancelar.style.display = "block";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

async function eliminarActividadFijaOrganizarVitality(id) {
  const confirmar = confirm("¿Quieres eliminar esta actividad fija?");

  if (!confirmar) {
    return;
  }

  try {
    if (typeof eliminarActividadFija === "function") {
      await eliminarActividadFija(id);
    } else {
      const actividades = obtenerActividadesFijasOrganizarVitality();
      const nuevasActividades = actividades.filter(
        (item) => String(item.id || item._id) !== String(id)
      );

      guardarJSON("actividadesFijasVitality", nuevasActividades);
    }

    mostrarToastVitality("Actividad eliminada.");
    mostrarActividadesFijasOrganizarVitality();
  } catch (error) {
    console.error("Error eliminando actividad fija:", error);
    mostrarToastVitality("No se pudo eliminar la actividad.");
  }
}

function reiniciarFormularioFijaOrganizarVitality() {
  const form = document.getElementById("actividadFijaForm");
  const idInput = document.getElementById("editandoActividadFijaId");
  const titulo = document.getElementById("tituloActividadFija");
  const botonGuardar = document.getElementById("btnGuardarActividadFija");
  const botonCancelar = document.getElementById("btnCancelarEdicionFija");

  if (form) form.reset();
  if (idInput) idInput.value = "";
  if (titulo) titulo.textContent = "Agregar actividad fija";
  if (botonGuardar) botonGuardar.textContent = "Guardar actividad fija";
  if (botonCancelar) botonCancelar.style.display = "none";
}

const cancelarEdicionActividadFijaOriginalVitality = window.cancelarEdicionActividadFija;

window.cancelarEdicionActividadFija = function () {
  if (typeof cancelarEdicionActividadFijaOriginalVitality === "function") {
    cancelarEdicionActividadFijaOriginalVitality();
  }

  reiniciarFormularioFijaOrganizarVitality();
};

window.addEventListener("DOMContentLoaded", () => {
  const pagina = obtenerPaginaActual();

  if (pagina !== "organizar_horario.html") {
    return;
  }

  setTimeout(mostrarActividadesFijasOrganizarVitality, 700);

  const form = document.getElementById("actividadFijaForm");

  if (form) {
    form.addEventListener("submit", () => {
      setTimeout(() => {
        reiniciarFormularioFijaOrganizarVitality();
        mostrarActividadesFijasOrganizarVitality();
      }, 900);
    });
  }
});

/* =========================
   CHAT UX WARM - INPUT, TECLADO Y AUTO SCROLL
========================= */
function bajarChatAlUltimoMensajeVitality() {
  const chatBox = document.getElementById("chatBox");

  if (!chatBox) {
    return;
  }

  requestAnimationFrame(() => {
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

function iniciarChatUXWarmVitality() {
  const pagina = obtenerPaginaActual();

  if (pagina !== "chat.html") {
    return;
  }

  document.body.classList.add("chat-warm-page");

  const input = document.getElementById("userInput");
  const chatBox = document.getElementById("chatBox");

  if (input) {
    input.addEventListener("focus", () => {
      document.body.classList.add("chat-input-focused");
      setTimeout(bajarChatAlUltimoMensajeVitality, 350);
    });

    input.addEventListener("blur", () => {
      setTimeout(() => {
        document.body.classList.remove("chat-input-focused");
      }, 250);
    });

    input.addEventListener("input", () => {
      setTimeout(bajarChatAlUltimoMensajeVitality, 80);
    });
  }

  if (window.visualViewport) {
    const alturaInicial = window.visualViewport.height;

    window.visualViewport.addEventListener("resize", () => {
      const diferencia = alturaInicial - window.visualViewport.height;

      if (diferencia > 120) {
        document.body.classList.add("chat-keyboard-open");
      } else {
        document.body.classList.remove("chat-keyboard-open");
      }

      setTimeout(bajarChatAlUltimoMensajeVitality, 120);
    });
  }

  if (chatBox) {
    const observador = new MutationObserver(() => {
      bajarChatAlUltimoMensajeVitality();
    });

    observador.observe(chatBox, {
      childList: true,
      subtree: true
    });

    setTimeout(bajarChatAlUltimoMensajeVitality, 400);
  }
}

window.addEventListener("DOMContentLoaded", iniciarChatUXWarmVitality);
/* =========================
   CHAT - HISTORIAL EN MONGODB
========================= */
async function guardarMensajeChatMongoVitality(sender, texto, recomendacionId = null, recomendacion = null) {
  const usuarioId = obtenerUsuarioIdVitality();

  if (!usuarioId || !texto) {
    return;
  }

  try {
    await fetch(`${API_URL}/api/chat-historial`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        usuarioId,
        sender,
        texto,
        recomendacionId,
        recomendacion
      })
    });
  } catch (error) {
    console.error("Error guardando mensaje del chat en MongoDB:", error);
  }
}

async function obtenerHistorialChatMongoVitality() {
  const usuarioId = obtenerUsuarioIdVitality();

  if (!usuarioId) {
    return [];
  }

  try {
    const respuesta = await fetch(`${API_URL}/api/chat-historial/${usuarioId}`);

    if (!respuesta.ok) {
      return [];
    }

    const data = await respuesta.json();

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error obteniendo historial del chat:", error);
    return [];
  }
}

function renderizarMensajeChatMongoVitality(mensaje) {
  const chatBox = document.getElementById("chatBox");

  if (!chatBox) {
    return;
  }

  const clase = mensaje.sender === "user" ? "user" : "bot";

  const div = document.createElement("div");
  div.className = `message ${clase}`;

  const p = document.createElement("p");
  p.textContent = mensaje.texto;

  div.appendChild(p);

  if (mensaje.sender === "bot" && mensaje.recomendacionId) {
    const acciones = crearAccionesRecomendacionChat(
      mensaje.recomendacionId,
      mensaje.recomendacion || null
    );

    div.appendChild(acciones);
  }

  chatBox.appendChild(div);
}

async function cargarHistorialChatMongoVitality() {
  const pagina = obtenerPaginaActual();

  if (pagina !== "chat.html") {
    return;
  }

  const chatBox = document.getElementById("chatBox");

  if (!chatBox) {
    return;
  }

  const historial = await obtenerHistorialChatMongoVitality();

  if (!historial || historial.length === 0) {
    return;
  }

  chatBox.innerHTML = "";

  historial.forEach((mensaje) => {
    renderizarMensajeChatMongoVitality(mensaje);
  });

  if (typeof bajarChatAlUltimoMensajeVitality === "function") {
    bajarChatAlUltimoMensajeVitality();
  }
}

window.addEventListener("DOMContentLoaded", cargarHistorialChatMongoVitality);
/* =========================
   PERFIL WARM VISUAL
========================= */
function obtenerFechaSimplePerfilVitality(fecha) {
  if (!fecha) return null;

  if (typeof fecha === "string" && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return fecha;
  }

  const fechaObjeto = new Date(fecha);

  if (Number.isNaN(fechaObjeto.getTime())) {
    return null;
  }

  const anio = fechaObjeto.getFullYear();
  const mes = String(fechaObjeto.getMonth() + 1).padStart(2, "0");
  const dia = String(fechaObjeto.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function restarDiasPerfilVitality(fechaSimple, dias) {
  const fecha = new Date(`${fechaSimple}T00:00:00`);
  fecha.setDate(fecha.getDate() - dias);
  return obtenerFechaSimplePerfilVitality(fecha);
}

function obtenerUltimos7DiasPerfilVitality() {
  const hoy = obtenerFechaSimplePerfilVitality(new Date());
  const dias = [];

  for (let i = 6; i >= 0; i--) {
    dias.push(restarDiasPerfilVitality(hoy, i));
  }

  return dias;
}

function obtenerPuntajePerfilCheckin(estado) {
  const valores = {
    "Muy mal": 25,
    "Mal": 38,
    "Normal": 52,
    "Bien": 70,
    "Muy bien": 88
  };

  return valores[estado] || 55;
}

async function obtenerHistorialPerfilVitality() {
  try {
    if (typeof obtenerHistorialCheckinsBackend === "function") {
      const historial = await obtenerHistorialCheckinsBackend();
      return Array.isArray(historial) ? historial : [];
    }
  } catch (error) {
    console.error("Error obteniendo historial para perfil:", error);
  }

  return [];
}

function calcularRachaPerfilVitality(historial) {
  if (!Array.isArray(historial) || historial.length === 0) {
    return 0;
  }

  const diasUnicos = [
    ...new Set(
      historial
        .map((item) =>
          obtenerFechaSimplePerfilVitality(item.createdAt || item.fecha || item.fechaISO)
        )
        .filter(Boolean)
    )
  ];

  const hoy = obtenerFechaSimplePerfilVitality(new Date());

  if (!diasUnicos.includes(hoy)) {
    return 0;
  }

  let racha = 0;
  let diaEsperado = hoy;

  while (diasUnicos.includes(diaEsperado)) {
    racha += 1;
    diaEsperado = restarDiasPerfilVitality(diaEsperado, 1);
  }

  return racha;
}

async function obtenerOnboardingPerfilVitality() {
  try {
    if (typeof obtenerOnboardingBackendVitality === "function") {
      const onboarding = await obtenerOnboardingBackendVitality();

      if (onboarding) {
        return onboarding;
      }
    }
  } catch (error) {
    console.error("Error obteniendo onboarding para perfil:", error);
  }

  try {
    return leerJSON("onboardingVitality", {});
  } catch (error) {
    return {};
  }
}

function obtenerAccionesHoyPerfilVitality() {
  try {
    const diaHoy = obtenerNombreDiaHoy();
    const fechaHoy = obtenerFechaHoyFormatoInput();

    const fijas = obtenerActividadesFijas()
      .filter((item) => item.dia === diaHoy);

    const especiales = obtenerActividadesEspeciales()
      .filter((item) => item.fecha === fechaHoy);

    return [...fijas, ...especiales];
  } catch (error) {
    console.error("Error obteniendo acciones para perfil:", error);
    return [];
  }
}

function pintarPerfilWarmChips(contenedorId, items, icono) {
  const contenedor = document.getElementById(contenedorId);

  if (!contenedor) return;

  if (!Array.isArray(items) || items.length === 0) {
    contenedor.innerHTML = `
      <div class="perfil-empty-state">
        <p>Aún no hay datos registrados.</p>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = items
    .map((item) => `
      <div class="perfil-chip">
        <div class="perfil-chip-icon">${icono}</div>
        <strong>${escaparHTML(String(item))}</strong>
      </div>
    `)
    .join("");
}

function pintarGraficoPerfilCheckins(historial) {
  const barras = document.getElementById("perfilWarmBarrasCheckin");
  const porcentajeTexto = document.getElementById("perfilWarmCheckinPorcentaje");
  const numero = document.getElementById("perfilWarmCheckinNumero");
  const circle = document.getElementById("perfilWarmCircleCheckin");

  if (!barras) return;

  const ultimos7 = obtenerUltimos7DiasPerfilVitality();
  const hoy = obtenerFechaSimplePerfilVitality(new Date());

  const historialPorDia = {};

  historial.forEach((item) => {
    const fechaSimple = obtenerFechaSimplePerfilVitality(
      item.createdAt || item.fecha || item.fechaISO
    );

    if (fechaSimple) {
      historialPorDia[fechaSimple] = item;
    }
  });

  const diasConCheckin = ultimos7.filter((dia) => historialPorDia[dia]).length;
  const porcentaje = Math.round((diasConCheckin / 7) * 100);

  if (porcentajeTexto) porcentajeTexto.textContent = `${porcentaje}%`;
  if (numero) numero.textContent = `${diasConCheckin}/7`;
  if (circle) circle.style.setProperty("--avance", `${porcentaje}%`);

  barras.innerHTML = ultimos7
    .map((dia) => {
      const checkin = historialPorDia[dia];

      if (!checkin) {
        return `<span style="height: 18%;"></span>`;
      }

      const altura = obtenerPuntajePerfilCheckin(checkin.estadoAnimo);
      const clase = dia === hoy ? "hoy" : "con-checkin";

      return `<span class="${clase}" style="height: ${altura}%;"></span>`;
    })
    .join("");
}

function pintarAccionesPerfilVitality() {
  const acciones = obtenerAccionesHoyPerfilVitality();
  const total = acciones.length;
  const completadas = acciones.filter((item) => item.completada).length;
  const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;

  const numero = document.getElementById("perfilWarmAccionesNumero");
  const circle = document.getElementById("perfilWarmCircleAcciones");

  if (numero) numero.textContent = `${completadas}/${total}`;
  if (circle) circle.style.setProperty("--avance", `${porcentaje}%`);
}

function pintarRachaPerfilVitality(historial) {
  const racha = calcularRachaPerfilVitality(historial);
  const numero = document.getElementById("perfilWarmRachaNumero");
  const card = document.querySelector(".perfil-racha-card");

  if (numero) numero.textContent = String(racha);

  if (card) {
    if (racha > 0) {
      card.classList.remove("racha-inactiva");
    } else {
      card.classList.add("racha-inactiva");
    }
  }
}

async function iniciarPerfilWarmVitality() {
  const pagina = obtenerPaginaActual();

  if (pagina !== "perfil.html") {
    return;
  }

  try {
    if (typeof obtenerActividadesBackend === "function") {
      await obtenerActividadesBackend();
    }
  } catch (error) {
    console.error("Error cargando actividades en perfil:", error);
  }

  const usuario = obtenerUsuario ? obtenerUsuario() : null;
  const onboarding = await obtenerOnboardingPerfilVitality();
  const historial = await obtenerHistorialPerfilVitality();

  const nombre = usuario && usuario.nombre ? usuario.nombre : "Usuario";
  const primerNombre = nombre.split(" ")[0];
  const inicial = primerNombre.charAt(0).toUpperCase() || "U";

  const titulo = document.getElementById("perfilWarmNombre");
  const nombreCard = document.getElementById("perfilWarmNombreCard");
  const correo = document.getElementById("perfilWarmCorreo");
  const avatar = document.getElementById("perfilWarmAvatar");
  const identidad = document.getElementById("perfilWarmIdentidad");

  if (titulo) titulo.textContent = `Hola, ${primerNombre}`;
  if (nombreCard) nombreCard.textContent = nombre;
  if (correo) correo.textContent = usuario && usuario.correo ? usuario.correo : "Sin correo registrado";
  if (avatar) avatar.textContent = inicial;

  if (identidad) {
    identidad.textContent = onboarding.identidad || "Construyendo tu identidad";
  }

  pintarGraficoPerfilCheckins(historial);
  pintarAccionesPerfilVitality();
  pintarRachaPerfilVitality(historial);

  pintarPerfilWarmChips(
    "perfilWarmObjetivos",
    onboarding.objetivos || [],
    "✓"
  );

  pintarPerfilWarmChips(
    "perfilWarmEstres",
    onboarding.estres || [],
    "!"
  );
}

window.addEventListener("DOMContentLoaded", iniciarPerfilWarmVitality);

/* =========================
   PERFIL VISUAL - IDENTIDAD Y PORCENTAJES
========================= */
function escaparPerfilVisualVitality(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

function fechaSimplePerfilVisualVitality(fecha) {
  if (!fecha) return null;

  if (typeof fecha === "string" && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return fecha;
  }

  const fechaObjeto = new Date(fecha);

  if (Number.isNaN(fechaObjeto.getTime())) {
    return null;
  }

  const anio = fechaObjeto.getFullYear();
  const mes = String(fechaObjeto.getMonth() + 1).padStart(2, "0");
  const dia = String(fechaObjeto.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function restarDiasPerfilVisualVitality(fechaSimple, dias) {
  const fecha = new Date(`${fechaSimple}T00:00:00`);
  fecha.setDate(fecha.getDate() - dias);
  return fechaSimplePerfilVisualVitality(fecha);
}

function ultimos7DiasPerfilVisualVitality() {
  const hoy = fechaSimplePerfilVisualVitality(new Date());
  const dias = [];

  for (let i = 6; i >= 0; i--) {
    dias.push(restarDiasPerfilVisualVitality(hoy, i));
  }

  return dias;
}

function valorAnimoPerfilVisual(estado) {
  const mapa = {
    "Muy mal": 20,
    "Mal": 40,
    "Normal": 60,
    "Bien": 80,
    "Muy bien": 95
  };

  return mapa[estado] || 55;
}

function valorEstresPerfilVisual(estres) {
  const mapa = {
    "Alto": 30,
    "Medio": 60,
    "Bajo": 90
  };

  return mapa[estres] || 55;
}

function valorSuenoPerfilVisual(sueno) {
  const mapa = {
    "Mal": 30,
    "Regular": 60,
    "Bien": 90
  };

  return mapa[sueno] || 55;
}

function valorEnergiaPerfilVisual(energia) {
  const mapa = {
    "Baja": 30,
    "Media": 60,
    "Alta": 90
  };

  return mapa[energia] || 55;
}

async function historialPerfilVisualVitality() {
  try {
    if (typeof obtenerHistorialCheckinsBackend === "function") {
      const historial = await obtenerHistorialCheckinsBackend();
      return Array.isArray(historial) ? historial : [];
    }
  } catch (error) {
    console.error("Error obteniendo historial perfil visual:", error);
  }

  return [];
}

async function onboardingPerfilVisualVitality() {
  try {
    if (typeof obtenerOnboardingBackendVitality === "function") {
      const onboarding = await obtenerOnboardingBackendVitality();
      return onboarding || {};
    }
  } catch (error) {
    console.error("Error obteniendo onboarding perfil visual:", error);
  }

  try {
    return leerJSON("onboardingVitality", {});
  } catch (error) {
    return {};
  }
}

function accionesHoyPerfilVisualVitality() {
  try {
    const diaHoy = obtenerNombreDiaHoy();
    const fechaHoy = obtenerFechaHoyFormatoInput();

    const fijas = obtenerActividadesFijas().filter((item) => item.dia === diaHoy);
    const especiales = obtenerActividadesEspeciales().filter((item) => item.fecha === fechaHoy);

    return [...fijas, ...especiales];
  } catch (error) {
    console.error("Error obteniendo acciones perfil visual:", error);
    return [];
  }
}

function calcularRachaPerfilVisualVitality(historial) {
  const diasUnicos = [
    ...new Set(
      historial
        .map((item) => fechaSimplePerfilVisualVitality(item.createdAt || item.fecha || item.fechaISO))
        .filter(Boolean)
    )
  ];

  const hoy = fechaSimplePerfilVisualVitality(new Date());

  if (!diasUnicos.includes(hoy)) {
    return 0;
  }

  let racha = 0;
  let dia = hoy;

  while (diasUnicos.includes(dia)) {
    racha += 1;
    dia = restarDiasPerfilVisualVitality(dia, 1);
  }

  return racha;
}

function pintarRingPerfilVisual(id, porcentaje) {
  const elemento = document.getElementById(id);

  if (elemento) {
    elemento.style.setProperty("--avance", `${porcentaje}%`);
  }
}

function pintarBarraPerfilVisual(idBarra, idTexto, porcentaje) {
  const barra = document.getElementById(idBarra);
  const texto = document.getElementById(idTexto);

  if (barra) barra.style.width = `${porcentaje}%`;
  if (texto) texto.textContent = `${porcentaje}%`;
}

function pintarSemanaPerfilVisual(historial) {
  const contenedor = document.getElementById("perfilVisualSemana");
  const texto = document.getElementById("perfilVisualSemanaTexto");

  if (!contenedor) return;

  const dias = ultimos7DiasPerfilVisualVitality();
  const hoy = fechaSimplePerfilVisualVitality(new Date());

  const diasHistorial = [
    ...new Set(
      historial
        .map((item) => fechaSimplePerfilVisualVitality(item.createdAt || item.fecha || item.fechaISO))
        .filter(Boolean)
    )
  ];

  const letras = ["L", "M", "Mi", "J", "V", "S", "D"];
  const diasConCheckin = dias.filter((dia) => diasHistorial.includes(dia)).length;

  contenedor.innerHTML = dias
    .map((dia, index) => {
      let clase = "";

      if (diasHistorial.includes(dia)) {
        clase = "con-checkin";
      }

      if (dia === hoy && diasHistorial.includes(dia)) {
        clase = "hoy";
      }

      return `
        <div class="${clase}">
          <span></span>
          <small>${letras[index]}</small>
        </div>
      `;
    })
    .join("");

  if (texto) {
    texto.textContent = `${diasConCheckin} de 7 días con check-in.`;
  }

  return diasConCheckin;
}

function pintarTagsPerfilVisual(id, items, icono) {
  const contenedor = document.getElementById(id);

  if (!contenedor) return;

  if (!Array.isArray(items) || items.length === 0) {
    contenedor.innerHTML = "<p>Aún no hay datos registrados.</p>";
    return;
  }

  contenedor.innerHTML = items
    .map((item) => `
      <div class="perfil-tag">
        <span>${icono}</span>
        ${escaparPerfilVisualVitality(String(item))}
      </div>
    `)
    .join("");
}

async function iniciarPerfilVisualVitality() {
  if (obtenerPaginaActual() !== "perfil.html") {
    return;
  }

  try {
    if (typeof obtenerActividadesBackend === "function") {
      await obtenerActividadesBackend();
    }
  } catch (error) {
    console.error("Error cargando actividades perfil visual:", error);
  }

  const usuario = typeof obtenerUsuario === "function" ? obtenerUsuario() : null;
  const onboarding = await onboardingPerfilVisualVitality();
  const historial = await historialPerfilVisualVitality();

  const nombre = usuario && usuario.nombre ? usuario.nombre : "Usuario";
  const primerNombre = nombre.split(" ")[0];
  const inicial = primerNombre.charAt(0).toUpperCase() || "U";

  const titulo = document.getElementById("perfilVisualTitulo");
  const avatar = document.getElementById("perfilVisualAvatar");
  const identidad = document.getElementById("perfilVisualIdentidad");
  const usuarioTexto = document.getElementById("perfilVisualUsuario");

  if (titulo) titulo.textContent = `Hola, ${primerNombre}`;
  if (avatar) avatar.textContent = inicial;
  if (identidad) identidad.textContent = onboarding.identidad || "Construyendo tu identidad";
  if (usuarioTexto) usuarioTexto.textContent = usuario && usuario.correo ? usuario.correo : "Usuario Vitality";

  const ultimoCheckin = historial.length > 0
    ? historial[0]
    : null;

  const animo = ultimoCheckin ? valorAnimoPerfilVisual(ultimoCheckin.estadoAnimo) : 0;
  const calma = ultimoCheckin ? valorEstresPerfilVisual(ultimoCheckin.nivelEstres) : 0;
  const sueno = ultimoCheckin ? valorSuenoPerfilVisual(ultimoCheckin.sueno) : 0;
  const energia = ultimoCheckin ? valorEnergiaPerfilVisual(ultimoCheckin.energia) : 0;

  const bienestar = ultimoCheckin
    ? Math.round((animo + calma + sueno + energia) / 4)
    : 0;

  pintarBarraPerfilVisual("perfilBarraAnimo", "perfilValorAnimo", animo);
  pintarBarraPerfilVisual("perfilBarraEstres", "perfilValorEstres", calma);
  pintarBarraPerfilVisual("perfilBarraSueno", "perfilValorSueno", sueno);
  pintarBarraPerfilVisual("perfilBarraEnergia", "perfilValorEnergia", energia);

  const diasConCheckin = pintarSemanaPerfilVisual(historial) || 0;
  const constancia = Math.round((diasConCheckin / 7) * 100);

  const acciones = accionesHoyPerfilVisualVitality();
  const totalAcciones = acciones.length;
  const completadas = acciones.filter((item) => item.completada).length;
  const organizacion = totalAcciones > 0
    ? Math.round((completadas / totalAcciones) * 100)
    : 0;

  const bienestarText = document.getElementById("perfilPorcentajeBienestar");
  const constanciaText = document.getElementById("perfilPorcentajeConstancia");
  const organizacionText = document.getElementById("perfilPorcentajeOrganizacion");

  if (bienestarText) bienestarText.textContent = `${bienestar}%`;
  if (constanciaText) constanciaText.textContent = `${constancia}%`;
  if (organizacionText) organizacionText.textContent = `${organizacion}%`;

  pintarRingPerfilVisual("perfilRingBienestar", bienestar);
  pintarRingPerfilVisual("perfilRingConstancia", constancia);
  pintarRingPerfilVisual("perfilRingOrganizacion", organizacion);

  const racha = calcularRachaPerfilVisualVitality(historial);
  const rachaNumero = document.getElementById("perfilVisualRacha");
  const rachaTexto = document.getElementById("perfilVisualRachaTexto");
  const rachaCard = document.querySelector(".perfil-streak-card");

  if (rachaNumero) rachaNumero.textContent = String(racha);

  if (rachaTexto) {
    rachaTexto.textContent = racha > 0
      ? "Tu racha está activa hoy."
      : "Haz tu check-in para activar tu racha.";
  }

  if (rachaCard) {
    if (racha > 0) {
      rachaCard.classList.remove("inactiva");
    } else {
      rachaCard.classList.add("inactiva");
    }
  }

  pintarTagsPerfilVisual("perfilVisualObjetivos", onboarding.objetivos || [], "🎯");
  pintarTagsPerfilVisual("perfilVisualEstres", onboarding.estres || [], "⚠️");
}

window.addEventListener("DOMContentLoaded", iniciarPerfilVisualVitality);

/* =========================
   HOME - FOCO IA + CARRUSEL + DIAS CORRECTOS
========================= */
function obtenerEmojiFocoHomeVitality(texto = "") {
  const t = String(texto).toLowerCase();

  if (t.includes("agua") || t.includes("hidrata")) return "💧";
  if (t.includes("respira") || t.includes("respiración")) return "🌬️";
  if (t.includes("camina") || t.includes("ejercicio") || t.includes("mover")) return "🚶";
  if (t.includes("dormir") || t.includes("sueño") || t.includes("descanso")) return "🌙";
  if (t.includes("estudi") || t.includes("tarea") || t.includes("foco")) return "📚";
  if (t.includes("pausa") || t.includes("descanso")) return "☕";
  if (t.includes("digital") || t.includes("instagram") || t.includes("tiktok") || t.includes("celular")) return "📱";
  if (t.includes("medita") || t.includes("calma") || t.includes("ansiedad")) return "🧘";

  return "✨";
}

function obtenerDescripcionCortaHomeVitality(texto = "") {
  const limpio = String(texto)
    .replace(/\s+/g, " ")
    .trim();

  if (!limpio) {
    return "Vitality preparó una sugerencia breve para ayudarte a avanzar con calma.";
  }

  if (limpio.length <= 105) {
    return limpio;
  }

  return `${limpio.slice(0, 105).trim()}...`;
}

function obtenerTituloCortoRecomendacionHomeVitality(recomendacion) {
  const accion = recomendacion?.accionSugerida || {};

  return (
    accion.titulo ||
    accion.tipo ||
    recomendacion?.categoria ||
    "Recomendación personalizada"
  );
}

function obtenerTextoRecomendacionHomeVitality(recomendacion) {
  const accion = recomendacion?.accionSugerida || {};

  return (
    accion.descripcion ||
    accion.detalle ||
    recomendacion?.resumen ||
    recomendacion?.mensajeIA ||
    recomendacion?.mensaje ||
    "Vitality generó una recomendación personalizada según tu estado y tus datos."
  );
}

async function pintarFocoHomeVitality(acciones) {
  const focoHora = document.getElementById("homeFocoHora");
  const focoTitulo = document.getElementById("homeFocoTitulo");
  const focoDetalle = document.getElementById("homeFocoDetalle");
  const focoEmoji = document.getElementById("homeFocoEmoji");
  const focoBtn = document.getElementById("homeFocoCompletarBtn");

  const recomendacion = await obtenerUltimaRecomendacionIAHomeVitality();

  if (recomendacion) {
    const accion = recomendacion.accionSugerida || {};
    const titulo = obtenerTituloCortoRecomendacionHomeVitality(recomendacion);
    const texto = obtenerTextoRecomendacionHomeVitality(recomendacion);
    const emoji = obtenerEmojiFocoHomeVitality(`${titulo} ${texto}`);

    if (focoHora) focoHora.textContent = accion.hora || "IA";
    if (focoTitulo) focoTitulo.textContent = titulo;
    if (focoDetalle) focoDetalle.textContent = obtenerDescripcionCortaHomeVitality(texto);
    if (focoEmoji) focoEmoji.textContent = emoji;

    if (focoBtn) {
      focoBtn.disabled = false;
      focoBtn.textContent = "Ver recomendación";
      focoBtn.onclick = () => {
        window.location.href = `chat.html?recomendacionId=${recomendacion._id}`;
      };
    }

    return;
  }

  const objetivo = await obtenerObjetivoPendienteHomeVitality();

  if (objetivo) {
    const titulo = objetivo.titulo || "Objetivo pendiente";
    const texto = objetivo.descripcion || "Tienes un objetivo personal pendiente para avanzar hoy.";

    if (focoHora) focoHora.textContent = "Meta";
    if (focoTitulo) focoTitulo.textContent = titulo;
    if (focoDetalle) focoDetalle.textContent = obtenerDescripcionCortaHomeVitality(texto);
    if (focoEmoji) focoEmoji.textContent = obtenerEmojiFocoHomeVitality(`${titulo} ${texto}`);

    if (focoBtn) {
      focoBtn.disabled = false;
      focoBtn.textContent = "Ver perfil";
      focoBtn.onclick = () => {
        window.location.href = "perfil.html";
      };
    }

    return;
  }

  const proxima = obtenerProximaAccionHomeVitality(acciones);

  if (proxima) {
    const titulo = proxima.titulo || "Próxima acción";
    const texto = `Próxima acción de tu día · ${obtenerRangoHora(proxima.hora, proxima.horaFin)}`;

    if (focoHora) focoHora.textContent = proxima.hora || "Hoy";
    if (focoTitulo) focoTitulo.textContent = titulo;
    if (focoDetalle) focoDetalle.textContent = texto;
    if (focoEmoji) focoEmoji.textContent = obtenerEmojiFocoHomeVitality(titulo);

    if (focoBtn) {
      focoBtn.disabled = false;
      focoBtn.textContent = "Completar";
      focoBtn.onclick = () => completarAccionHomeVitality(proxima.origen, proxima.id);
    }

    return;
  }

  if (focoHora) focoHora.textContent = "Hoy";
  if (focoTitulo) focoTitulo.textContent = "Día organizado";
  if (focoDetalle) focoDetalle.textContent = "No tienes acciones pendientes por ahora.";
  if (focoEmoji) focoEmoji.textContent = "✅";

  if (focoBtn) {
    focoBtn.disabled = true;
    focoBtn.textContent = "Completado";
  }
}

/* =========================
   HOME - CARRUSEL DE RECOMENDACIONES CORTAS
========================= */
function crearTipsHomeVitality(historial = [], onboarding = {}) {
  const tips = [
    {
      emoji: "💧",
      titulo: "Toma agua",
      descripcion: "Haz una pausa breve y toma un vaso de agua."
    },
    {
      emoji: "🌬️",
      titulo: "Respira 1 minuto",
      descripcion: "Inhala lento, exhala suave y vuelve a tu día con calma."
    },
    {
      emoji: "🚶",
      titulo: "Muévete un poco",
      descripcion: "Camina unos minutos para despejar la mente."
    },
    {
      emoji: "📚",
      titulo: "Bloque corto",
      descripcion: "Elige una tarea pequeña y avanza solo 15 minutos."
    },
    {
      emoji: "📱",
      titulo: "Pausa digital",
      descripcion: "Deja el celular unos minutos y vuelve a tu foco."
    },
    {
      emoji: "🧘",
      titulo: "Baja la tensión",
      descripcion: "Haz una pausa tranquila antes de seguir."
    }
  ];

  const ultimo = Array.isArray(historial) && historial.length > 0 ? historial[0] : null;

  if (ultimo?.nivelEstres === "Alto") {
    tips.unshift({
      emoji: "🌿",
      titulo: "Baja el estrés",
      descripcion: "Respira lento por un minuto antes de continuar."
    });
  }

  if (ultimo?.sueno === "Mal") {
    tips.unshift({
      emoji: "🌙",
      titulo: "Cuida tu descanso",
      descripcion: "Hoy intenta bajar el ritmo y evitar sobrecargarte."
    });
  }

  if (Array.isArray(onboarding.objetivos) && onboarding.objetivos.includes("Estudiar con foco")) {
    tips.unshift({
      emoji: "📚",
      titulo: "Estudia con foco",
      descripcion: "Parte por una tarea mínima para evitar bloquearte."
    });
  }

  return tips.slice(0, 6);
}

function pintarTipsHomeVitality(historial = [], onboarding = {}) {
  const titulo = document.getElementById("homeTipTitulo");
  const descripcion = document.getElementById("homeTipDescripcion");
  const emoji = document.getElementById("homeTipEmoji");
  const dots = document.getElementById("homeTipDots");

  if (!titulo || !descripcion || !emoji) return;

  const tips = crearTipsHomeVitality(historial, onboarding);
  let indice = 0;

  function renderTip() {
    const tip = tips[indice];

    titulo.textContent = tip.titulo;
    descripcion.textContent = tip.descripcion;
    emoji.textContent = tip.emoji;

    if (dots) {
      dots.innerHTML = tips
        .slice(0, 3)
        .map((_, i) => `<span class="${i === indice % 3 ? "active" : ""}"></span>`)
        .join("");
    }

    indice = (indice + 1) % tips.length;
  }

  renderTip();

  if (window.homeTipsIntervalVitality) {
    clearInterval(window.homeTipsIntervalVitality);
  }

  window.homeTipsIntervalVitality = setInterval(renderTip, 4500);
}

/* =========================
   HOME - GRAFICO CHECKINS CON DIAS CORRECTOS
========================= */
function obtenerEtiquetaDiaHomeVitality(fechaSimple) {
  const fecha = new Date(`${fechaSimple}T12:00:00`);
  const etiquetas = ["D", "L", "M", "Mi", "J", "V", "S"];

  return etiquetas[fecha.getDay()];
}

function pintarGraficoCheckinsHomeVitality(historial) {
  const contenedor = document.getElementById("homeMiniBars");
  const labels = document.getElementById("homeDaysLabels");
  const porcentajeTexto = document.getElementById("homePorcentajeSemana");

  if (!contenedor) return;

  const ultimos7Dias = obtenerUltimos7DiasHomeVitality();
  const hoy = obtenerFechaSimpleHomeVitality(new Date());

  const historialPorDia = {};

  historial.forEach((item) => {
    const fechaSimple = obtenerFechaSimpleHomeVitality(
      item.createdAt || item.fecha || item.fechaISO
    );

    if (fechaSimple) {
      historialPorDia[fechaSimple] = item;
    }
  });

  const diasConCheckin = ultimos7Dias.filter((dia) => historialPorDia[dia]).length;
  const porcentaje = Math.round((diasConCheckin / 7) * 100);

  if (porcentajeTexto) {
    porcentajeTexto.textContent = `${porcentaje}%`;
  }

  contenedor.innerHTML = ultimos7Dias
    .map((dia) => {
      const checkin = historialPorDia[dia];

      if (!checkin) {
        return `<span class="sin-checkin" style="height: 18%;"></span>`;
      }

      const altura = obtenerPuntajeHomeCheckin(checkin.estadoAnimo);
      const clase = dia === hoy ? "hoy" : "con-checkin";

      return `<span class="${clase}" style="height: ${altura}%;"></span>`;
    })
    .join("");

  if (labels) {
    labels.innerHTML = ultimos7Dias
      .map((dia) => `<small>${obtenerEtiquetaDiaHomeVitality(dia)}</small>`)
      .join("");
  }
}

/* =========================
   HOME - INICIO ACTUALIZADO
========================= */
async function iniciarHomeWarmVitality() {
  const pagina = obtenerPaginaActual();

  if (pagina !== "horario.html") {
    return;
  }

  await obtenerActividadesBackend();

  const usuario = obtenerUsuario();
  const historial = await obtenerHistorialHomeVitality();
  const onboarding = typeof obtenerOnboardingBackendVitality === "function"
    ? await obtenerOnboardingBackendVitality()
    : {};
  const acciones = obtenerAccionesHomeVitality();

  const completadas = acciones.filter((item) => item.completada).length;
  const total = acciones.length;
  const porcentajeAcciones = total > 0 ? Math.round((completadas / total) * 100) : 0;

  const fecha = document.getElementById("homeFechaActual");
  const saludo = document.getElementById("homeSaludoUsuario");
  const avatar = document.querySelector(".home-avatar-btn");
  const circulo = document.querySelector(".home-progress-circle");
  const accionesNumero = document.getElementById("homeAccionesNumero");
  const accionesResumen = document.getElementById("homeAccionesResumen");

  if (fecha) {
    fecha.textContent = formatearFechaHomeVitality();
  }

  if (saludo) {
    const primerNombre = usuario && usuario.nombre
      ? usuario.nombre.split(" ")[0]
      : "Usuario";

    saludo.textContent = `Hola, ${primerNombre}`;
  }

  if (avatar && usuario) {
    avatar.textContent = obtenerInicialNombreHomeVitality(usuario.nombre);
  }

  pintarGraficoCheckinsHomeVitality(historial);
  pintarRachaHomeVitality(historial);
  pintarTipsHomeVitality(historial, onboarding);

  if (circulo) {
    circulo.style.setProperty("--avance", `${porcentajeAcciones}%`);
  }

  if (accionesNumero) {
    accionesNumero.textContent = `${completadas}/${total}`;
  }

  if (accionesResumen) {
    accionesResumen.textContent = `${completadas} de ${total} hechas`;
  }

  pintarAccionesHomeVitality(acciones);
  await pintarFocoHomeVitality(acciones);
}

window.addEventListener("DOMContentLoaded", () => {
  setTimeout(iniciarHomeWarmVitality, 600);
});
