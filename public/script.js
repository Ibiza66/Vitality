/* =========================
   MENÃš HAMBURGUESA Y PERFIL
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
   NAVEGACIÃ“N EN HORARIO
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
   REGISTRO E INICIO DE SESIÃ“N
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
  alert("Cuenta creada con Ã©xito.");
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
    alert("No existe una cuenta registrada. Por favor regÃ­strate primero.");
    return;
  }

  if (correo === usuario.correo && password === usuario.password) {
    alert("Inicio de sesiÃ³n exitoso.");
    window.location.href = "horario.html";
  } else {
    alert("Correo o contraseÃ±a incorrectos.");
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
  mostrarPanelPerfilAvanzado();
  alert("Perfil guardado con Ã©xito.");
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
  alert("Check-in guardado con Ã©xito.");
  window.location.href = "alertas.html";
}

/* =========================
   ALERTAS SEGÃšN CHECK-IN
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
        <p><strong>Estado detectado:</strong> Hoy registraste un nivel de estrÃ©s alto.</p>
        <p><strong>RecomendaciÃ³n:</strong> Te recomendamos tomar una pausa, salir a caminar o escuchar mÃºsica relajante.</p>
      </div>
    `;
  }

  if (checkin.energia === "Baja") {
    alertasHTML += `
      <div class="alerta">
        <p><strong>Consejo de bienestar:</strong> Tu nivel de energÃ­a estÃ¡ bajo.</p>
        <p><strong>RecomendaciÃ³n:</strong> Intenta descansar, hidratarte bien o hacer una actividad tranquila que te guste.</p>
      </div>
    `;
  }

  if (checkin.sueno === "Mal") {
    alertasHTML += `
      <div class="alerta">
        <p><strong>Descanso insuficiente:</strong> Reportaste que dormiste mal.</p>
        <p><strong>RecomendaciÃ³n:</strong> Considera acostarte mÃ¡s temprano hoy y reducir actividades exigentes esta noche.</p>
      </div>
    `;
  }

  if (checkin.estadoAnimo === "Mal" || checkin.estadoAnimo === "Muy mal") {
    alertasHTML += `
      <div class="alerta">
        <p><strong>Estado emocional:</strong> Hoy no te has sentido bien.</p>
        <p><strong>RecomendaciÃ³n:</strong> Date un momento para ti, habla con alguien de confianza o usa el chat de apoyo de Vitality.</p>
      </div>
    `;
  }

  if (alertasHTML === "") {
    alertasHTML = `
      <div class="alerta">
        <p><strong>Buen trabajo.</strong> No detectamos alertas importantes en tu check-in de hoy.</p>
        <p><strong>Sugerencia:</strong> MantÃ©n tu rutina, tus pausas y tus hÃ¡bitos saludables.</p>
      </div>
    `;
  }

  alertasHTML += `
    <div class="alerta">
      <p><strong>Â¿Necesitas apoyo?</strong> Puedes conversar con Vitality para recibir orientaciÃ³n y sugerencias personalizadas.</p>
      <p><a href="chat.html">Hablar con Vitality</a></p>
    </div>
  `;

  alertasContainer.innerHTML = alertasHTML;
}

/* =========================
   GRÃFICO DEL PERFIL SEGÃšN CHECK-IN
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

function obtenerRangoHora(inicio, fin) {
  if (inicio && fin) return `${inicio} - ${fin}`;
  if (inicio) return inicio;
  return "Sin hora";
}

function validarRangoHoras(horaInicio, horaFin) {
  if (!horaInicio || !horaFin) return false;

  if (horaFin <= horaInicio) {
    alert("La hora de tÃ©rmino debe ser posterior a la hora de inicio.");
    return false;
  }

  return true;
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
  const actividad = actividadesEspeciales.find((item) => String(item.id) === idGuardado);
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
    alert("Por favor completa todos los campos de la actividad fija.");
    return;
  }

  if (!validarRangoHoras(hora, horaFin)) return;

  const actividadesFijas = obtenerActividadesFijas();

  if (editandoId) {
    const actualizadas = actividadesFijas.map((item) =>
      String(item.id) === editandoId
        ? {
            ...item,
            dia,
            hora,
            horaFin,
            actividad
          }
        : item
    );

    guardarActividadesFijas(actualizadas);
    alert("Actividad fija actualizada con Ã©xito.");
    limpiarEdicionActividadFija();
  } else {
    actividadesFijas.push({
      id: Date.now(),
      dia,
      hora,
      horaFin,
      actividad,
      completada: false
    });

    guardarActividadesFijas(actividadesFijas);
    alert("Actividad fija guardada con Ã©xito.");
  }

  event.target.reset();
  mostrarActividadesFijas();
  mostrarActividadesHoy();
  rellenarTablaHorarioSemanal();
  mostrarPanelPerfilAvanzado();
}

function guardarActividadEspecial(event) {
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
    alert("Por favor completa todos los campos de la actividad especial.");
    return;
  }

  if (!validarRangoHoras(hora, horaFin)) return;

  const actividadesEspeciales = obtenerActividadesEspeciales();

  if (editandoId) {
    const actualizadas = actividadesEspeciales.map((item) =>
      String(item.id) === editandoId
        ? {
            ...item,
            tipo,
            fecha,
            hora,
            horaFin,
            actividad
          }
        : item
    );

    guardarActividadesEspeciales(actualizadas);
    alert("Actividad especial actualizada con Ã©xito.");
    limpiarEdicionActividadEspecial();
  } else {
    actividadesEspeciales.push({
      id: Date.now(),
      tipo,
      fecha,
      hora,
      horaFin,
      actividad,
      completada: false
    });

    guardarActividadesEspeciales(actividadesEspeciales);
    alert("Actividad especial guardada con Ã©xito.");
  }

  event.target.reset();
  mostrarActividadesEspeciales();
  mostrarActividadesHoy();
  mostrarEventosEspecialesHoy();
  mostrarPanelPerfilAvanzado();
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
  mostrarPanelPerfilAvanzado();
}

function eliminarActividadFija(id) {
  const actividadesFijas = obtenerActividadesFijas().filter((item) => item.id !== id);

  guardarActividadesFijas(actividadesFijas);
  mostrarActividadesFijas();
  mostrarActividadesHoy();
  rellenarTablaHorarioSemanal();
  mostrarPanelPerfilAvanzado();
}

function alternarActividadEspecial(id) {
  const actividadesEspeciales = obtenerActividadesEspeciales().map((item) =>
    item.id === id ? { ...item, completada: !item.completada } : item
  );

  guardarActividadesEspeciales(actividadesEspeciales);
  mostrarActividadesEspeciales();
  mostrarActividadesHoy();
  mostrarEventosEspecialesHoy();
  mostrarPanelPerfilAvanzado();
}

function eliminarActividadEspecial(id) {
  const actividadesEspeciales = obtenerActividadesEspeciales().filter((item) => item.id !== id);

  guardarActividadesEspeciales(actividadesEspeciales);
  mostrarActividadesEspeciales();
  mostrarActividadesHoy();
  mostrarEventosEspecialesHoy();
  mostrarPanelPerfilAvanzado();
}

function mostrarActividadesFijas() {
  const contenedor = document.getElementById("listaActividadesFijas");
  if (!contenedor) return;

  const actividadesFijas = obtenerActividadesFijas();

  if (actividadesFijas.length === 0) {
    contenedor.innerHTML = `
      <div class="actividad-card">
        <p>No hay actividades fijas guardadas todavÃ­a.</p>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = actividadesFijas
    .map(
      (item) => `
        <div class="actividad-card ${item.completada ? "actividad-completada" : ""}">
          <strong>${item.dia}</strong>
          <p><strong>Horario:</strong> ${obtenerRangoHora(item.hora, item.horaFin)}</p>
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
        <p>No hay actividades especiales guardadas todavÃ­a.</p>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = actividadesEspeciales
    .map(
      (item) => `
        <div class="actividad-card ${item.completada ? "actividad-completada" : ""}">
          <strong>${item.tipo}</strong>
          <p>${item.fecha}</p>
          <p><strong>Horario:</strong> ${obtenerRangoHora(item.hora, item.horaFin)}</p>
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
    "MiÃ©rcoles",
    "Jueves",
    "Viernes",
    "SÃ¡bado"
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
    return "AdemÃ¡s, vi que hoy tienes un evento especial en tu horario. Si quieres, tambiÃ©n puedo ayudarte a organizar ese dÃ­a.";
  }

  if (resumen.total >= 4) {
    return "TambiÃ©n noto que hoy tienes varias actividades en tu horario. Podemos ordenar tu dÃ­a para que no se sienta tan pesado.";
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
          <strong>${item.tipo}</strong>
          <p><strong>Horario:</strong> ${obtenerRangoHora(item.hora, item.horaFin)}</p>
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
      "Hola, soy Vitality ðŸ’š",
      "No encontrÃ© un check-in reciente. Â¿Te gustarÃ­a conversar, organizar tu dÃ­a o recibir una recomendaciÃ³n?"
    ];
  }

  let mensajePrincipal = "Hola, soy Vitality ðŸ’š";
  let mensajeSecundario = "";

  if (checkin.estadoAnimo === "Muy mal" || checkin.estadoAnimo === "Mal") {
    mensajeSecundario = `Vi que hoy te has sentido ${checkin.estadoAnimo.toLowerCase()}. Â¿Te gustarÃ­a conversar, organizar tu dÃ­a o recibir una recomendaciÃ³n?`;
  } else if (checkin.nivelEstres === "Alto") {
    mensajeSecundario = "NotÃ© que hoy marcaste estrÃ©s alto. Â¿Te gustarÃ­a conversar, organizar tu dÃ­a o recibir una recomendaciÃ³n?";
  } else if (checkin.energia === "Baja") {
    mensajeSecundario = "Vi que hoy tienes energÃ­a baja. Â¿Te gustarÃ­a conversar, organizar tu dÃ­a o recibir una recomendaciÃ³n?";
  } else if (checkin.sueno === "Mal") {
    mensajeSecundario = "NotÃ© que dormiste mal. Â¿Te gustarÃ­a conversar, organizar tu dÃ­a o recibir una recomendaciÃ³n?";
  } else if (checkin.estadoAnimo === "Bien" || checkin.estadoAnimo === "Muy bien") {
    mensajeSecundario = `QuÃ© bueno que hoy te sientes ${checkin.estadoAnimo.toLowerCase()}. Â¿Te gustarÃ­a conversar, organizar tu dÃ­a o recibir una recomendaciÃ³n?`;
  } else {
    mensajeSecundario = "Gracias por completar tu check-in. Â¿Te gustarÃ­a conversar, organizar tu dÃ­a o recibir una recomendaciÃ³n?";
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
      <button type="button" onclick="usarOpcionRapida('organizaciÃ³n')">Organizar mi dÃ­a</button>
      <button type="button" onclick="usarOpcionRapida('recomendaciÃ³n')">Dame una recomendaciÃ³n</button>
    `;
    return;
  }

  if (chatState === "conversacion") {
    contenedor.innerHTML = `
      <button type="button" onclick="usarOpcionRapida('quiero seguir conversando')">Seguir conversando</button>
      <button type="button" onclick="usarOpcionRapida('organizar mi dÃ­a')">Organizar mi dÃ­a</button>
      <button type="button" onclick="reiniciarChat()">Volver al inicio</button>
    `;
    return;
  }

  if (chatState === "organizacion") {
    contenedor.innerHTML = `
      <button type="button" onclick="usarOpcionRapida('sÃ­')">SÃ­</button>
      <button type="button" onclick="usarOpcionRapida('no')">No</button>
      <button type="button" onclick="reiniciarChat()">Volver al inicio</button>
    `;
    return;
  }

  if (chatState === "recomendacion") {
    contenedor.innerHTML = `
      <button type="button" onclick="usarOpcionRapida('otra')">Otra recomendaciÃ³n</button>
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
    msg.includes("organizaciÃ³n") ||
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
    msg.includes("quÃ© hago") ||
    msg.includes("que hago")
  ) {
    return "recomendacion";
  }

  if (
    msg.includes("convers") ||
    msg.includes("hablar") ||
    msg.includes("acompaÃ±a") ||
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
    return "CuÃ©ntame un poco mÃ¡s sobre cÃ³mo te has sentido hoy.";
  }

  if (checkin.nivelEstres === "Alto") {
    return "Como hoy marcaste estrÃ©s alto, quiero ir con calma contigo. Â¿QuÃ© te estÃ¡ pesando mÃ¡s ahora mismo?";
  }

  if (checkin.estadoAnimo === "Mal" || checkin.estadoAnimo === "Muy mal") {
    return "Estoy aquÃ­ contigo. Â¿Quieres contarme quÃ© fue lo mÃ¡s difÃ­cil de tu dÃ­a?";
  }

  if (checkin.energia === "Baja") {
    return "NotÃ© que hoy tienes poca energÃ­a. Â¿Sientes mÃ¡s cansancio fÃ­sico o mental?";
  }

  if (checkin.sueno === "Mal") {
    return "Dormir mal afecta bastante el dÃ­a. Â¿Has sentido mÃ¡s sueÃ±o, irritaciÃ³n o poca concentraciÃ³n?";
  }

  return "CuÃ©ntame, Â¿quÃ© ha sido lo mÃ¡s importante de tu dÃ­a?";
}

function responderOrganizacion() {
  const resumenHorario = obtenerResumenHorarioHoy();

  if (resumenHorario.especiales.length > 0) {
    return "Hoy tienes un evento especial en tu horario. Yo te recomendarÃ­a partir por eso, luego dejar una tarea importante y despuÃ©s una pausa breve. Â¿Quieres que lo ordenemos juntas?";
  }

  if (resumenHorario.total >= 4) {
    return "Hoy tienes varias actividades. Lo mejor serÃ­a dividir tu dÃ­a en tres partes: primero lo urgente, despuÃ©s lo importante y luego lo que puede esperar. Â¿Quieres empezar por identificar quÃ© es urgente?";
  }

  if (resumenHorario.total > 0) {
    return "Veo que hoy tienes algunas actividades registradas. Puedes partir por la mÃ¡s importante o por la mÃ¡s corta, segÃºn cÃ³mo te sientas ahora. Â¿QuÃ© prefieres?";
  }

  return "No veo muchas actividades registradas para hoy. Podemos armar una mini planificaciÃ³n simple: una tarea importante, una secundaria y un momento de descanso. Â¿Te gustarÃ­a eso?";
}

function responderRecomendacion() {
  const checkin = obtenerCheckin();

  if (!checkin) {
    return "Te recomendarÃ­a algo simple para hoy: respirar un poco, tomar agua, y darte un momento para bajar el ritmo. DespuÃ©s puedes decidir quÃ© hacer con mÃ¡s calma.";
  }

  if (checkin.nivelEstres === "Alto") {
    return "Mi recomendaciÃ³n para hoy serÃ­a bajar un poco la carga del momento: respira profundo, alÃ©jate unos minutos de lo que te tensiona y enfÃ³cate solo en una cosa a la vez.";
  }

  if (checkin.energia === "Baja") {
    return "Como hoy tienes energÃ­a baja, te recomendarÃ­a no exigirte con todo al mismo tiempo. Parte por una tarea pequeÃ±a, luego descansa un poco y despuÃ©s evalÃºa cÃ³mo sigues.";
  }

  if (checkin.sueno === "Mal") {
    return "Como dormiste mal, hoy te conviene priorizar lo esencial, hidratarte bien y evitar sobrecargarte mÃ¡s de la cuenta.";
  }

  if (checkin.estadoAnimo === "Mal" || checkin.estadoAnimo === "Muy mal") {
    return "Hoy te recomendarÃ­a darte un espacio amable: hacer una pausa, escuchar mÃºsica tranquila, conversar con alguien de confianza o simplemente bajar la exigencia por un rato.";
  }

  return "Como hoy te has sentido relativamente bien, te recomendarÃ­a aprovechar este momento para organizar una o dos cosas importantes y dejar tambiÃ©n un espacio para algo que disfrutes.";
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

    if (msg.includes("sÃ­") || msg.includes("si")) {
      return "Perfecto. Puedes elegir entre conversar, organizar tu dÃ­a o recibir una recomendaciÃ³n.";
    }

    return "Puedo ayudarte de tres formas: conversar, organizar tu dÃ­a o darte una recomendaciÃ³n. Â¿CuÃ¡l prefieres?";
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
      msg.includes("estrÃ©s") ||
      msg.includes("ansiedad")
    ) {
      return "Gracias por contÃ¡rmelo. No tienes que resolver todo ahora mismo. Podemos seguir hablando o, si prefieres, tambiÃ©n puedo ayudarte a ordenar tu dÃ­a.";
    }

    return "Te estoy leyendo. Si quieres, puedes contarme un poco mÃ¡s, o tambiÃ©n puedo cambiar y ayudarte a organizar tu dÃ­a o darte una recomendaciÃ³n.";
  }

  if (chatState === "organizacion") {
    if (msg.includes("sÃ­") || msg.includes("si")) {
      return "Perfecto. Entonces partamos por esto: dime cuÃ¡l es tu tarea o actividad mÃ¡s urgente de hoy.";
    }

    if (msg.includes("no")) {
      return "EstÃ¡ bien. Entonces podemos volver a conversar con calma o puedo darte una recomendaciÃ³n simple para hoy.";
    }

    if (msg.includes("prueba") || msg.includes("solemne")) {
      return "Si tienes una prueba o solemne, esa deberÃ­a ir primero. DespuÃ©s intenta dejar solo una tarea importante mÃ¡s y no llenarte de cosas secundarias.";
    }

    return "Para organizarte mejor, piensa en este orden: primero lo urgente, luego lo importante y despuÃ©s lo opcional. Si quieres, dime quÃ© tienes pendiente y te ayudo a priorizar.";
  }

  if (chatState === "recomendacion") {
    if (msg.includes("otra")) {
      return "Claro. Otra recomendaciÃ³n Ãºtil para hoy serÃ­a bajar un poco el ritmo y elegir solo una meta pequeÃ±a y realista para sentir mÃ¡s control.";
    }

    if (msg.includes("gracias")) {
      return "De nada ðŸ’š Si quieres despuÃ©s podemos seguir conversando o ayudarte a organizar lo que te queda del dÃ­a.";
    }

    return "Si quieres, tambiÃ©n puedo darte una recomendaciÃ³n mÃ¡s emocional o una mÃ¡s prÃ¡ctica para organizar tu dÃ­a. Â¿CuÃ¡l prefieres?";
  }

  return "Estoy aquÃ­ para ayudarte. Â¿Prefieres conversar, organizar tu dÃ­a o recibir una recomendaciÃ³n?";
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
      <strong>${titulo}</strong>
      <button
        type="button"
        class="cerrar-notificacion"
        onclick="cerrarNotificacionVitality(this)"
        aria-label="Cerrar notificaciÃ³n"
      >
        Ã—
      </button>
    </div>
    <p>${mensaje}</p>
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
      "ðŸ“… PrÃ³xima actividad",
      `De ${obtenerRangoHora(primeraActividad.hora, primeraActividad.horaFin)} tienes: ${primeraActividad.nombre}.`,
      "info"
    );

    if (actividadesHoy.length > 1) {
      mostrarNotificacionVitality(
        "ðŸ”” Actividades pendientes",
        `AdemÃ¡s tienes ${actividadesHoy.length - 1} actividad(es) mÃ¡s pendiente(s) para hoy.`,
        "info"
      );
    }
  }

  if (checkin) {
    if (checkin.nivelEstres === "Alto" && actividadesHoy.length > 0) {
      mostrarNotificacionVitality(
        "âš ï¸ RecomendaciÃ³n Vitality",
        "Como hoy registraste estrÃ©s alto, intenta hacer una pausa breve antes de comenzar tu prÃ³xima actividad.",
        "alerta"
      );
    } else if (checkin.nivelEstres === "Alto") {
      mostrarNotificacionVitality(
        "âš ï¸ EstrÃ©s alto detectado",
        "Hoy registraste estrÃ©s alto. Te recomendamos hacer una pausa breve antes de continuar.",
        "alerta"
      );
    }

    if (checkin.energia === "Baja" && actividadesHoy.length > 0) {
      mostrarNotificacionVitality(
        "ðŸ’¡ EnergÃ­a baja",
        "Tu energÃ­a estÃ¡ baja hoy. Prioriza la actividad mÃ¡s importante y deja espacio para descansar.",
        "info"
      );
    } else if (checkin.energia === "Baja") {
      mostrarNotificacionVitality(
        "ðŸ’¡ EnergÃ­a baja",
        "Tu energÃ­a estÃ¡ baja hoy. Intenta priorizar solo lo mÃ¡s importante.",
        "info"
      );
    }

    if (checkin.sueno === "Mal") {
      mostrarNotificacionVitality(
        "ðŸ˜´ Descanso insuficiente",
        "Dormiste mal. Trata de no sobrecargarte y organiza tu dÃ­a con calma.",
        "alerta"
      );
    }

    if (checkin.estadoAnimo === "Mal" || checkin.estadoAnimo === "Muy mal") {
      mostrarNotificacionVitality(
        "ðŸ’š Apoyo emocional",
        "Hoy no te has sentido bien. Puedes usar el chat de apoyo para conversar un momento.",
        "peligro"
      );
    }
  }

  if (!checkin && actividadesHoy.length === 0) {
    mostrarNotificacionVitality(
      "ðŸ’š Bienvenida a Vitality",
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
    return "Completa tu check-in diario para que Vitality pueda entregarte una recomendaciÃ³n segÃºn tu estado emocional, energÃ­a, sueÃ±o y nivel de estrÃ©s.";
  }

  if (checkin.nivelEstres === "Alto" && checkin.energia === "Baja") {
    return "Hoy registraste estrÃ©s alto y energÃ­a baja. Te recomendamos priorizar solo lo mÃ¡s importante, tomar una pausa breve y evitar sobrecargarte.";
  }

  if (checkin.nivelEstres === "Alto" && pendientes > 0) {
    return "Hoy tienes estrÃ©s alto y actividades pendientes. Intenta ordenar tu dÃ­a empezando por una sola tarea importante y dejando pausas entre actividades.";
  }

  if (checkin.sueno === "Mal") {
    return "Como dormiste mal, te recomendamos reducir la exigencia del dÃ­a, hidratarte bien y dejar espacio para descansar.";
  }

  if (checkin.estadoAnimo === "Mal" || checkin.estadoAnimo === "Muy mal") {
    return "Hoy no te has sentido bien. Puede ayudarte hablar con alguien de confianza, tomar una pausa o usar el chat de apoyo de Vitality.";
  }

  if (checkin.energia === "Baja") {
    return "Tu energÃ­a estÃ¡ baja hoy. Parte por una tarea pequeÃ±a y realista, luego descansa antes de continuar.";
  }

  if (pendientes > 0) {
    return "Tienes actividades pendientes para hoy. Te recomendamos comenzar por la mÃ¡s importante y marcarla como completada cuando termines.";
  }

  return "Tu check-in no muestra alertas importantes. MantÃ©n tus hÃ¡bitos, organiza tus tiempos y deja un espacio para algo que disfrutes.";
}

function obtenerNivelBienestar(checkin) {
  if (!checkin) {
    return {
      nivel: "Sin datos suficientes",
      descripcion: "Completa tu check-in para estimar tu nivel de bienestar del dÃ­a."
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
      descripcion: "Hoy tu bienestar general se ve favorable segÃºn tu Ãºltimo check-in."
    };
  }

  if (puntaje >= 0) {
    return {
      nivel: "Medio",
      descripcion: "Tu bienestar se ve estable, aunque podrÃ­as cuidar tus pausas y tu organizaciÃ³n."
    };
  }

  return {
    nivel: "Bajo",
    descripcion: "Tu check-in muestra seÃ±ales de cansancio, estrÃ©s o bajo Ã¡nimo. Conviene bajar la carga y buscar apoyo si lo necesitas."
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
   TABLA SEMANAL DINÃMICA
========================= */
function obtenerIndiceDia(dia) {
  const dias = {
    "Lunes": 1,
    "Martes": 2,
    "MiÃ©rcoles": 3,
    "Jueves": 4,
    "Viernes": 5,
    "SÃ¡bado": 6,
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
      <td>${hora}</td>
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
          ? `${actividad.actividad} (${obtenerRangoHora(actividad.hora, actividad.horaFin)}) âœ“`
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
  mostrarPanelPerfilAvanzado();
  mostrarAlertas();
  mostrarActividadesFijas();
  mostrarActividadesEspeciales();
  mostrarActividadesHoy();
  mostrarEventosEspecialesHoy();
  rellenarTablaHorarioSemanal();
  iniciarChatInteligente();
  generarNotificacionesAutomaticas();
});

/* =========================
   REGISTRO E INICIO DE SESIÓN CON BACKEND - CORRECCIÓN FINAL
========================= */
function guardarUsuario(usuario) {
  localStorage.setItem("usuarioVitality", JSON.stringify(usuario));
}

function obtenerUsuario() {
  const usuarioGuardado = localStorage.getItem("usuarioVitality");
  return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
}

async function registrarUsuario(event) {
  event.preventDefault();

  const nombreInput = document.getElementById("nombre");
  const correoInput = document.getElementById("correo");
  const passwordInput = document.getElementById("password");

  if (!nombreInput || !correoInput || !passwordInput) return;

  const nombre = nombreInput.value.trim();
  const correo = correoInput.value.trim().toLowerCase();
  const password = passwordInput.value.trim();

  if (!nombre || !correo || !password) {
    alert("Por favor completa todos los campos.");
    return;
  }

  try {
    const respuesta = await fetch("/api/usuarios/registro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nombre,
        correo,
        password
      })
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      alert(data.mensaje || "No se pudo registrar el usuario.");
      return;
    }

    guardarUsuario(data.usuario);

    alert("Cuenta creada con éxito.");
    window.location.href = "perfil.html";
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    alert("Ocurrió un error al conectar con el servidor.");
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
    alert("Por favor ingresa tu correo y contraseña.");
    return;
  }

  try {
    const respuesta = await fetch("/api/usuarios/login", {
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
      alert(data.mensaje || "Correo o contraseña incorrectos.");
      return;
    }

    guardarUsuario(data.usuario);

    alert("Inicio de sesión exitoso.");
    window.location.href = "horario.html";
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    alert("Ocurrió un error al conectar con el servidor.");
  }
}

/* =========================
   PERFIL CON BACKEND Y MONGODB - CORRECCIÓN FINAL
========================= */
async function guardarPerfilBackend(categoria, actividades) {
  const usuario = obtenerUsuario();

  if (!usuario || !usuario.id) {
    guardarPerfil(categoria, actividades);
    return {
      ok: false,
      mensaje: "No hay usuario conectado al backend. Perfil guardado solo localmente."
    };
  }

  try {
    const respuesta = await fetch(`/api/perfiles/${usuario.id}`, {
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

    localStorage.setItem("perfilVitality", JSON.stringify({
      categoria: data.perfil.categoria,
      actividades: data.perfil.actividades
    }));

    return {
      ok: true,
      perfil: data.perfil
    };
  } catch (error) {
    console.error("Error al guardar perfil en backend:", error);

    guardarPerfil(categoria, actividades);

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
    const respuesta = await fetch(`/api/perfiles/${usuario.id}`);

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

    localStorage.setItem("perfilVitality", JSON.stringify(perfil));

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
    alert("Por favor completa todos los campos del perfil.");
    return;
  }

  const resultado = await guardarPerfilBackend(categoria, actividades);

  await mostrarDatosPerfil();
  mostrarPanelPerfilAvanzado();

  if (resultado.ok) {
    alert("Perfil guardado con éxito en MongoDB.");
  } else {
    alert(resultado.mensaje);
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
   CHECK-IN CON BACKEND Y MONGODB - CORRECCIÓN FINAL
========================= */
async function guardarCheckinBackend(estadoAnimo, nivelEstres, sueno, energia) {
  const usuario = obtenerUsuario();

  if (!usuario || !usuario.id) {
    guardarCheckin(estadoAnimo, nivelEstres, sueno, energia);

    return {
      ok: false,
      mensaje: "No hay usuario conectado al backend. Check-in guardado solo localmente."
    };
  }

  try {
    const respuesta = await fetch("/api/checkins", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        usuarioId: usuario.id,
        estadoAnimo,
        nivelEstres,
        sueno,
        energia
      })
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      return {
        ok: false,
        mensaje: data.mensaje || "No se pudo guardar el check-in en MongoDB."
      };
    }

    const checkinLocal = {
      estadoAnimo: data.checkin.estadoAnimo,
      nivelEstres: data.checkin.nivelEstres,
      sueno: data.checkin.sueno,
      energia: data.checkin.energia,
      fecha: new Date(data.checkin.fecha).toLocaleDateString()
    };

    localStorage.setItem("checkinVitality", JSON.stringify(checkinLocal));

    return {
      ok: true,
      checkin: data.checkin
    };
  } catch (error) {
    console.error("Error al guardar check-in en backend:", error);

    guardarCheckin(estadoAnimo, nivelEstres, sueno, energia);

    return {
      ok: false,
      mensaje: "No se pudo conectar con el servidor. Check-in guardado solo localmente."
    };
  }
}

async function obtenerUltimoCheckinBackend() {
  const usuario = obtenerUsuario();

  if (!usuario || !usuario.id) {
    return obtenerCheckin();
  }

  try {
    const respuesta = await fetch(`/api/checkins/ultimo/${usuario.id}`);

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
      fecha: new Date(data.fecha).toLocaleDateString()
    };

    localStorage.setItem("checkinVitality", JSON.stringify(checkinLocal));

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

  const resultado = await guardarCheckinBackend(
    estadoAnimo,
    nivelEstres,
    sueno,
    energia
  );

  if (resultado.ok) {
    alert("Check-in guardado con éxito en MongoDB.");
  } else {
    alert(resultado.mensaje);
  }

  window.location.href = "alertas.html";
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

window.addEventListener("DOMContentLoaded", () => {
  sincronizarCheckinBackendConInterfaz();
});

/* =========================
   ACTIVIDADES CON BACKEND Y MONGODB - CORRECCIÓN FINAL
========================= */
function obtenerUsuarioBackendActual() {
  const usuario = obtenerUsuario();

  if (!usuario || !usuario.id) {
    return null;
  }

  return usuario;
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
    const respuesta = await fetch(`/api/actividades/${usuario.id}`);
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
      ? `/api/actividades/${editandoId}`
      : "/api/actividades";

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
      ? `/api/actividades/${editandoId}`
      : "/api/actividades";

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
    alert("Por favor completa todos los campos de la actividad fija.");
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
    alert(resultado.mensaje);
    return;
  }

  event.target.reset();
  limpiarEdicionActividadFija();

  await sincronizarActividadesBackendConInterfaz();

  alert(editandoId ? "Actividad fija actualizada en MongoDB." : "Actividad fija guardada en MongoDB.");
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
    alert("Por favor completa todos los campos de la actividad especial.");
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
    alert(resultado.mensaje);
    return;
  }

  event.target.reset();
  limpiarEdicionActividadEspecial();

  await sincronizarActividadesBackendConInterfaz();

  alert(editandoId ? "Actividad especial actualizada en MongoDB." : "Actividad especial guardada en MongoDB.");
}

async function alternarActividadFija(id) {
  try {
    const respuesta = await fetch(`/api/actividades/${id}/completar`, {
      method: "PATCH"
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      alert(data.mensaje || "No se pudo actualizar la actividad.");
      return;
    }

    await sincronizarActividadesBackendConInterfaz();
  } catch (error) {
    console.error("Error al completar actividad fija:", error);
    alert("No se pudo conectar con el servidor.");
  }
}

async function alternarActividadEspecial(id) {
  try {
    const respuesta = await fetch(`/api/actividades/${id}/completar`, {
      method: "PATCH"
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      alert(data.mensaje || "No se pudo actualizar la actividad.");
      return;
    }

    await sincronizarActividadesBackendConInterfaz();
  } catch (error) {
    console.error("Error al completar actividad especial:", error);
    alert("No se pudo conectar con el servidor.");
  }
}

async function eliminarActividadFija(id) {
  const confirmar = confirm("¿Seguro que quieres eliminar esta actividad fija?");

  if (!confirmar) return;

  try {
    const respuesta = await fetch(`/api/actividades/${id}`, {
      method: "DELETE"
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      alert(data.mensaje || "No se pudo eliminar la actividad.");
      return;
    }

    await sincronizarActividadesBackendConInterfaz();
  } catch (error) {
    console.error("Error al eliminar actividad fija:", error);
    alert("No se pudo conectar con el servidor.");
  }
}

async function eliminarActividadEspecial(id) {
  const confirmar = confirm("¿Seguro que quieres eliminar esta actividad especial?");

  if (!confirmar) return;

  try {
    const respuesta = await fetch(`/api/actividades/${id}`, {
      method: "DELETE"
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      alert(data.mensaje || "No se pudo eliminar la actividad.");
      return;
    }

    await sincronizarActividadesBackendConInterfaz();
  } catch (error) {
    console.error("Error al eliminar actividad especial:", error);
    alert("No se pudo conectar con el servidor.");
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
          <strong>${item.dia}</strong>
          <p><strong>Horario:</strong> ${obtenerRangoHora(item.hora, item.horaFin)}</p>
          <p>${item.actividad}</p>
          <p><strong>Estado:</strong> ${item.completada ? "Realizada" : "Pendiente"}</p>
          <div class="acciones-actividad">
            <button type="button" onclick="alternarActividadFija('${item.id}')">
              ${item.completada ? "Desmarcar" : "Completar"}
            </button>
            <button type="button" onclick="editarActividadFija('${item.id}')">Editar</button>
            <button type="button" onclick="eliminarActividadFija('${item.id}')">Eliminar</button>
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
          <p>${item.fecha}</p>
          <p><strong>Horario:</strong> ${obtenerRangoHora(item.hora, item.horaFin)}</p>
          <p>${item.actividad}</p>
          <p><strong>Estado:</strong> ${item.completada ? "Realizada" : "Pendiente"}</p>
          <div class="acciones-actividad">
            <button type="button" onclick="alternarActividadEspecial('${item.id}')">
              ${item.completada ? "Desmarcar" : "Completar"}
            </button>
            <button type="button" onclick="editarActividadEspecial('${item.id}')">Editar</button>
            <button type="button" onclick="eliminarActividadEspecial('${item.id}')">Eliminar</button>
          </div>
        </div>
      `
    )
    .join("");
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
      const botonCompletar =
        item.origen === "fija"
          ? `onclick="alternarActividadFija('${item.id}')"`
          : `onclick="alternarActividadEspecial('${item.id}')"`;

      const botonEliminar =
        item.origen === "fija"
          ? `onclick="eliminarActividadFija('${item.id}')"`
          : `onclick="eliminarActividadEspecial('${item.id}')"`;

      const botonEditar =
        item.origen === "fija"
          ? `onclick="editarActividadFija('${item.id}')"`
          : `onclick="editarActividadEspecial('${item.id}')"`;

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
          <strong>${item.tipo}</strong>
          <p><strong>Horario:</strong> ${obtenerRangoHora(item.hora, item.horaFin)}</p>
          <p>${item.actividad}</p>
          <p><strong>Estado:</strong> ${item.completada ? "Realizada" : "Pendiente"}</p>
          <div class="acciones-actividad">
            <button type="button" onclick="alternarActividadEspecial('${item.id}')">
              ${item.completada ? "Desmarcar" : "Completar"}
            </button>
            <button type="button" onclick="editarActividadEspecial('${item.id}')">Editar</button>
            <button type="button" onclick="eliminarActividadEspecial('${item.id}')">Eliminar</button>
          </div>
        </div>
      `
    )
    .join("");
}

window.addEventListener("DOMContentLoaded", () => {
  sincronizarActividadesBackendConInterfaz();
});
