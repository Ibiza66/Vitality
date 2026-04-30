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
        <p><strong>Recomendación:</strong> Intenta descansar, hidratarte bien o hacer una actividad tranquila que disfrutes.</p>
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

function guardarActividadFija(event) {
  event.preventDefault();

  const diaInput = document.getElementById("diaFijo");
  const horaInput = document.getElementById("horaFija");
  const actividadInput = document.getElementById("actividadFija");

  if (!diaInput || !horaInput || !actividadInput) return;

  const dia = diaInput.value.trim();
  const hora = horaInput.value.trim();
  const actividad = actividadInput.value.trim();

  if (!dia || !hora || !actividad) {
    alert("Por favor completa todos los campos de la actividad fija.");
    return;
  }

  const actividadesFijas = obtenerActividadesFijas();
  actividadesFijas.push({
    id: Date.now(),
    dia,
    hora,
    actividad,
    completada: false
  });
  guardarActividadesFijas(actividadesFijas);

  alert("Actividad fija guardada con éxito.");
  event.target.reset();
  mostrarActividadesFijas();
}

function guardarActividadEspecial(event) {
  event.preventDefault();

  const tipoInput = document.getElementById("tipoEspecial");
  const fechaInput = document.getElementById("fechaEspecial");
  const horaInput = document.getElementById("horaEspecial");
  const actividadInput = document.getElementById("actividadEspecial");

  if (!tipoInput || !fechaInput || !horaInput || !actividadInput) return;

  const tipo = tipoInput.value.trim();
  const fecha = fechaInput.value.trim();
  const hora = horaInput.value.trim();
  const actividad = actividadInput.value.trim();

  if (!tipo || !fecha || !hora || !actividad) {
    alert("Por favor completa todos los campos de la actividad especial.");
    return;
  }

  const actividadesEspeciales = obtenerActividadesEspeciales();
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
  event.target.reset();
  mostrarActividadesEspeciales();
}

function alternarActividadFija(id) {
  const actividadesFijas = obtenerActividadesFijas().map((item) =>
    item.id === id ? { ...item, completada: !item.completada } : item
  );

  guardarActividadesFijas(actividadesFijas);
  mostrarActividadesFijas();
}

function eliminarActividadFija(id) {
  const actividadesFijas = obtenerActividadesFijas().filter((item) => item.id !== id);
  guardarActividadesFijas(actividadesFijas);
  mostrarActividadesFijas();
}

function alternarActividadEspecial(id) {
  const actividadesEspeciales = obtenerActividadesEspeciales().map((item) =>
    item.id === id ? { ...item, completada: !item.completada } : item
  );

  guardarActividadesEspeciales(actividadesEspeciales);
  mostrarActividadesEspeciales();
}

function eliminarActividadEspecial(id) {
  const actividadesEspeciales = obtenerActividadesEspeciales().filter((item) => item.id !== id);
  guardarActividadesEspeciales(actividadesEspeciales);
  mostrarActividadesEspeciales();
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
            <button type="button" onclick="eliminarActividadEspecial(${item.id})">Eliminar</button>
          </div>
        </div>
      `
    )
    .join("");
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

  mostrarDatosPerfil();
  mostrarResumenCheckinEnPerfil();
  mostrarAlertas();
  mostrarActividadesFijas();
  mostrarActividadesEspeciales();
});