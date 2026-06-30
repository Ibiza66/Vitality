/* =========================================================================
   MOTOR DEL CUESTIONARIO I→G→A — Vitality
   
   RESPONSABILIDADES DE ESTE ARCHIVO:
   1. Definir las 15 preguntas organizadas en 3 fases
   2. Manejar la navegación entre preguntas (estado en memoria)
   3. Renderizar el input correcto según el tipo de pregunta
   4. Llamar al backend para obtener preguntas de follow-up (IA opcional)
   5. Al finalizar, enviar todas las respuestas al backend y redirigir

   PATRÓN DE EXPOSICIÓN:
   Expone window.CQ para que los botones del HTML puedan llamar funciones.
   Ejemplo: onclick="window.CQ.siguiente()"
   ========================================================================= */

/* ─────────────────────────────────────────────────────
   CONFIGURACIÓN
───────────────────────────────────────────────────── */
import { API_URL } from './config.js';

/* ─────────────────────────────────────────────────────
   PREGUNTAS DEL CUESTIONARIO
   
   Cada pregunta tiene:
   - fase:        "identidad" | "objetivos" | "acciones"
   - texto:       La pregunta
   - hint:        Guía corta para el usuario
   - tipo:        "texto" | "opciones" | "slider"
   - opciones:    Array de strings (solo si tipo = "opciones")
   - min/max/unit/default: Solo si tipo = "slider"
   - saltable:    true si el usuario puede omitirla
   - followup:    true si el backend IA intenta generar una pregunta de profundización
───────────────────────────────────────────────────── */
const PREGUNTAS = [
  /* ════ FASE 1: IDENTIDAD (preguntas 1-5) ════ */
  {
    fase:      "identidad",
    texto:     "¿Cómo te describes a ti mismo/a en tu mejor versión? ¿Quién quieres ser?",
    hint:      "Piensa en el tipo de persona que admiras. ¿Cómo sería ese tú ideal?",
    tipo:      "texto",
    saltable:  false,
    followup:  true
  },
  {
    fase:      "identidad",
    texto:     "¿Cuáles son los 3 valores más importantes para ti en este momento de tu vida?",
    hint:      "Por ejemplo: honestidad, crecimiento, familia, salud, creatividad.",
    tipo:      "opciones",
    opciones:  ["Honestidad", "Crecimiento personal", "Familia", "Salud", "Creatividad", "Independencia", "Conexión social", "Disciplina"],
    saltable:  false,
    followup:  false
  },
  {
    fase:      "identidad",
    texto:     "¿Qué actividades o momentos te hacen sentir más tú mismo/a?",
    hint:      "Cuando haces esto, el tiempo pasa rápido y te sientes bien contigo.",
    tipo:      "texto",
    saltable:  false,
    followup:  true
  },
  {
    fase:      "identidad",
    texto:     "¿Cuántas horas libres tienes en un día típico (sin clases ni trabajo)?",
    hint:      "Tiempo real disponible para ti, no el ideal.",
    tipo:      "slider",
    min:       0, max: 10, unit: "horas", valorDefault: 3,
    saltable:  false,
    followup:  false
  },
  {
    fase:      "identidad",
    texto:     "En una escala del 1 al 10, ¿qué tan organizado/a eres actualmente?",
    hint:      "1 = caos total, 10 = todo perfectamente estructurado.",
    tipo:      "slider",
    min:       1, max: 10, unit: "nivel", valorDefault: 5,
    saltable:  false,
    followup:  false
  },

  /* ════ FASE 2: OBJETIVOS (preguntas 6-10) ════ */
  {
    fase:      "objetivos",
    texto:     "¿Cuál es tu meta más importante este semestre o este año?",
    hint:      "Puede ser académica, personal, de salud o creativa.",
    tipo:      "texto",
    saltable:  false,
    followup:  true
  },
  {
    fase:      "objetivos",
    texto:     "¿Por qué esa meta es importante para ti? ¿Qué cambia cuando la logres?",
    hint:      "El \"para qué\" es lo que te mantiene cuando las cosas se ponen difíciles.",
    tipo:      "texto",
    saltable:  false,
    followup:  true
  },
  {
    fase:      "objetivos",
    texto:     "¿Cuál es el principal obstáculo que te impide avanzar hacia esa meta?",
    hint:      "Sé honesto/a. No hay respuesta incorrecta.",
    tipo:      "opciones",
    opciones:  ["Falta de tiempo", "Distracción / redes sociales", "No sé por dónde empezar", "Cansancio o falta de energía", "Miedo a equivocarme", "Procrastinación", "Problemas externos (familia, trabajo)", "Otro"],
    saltable:  false,
    followup:  true
  },
  {
    fase:      "objetivos",
    texto:     "¿En qué área de tu vida quieres crecer más este año?",
    hint:      "Elige la que sientes más urgente o más descuidada.",
    tipo:      "opciones",
    opciones:  ["Estudios / carrera", "Salud física", "Salud mental / emocional", "Relaciones personales", "Finanzas", "Creatividad / hobbies", "Hábitos y rutina", "Espiritualidad / propósito"],
    saltable:  false,
    followup:  false
  },
  {
    fase:      "objetivos",
    texto:     "¿Cuántos minutos al día estarías dispuesto/a a dedicar a tu meta principal?",
    hint:      "Sé realista, no idealista. Empieza pequeño.",
    tipo:      "slider",
    min:       10, max: 120, unit: "minutos", valorDefault: 30,
    saltable:  false,
    followup:  false
  },

  /* ════ FASE 3: ACCIONES (preguntas 11-15) ════ */
  {
    fase:      "acciones",
    texto:     "¿A qué hora te despiertas normalmente en los días de semana?",
    hint:      "La hora real, no la que quisiera.",
    tipo:      "opciones",
    opciones:  ["Antes de las 7am", "Entre 7am y 8am", "Entre 8am y 9am", "Entre 9am y 10am", "Después de las 10am"],
    saltable:  false,
    followup:  false
  },
  {
    fase:      "acciones",
    texto:     "¿Cuándo te sientes más productivo/a durante el día?",
    hint:      "¿En qué momento del día tu mente funciona mejor?",
    tipo:      "opciones",
    opciones:  ["Mañana (antes del mediodía)", "Tarde (12pm-6pm)", "Noche (después de las 6pm)", "Es variable, no tengo un patrón claro"],
    saltable:  false,
    followup:  false
  },
  {
    fase:      "acciones",
    texto:     "¿Qué hábito quieres incorporar primero en tu rutina?",
    hint:      "Algo concreto, no abstracto. En vez de \"hacer ejercicio\", di qué ejercicio y cuándo.",
    tipo:      "texto",
    saltable:  false,
    followup:  true
  },
  {
    fase:      "acciones",
    texto:     "¿Qué es lo que más frecuentemente te impide cumplir tus actividades cuando ya las tienes planeadas?",
    hint:      "Esto es diferente al obstáculo de la meta. Aquí estamos hablando del día a día.",
    tipo:      "opciones",
    opciones:  ["Me distraigo con el celular", "Me quedo dormido/a o sin energía", "Surge algo inesperado", "Me abruma la idea de empezar", "Me olvido o no tengo recordatorio", "No tengo un lugar tranquilo"],
    saltable:  true,
    followup:  true
  },
  {
    fase:      "acciones",
    texto:     "Si pudieras cambiar solo UNA cosa de tu rutina actual, ¿qué sería?",
    hint:      "La respuesta que más rápido venga a tu mente suele ser la más honesta.",
    tipo:      "texto",
    saltable:  false,
    followup:  true
  }
];

/* Metadatos de cada fase (para la pantalla de intro) */
const FASES = {
  identidad: {
    icono:  "🧠",
    nombre: "Identidad",
    desc:   "Vamos a explorar quién eres y qué te define como persona.",
    color:  "#22c55e"
  },
  objetivos: {
    icono:  "🎯",
    nombre: "Objetivos",
    desc:   "¿Qué quieres lograr? Entendemos tu dirección y tus obstáculos.",
    color:  "#3b82f6"
  },
  acciones: {
    icono:  "⚡",
    nombre: "Acciones",
    desc:   "Transformamos todo lo anterior en un horario personalizado para ti.",
    color:  "#f59e0b"
  }
};

const ORDEN_FASES = ["identidad", "objetivos", "acciones"];

/* ─────────────────────────────────────────────────────
   ESTADO DEL CUESTIONARIO
   
   Todo vive en este objeto mientras el usuario responde.
   No usamos localStorage hasta que el backend confirme el guardado.
───────────────────────────────────────────────────── */
let estado = {
  indiceActual:   -1,      // -1 = en bienvenida/intro
  faseActual:     null,    // "identidad" | "objetivos" | "acciones"
  mostrандoIntro: true,    // true = mostrando intro de fase
  respuestas:     [],      // Array acumulado de respuestas
  countFollowups: 0        // Cuántos follow-ups respondió el usuario
};

/* ─────────────────────────────────────────────────────
   UTILIDADES DOM
───────────────────────────────────────────────────── */
function mostrarScreen(id) {
  document.querySelectorAll(".cq-screen").forEach(s => s.classList.remove("activa"));
  const screen = document.getElementById(id);
  if (screen) screen.classList.add("activa");
}

function actualizarProgreso() {
  const total  = PREGUNTAS.length;
  const actual = estado.indiceActual;
  const pct    = actual < 0 ? 0 : Math.round((actual / total) * 100);

  const barra = document.getElementById("cq-barra-fill");
  if (barra) barra.style.width = pct + "%";

  const texto = document.getElementById("cq-prog-texto");
  if (texto && actual >= 0) texto.textContent = `${actual + 1} / ${total}`;

  /* Actualizar dots de fase */
  ORDEN_FASES.forEach((fase, i) => {
    const dot = document.getElementById(`dot-${i}`);
    if (!dot) return;
    dot.classList.remove("activa", "completa");
    const fasePreguntaIndices = PREGUNTAS
      .map((p, idx) => p.fase === fase ? idx : -1)
      .filter(idx => idx >= 0);
    const ultimoIndiceFase = fasePreguntaIndices[fasePreguntaIndices.length - 1];

    if (actual > ultimoIndiceFase) {
      dot.classList.add("completa");
    } else if (actual >= fasePreguntaIndices[0]) {
      dot.classList.add("activa");
      document.documentElement.style.setProperty("--fase-color", FASES[fase].color);
    }
  });
}

function obtenerUsuarioId() {
  try {
    const u = JSON.parse(localStorage.getItem("usuarioVitality") || "{}");
    return u.id || u._id || null;
  } catch {
    return null;
  }
}

/* ─────────────────────────────────────────────────────
   RENDERIZADO DE INPUTS DINÁMICOS
───────────────────────────────────────────────────── */
function renderizarInput(pregunta) {
  const area = document.getElementById("q-input-area");
  if (!area) return;

  if (pregunta.tipo === "texto") {
    area.innerHTML = `
      <textarea
        id="input-respuesta"
        class="cq-textarea"
        placeholder="Escribe tu respuesta aquí..."
        rows="4"
        maxlength="800"
        oninput="document.getElementById('char-count').textContent = this.value.length + ' / 800'"
      ></textarea>
      <p class="cq-char-count" id="char-count">0 / 800</p>
    `;

  } else if (pregunta.tipo === "opciones") {
    const items = pregunta.opciones.map(op => `
      <button
        type="button"
        class="cq-opcion"
        onclick="window.CQ._toggleOpcion(this, '${pregunta.tipo}')"
        data-valor="${op}"
      >
        <span class="cq-opcion-circle"></span>
        ${op}
      </button>
    `).join("");
    area.innerHTML = `<div class="cq-opciones" id="opciones-container">${items}</div>`;

  } else if (pregunta.tipo === "slider") {
    area.innerHTML = `
      <div class="cq-slider-wrap">
        <p class="cq-slider-num" id="slider-val">${pregunta.valorDefault}</p>
        <p class="cq-slider-unit">${pregunta.unit}</p>
        <input
          type="range"
          class="cq-slider"
          id="input-respuesta"
          min="${pregunta.min}"
          max="${pregunta.max}"
          value="${pregunta.valorDefault}"
          oninput="document.getElementById('slider-val').textContent = this.value"
        />
        <div class="cq-slider-ends">
          <span>${pregunta.min} ${pregunta.unit}</span>
          <span>${pregunta.max} ${pregunta.unit}</span>
        </div>
      </div>
    `;
  }
}

/* Toggle de opciones — permite selección múltiple hasta 3 */
function _toggleOpcion(btn, tipo) {
  const seleccionadas = document.querySelectorAll(".cq-opcion.elegida");
  const yaElegida     = btn.classList.contains("elegida");

  if (yaElegida) {
    btn.classList.remove("elegida");
    btn.querySelector(".cq-opcion-circle").textContent = "";
  } else {
    if (seleccionadas.length >= 3) return; // máx 3 opciones
    btn.classList.add("elegida");
    btn.querySelector(".cq-opcion-circle").textContent = "✓";
  }
}

/* Obtiene el valor del input actual según su tipo */
function obtenerValorActual(pregunta) {
  if (pregunta.tipo === "texto") {
    const el = document.getElementById("input-respuesta");
    return el ? el.value.trim() : "";

  } else if (pregunta.tipo === "opciones") {
    const elegidas = document.querySelectorAll(".cq-opcion.elegida");
    return Array.from(elegidas).map(el => el.dataset.valor).join(", ");

  } else if (pregunta.tipo === "slider") {
    const el = document.getElementById("input-respuesta");
    return el ? `${el.value} ${pregunta.unit}` : `${pregunta.valorDefault} ${pregunta.unit}`;
  }
  return "";
}

/* ─────────────────────────────────────────────────────
   CARGA DE PREGUNTA EN EL DOM
───────────────────────────────────────────────────── */
function cargarPregunta(indice) {
  const pregunta = PREGUNTAS[indice];
  if (!pregunta) return;

  /* Actualizar labels */
  const faseInfo = FASES[pregunta.fase];
  document.getElementById("q-fase-label").textContent = faseInfo.icono + " " + faseInfo.nombre;
  document.getElementById("q-numero").textContent     = `${indice + 1} / ${PREGUNTAS.length}`;
  document.getElementById("q-texto").textContent      = pregunta.texto;
  document.getElementById("q-hint").textContent       = pregunta.hint;

  /* Ocultar follow-up */
  const followupBox = document.getElementById("followup-box");
  if (followupBox) {
    followupBox.hidden = true;
    document.getElementById("followup-input").value = "";
  }

  /* Ocultar botón saltar si no es saltable */
  const btnSaltar = document.getElementById("btn-saltar");
  if (btnSaltar) btnSaltar.hidden = !pregunta.saltable;

  /* Ocultar loading */
  const loading = document.getElementById("cq-loading");
  if (loading) loading.hidden = true;

  /* Renderizar el input dinámico */
  renderizarInput(pregunta);

  actualizarProgreso();
  mostrarScreen("s-pregunta");
}

/* ─────────────────────────────────────────────────────
   LLAMADA AL BACKEND PARA FOLLOW-UP
───────────────────────────────────────────────────── */
async function pedirFollowup(pregunta, respuesta) {
  const loading = document.getElementById("cq-loading");
  if (loading) loading.hidden = false;

  try {
    const res = await fetch(`${API_URL}/api/cuestionario/followup`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        pregunta: pregunta.texto,
        respuesta,
        fase: pregunta.fase
      })
    });

    const data = await res.json();

    if (data.followup) {
      document.getElementById("followup-q").textContent = data.followup;
      document.getElementById("followup-box").hidden    = false;
    }
  } catch (err) {
    /* Follow-up es opcional — si falla, silencioso */
    console.log("[CQ] Follow-up no disponible:", err.message);
  } finally {
    if (loading) loading.hidden = true;
  }
}

/* ─────────────────────────────────────────────────────
   MOSTRAR INTRO DE FASE
───────────────────────────────────────────────────── */
function mostrarIntroFase(fase) {
  const info = FASES[fase];
  document.getElementById("intro-icon").textContent = info.icono;
  document.getElementById("intro-name").textContent = info.nombre;
  document.getElementById("intro-desc").textContent = info.desc;
  estado.mostrándoIntro = true;
  mostrarScreen("s-intro");
}

/* ─────────────────────────────────────────────────────
   GUARDAR RESPUESTA ACTUAL EN ESTADO
───────────────────────────────────────────────────── */
function guardarRespuestaActual() {
  const pregunta  = PREGUNTAS[estado.indiceActual];
  const respuesta = obtenerValorActual(pregunta);

  const followupPregunta  = document.getElementById("followup-q")?.textContent    || "";
  const followupRespuesta = document.getElementById("followup-input")?.value.trim() || "";

  if (followupRespuesta) estado.countFollowups++;

  /* Buscar si ya existe una respuesta para este índice (para no duplicar) */
  const existing = estado.respuestas.findIndex(r => r.numeroPregunta === estado.indiceActual + 1);

  const obj = {
    fase:              pregunta.fase,
    numeroPregunta:    estado.indiceActual + 1,
    pregunta:          pregunta.texto,
    respuesta,
    tipoInput:         pregunta.tipo,
    followupPregunta,
    followupRespuesta
  };

  if (existing >= 0) {
    estado.respuestas[existing] = obj;
  } else {
    estado.respuestas.push(obj);
  }
}

/* ─────────────────────────────────────────────────────
   API PÚBLICA: window.CQ
   Estas son las funciones que llaman los onclick del HTML
───────────────────────────────────────────────────── */
const CQ = {

  /* El usuario presionó "Empezar →" en la bienvenida */
  iniciar() {
    estado.indiceActual = -1;
    mostrarIntroFase("identidad");
  },

  /* El usuario presionó "Comenzar →" en una intro de fase */
  comenzarFase() {
    estado.mostrándoIntro = false;

    if (estado.indiceActual === -1) {
      /* Primer inicio: ir a pregunta 0 */
      estado.indiceActual = 0;
    }
    /* Si ya estamos en medio de una fase, simplemente mostramos la pregunta actual */
    cargarPregunta(estado.indiceActual);
  },

  /* El usuario presionó "Siguiente →" */
  async siguiente() {
    const pregunta  = PREGUNTAS[estado.indiceActual];
    const respuesta = obtenerValorActual(pregunta);

    /* Validar que campos no saltables tengan respuesta */
    if (!pregunta.saltable && !respuesta) {
      /* Pequeño shake visual en el input */
      const area = document.getElementById("q-input-area");
      if (area) {
        area.style.outline = "2px solid #ef4444";
        setTimeout(() => { area.style.outline = ""; }, 1200);
      }
      return;
    }

    guardarRespuestaActual();

    /* Si la pregunta soporta follow-up y el usuario escribió algo suficiente,
       pedir follow-up ANTES de avanzar (solo si el follow-up no se mostró aún) */
    const followupBox    = document.getElementById("followup-box");
    const followupVisible = followupBox && !followupBox.hidden;

    if (pregunta.followup && pregunta.tipo === "texto" && respuesta.length > 20 && !followupVisible) {
      await pedirFollowup(pregunta, respuesta);
      /* Si hay follow-up, el usuario debe responderlo antes de continuar */
      if (!document.getElementById("followup-box").hidden) return;
    }

    /* Avanzar al siguiente índice */
    const siguienteIndice = estado.indiceActual + 1;

    if (siguienteIndice >= PREGUNTAS.length) {
      /* Terminó todas las preguntas → enviar al backend */
      await CQ._enviarAlBackend();
      return;
    }

    /* Detectar cambio de fase */
    const faseSiguiente = PREGUNTAS[siguienteIndice].fase;
    const faseActual    = pregunta.fase;

    estado.indiceActual = siguienteIndice;

    if (faseSiguiente !== faseActual) {
      mostrarIntroFase(faseSiguiente);
    } else {
      cargarPregunta(siguienteIndice);
    }
  },

  /* El usuario presionó "Saltar" */
  saltar() {
    guardarRespuestaActual(); // guarda vacío

    const siguienteIndice = estado.indiceActual + 1;

    if (siguienteIndice >= PREGUNTAS.length) {
      CQ._enviarAlBackend();
      return;
    }

    const faseSiguiente = PREGUNTAS[siguienteIndice].fase;
    const faseActual    = PREGUNTAS[estado.indiceActual].fase;
    estado.indiceActual = siguienteIndice;

    if (faseSiguiente !== faseActual) {
      mostrarIntroFase(faseSiguiente);
    } else {
      cargarPregunta(siguienteIndice);
    }
  },

  /* El usuario presionó "✕" para salir */
  salir() {
    if (confirm("¿Seguro/a que quieres salir? Perderás el progreso actual.")) {
      window.location.href = "horario.html";
    }
  },

  /* Toggle interno de opciones (expuesto para onclick del HTML) */
  _toggleOpcion,

  /* ── Envío final al backend ── */
  async _enviarAlBackend() {
    const usuarioId = obtenerUsuarioId();
    if (!usuarioId) {
      alert("Tu sesión expiró. Por favor inicia sesión de nuevo.");
      window.location.href = "index.html";
      return;
    }

    /* Mostrar pantalla de carga */
    mostrarScreen("s-completando");

    try {
      const respuesta = await fetch(`${API_URL}/api/cuestionario/procesar`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          usuarioId,
          respuestas: estado.respuestas
        })
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.mensaje || "Error al procesar el cuestionario.");
      }

      /* Mostrar pantalla de completado */
      const resumenEl = document.getElementById("resumen-ia");
      if (resumenEl) resumenEl.textContent = data.fichaClinica || "Ficha generada correctamente.";

      const statFu = document.getElementById("stat-fu");
      if (statFu) statFu.textContent = estado.countFollowups;

      mostrarScreen("s-completado");

    } catch (error) {
      console.error("[CQ] Error al enviar:", error);
      mostrarScreen("s-completado");
      const resumenEl = document.getElementById("resumen-ia");
      if (resumenEl) resumenEl.textContent = "Cuestionario guardado. Hubo un problema conectando con la IA, pero tus respuestas están seguras.";
    }
  }
};

/* Exponer globalmente para los onclick del HTML */
window.CQ = CQ;
