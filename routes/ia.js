const express = require("express");
const OpenAI = require("openai");

const router = express.Router();

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  : null;

/* =========================
   RESPUESTA LOCAL DE RESPALDO
========================= */
function respuestaLocalFallback(mensaje, checkin) {
  const texto = String(mensaje || "").toLowerCase();

  if (
    texto.includes("matarme") ||
    texto.includes("suicid") ||
    texto.includes("hacerme daño") ||
    texto.includes("hacerme dano") ||
    texto.includes("no quiero vivir")
  ) {
    return "Siento mucho que estés pasando por eso.\n1) Busca ayuda inmediata con alguien de confianza.\n2) Si estás en peligro, llama a emergencias.\n3) No tienes que enfrentar esto sola.";
  }

  if (texto.includes("estres") || texto.includes("estrés")) {
    return "1) Haz una pausa breve y respira lento.\n2) Elige solo una tarea importante.\n3) Avanza 25 minutos y luego descansa.";
  }

  if (
    texto.includes("cansada") ||
    texto.includes("cansado") ||
    texto.includes("sueño") ||
    texto.includes("sueno")
  ) {
    return "1) Toma agua y baja el ritmo.\n2) Haz una tarea pequeña primero.\n3) Descansa antes de seguir.";
  }

  if (
    texto.includes("organizar") ||
    texto.includes("horario") ||
    texto.includes("actividad") ||
    texto.includes("plan")
  ) {
    return "1) Parte por lo urgente.\n2) Luego haz una tarea importante.\n3) Deja una pausa breve antes de continuar.";
  }

  if (checkin && checkin.nivelEstres === "Alto") {
    return "Según tu check-in, hoy tienes estrés alto.\n1) Baja la carga.\n2) Haz una pausa breve.\n3) Avanza con una sola tarea.";
  }

  if (checkin && checkin.energia === "Baja") {
    return "Según tu check-in, hoy tienes energía baja.\n1) Elige una tarea pequeña.\n2) Hazla con calma.\n3) Descansa antes de continuar.";
  }

  return "Estoy aquí para apoyarte.\nPuedes contarme cómo te sientes o pedirme ayuda para organizar tu día.";
}

/* =========================
   ARMAR CONTEXTO PARA OPENAI
========================= */
function construirContexto(checkin, actividadesHoy, objetivos) {
  return `
Aplicación: Vitality.
Propósito: apoyar bienestar emocional, organización diaria y hábitos saludables.
Importante: No debes dar diagnósticos médicos ni psicológicos. No reemplazas ayuda profesional.

Check-in del usuario:
${JSON.stringify(checkin || {}, null, 2)}

Resumen de actividades de hoy:
${JSON.stringify(actividadesHoy || {}, null, 2)}

Objetivos personales:
${JSON.stringify(objetivos || [], null, 2)}
`;
}

/* =========================
   LIMPIAR RESPUESTA IA
========================= */
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
   RUTA CHAT IA
========================= */
router.post("/chat", async (req, res) => {
  const { mensaje, checkin, actividadesHoy, objetivos } = req.body;

  const mensajeLimpio = String(mensaje || "").trim();

  if (!mensajeLimpio) {
    return res.status(400).json({
      mensaje: "Debes enviar un mensaje."
    });
  }

  if (!openai) {
    return res.json({
      respuesta: respuestaLocalFallback(mensajeLimpio, checkin),
      modo: "local"
    });
  }

  try {
    const contexto = construirContexto(checkin, actividadesHoy, objetivos);

    const respuesta = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.2",
      instructions: `
Eres Vitality, un asistente amable, claro y preventivo.

Reglas obligatorias:
- Responde siempre en español.
- Responde muy breve.
- No uses Markdown.
- No uses títulos.
- No uses negritas.
- No escribas párrafos largos.
- No uses más de 70 palabras.
- Si das un plan, usa exactamente este formato:
1) Primera acción breve.
2) Segunda acción breve.
3) Tercera acción breve.
- Cada paso debe ir en una línea distinta.
- Usa frases simples y directas.
- Considera el check-in, actividades y objetivos del usuario.
- No diagnostiques enfermedades.
- No digas que eres terapeuta, médico o psicólogo.
- No reemplazas ayuda profesional.
- Si el usuario menciona peligro, autolesión, suicidio o una urgencia grave, recomienda buscar ayuda inmediata.
`,
      input: `${contexto}\n\nUsuario: ${mensajeLimpio}`,
      max_output_tokens: 90
    });

    const textoRespuesta = limpiarRespuestaIA(
      respuesta.output_text ||
        "No pude generar una respuesta en este momento. Intenta escribirme nuevamente."
    );

    return res.json({
      respuesta: textoRespuesta,
      modo: "openai"
    });
  } catch (error) {
    console.error("Error en IA:", error);

    return res.json({
      respuesta: respuestaLocalFallback(mensajeLimpio, checkin),
      modo: "local_fallback_por_error",
      detalle: "OpenAI no respondió correctamente, se usó respuesta local."
    });
  }
});

module.exports = router;