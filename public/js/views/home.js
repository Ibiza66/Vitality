


// Para horario.html: Gestión del panel de inicio, saludo dinámico al usuario, cálculo y renderizado de la racha (homeRachaNumero) y despliegue de las acciones diarias recomendadas por la IA.




// Linea 5855


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


// Linea 5632

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
  if (pagina !== "horario.html") return;

  await obtenerActividadesBackend();

  const usuario  = obtenerUsuario();
  const acciones = obtenerAccionesHomeVitality();

  const [historial, onboarding] = await Promise.all([
    typeof obtenerHistorialHomeVitality === "function"
      ? obtenerHistorialHomeVitality()
      : Promise.resolve([]),
    typeof obtenerOnboardingBackendVitality === "function"
      ? obtenerOnboardingBackendVitality().catch(() => ({}))
      : Promise.resolve({})
  ]);

  const completadas        = acciones.filter((a) => a.completada).length;
  const total              = acciones.length;
  const porcentajeAcciones = total > 0 ? Math.round((completadas / total) * 100) : 0;
  const proxima            = obtenerProximaAccionHomeVitality(acciones);

  const fecha            = document.getElementById("homeFechaActual");
  const saludo           = document.getElementById("homeSaludoUsuario");
  const avatar           = document.querySelector(".home-avatar-btn");
  const identidad        = document.getElementById("homeIdentidadUsuario");
  const porcentajeSemana = document.getElementById("homePorcentajeSemana");
  const circulo          = document.querySelector(".home-progress-circle");
  const accionesNumero   = document.getElementById("homeAccionesNumero");
  const accionesResumen  = document.getElementById("homeAccionesResumen");
  const focoHora         = document.getElementById("homeFocoHora");
  const focoTitulo       = document.getElementById("homeFocoTitulo");
  const focoDetalle      = document.getElementById("homeFocoDetalle");
  const focoBtn          = document.getElementById("homeFocoCompletarBtn");

  if (fecha)  fecha.textContent = formatearFechaHomeVitality();

  if (saludo) {
    const primerNombre = usuario?.nombre ? usuario.nombre.split(" ")[0] : "Usuario";
    saludo.textContent = `Hola, ${primerNombre}`;
  }

  if (avatar && usuario) avatar.textContent = obtenerInicialNombreHomeVitality(usuario.nombre);
  if (identidad) identidad.textContent = await obtenerIdentidadHomeVitality();
  if (porcentajeSemana) porcentajeSemana.textContent = `${porcentajeAcciones}%`;
  if (circulo) circulo.style.setProperty("--avance", `${porcentajeAcciones}%`);
  if (accionesNumero)  accionesNumero.textContent  = `${completadas}/${total}`;
  if (accionesResumen) accionesResumen.textContent = `${completadas} de ${total} hechas`;

  if (proxima) {
    if (focoHora)    focoHora.textContent    = proxima.hora || "Sin hora";
    if (focoTitulo)  focoTitulo.textContent  = proxima.titulo;
    if (focoDetalle) focoDetalle.textContent = `Un paso pequeño hacia tu meta · ${obtenerRangoHora(proxima.hora, proxima.horaFin)}`;
    if (focoBtn) {
      focoBtn.disabled    = false;
      focoBtn.textContent = "▶ Empezar";
      focoBtn.onclick     = () => completarAccionHomeVitality(proxima.origen, proxima.id);
    }
  } else {
    if (focoHora)    focoHora.textContent    = "Hoy";
    if (focoTitulo)  focoTitulo.textContent  = "Día organizado";
    if (focoDetalle) focoDetalle.textContent = "No tienes acciones pendientes por ahora.";
    if (focoBtn) { focoBtn.disabled = true; focoBtn.textContent = "Completado"; }
  }

  if (typeof pintarGraficoCheckinsHomeVitality === "function") pintarGraficoCheckinsHomeVitality(historial);
  if (typeof pintarRachaHomeVitality === "function") pintarRachaHomeVitality(historial);
  if (typeof pintarTipsHomeVitality === "function") pintarTipsHomeVitality(historial, onboarding);
  if (typeof pintarFocoHomeVitality === "function") await pintarFocoHomeVitality(acciones);
  if (typeof pintarAccionesHomeVitality === "function") pintarAccionesHomeVitality(acciones);
}
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(iniciarHomeWarmVitality, 600);
});

