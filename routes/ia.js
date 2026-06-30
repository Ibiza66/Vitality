const express = require("express");
const mongoose = require("mongoose");
const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});const RecomendacionIA = require("../models/RecomendacionIA");

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
        tipo: "pausa_digital",
        titulo: "Pausa digital",
        descripcion:
          "Tomar una pausa breve del celular y volver a una tarea pequeña.",
        fecha: hoy,
        hora: "",
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
        titulo: "Bloque corto sugerido por Vitality",
        descripcion:
          "Actividad breve para avanzar sin sobrecargarse.",
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
        titulo: "Priorizar una tarea importante",
        descripcion:
          "Elegir una tarea urgente y dividirla en un primer paso pequeño.",
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
        tipo: "solo_recomendacion",
        titulo: "Bajar carga del día",
        descripcion:
          "Priorizar una sola tarea y hacer una pausa breve.",
        fecha: hoy,
        hora: "",
        duracionMinutos: 0
      },
      requiereConfirmacion: true
    };
  }

  return {
    fase: "general",
    categoriaBarrera: "SIN_BARRERA_CLARA",
    nivelPrioridad: "medio",
    accionSugerida: {
      tipo: "solo_recomendacion",
      titulo: "Recomendación personalizada",
      descripcion: respuestaIA || "Continuar conversación con Vitality.",
      fecha: "",
      hora: "",
      duracionMinutos: 0
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
    texto.includes("no quiero vivir")
  ) {
    return "Siento mucho que estés pasando por eso. No tienes que enfrentarlo sola. Busca ayuda inmediata con una persona de confianza o comunícate con servicios de emergencia de tu país. Si estás en peligro ahora, llama a emergencias o acércate a alguien cercano.";
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
   RUTA CHAT IA ADAPTATIVA
========================= */
router.post("/chat", async (req, res) => {
  try {
    const {
      usuarioId,
      mensaje,
      historialChat,
      checkin,
      actividadesHoy,
      objetivos,
      onboarding
    } = req.body;

    const mensajeLimpio = String(mensaje || "").trim();

    if (!mensajeLimpio) {
      return res.status(400).json({ mensaje: "Debes enviar un mensaje." });
    }

    const contexto = construirContexto(checkin, actividadesHoy, objetivos);

    const estadoHoy = checkin
      ? `Estado emocional: ${checkin.estadoAnimo || "?"}, Estrés: ${checkin.nivelEstres || "?"}, Descanso: ${checkin.sueno || "?"}`
      : "El usuario no ha hecho check-in hoy.";

    const fichaClinica = onboarding?.fichaClinica
      ? String(onboarding.fichaClinica).slice(0, 400)
      : null;

    const objetivosTexto = Array.isArray(objetivos) && objetivos.length > 0
      ? objetivos.slice(0, 2).map(o => o.descripcion || o.titulo || "").filter(Boolean).join("; ")
      : "Sin objetivos registrados";

    const msgLower = mensajeLimpio.toLowerCase().trim();
    const palabrasMsg = mensajeLimpio.split(/\s+/).length;

    const quiereConversar =
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
      palabrasMsg <= 2;

    const contextoPersonal = [
      estadoHoy,
      fichaClinica ? `Perfil del usuario: ${fichaClinica}` : "",
      `Objetivos: ${objetivosTexto}`
    ].filter(Boolean).join("\n");

    const systemPrompt = quiereConversar
      ? `Eres Vitality, acompañante empático de bienestar para universitarios.
MODO ESCUCHA: el usuario necesita ser escuchado, no instrucciones todavía.

${contextoPersonal}

Haz UNA sola pregunta abierta, personalizada con el contexto real del usuario. No preguntes algo genérico.
Ejemplo bueno: "Vi que hoy estás con estrés alto y tu meta es arreglar tu app. ¿Qué parte de eso te está bloqueando más?"
Máximo 2 oraciones: empatía breve + pregunta específica. Sin Markdown. En español.`
      : `Eres Vitality, acompañante de bienestar para universitarios.
MODO AYUDA: el usuario pide ayuda concreta.

${contextoPersonal}

Responde con:
1. Una frase corta que valide cómo se siente, usando su perfil real (no genérico).
2. Una recomendación específica para lo que pidió, conectada a sus objetivos.
3. Una pregunta de seguimiento concreta.
Sin Markdown, sin guiones como listas, sin negritas. Máximo 4 oraciones. En español.`;

    let textoIA = "";
    try {
      const historialValido = (Array.isArray(historialChat) ? historialChat : [])
        .filter(m => m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.trim().length > 2)
        .slice(-6);

      while (historialValido.length > 0 && historialValido[0].role !== "user") {
        historialValido.shift();
      }

      const mensajesAPI = [
        ...historialValido,
        { role: "user", content: mensajeLimpio }
      ];

    const respuestaIA = await client.messages.create({
  model: process.env.CLAUDE_MODEL || "claude-sonnet-4-6",
  max_tokens: 400,
  system: systemPrompt,
  messages: mensajesAPI
});

textoIA =
  respuestaIA.content[0]?.text ||
  respuestaLocalFallback(mensajeLimpio, checkin);
    } catch (iaError) {
  console.error("[ia/chat] Anthropic falló:", iaError);

  textoIA = respuestaLocalFallback(mensajeLimpio, checkin);
}

    const respuestaLimpia = limpiarRespuestaIA(textoIA);

    const esRespuestaConversacional =
      quiereConversar || respuestaLimpia.trimEnd().endsWith("?");

    let recomendacion = null;
    if (!esRespuestaConversacional) {
      recomendacion = await guardarRecomendacionIA({
        usuarioId,
        mensajeUsuario: mensajeLimpio,
        mensajeIA: respuestaLimpia,
        checkin,
        contexto
      });
    }

    return res.json({
      respuesta: respuestaLimpia,
      modo: "anthropic_adaptativa",
      recomendacionId: recomendacion ? recomendacion._id.toString() : null,
      recomendacion: recomendacion || null
    });
  } catch (error) {
    console.error("Error en IA adaptativa:", error);
    return res.status(500).json({
      mensaje: "Error al conectar con IA adaptativa.",
      error: error.message
    });
  }
});

module.exports = router;