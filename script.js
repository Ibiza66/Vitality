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

  mostrarBotonCancelarFija();
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

  if (form) {
    form.reset();
  }

  limpiarEdicionActividadFija();
}

function cancelarEdicionActividadEspecial() {
  const form = document.getElementById("actividadEspecialForm");

  if (form) {
    form.reset();
  }

  limpiarEdicionActividadEspecial();
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

/* =========================
   ACCIONES ACTIVIDADES
========================= */
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
    const response = generateSupportResponse(text);
    addMessage(response, "bot");
    actualizarBotonesChat();
  }, 500);
}

function usarOpcionRapida(opcion) {
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
  if (!contenedor) return;

  if (chatState === "inicio") {
    contenedor.innerHTML = `
      <button type="button" onclick="usarOpcionRapida('conversar')">Conversar</button>
      <button type="button" onclick="usarOpcionRapida('organización')">Organizar mi día</button>
      <button type="button" onclick="usarOpcionRapida('recomendación')">Dame una recomendación</button>
    `;
    return;
  }

  if (chatState === "conversacion") {
    contenedor.innerHTML = `
      <button type="button" onclick="usarOpcionRapida('quiero seguir conversando')">Seguir conversando</button>
      <button type="button" onclick="usarOpcionRapida('organizar mi día')">Organizar mi día</button>
      <button type="button" onclick="reiniciarChat()">Volver al inicio</button>
    `;
    return;
  }

  if (chatState === "organizacion") {
    contenedor.innerHTML = `
      <button type="button" onclick="usarOpcionRapida('sí')">Sí</button>
      <button type="button" onclick="usarOpcionRapida('no')">No</button>
      <button type="button" onclick="reiniciarChat()">Volver al inicio</button>
    `;
    return;
  }

  if (chatState === "recomendacion") {
    contenedor.innerHTML = `
      <button type="button" onclick="usarOpcionRapida('otra')">Otra recomendación</button>
      <button type="button" onclick="usarOpcionRapida('gracias')">Gracias</button>
      <button type="button" onclick="reiniciarChat()">Volver al inicio</button>
    `;
    return;
  }
}

function reiniciarChat() {
  iniciarChatInteligente();
  actualizarBotonesChat();
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
  iniciarChatInteligente();
});