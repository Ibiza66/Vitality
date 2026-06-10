const express = require("express");
const OpenAI = require("openai");
const mongoose = require("mongoose");

const RecomendacionIA = require("../models/RecomendacionIA");

const router = express.Router();

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  : null;

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
   Esto permite guardar recomendación aunque OpenAI responda texto normal.
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
      checkin,
      actividadesHoy,
      objetivos
    } = req.body;

    const mensajeLimpio = String(mensaje || "").trim();

    if (!mensajeLimpio) {
      return res.status(400).json({
        mensaje: "Debes enviar un mensaje."
      });
    }

    const contexto = construirContexto(checkin, actividadesHoy, objetivos);

    let textoIA = "";

    if (!openai) {
      textoIA = respuestaLocalFallback(mensajeLimpio, checkin);
    } else {
      const respuesta = await openai.responses.create({
        model: process.env.OPENAI_MODEL || "gpt-5.2",
        instructions: `
Eres Vitality, un asistente amable de bienestar emocional, organización diaria y bienestar digital.

Responde siempre en español.
Usa tono cercano, breve y útil.
No uses Markdown pesado.
No uses títulos con ###.
No uses negritas con **.
No diagnostiques enfermedades.
No digas que eres terapeuta, médico o psicólogo.
No reemplazas ayuda profesional.
Valida primero la situación del usuario.
Da máximo 3 pasos concretos.
Usa el contexto del usuario: check-in, actividades y objetivos.
Si detectas distracción digital, recomienda una pausa digital.
Si detectas cansancio, recomienda una actividad corta y realista.
Si detectas estrés alto, recomienda bajar la carga.
        `,
        input: `
CONTEXTO DEL USUARIO:
${JSON.stringify(contexto, null, 2)}

MENSAJE DEL USUARIO:
${mensajeLimpio}
        `,
        max_output_tokens: 300
      });

      textoIA =
        respuesta.output_text ||
        respuestaLocalFallback(mensajeLimpio, checkin);
    }

    const respuestaLimpia = limpiarRespuestaIA(textoIA);

    const recomendacion = await guardarRecomendacionIA({
      usuarioId,
      mensajeUsuario: mensajeLimpio,
      mensajeIA: respuestaLimpia,
      checkin,
      contexto
    });

    return res.json({
      respuesta: respuestaLimpia,
      modo: openai ? "openai_adaptativa" : "local_adaptativa",
      recomendacionId: recomendacion ? recomendacion._id : null,
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