const express = require("express");
const router = express.Router();

/* ========================================================
   RUTA DE CHAT IA - VITALITY
   POST: /api/ia/chat
   Body: { mensaje, checkin, actividadesHoy, objetivos, usuarioId }
======================================================== */

// Detectar qué cliente de IA está disponible
let openai = null;
try {
  const OpenAI = require("openai");
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch (_) {}

/* ─────────────────────────────────────────
   RESPUESTA LOCAL DE RESPALDO
   Se usa cuando no hay API key configurada
───────────────────────────────────────────*/
function respuestaLocalFallback(mensaje, checkin) {
  const texto = String(mensaje || "").toLowerCase();

  if (texto.includes("estres") || texto.includes("estrés") || texto.includes("ansio")) {
    return "Entiendo que te sientes bajo presión. Respirar profundo y dar un paso a la vez puede ayudarte. ¿Hay algo concreto que te preocupa hoy?";
  }

  if (texto.includes("cansan") || texto.includes("cansado") || texto.includes("energía") || texto.includes("energia")) {
    return "El cansancio es una señal importante. ¿Has podido descansar bien últimamente? A veces una pausa breve marca la diferencia.";
  }

  if (texto.includes("horario") || texto.includes("organiz") || texto.includes("actividad")) {
    return "Para organizar tu día, te sugiero empezar por una sola tarea importante. ¿Cuál sería la más urgente para ti hoy?";
  }

  if (checkin && (checkin.nivelEstres === "Alto" || checkin.estadoAnimo === "Muy mal" || checkin.estadoAnimo === "Mal")) {
    return "Vi que tu check-in de hoy refleja un momento difícil. Recuerda que está bien no estar bien. ¿Quieres que revisemos juntos cómo está tu día?";
  }

  return "Estoy aquí para apoyarte. Cuéntame cómo te sientes o pide ayuda para organizar tu día.";
}

/* ─────────────────────────────────────────
   CONSTRUIR CONTEXTO PARA LA IA
───────────────────────────────────────────*/
function construirContexto(checkin, actividadesHoy, objetivos) {
  return `
Aplicación: Vitality — bienestar emocional y organización personal.
Importante: No des diagnósticos médicos ni psicológicos. No reemplazas ayuda profesional.

Check-in emocional del usuario:
${JSON.stringify(checkin || {}, null, 2)}

Resumen de actividades de hoy:
${JSON.stringify(actividadesHoy || {}, null, 2)}

Objetivos personales:
${JSON.stringify(objetivos || [], null, 2)}
`.trim();
}

/* ─────────────────────────────────────────
   LIMPIAR RESPUESTA (quitar Markdown)
───────────────────────────────────────────*/
function limpiarRespuesta(texto) {
  return String(texto || "")
    .replaceAll("###", "").replaceAll("##", "").replaceAll("#", "")
    .replaceAll("**", "").replaceAll("__", "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/* ─────────────────────────────────────────
   RUTA PRINCIPAL: POST /api/ia/chat
───────────────────────────────────────────*/
router.post("/chat", async (req, res) => {
  const { mensaje, checkin, actividadesHoy, objetivos } = req.body;

  const mensajeLimpio = String(mensaje || "").trim();

  if (!mensajeLimpio) {
    return res.status(400).json({ mensaje: "Debes enviar un mensaje." });
  }

  // Sin API key → respuesta local inmediata
  if (!openai) {
    return res.json({
      respuesta: respuestaLocalFallback(mensajeLimpio, checkin),
      modo: "local"
    });
  }

  try {
    const contexto = construirContexto(checkin, actividadesHoy, objetivos);

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      max_tokens: 200,
      messages: [
        {
          role: "system",
          content: `Eres Vitality, un acompañante de bienestar emocional empático y reflexivo.

Reglas obligatorias:
- Responde siempre en español.
- Responde de forma breve (máximo 80 palabras).
- No uses Markdown ni negritas.
- Haz UNA sola pregunta abierta por mensaje para invitar a la reflexión.
- Valida la emoción del usuario antes de sugerir cualquier acción.
- No diagnostiques enfermedades ni reemplaces ayuda profesional.
- Si el usuario menciona autolesión o urgencia grave, recomienda buscar ayuda inmediata.

${contexto}`
        },
        { role: "user", content: mensajeLimpio }
      ]
    });

    const textoRespuesta = limpiarRespuesta(
      completion.choices?.[0]?.message?.content ||
      "No pude generar una respuesta. Intenta escribirme nuevamente."
    );

    return res.json({ respuesta: textoRespuesta, modo: "openai" });

  } catch (error) {
    console.error("[Vitality IA] Error con OpenAI:", error.message);

    // Fallback local si OpenAI falla
    return res.json({
      respuesta: respuestaLocalFallback(mensajeLimpio, checkin),
      modo: "local-fallback"
    });
  }
});

module.exports = router;