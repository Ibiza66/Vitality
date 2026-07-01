const express = require("express");
const mongoose = require("mongoose");
const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const RecomendacionIA = require("../models/RecomendacionIA");

const router = express.Router();


/* =========================
   FUNCIONES AUXILIARES
========================= */
function limpiarId(id) {
  if (!id) return null;

  return String(id)
    .replace(/[^a-fA-F0-9]/g, "")
    .trim();
}

function idValido(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function limpiarRespuestaIA(texto) {
  return String(texto || "")
    .replaceAll("###", "")
    .replaceAll("##", "")
    .replaceAll("#", "")
    .replaceAll("**", "")
    .replaceAll("__", "")
    .replace(/\s+([1-9]\))/g, "\n$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/* =========================
   DETECCIÓN DE SEÑAL DE RIESGO (SEGURIDAD)
   Esta detección corre del lado del servidor, en código determinístico,
   NO depende de que el modelo de IA recuerde incluir los recursos de
   ayuda. Si detecta la señal, el backend ANEXA siempre la línea de
   derivación, sin importar qué haya respondido la IA.
========================= */
const PALABRAS_CLAVE_RIESGO = [
  "matarme",
  "suicid",
  "hacerme daño",
  "hacerme dano",
  "no quiero vivir",
  "no quiero seguir viviendo",
  "no quiero seguir aqui",
  "no quiero seguir aquí",
  "ya no tiene sentido",
  "no tiene sentido seguir",
  "mejor sin mi",
  "mejor sin mí",
  "estarian mejor sin mi",
  "estarían mejor sin mí",
  "quiero desaparecer",
  "no aguanto mas",
  "no aguanto más",
  "quitarme la vida",
  "terminar con todo"
  ,
  // muerte / morir — con verbo, para evitar el idiomático "muerto de risa/hambre"
  "quiero morir",
  "quiero morirme",
  "me quiero morir",
  "quisiera morir",
  "ganas de morir",
  "ganas de morirme",
  "quiero estar muerto",
  "quiero estar muerta",
  // desesperanza
  "para que seguir",
  "para qué seguir",
  "no vale la pena vivir",
  "cansado de vivir",
  "cansada de vivir",
  // autolesión
  "cortarme las venas",
  "lastimarme",
  "autolesion",
  "autolesión",
  // variantes de desaparecer / acabar / "acá" chileno
  "quisiera desaparecer",
  "acabar con mi vida",
  "acabar con todo",
  "no quiero seguir aca",
  "no quiero seguir acá"
];

function detectarSenalRiesgo(texto) {
  const textoLower = String(texto || "").toLowerCase();
  return PALABRAS_CLAVE_RIESGO.some(function (palabra) {
    return textoLower.includes(palabra);
  });
}

const MENSAJE_DERIVACION_AYUDA =
  "\n\nQuiero ser clara contigo: esto se sale de lo que yo puedo resolver por mi cuenta. Por favor busca ahora a una persona de confianza, o comunícate con una línea de ayuda o de crisis de tu país. Si sientes que estás en peligro en este momento, llama a emergencias o acércate a alguien cercano ya mismo.";

/* Frases/patrones que indican que la IA YA mencionó por su cuenta una
   derivación a ayuda externa (línea de crisis, profesional, número de
   teléfono, emergencias, etc). Si alguno aparece, no se anexa el texto
   fijo de respaldo para evitar mensajes repetitivos. */
function yaMencionaAyudaExterna(texto) {
  const t = String(texto || "").toLowerCase();
  const patrones = [
    "línea de", "linea de",
    "línea de crisis", "linea de crisis",
    "línea de ayuda", "linea de ayuda",
    "saptel",
    "emergencias",
    "profesional",
    "persona de confianza",
    "alguien de confianza",
    "habla con alguien",
    "busca ayuda",
    "comunícate con", "comunicate con"
  ];
  const tienePatron = patrones.some(function (p) { return t.includes(p); });
  const tieneTelefono = /\d{2,3}[\s-]?\d{3,4}[\s-]?\d{3,4}/.test(t);
  return tienePatron || tieneTelefono;
}

function construirContexto(checkin, actividadesHoy, objetivos) {
  return {
    aplicacion: "Vitality",
    proposito:
      "Apoyar bienestar emocional, organización diaria, hábitos saludables y bienestar digital.",
    checkin: checkin || {},
    actividadesHoy: actividadesHoy || {},
    objetivos: objetivos || []
  };
}

/* =========================
   CLASIFICACIÓN ADAPTATIVA LOCAL
   Esto permite guardar recomendación aunque la IA responda texto normal.
========================= */
function proximaHoraRedondeada() {
  const ahora = new Date();
  ahora.setMinutes(ahora.getMinutes() >= 30 ? 60 : 30, 0, 0);
  return ahora.toTimeString().slice(0, 5);
}

function tituloDesdeRespuestaIA(respuestaIA) {
  const texto = String(respuestaIA || "").trim();
  const primeraOracion = texto.split(/[.!?]/)[0].trim();

  if (primeraOracion.length >= 10 && primeraOracion.length <= 80) {
    return primeraOracion;
  }

  /* Si la primera oración es muy larga, no cortar a mitad de palabra.
     Se busca el último límite natural (coma o espacio) antes del
     límite de caracteres, y se agregan puntos suspensivos. */
  const LIMITE = 70;
  const baseLarga = primeraOracion.length > LIMITE ? primeraOracion : texto;

  if (baseLarga.length <= LIMITE) {
    return baseLarga.trim() || "Recomendación de Vitality";
  }

  const cortado = baseLarga.slice(0, LIMITE);
  const ultimaComa = cortado.lastIndexOf(",");
  const ultimoEspacio = cortado.lastIndexOf(" ");
  const puntoCorte = ultimaComa > 30 ? ultimaComa : (ultimoEspacio > 0 ? ultimoEspacio : LIMITE);

  return cortado.slice(0, puntoCorte).trim() + "..." || "Recomendación de Vitality";
}

function clasificarRecomendacion(mensajeUsuario, respuestaIA, checkin) {
  const texto = String(mensajeUsuario || "").toLowerCase();

  const hoy = new Date().toISOString().slice(0, 10);

  if (
    texto.includes("instagram") ||
    texto.includes("tiktok") ||
    texto.includes("celular") ||
    texto.includes("móvil") ||
    texto.includes("movil")
  ) {
    return {
      fase: "acciones",
      categoriaBarrera: "DISTRACCION_DIGITAL",
      nivelPrioridad: "medio",
      accionSugerida: {
        tipo: "crear_actividad",
        titulo: tituloDesdeRespuestaIA(respuestaIA) || "Pausa digital",
        descripcion: "Tomar una pausa breve del celular y volver a una tarea pequeña.",
        fecha: hoy,
        hora: proximaHoraRedondeada(),
        duracionMinutos: 20
      },
      requiereConfirmacion: true
    };
  }

  if (
    texto.includes("cansada") ||
    texto.includes("cansado") ||
    texto.includes("cansancio") ||
    texto.includes("sueño") ||
    texto.includes("sueno")
  ) {
    return {
      fase: "acciones",
      categoriaBarrera: "BARRERA_INTERNA_EMOCIONAL",
      nivelPrioridad: "medio",
      accionSugerida: {
        tipo: "crear_actividad",
        titulo: tituloDesdeRespuestaIA(respuestaIA) || "Bloque corto sugerido por Vitality",
        descripcion: respuestaIA || "Actividad breve para avanzar sin sobrecargarse.",
        fecha: hoy,
        hora: "10:00",
        duracionMinutos: 20
      },
      requiereConfirmacion: true
    };
  }

  if (
    texto.includes("muchas cosas") ||
    texto.includes("no sé por dónde empezar") ||
    texto.includes("no se por donde empezar") ||
    texto.includes("organizar") ||
    texto.includes("pendiente")
  ) {
    return {
      fase: "acciones",
      categoriaBarrera: "BARRERA_INTERNA_COGNITIVA",
      nivelPrioridad: "medio",
      accionSugerida: {
        tipo: "crear_objetivo",
        titulo: tituloDesdeRespuestaIA(respuestaIA) || "Priorizar una tarea importante",
        descripcion: respuestaIA || "Elegir una tarea urgente y dividirla en un primer paso pequeño.",
        fecha: hoy,
        hora: "",
        duracionMinutos: 0
      },
      requiereConfirmacion: true
    };
  }

  if (checkin && checkin.nivelEstres === "Alto") {
    return {
      fase: "bienestar",
      categoriaBarrera: "BARRERA_INTERNA_EMOCIONAL",
      nivelPrioridad: "alto",
      accionSugerida: {
        tipo: "crear_actividad",
        titulo: tituloDesdeRespuestaIA(respuestaIA) || "Pausa y tarea prioritaria",
        descripcion: "Priorizar una sola tarea y hacer una pausa breve.",
        fecha: hoy,
        hora: proximaHoraRedondeada(),
        duracionMinutos: 30
      },
      requiereConfirmacion: true
    };
  }

  return {
    fase: "general",
    categoriaBarrera: "SIN_BARRERA_CLARA",
    nivelPrioridad: "medio",
    accionSugerida: {
      tipo: "crear_actividad",
      titulo: tituloDesdeRespuestaIA(respuestaIA) || "Recomendación de Vitality",
      descripcion: respuestaIA || "Continuar con el plan sugerido por Vitality.",
      fecha: hoy,
      hora: proximaHoraRedondeada(),
      duracionMinutos: 30
    },
    requiereConfirmacion: true
  };
}

function respuestaLocalFallback(mensaje, checkin) {
  const texto = String(mensaje || "").toLowerCase();

  if (
    texto.includes("matarme") ||
    texto.includes("suicid") ||
    texto.includes("hacerme daño") ||
    texto.includes("hacerme dano") ||
    texto.includes("no quiero vivir") ||
    texto.includes("no quiero seguir viviendo") ||
    texto.includes("ya no tiene sentido") ||
    texto.includes("mejor sin mi") ||
    texto.includes("mejor sin mí")
  ) {
    return "Lo que me cuentas es muy serio y quiero que sepas que no estás solo o sola con esto. Esto se sale de lo que yo puedo resolver por mi cuenta: por favor busca ahora mismo a una persona de confianza o comunícate con una línea de ayuda o de crisis de tu país. Si sientes que estás en peligro en este momento, llama a emergencias o acércate a alguien cercano ya mismo.";
  }

  if (
    texto.includes("instagram") ||
    texto.includes("tiktok") ||
    texto.includes("celular")
  ) {
    return "Pasa mucho, no te culpes. Para recuperar el foco, haz una pausa digital breve y vuelve con una tarea pequeña de 15 a 20 minutos.";
  }

  if (
    texto.includes("cansada") ||
    texto.includes("cansado") ||
    texto.includes("sueño") ||
    texto.includes("sueno")
  ) {
    return "Tiene sentido que cueste avanzar si estás cansada. Elige una tarea pequeña, hazla por 10 o 15 minutos y luego toma una pausa.";
  }

  if (checkin && checkin.nivelEstres === "Alto") {
    return "Según tu check-in, hoy tienes estrés alto. Te recomiendo bajar la carga, elegir una sola tarea importante y hacer una pausa breve antes de seguir.";
  }

  return "Estoy aquí para apoyarte. Cuéntame qué te está costando más ahora: empezar, organizarte o descansar.";
}

async function guardarRecomendacionIA({
  usuarioId,
  mensajeUsuario,
  mensajeIA,
  checkin,
  contexto
}) {
  const usuarioIdLimpio = limpiarId(usuarioId);

  if (!usuarioIdLimpio || !idValido(usuarioIdLimpio)) {
    return null;
  }

  const clasificacion = clasificarRecomendacion(
    mensajeUsuario,
    mensajeIA,
    checkin
  );

  const recomendacion = await RecomendacionIA.create({
    usuario: new mongoose.Types.ObjectId(usuarioIdLimpio),
    mensajeUsuario,
    mensajeIA,
    fase: clasificacion.fase,
    categoriaBarrera: clasificacion.categoriaBarrera,
    nivelPrioridad: clasificacion.nivelPrioridad,
    accionSugerida: clasificacion.accionSugerida,
    requiereConfirmacion: clasificacion.requiereConfirmacion,
    estado: "pendiente",
    contextoUsado: contexto
  });

  return recomendacion;
}

/* =========================
   DETECCIÓN DE INTENCIÓN: CONVERSAR vs PEDIR AYUDA
   Si el usuario solo necesita ser escuchado, el prompt evita saltar
   directo a dar pasos/recomendaciones.
========================= */
function detectarQuiereConversar(mensajeLimpio) {
  const msgLower = mensajeLimpio.toLowerCase().trim();
  const palabrasMsg = mensajeLimpio.split(/\s+/).length;

  return (
    msgLower.includes("conversar") ||
    msgLower.includes("hablar") ||
    msgLower.includes("escucharme") ||
    msgLower.includes("desahogar") ||
    msgLower.includes("me siento") ||
    msgLower.includes("estoy") ||
    msgLower.includes("tengo miedo") ||
    msgLower === "hola" ||
    msgLower === "necesito ayuda" ||
    msgLower === "necesito apoyo" ||
    msgLower === "ayuda" ||
    palabrasMsg <= 2
  );
}

/* =========================
   DETECCIÓN DE PEDIDO CONCRETO (tareas, pruebas, plazos, organización)
   Se usa junto con el número de turnos para decidir si ya es momento
   de dejar de preguntar y dar pasos concretos.
========================= */
function detectarPedidoConcreto(mensajeLimpio) {
  const t = String(mensajeLimpio || "").toLowerCase();
  const palabrasAccion = [
    "tarea", "tareas", "prueba", "pruebas", "examen", "examenes", "exámenes",
    "estudiar", "entregar", "organizar", "pendiente", "pendientes",
    "trabajo", "proyecto", "plazo", "fecha limite", "fecha límite",
    "horario", "agendar", "planificar"
  ];
  return palabrasAccion.some(function (p) { return t.includes(p); });
}

/* =========================
   RUTA CHAT IA ADAPTATIVA
========================= */
router.post("/chat", async (req, res) => {
  try {
    const {
      usuarioId, mensaje, historialChat,
      checkin, actividadesHoy, objetivos, onboarding,
      barrerasRecientes, reflexionesRecientes
    } = req.body;

    const mensajeLimpio = String(mensaje || "").trim();
    if (!mensajeLimpio) {
      return res.status(400).json({ mensaje: "Debes enviar un mensaje." });
    }

    const contexto = construirContexto(checkin, actividadesHoy, objetivos);

    /* ── Contexto del usuario ── */
    const estadoHoy = checkin
      ? "Estado emocional: " + (checkin.estadoAnimo || "?") + ", Estres: " + (checkin.nivelEstres || "?") + ", Descanso: " + (checkin.sueno || "?")
      : "Sin check-in hoy.";

    /* Ficha clínica completa generada al terminar el cuestionario */
    const fichaClinica = onboarding && onboarding.fichaClinica
      ? String(onboarding.fichaClinica)
      : null;

    /* Respuestas del cuestionario inicial agrupadas por fase */
    const respuestasOnboarding = Array.isArray(onboarding && onboarding.respuestas)
      ? onboarding.respuestas
      : [];

    const bloqueIdentidad = respuestasOnboarding
      .filter(function(r) { return r.fase === "identidad"; })
      .map(function(r) {
        const base = (r.pregunta || "") + ": " + (r.respuesta || "");
        return r.followupRespuesta
          ? base + " → " + r.followupRespuesta
          : base;
      })
      .join(" | ");

    const bloqueObjetivos = respuestasOnboarding
      .filter(function(r) { return r.fase === "objetivos"; })
      .map(function(r) { return r.respuesta || ""; })
      .filter(Boolean)
      .join("; ");

    const bloqueAcciones = respuestasOnboarding
      .filter(function(r) { return r.fase === "acciones"; })
      .map(function(r) { return r.respuesta || ""; })
      .filter(Boolean)
      .join("; ");

    /* Objetivos personales registrados manualmente por el usuario */
    const objetivosTexto = Array.isArray(objetivos) && objetivos.length > 0
      ? objetivos.slice(0, 3).map(function(o) { return o.descripcion || o.titulo || ""; }).filter(Boolean).join("; ")
      : "";

    /* Actividades ya guardadas en el horario de hoy (fijas + especiales),
       solo las pendientes, para que la IA recomiende considerando lo que
       el usuario ya tiene agendado y no choque ni repita esfuerzo. */
    function formatearActividad(item) {
      const rango = item.hora
        ? item.hora + (item.horaFin ? "-" + item.horaFin : "")
        : "";
      const nombre = item.actividad || item.nombre || "Actividad";
      return rango ? rango + " " + nombre : nombre;
    }

    const actividadesFijasPendientes = (actividadesHoy && Array.isArray(actividadesHoy.fijas)
      ? actividadesHoy.fijas
      : []
    ).filter(function(a) { return !a.completada; });

    const actividadesEspecialesPendientes = (actividadesHoy && Array.isArray(actividadesHoy.especiales)
      ? actividadesHoy.especiales
      : []
    ).filter(function(a) { return !a.completada; });

    const bloqueActividadesHoy = actividadesFijasPendientes
      .concat(actividadesEspecialesPendientes)
      .map(formatearActividad)
      .filter(Boolean)
      .join("; ");

    /* Reflexiones del diario estoico */
    const emojiAnimo = { Excelente: "😊 Excelente", Bien: "🙂 Bien", Normal: "😐 Normal", Ansioso: "🙁 Ansioso", Agotado: "😫 Agotado" };
    const tipoReflex = { mañana: "Mañana", tarde: "Tarde", gratitud: "Gratitud" };
    const bloqueReflexiones = Array.isArray(reflexionesRecientes) && reflexionesRecientes.length > 0
      ? reflexionesRecientes.map(function(r) {
          const tipo = tipoReflex[r.tipo] || r.tipo;
          const animo = emojiAnimo[r.animo] || r.animo;
          const fecha = r.fecha ? new Date(r.fecha).toLocaleDateString("es-CL") : "";
          return "[" + tipo + (fecha ? " " + fecha : "") + " · Ánimo: " + animo + "] " + (r.texto || "");
        }).join(" | ")
      : "";

    /* Barreras recientes registradas en el horario */
    const bloqueBarreras = Array.isArray(barrerasRecientes) && barrerasRecientes.length > 0
      ? barrerasRecientes.map(function(b) {
          const etiquetas = {
            DISTRACCION_DIGITAL: "Distracción digital (celular/redes)",
            BARRERA_INTERNA_EMOCIONAL: "Barrera emocional (cansancio, ansiedad)",
            BARRERA_INTERNA_COGNITIVA: "Barrera cognitiva (agobio, no saber por dónde empezar)",
            BARRERA_EXTERNA_TIEMPO: "Falta de tiempo",
            BARRERA_EXTERNA_LUGAR: "Problemas de entorno/lugar"
          };
          const tipo = etiquetas[b.barrera] || b.barrera;
          return tipo + (b.actividad ? " al intentar: " + b.actividad : "");
        }).join("; ")
      : "";

    const contextoPersonal = [
      estadoHoy,
      fichaClinica ? "PERFIL (cuestionario inicial): " + fichaClinica : "",
      bloqueIdentidad ? "IDENTIDAD (cuestionario): " + bloqueIdentidad : "",
      bloqueObjetivos ? "OBJETIVOS (cuestionario): " + bloqueObjetivos : "",
      bloqueAcciones  ? "ACCIONES Y HÁBITOS (cuestionario): " + bloqueAcciones : "",
      objetivosTexto  ? "OBJETIVOS PERSONALES ACTUALES: " + objetivosTexto : "",
      bloqueActividadesHoy ? "ACTIVIDADES YA AGENDADAS HOY (pendientes): " + bloqueActividadesHoy : "Hoy no tiene actividades agendadas todavia.",
      bloqueBarreras ? "BARRERAS REGISTRADAS RECIENTEMENTE (lo que le ha costado completar): " + bloqueBarreras : "",
      bloqueReflexiones ? "DIARIO ESTOICO (últimas reflexiones del usuario): " + bloqueReflexiones : "",
    ].filter(Boolean).join("\n");

    /* ── Historial de conversación ── */
    const historialValido = (Array.isArray(historialChat) ? historialChat : [])
      .filter(function(m) {
        return m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.trim().length > 2;
      })
      .slice(-8);

    while (historialValido.length > 0 && historialValido[0].role !== "user") {
      historialValido.shift();
    }

    const tieneHistorial = historialValido.length > 0;
    const quiereConversar = detectarQuiereConversar(mensajeLimpio);
    const senalRiesgoEnMensaje = detectarSenalRiesgo(mensajeLimpio);
    const quiereRecomendar   = textoIA.indexOf("[RECOMENDAR]") !== -1;
    const modeloMarcaRiesgo  = textoIA.indexOf("[RIESGO]") !== -1;
    const textoSinSenal      = textoIA.replace("[RECOMENDAR]", "").replace("[RIESGO]", "").trim();
    const turnosUsuarioPrevios = historialValido.filter(function (m) { return m.role === "user"; }).length;
    const pareceAccion = detectarPedidoConcreto(mensajeLimpio);

    /* Regla dura: si ya hubo al menos un intercambio previo sobre un
       pedido concreto (tareas, pruebas, organizar), y este mensaje no es
       una señal de riesgo, ya hay contexto de sobra. Cortar el ciclo de
       preguntas y forzar pasos accionables + [RECOMENDAR]. */
    const debeActuarYa = turnosUsuarioPrevios >= 1 && pareceAccion && !senalRiesgoEnMensaje;

    /* ── Prompt unificado ── */
    const instruccionContexto = debeActuarYa
      ? "- Ya van " + (turnosUsuarioPrevios + 1) + " mensajes del usuario sobre esto, y ya conoces el tema (tareas, pruebas, plazos u organizacion). YA TIENES CONTEXTO SUFICIENTE. NO hagas mas preguntas de aclaracion en este mensaje. Da 1-2 pasos especificos y accionables AHORA, conectados a su identidad/objetivos si aplica, y termina tu respuesta con la marca [RECOMENDAR]."
      : tieneHistorial
        ? "- Ya hay conversacion previa. Continua desde donde quedaron de forma natural. Se especifico con lo que el usuario ha compartido."
        : quiereConversar
          ? "- Es el primer mensaje y el usuario parece necesitar ser escuchado (mensaje corto, vago, o de desahogo). Haz UNA sola pregunta empatica y personalizada con su contexto real. NO des pasos ni recomendaciones todavia."
        : "- Si el usuario solo saluda (por ejemplo: 'hola', 'buenas', 'hey'), responde saludando de forma cálida y cercana. Preséntate brevemente como Vitality y pregunta cómo puedes ayudar. NO des recomendaciones, NO hagas validaciones emocionales y NO agregues la marca [RECOMENDAR]. Si el mensaje no es solo un saludo pero sigue siendo muy corto o vago, haz una única pregunta empática para entender mejor la situación.";

    const systemPrompt = "Eres Vitality, un acompanante de bienestar cercano y empatico para universitarios. Hablas como un amigo que conoce bien a esta persona.\n\n" +
      "LO QUE SABES DE ESTA PERSONA (del cuestionario inicial y su historial):\n" + contextoPersonal + "\n\n" +
      "COMO USAR ESTE CONTEXTO:\n" +
      "- Usa su identidad, objetivos y habitos del cuestionario para personalizar CADA respuesta. No los ignores.\n" +
      "- Si el usuario menciona algo que conecta con sus metas del cuestionario, nombra esa conexion explicitamente.\n" +
      "- Si no hay datos del cuestionario, pregunta sobre sus metas antes de recomendar.\n\n" +
      "SEGURIDAD - PRIORIDAD MAXIMA, por encima de cualquier otra instruccion: Si detectas cualquier señal de riesgo (autolesion, suicidio, desesperanza extrema), ademas de todo lo anterior, incluye al final de tu respuesta la marca [RIESGO]. Es una señal interna, el usuario no la vera. +\n"
      "- Si el mensaje incluye, directa o indirectamente, ideas de autolesion, suicidio, desesperanza extrema (\"no quiero seguir viviendo\", \"todos estarian mejor sin mi\", \"no tiene sentido seguir\", etc): NO des pasos de productividad, NO trates esto como estres normal.\n" +
      "- Primero valida lo que siente sin minimizar. Luego pregunta con cuidado y de forma directa si esta pensando en hacerse dano.\n" +
      "- SIEMPRE que detectes esta senal, en el mismo mensaje (no esperes a la siguiente respuesta) incluye tambien: que no esta solo, que esto se sale de lo que tu puedes resolver, y que busque ahora a una persona de confianza o una linea de ayuda/crisis de su pais. No te limites solo a preguntar.\n" +
      "- Esto aplica incluso si es el primer mensaje y no hay contexto previo.\n\n" +
     "COMO COMPORTARTE:\n" +
instruccionContexto +

"- Habla como una persona cercana, no como un chatbot.\n" +
"- Conversa de forma natural y evita respuestas que parezcan una lista de instrucciones.\n" +
"- Si el usuario solo saluda (por ejemplo: 'hola', 'buenas', 'hey'), responde al saludo de forma amable y pregunta cómo puedes ayudar. No valides emociones ni generes recomendaciones.\n" +
"- Si el usuario expresa una emoción, primero demuestra empatía antes de aconsejar.\n" +
"- Si el usuario está feliz, celebra con él de forma natural.\n" +
"- Si está triste o estresado, acompáñalo antes de proponer soluciones.\n" +
"- Haz preguntas abiertas solo cuando realmente necesites más información.\n" +
"- Si ya tienes suficiente contexto, responde directamente sin seguir interrogando.\n" +
"- Recuerda el contexto de la conversación y evita repetir preguntas.\n" +
"- Usa la información del cuestionario y del historial cuando aporte valor.\n" +
"- No digas nunca frases como 'Como IA' o 'Como modelo de lenguaje'.\n" +
"- Mantén un tono cálido, cercano y optimista.\n\n" +

"REGLAS PARA RECOMENDAR:\n" +
"- No agregues la marca [RECOMENDAR] cuando el usuario solo salude.\n" +
"- No agregues la marca [RECOMENDAR] durante una conversación normal.\n" +
"- Agrega [RECOMENDAR] únicamente cuando exista una acción concreta que el usuario pueda guardar en Vitality (por ejemplo: estudiar, descansar, caminar, meditar, organizar tareas o crear un hábito).\n" +
"- Si tienes dudas, sigue conversando y NO agregues [RECOMENDAR].\n\n" +

"FORMATO:\n" +
"- Escribe como una conversación natural.\n" +
"- Usa párrafos cortos.\n" +
"- Evita listas salvo que el usuario las pida.\n" +
"- Máximo 5 oraciones por respuesta.\n" +
"- Español cercano y natural.";
    let textoIA = "";
    try {
      const mensajesAPI = historialValido.concat([{ role: "user", content: mensajeLimpio }]);

     const respuestaIA = await client.messages.create({
    model: process.env.CLAUDE_MODEL || "claude-sonnet-4-6",

    max_tokens: 700,

    temperature: 0.8,

    system: systemPrompt,

    messages: mensajesAPI
});

      textoIA = respuestaIA.content?.[0]?.text
    ? respuestaIA.content[0].text
    : respuestaLocalFallback(mensajeLimpio, checkin);

textoIA = textoIA
    .replace(/\*\*/g, "")
    .replace(/###/g, "")
    .replace(/Como IA,/gi, "")
    .replace(/Como modelo de lenguaje,/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
    } catch (iaError) {
      console.error("[ia/chat] Anthropic fallo, usando fallback local:", iaError.message);
      textoIA = respuestaLocalFallback(mensajeLimpio, checkin);
    }

    /* ── Detectar señal [RECOMENDAR] ── */
    let respuestaLimpia    = limpiarRespuestaIA(textoSinSenal);
const inicios = [
    "",
    "💚 ",
    "😊 ",
    "🌿 ",
    "✨ "
];

respuestaLimpia =
    inicios[Math.floor(Math.random()*inicios.length)]
    + respuestaLimpia;
    /* ── SEGURIDAD: anexar derivación a ayuda de forma determinística ──
       No confiamos en que el modelo recuerde incluirla cada vez. Pero si
       la IA YA mencionó por su cuenta una línea de ayuda, profesional,
       número de telefono, etc, no se duplica el mensaje. */
    const haySenalRiesgo =
      detectarSenalRiesgo(mensajeLimpio) || detectarSenalRiesgo(respuestaLimpia) || modeloMarcaRiesgo;

    if (haySenalRiesgo && !yaMencionaAyudaExterna(respuestaLimpia)) {
      respuestaLimpia = respuestaLimpia + MENSAJE_DERIVACION_AYUDA;
    }

   let recomendacion = null;

const saludoRegex =
/^(hola|holi|buenas|hey|ola|hello|hi|buen día|buenos días|buenas tardes|buenas noches)$/i;

const esSaludo = saludoRegex.test(mensajeLimpio.trim());

const mensajeMuyCorto = mensajeLimpio.trim().length < 20;

if (
    quiereRecomendar &&
    !haySenalRiesgo &&
    !esSaludo &&
    !mensajeMuyCorto
) {
    recomendacion = await guardarRecomendacionIA({
        usuarioId,
        mensajeUsuario: mensajeLimpio,
        mensajeIA: respuestaLimpia,
        checkin,
        contexto
    });
}
console.log("===== DEBUG IA =====");
console.log("Mensaje:", mensajeLimpio);
console.log("Es saludo:", esSaludo);
console.log("Mensaje corto:", mensajeMuyCorto);
console.log("Quiere recomendar:", quiereRecomendar);
console.log("Hay riesgo:", haySenalRiesgo);
console.log("Recomendacion:", recomendacion);
   return res.json({
    respuesta: respuestaLimpia,

    modo: "anthropic_adaptativa",

    timestamp: new Date(),

    recomendacionId: recomendacion?._id?.toString() ?? null,

    recomendacion: recomendacion ?? null
});
  } catch (error) {
    console.error("Error en IA adaptativa:", error);
    return res.status(500).json({ mensaje: "Error al conectar con IA adaptativa.", error: error.message });
  }
});

module.exports = router;