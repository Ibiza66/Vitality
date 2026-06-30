/* =========================================================================
   HORARIO-PREVIEW.JS — Vitality
   Escrito para coincidir con la estructura exacta de horario-preview.html
   
   Screens existentes en el HTML:
     #s-cargando   → spinner mientras cargamos del backend
     #s-preview    → muestra las actividades agrupadas por día
     #s-error      → si no hay cuestionario completado o hay error de red
   
   Métodos expuestos en window.HP (los llaman botones del HTML):
     HP.confirmar()      → redirige a horario.html (footer btn-confirmar)
     HP.regenerar()      → vuelve al cuestionario  (footer btn-regen)
     HP.generarHorario() → reintenta cargar         (botón en s-error)
   ========================================================================= */

import { API_URL } from './config.js';

/* ─────────────────────────────────────────────────────
   UTILIDADES
───────────────────────────────────────────────────── */
function obtenerUsuarioId() {
  try {
    const u = JSON.parse(localStorage.getItem("usuarioVitality") || "{}");
    return u.id || u._id || null;
  } catch {
    return null;
  }
}
function mostrarScreen(id) {
  // Inline styles tienen la mayor especificidad — sobreescriben IDs y clases
  ["s-cargando", "s-preview", "s-error"].forEach(screenId => {
    const el = document.getElementById(screenId);
    if (el) el.style.display = "none";
  });

  const el = document.getElementById(id);
  if (el) {
    el.style.display = (id === "s-cargando" || id === "s-error") ? "flex" : "block";
  }

  const footer = document.getElementById("hp-footer");
  if (footer) footer.style.display = id === "s-preview" ? "flex" : "none";
}

function formatearHora(hora) {
  if (!hora) return "—";
  const [h, m] = hora.split(":").map(Number);
  const ampm   = h >= 12 ? "PM" : "AM";
  const hora12 = h % 12 || 12;
  return `${hora12}:${String(m).padStart(2, "0")} ${ampm}`;
}

/* Capitaliza primera letra: "lunes" → "Lunes" */
function capitalizar(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}

/* ─────────────────────────────────────────────────────
   RENDERIZADO DE ACTIVIDADES
   
   El HTML espera esta estructura dentro de #actividades-container:
   
   <div class="dia-grupo">
     <p class="dia-titulo">LUNES</p>
     <div class="act-card">
       <span class="act-hora">9:00 AM · 45 min</span>
       <span class="act-nombre">Bloque de estudio</span>
       <span class="act-ia-dot"></span>
     </div>
   </div>
───────────────────────────────────────────────────── */
const ORDEN_DIAS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

function renderizarActividades(actividades) {
  const container = document.getElementById("actividades-container");
  if (!container) return;
  container.innerHTML = "";

  if (!actividades || actividades.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:2rem;opacity:0.45;font-size:14px">
        No se generaron actividades automáticas.<br>
        Puedes agregar las tuyas desde el horario.
      </div>`;
    return;
  }

  /* Agrupar actividades por día */
  const porDia = {};
  actividades.forEach(act => {
    const dia = (act.dia || act.diaSemana || "general").toLowerCase();
    if (!porDia[dia]) porDia[dia] = [];
    porDia[dia].push(act);
  });

  /* Ordenar por día de la semana; los que no tengan día van al final */
  const diasOrdenados = ORDEN_DIAS.filter(d => porDia[d]);
  const otrosDias     = Object.keys(porDia).filter(d => !ORDEN_DIAS.includes(d));
  [...diasOrdenados, ...otrosDias].forEach(dia => {
    const grupo = document.createElement("div");
    grupo.className = "dia-grupo";

    const titulo = document.createElement("p");
    titulo.className = "dia-titulo";
    titulo.textContent = capitalizar(dia);
    grupo.appendChild(titulo);

    /* Ordenar por hora dentro del día */
    const actsDelDia = porDia[dia].sort((a, b) =>
      (a.hora || "").localeCompare(b.hora || "")
    );

    actsDelDia.forEach(act => {
      const nombre   = act.actividad || act.titulo || "Actividad";
      const hora     = formatearHora(act.hora);
      const duracion = act.duracion ? ` · ${act.duracion} min` : "";

      const card = document.createElement("div");
      card.className = "act-card";
      card.innerHTML = `
        <span class="act-hora">${hora}${duracion}</span>
        <span class="act-nombre">${nombre}</span>
        <span class="act-ia-dot" title="Generada por Vitality IA"></span>
      `;
      grupo.appendChild(card);
    });

    container.appendChild(grupo);
  });
}

/* ─────────────────────────────────────────────────────
   ACTUALIZAR ESTADÍSTICAS
───────────────────────────────────────────────────── */
function actualizarStats(actividades) {
  const total = actividades.length;

  /* Días únicos */
  const dias = new Set(actividades.map(a => (a.dia || a.diaSemana || "").toLowerCase()));
  const diasCount = [...dias].filter(Boolean).length;

  /* Horas totales por semana */
  const minutos = actividades.reduce((acc, a) => acc + (Number(a.duracion) || 30), 0);
  const horas   = (minutos / 60).toFixed(1).replace(".0", "");

  const elTotal = document.getElementById("stat-total");
  const elDias  = document.getElementById("stat-dias");
  const elHoras = document.getElementById("stat-horas");

  if (elTotal) elTotal.textContent = total;
  if (elDias)  elDias.textContent  = diasCount || "—";
  if (elHoras) elHoras.textContent = `${horas}h`;
}

/* ─────────────────────────────────────────────────────
   CARGAR DATOS DESDE EL BACKEND
───────────────────────────────────────────────────── */
async function generarHorario() {
  mostrarScreen("s-cargando");

  const usuarioId = obtenerUsuarioId();
  if (!usuarioId) {
    window.location.href = "index.html";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/cuestionario/${usuarioId}`);

    if (!res.ok) {
      mostrarScreen("s-error");
      return;
    }

    const data = await res.json();

    /* Mostrar un extracto de la ficha en el subtítulo del intro */
    const intro = document.querySelector(".hp-intro p");
    if (intro && data.fichaClinica) {
      /* Mostrar solo las primeras 2 oraciones para no abrumar */
      const oraciones = data.fichaClinica.split(/\.\s+/).filter(Boolean);
      const resumen = oraciones.slice(0, 2).join(". ") + (oraciones.length > 2 ? "." : "");
      intro.textContent = resumen;
      intro.style.whiteSpace = "pre-line";
    }

    const actividades = data.actividades || [];
    renderizarActividades(actividades);
    actualizarStats(actividades);
    mostrarScreen("s-preview");

  } catch (err) {
    console.error("[HP] Error cargando horario:", err);
    mostrarScreen("s-error");
  }
}

/* ─────────────────────────────────────────────────────
   CONFIRMAR HORARIO — guarda en horario.html
───────────────────────────────────────────────────── */
async function confirmar() {
  const overlay = document.getElementById("overlay-confirmando");
  if (overlay) overlay.classList.add("visible");

  const btnConfirmar = document.getElementById("btn-confirmar");
  const btnRegen     = document.getElementById("btn-regen");
  if (btnConfirmar) btnConfirmar.disabled = true;
  if (btnRegen)     btnRegen.disabled     = true;

  /* Las actividades ya están guardadas en MongoDB desde el cuestionario.
     Solo necesitamos redirigir al horario. */
  setTimeout(() => {
    window.location.href = "horario.html";
  }, 1200);
}

/* ─────────────────────────────────────────────────────
   API PÚBLICA window.HP
   Los onclick del HTML llaman a estas funciones.
───────────────────────────────────────────────────── */
window.HP = {
  confirmar,
  regenerar()      { window.location.href = "cuestionario.html"; },
  generarHorario() { generarHorario(); }
};

/* Arrancar al cargar la página */
document.addEventListener("DOMContentLoaded", generarHorario);
