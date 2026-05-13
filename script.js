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
   CHAT DE APOYO
========================= */
let chatStep = 0;

const chatQuestions = [
  "Gracias por contármelo. ¿Dirías que hoy te sientes con mucho estrés, poco estrés o algo intermedio?",
  "Entiendo. ¿Te ha pasado solo hoy o llevas varios días sintiéndote así?",
  "Gracias por responder. ¿Te gustaría que te sugiera una actividad para sentirte mejor?"
];

function sendMessage(event) {
  event.preventDefault();

  const input = document.getElementById("userInput");
  const chatBox = document.getElementById("chatBox");

  if (!input || !chatBox) return;

  const text = input.value.trim();
  if (text === "") return;

  addMessage(text, "user");
  input.value = "";

  setTimeout(() => {
    let response = "";

    if (chatStep < chatQuestions.length) {
      response = chatQuestions[chatStep];
      chatStep++;
    } else {
      response = generateSupportResponse(text);
    }

    addMessage(response, "bot");
  }, 600);
}

function addMessage(text, sender) {
  const chatBox = document.getElementById("chatBox");
  if (!chatBox) return;

  const message = document.createElement("div");
  message.classList.add("message", sender);

  const paragraph = document.createElement("p");
  paragraph.textContent = text;

  message.appendChild(paragraph);
  chatBox.appendChild(message);

  chatBox.scrollTop = chatBox.scrollHeight;
}

function generateSupportResponse(text) {
  const msg = text.toLowerCase();

  if (msg.includes("sí") || msg.includes("si")) {
    return "Podrías intentar una pausa breve, escuchar música relajante, salir a caminar o conversar con alguien de confianza 💚";
  }

  if (
    msg.includes("estrés") ||
    msg.includes("estres") ||
    msg.includes("ansiedad")
  ) {
    return "Lamento que te sientas así. Te recomiendo respirar profundo unos minutos, bajar el ritmo por un momento y revisar una actividad tranquila que te guste.";
  }

  if (
    msg.includes("triste") ||
    msg.includes("mal") ||
    msg.includes("cansado") ||
    msg.includes("cansada")
  ) {
    return "Gracias por decírmelo. A veces ayuda mucho descansar, hacer algo que disfrutes o hablar con alguien cercano.";
  }

  if (msg.includes("bien") || msg.includes("mejor")) {
    return "Me alegra leer eso. Mantener una rutina equilibrada y darte pausas también ayuda a seguir sintiéndote bien.";
  }

  return "Gracias por compartirlo conmigo. Si quieres, puedo seguir acompañándote o sugerirte alguna actividad para despejarte.";
}

/* =========================
   REGISTRO E INICIO DE SESIÓN
========================= */
function guardarUsuario(nombre, correo, password) {
  const usuario = { nombre, correo, password };
  localStorage.setItem("usuarioVitality", JSON.stringify(usuario));
}

function obtenerUsuario() {
  const usuarioGuardado = localStorage.getItem("usuarioVitality");
  return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
}

function registrarUsuario(event) {
  event.preventDefault();

  const nombreInput = document.getElementById("nombre");
  const correoInput = document.getElementById("correo");
  const passwordInput = document.getElementById("password");

  if (!nombreInput || !correoInput || !passwordInput) return;

  const nombre = nombreInput.value.trim();
  const correo = correoInput.value.trim();
  const password = passwordInput.value.trim();

  if (!nombre || !correo || !password) {
    alert("Por favor completa todos los campos.");
    return;
  }

  guardarUsuario(nombre, correo, password);
  alert("Cuenta creada con éxito.");
  window.location.href = "perfil.html";
}

function iniciarSesion(event) {
  event.preventDefault();

  const correoInput = document.getElementById("correoLogin");
  const passwordInput = document.getElementById("passwordLogin");

  if (!correoInput || !passwordInput) return;

  const correo = correoInput.value.trim();
  const password = passwordInput.value.trim();

  const usuario = obtenerUsuario();

  if (!usuario) {
    alert("No existe una cuenta registrada. Por favor regístrate primero.");
    return;
  }

  if (correo === usuario.correo && password === usuario.password) {
    alert("Inicio de sesión exitoso.");
    window.location.href = "horario.html";
  } else {
    alert("Correo o contraseña incorrectos.");
  }
}

/* =========================
   PERFIL DEL USUARIO
========================= */
function guardarPerfil(categoria, actividades) {
  const perfil = { categoria, actividades };
  localStorage.setItem("perfilVitality", JSON.stringify(perfil));
}

function obtenerPerfil() {
  const perfilGuardado = localStorage.getItem("perfilVitality");
  return perfilGuardado ? JSON.parse(perfilGuardado) : null;
}

function guardarDatosPerfil(event) {
  event.preventDefault();

  const categoriaInput = document.getElementById("categoria");
  const actividadesInput = document.getElementById("actividades");

  if (!categoriaInput || !actividadesInput) return;

  const categoria = categoriaInput.value.trim();
  const actividades = actividadesInput.value.trim();

  if (!categoria || !actividades) {
    alert("Por favor completa todos los campos del perfil.");
    return;
  }

  guardarPerfil(categoria, actividades);
  mostrarDatosPerfil();
  alert("Perfil guardado con éxito.");
}

function mostrarDatosPerfil() {
  const usuario = obtenerUsuario();
  const perfil = obtenerPerfil();

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
function guardarCheckin(estadoAnimo, nivelEstres, sueno, energia) {
  const checkin = {
    estadoAnimo,
    nivelEstres,
    sueno,
    energia,
    fecha: new Date().toLocaleDateString()
  };

  localStorage.setItem("checkinVitality", JSON.stringify(checkin));
}

function obtenerCheckin() {
  const checkinGuardado = localStorage.getItem("checkinVitality");
  return checkinGuardado ? JSON.parse(checkinGuardado) : null;
}

function guardarDatosCheckin(event) {
  event.preventDefault();

  const estadoAnimoInput = document.getElementById("estadoAnimo");
  const nivelEstresInput = document.getElementById("nivelEstres");
  const suenoInput = document.getElementById("sueno");
  const energiaInput = document.getElementById("energia");

  if (!estadoAnimoInput || !nivelEstresInput || !suenoInput || !energiaInput) {
    return;
  }

  const estadoAnimo = estadoAnimoInput.value.trim();
  const nivelEstres = nivelEstresInput.value.trim();
  const sueno = suenoInput.value.trim();
  const energia = energiaInput.value.trim();

  if (!estadoAnimo || !nivelEstres || !sueno || !energia) {
    alert("Por favor completa todo el check-in.");
    return;
  }

  guardarCheckin(estadoAnimo, nivelEstres, sueno, energia);
  alert("Check-in guardado con éxito.");
  window.location.href = "alertas.html";
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
  const data = localStorage.getItem("actividadesFijasVitality");
  return data ? JSON.parse(data) : [];
}

function guardarActividadesFijas(lista) {
  localStorage.setItem("actividadesFijasVitality", JSON.stringify(lista));
}

function obtenerActividadesEspeciales() {
  const data = localStorage.getItem("actividadesEspecialesVitality");
  return data ? JSON.parse(data) : [];
}

function guardarActividadesEspeciales(lista) {
  localStorage.setItem("actividadesEspecialesVitality", JSON.stringify(lista));
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

function cargarEdicionActividadFija() {
  const idGuardado = localStorage.getItem("editandoActividadFijaId");
  if (!idGuardado) return;

  const actividadesFijas = obtenerActividadesFijas();
  const actividad = actividadesFijas.find((item) => String(item.id) === idGuardado);
  if (!actividad) return;

  const titulo = document.getElementById("tituloActividadFija");
  const inputId = document.getElementById("editandoActividadFijaId");
  const dia = document.getElementById("diaFijo");
  const hora = document.getElementById("horaFija");
  const actividadInput = document.getElementById("actividadFija");
  const boton = document.getElementById("btnGuardarActividadFija");

  if (titulo) titulo.textContent = "Editar actividad fija";
  if (inputId) inputId.value = actividad.id;
  if (dia) dia.value = actividad.dia;
  if (hora) hora.value = actividad.hora;
  if (actividadInput) actividadInput.value = actividad.actividad;
  if (boton) boton.textContent = "Guardar cambios";
}

function cargarEdicionActividadEspecial() {
  const idGuardado = localStorage.getItem("editandoActividadEspecialId");
  if (!idGuardado) return;

  const actividadesEspeciales = obtenerActividadesEspeciales();
  const actividad = actividadesEspeciales.find((item) => String(item.id) === idGuardado);
  if (!actividad) return;

  const titulo = document.getElementById("tituloActividadEspecial");
  const inputId = document.getElementById("editandoActividadEspecialId");
  const tipo = document.getElementById("tipoEspecial");
  const fecha = document.getElementById("fechaEspecial");
  const hora = document.getElementById("horaEspecial");
  const actividadInput = document.getElementById("actividadEspecial");
  const boton = document.getElementById("btnGuardarActividadEspecial");

  if (titulo) titulo.textContent = "Editar actividad especial";
  if (inputId) inputId.value = actividad.id;
  if (tipo) tipo.value = actividad.tipo;
  if (fecha) fecha.value = actividad.fecha;
  if (hora) hora.value = actividad.hora;
  if (actividadInput) actividadInput.value = actividad.actividad;
  if (boton) boton.textContent = "Guardar cambios";
}

function limpiarEdicionActividadFija() {
  localStorage.removeItem("editandoActividadFijaId");
  const titulo = document.getElementById("tituloActividadFija");
  const inputId = document.getElementById("editandoActividadFijaId");
  const boton = document.getElementById("btnGuardarActividadFija");

  if (titulo) titulo.textContent = "Agregar actividad fija";
  if (inputId) inputId.value = "";
  if (boton) boton.textContent = "Guardar actividad fija";
}

function limpiarEdicionActividadEspecial() {
  localStorage.removeItem("editandoActividadEspecialId");
  const titulo = document.getElementById("tituloActividadEspecial");
  const inputId = document.getElementById("editandoActividadEspecialId");
  const boton = document.getElementById("btnGuardarActividadEspecial");

  if (titulo) titulo.textContent = "Agregar actividad especial";
  if (inputId) inputId.value = "";
  if (boton) boton.textContent = "Guardar actividad especial";
}

function guardarActividadFija(event) {
  event.preventDefault();

  const diaInput = document.getElementById("diaFijo");
  const horaInput = document.getElementById("horaFija");
  const actividadInput = document.getElementById("actividadFija");
  const editandoIdInput = document.getElementById("editandoActividadFijaId");

  if (!diaInput || !horaInput || !actividadInput) return;

  const dia = diaInput.value.trim();
  const hora = horaInput.value.trim();
  const actividad = actividadInput.value.trim();
  const editandoId = editandoIdInput ? editandoIdInput.value.trim() : "";

  if (!dia || !hora || !actividad) {
    alert("Por favor completa todos los campos de la actividad fija.");
    return;
  }

  const actividadesFijas = obtenerActividadesFijas();

  if (editandoId) {
    const actualizadas = actividadesFijas.map((item) =>
      String(item.id) === editandoId
        ? {
            ...item,
            dia,
            hora,
            actividad
          }
        : item
    );

    guardarActividadesFijas(actualizadas);
    alert("Actividad fija actualizada con éxito.");
    limpiarEdicionActividadFija();
  } else {
    actividadesFijas.push({
      id: Date.now(),
      dia,
      hora,
      actividad,
      completada: false
    });

    guardarActividadesFijas(actividadesFijas);
    alert("Actividad fija guardada con éxito.");
  }

  event.target.reset();
  mostrarActividadesFijas();
  mostrarActividadesHoy();
  rellenarTablaHorarioSemanal();
}

function guardarActividadEspecial(event) {
  event.preventDefault();

  const tipoInput = document.getElementById("tipoEspecial");
  const fechaInput = document.getElementById("fechaEspecial");
  const horaInput = document.getElementById("horaEspecial");
  const actividadInput = document.getElementById("actividadEspecial");
  const editandoIdInput = document.getElementById("editandoActividadEspecialId");

  if (!tipoInput || !fechaInput || !horaInput || !actividadInput) return;

  const tipo = tipoInput.value.trim();
  const fecha = fechaInput.value.trim();
  const hora = horaInput.value.trim();
  const actividad = actividadInput.value.trim();
  const editandoId = editandoIdInput ? editandoIdInput.value.trim() : "";

  if (!tipo || !fecha || !hora || !actividad) {
    alert("Por favor completa todos los campos de la actividad especial.");
    return;
  }

  const actividadesEspeciales = obtenerActividadesEspeciales();

  if (editandoId) {
    const actualizadas = actividadesEspeciales.map((item) =>
      String(item.id) === editandoId
        ? {
            ...item,
            tipo,
            fecha,
            hora,
            actividad
          }
        : item
    );

    guardarActividadesEspeciales(actualizadas);
    alert("Actividad especial actualizada con éxito.");
    limpiarEdicionActividadEspecial();
  } else {
    actividadesEspeciales.push({
      id: Date.now(),
      tipo,
      fecha,
      hora,
      actividad,
      completada: false
    });

    guardarActividadesEspeciales(actividadesEspeciales);
    alert("Actividad especial guardada con éxito.");
  }

  event.target.reset();
  mostrarActividadesEspeciales();
  mostrarActividadesHoy();
  mostrarEventosEspecialesHoy();
}

function alternarActividadFija(id) {
  const actividadesFijas = obtenerActividadesFijas().map((item) =>
    item.id === id ? { ...item, completada: !item.completada } : item
  );

  guardarActividadesFijas(actividadesFijas);
  mostrarActividadesFijas();
  mostrarActividadesHoy();
  rellenarTablaHorarioSemanal();
}

function eliminarActividadFija(id) {
  const actividadesFijas = obtenerActividadesFijas().filter((item) => item.id !== id);
  guardarActividadesFijas(actividadesFijas);
  mostrarActividadesFijas();
  mostrarActividadesHoy();
  rellenarTablaHorarioSemanal();
}

function alternarActividadEspecial(id) {
  const actividadesEspeciales = obtenerActividadesEspeciales().map((item) =>
    item.id === id ? { ...item, completada: !item.completada } : item
  );

  guardarActividadesEspeciales(actividadesEspeciales);
  mostrarActividadesEspeciales();
  mostrarActividadesHoy();
  mostrarEventosEspecialesHoy();
}

function eliminarActividadEspecial(id) {
  const actividadesEspeciales = obtenerActividadesEspeciales().filter((item) => item.id !== id);
  guardarActividadesEspeciales(actividadesEspeciales);
  mostrarActividadesEspeciales();
  mostrarActividadesHoy();
  mostrarEventosEspecialesHoy();
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
          <strong>${item.dia} - ${item.hora}</strong>
          <p>${item.actividad}</p>
          <p><strong>Estado:</strong> ${item.completada ? "Realizada" : "Pendiente"}</p>
          <div class="acciones-actividad">
            <button type="button" onclick="alternarActividadFija(${item.id})">
              ${item.completada ? "Desmarcar" : "Completar"}
            </button>
            <button type="button" onclick="editarActividadFija(${item.id})">Editar</button>
            <button type="button" onclick="eliminarActividadFija(${item.id})">Eliminar</button>
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
          <strong>${item.tipo}</strong>
          <p>${item.fecha} - ${item.hora}</p>
          <p>${item.actividad}</p>
          <p><strong>Estado:</strong> ${item.completada ? "Realizada" : "Pendiente"}</p>
          <div class="acciones-actividad">
            <button type="button" onclick="alternarActividadEspecial(${item.id})">
              ${item.completada ? "Desmarcar" : "Completar"}
            </button>
            <button type="button" onclick="editarActividadEspecial(${item.id})">Editar</button>
            <button type="button" onclick="eliminarActividadEspecial(${item.id})">Eliminar</button>
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
      titulo: `${item.dia} - ${item.hora}`,
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
      titulo: `${item.fecha} - ${item.hora}`,
      descripcion: item.actividad,
      estado: item.completada ? "Realizada" : "Pendiente",
      completada: item.completada,
      hora: item.hora
    });
  });

  actividadesHoy.sort((a, b) => a.hora.localeCompare(b.hora));

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
      const botonCompletar =
        item.origen === "fija"
          ? `onclick="alternarActividadFija(${item.id})"`
          : `onclick="alternarActividadEspecial(${item.id})"`;

      const botonEliminar =
        item.origen === "fija"
          ? `onclick="eliminarActividadFija(${item.id})"`
          : `onclick="eliminarActividadEspecial(${item.id})"`;

      const botonEditar =
        item.origen === "fija"
          ? `onclick="editarActividadFija(${item.id})"`
          : `onclick="editarActividadEspecial(${item.id})"`;

      return `
        <div class="actividad-card ${item.completada ? "actividad-completada" : ""}">
          <strong>${item.tipo}</strong>
          <p>${item.titulo}</p>
          <p>${item.descripcion}</p>
          <p><strong>Estado:</strong> ${item.estado}</p>
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

/* =========================
   EVENTOS ESPECIALES DE HOY
========================= */
function mostrarEventosEspecialesHoy() {
  const contenedor = document.getElementById("listaEventosHoy");
  if (!contenedor) return;

  const fechaHoy = obtenerFechaHoyFormatoInput();

  const eventosHoy = obtenerActividadesEspeciales()
    .filter((item) => item.fecha === fechaHoy)
    .sort((a, b) => a.hora.localeCompare(b.hora));

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
          <strong>${item.tipo}</strong>
          <p>${item.hora}</p>
          <p>${item.actividad}</p>
          <p><strong>Estado:</strong> ${item.completada ? "Realizada" : "Pendiente"}</p>
          <div class="acciones-actividad">
            <button type="button" onclick="alternarActividadEspecial(${item.id})">
              ${item.completada ? "Desmarcar" : "Completar"}
            </button>
            <button type="button" onclick="editarActividadEspecial(${item.id})">Editar</button>
            <button type="button" onclick="eliminarActividadEspecial(${item.id})">Eliminar</button>
          </div>
        </div>
      `
    )
    .join("");
}

/* =========================
   TABLA SEMANAL DINÁMICA
========================= */
function limpiarTablaHorarioSemanal() {
  const tabla = document.getElementById("tablaHorarioSemanal");
  if (!tabla) return;

  const filas = tabla.querySelectorAll("tbody tr");

  filas.forEach((fila) => {
    const celdas = fila.querySelectorAll("td");
    celdas.forEach((celda, index) => {
      if (index !== 0) {
        celda.textContent = "";
      }
    });
  });
}

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

function rellenarTablaHorarioSemanal() {
  const tabla = document.getElementById("tablaHorarioSemanal");
  if (!tabla) return;

  limpiarTablaHorarioSemanal();

  const actividadesFijas = obtenerActividadesFijas();
  const filas = tabla.querySelectorAll("tbody tr");

  actividadesFijas.forEach((actividad) => {
    const indiceDia = obtenerIndiceDia(actividad.dia);
    if (!indiceDia) return;

    filas.forEach((fila) => {
      const celdas = fila.querySelectorAll("td");
      const horaFila = celdas[0]?.textContent.trim();

      if (horaFila === actividad.hora && celdas[indiceDia]) {
        if (celdas[indiceDia].textContent.trim() !== "") {
          celdas[indiceDia].textContent += " / " + actividad.actividad;
        } else {
          celdas[indiceDia].textContent = actividad.actividad;
        }
      }
    });
  });
}

/* =========================
   CARGA INICIAL
========================= */
window.addEventListener("DOMContentLoaded", () => {
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

  cargarEdicionActividadFija();
  cargarEdicionActividadEspecial();

  mostrarDatosPerfil();
  mostrarResumenCheckinEnPerfil();
  mostrarAlertas();
  mostrarActividadesFijas();
  mostrarActividadesEspeciales();
  mostrarActividadesHoy();
  mostrarEventosEspecialesHoy();
  rellenarTablaHorarioSemanal();
});