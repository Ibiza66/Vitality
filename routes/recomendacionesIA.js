const express = require("express");
const mongoose = require("mongoose");

const RecomendacionIA = require("../models/RecomendacionIA");
const Objetivo = require("../models/Objetivo");
const Actividad = require("../models/Actividad");

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

function sumarMinutosAHora(hora, minutos) {
  if (!hora || !minutos) return "";

  const partes = hora.split(":");
  const horas = Number(partes[0]);
  const mins = Number(partes[1]);

  if (Number.isNaN(horas) || Number.isNaN(mins)) {
    return "";
  }

  const fecha = new Date();
  fecha.setHours(horas);
  fecha.setMinutes(mins + Number(minutos));

  const horaFinal = String(fecha.getHours()).padStart(2, "0");
  const minutoFinal = String(fecha.getMinutes()).padStart(2, "0");

  return `${horaFinal}:${minutoFinal}`;
}
/* =========================
   GENERAR RECOMENDACIÓN DESDE CHAT
========================= */
function limpiarIdChatIA(id) {
  return String(id || "").trim();
}

function idValidoChatIA(id) {
  const mongoose = require("mongoose");
  return mongoose.Types.ObjectId.isValid(id);
}

function crearRecomendacionDesdeTextoChat(mensajeUsuario) {
  const texto = String(mensajeUsuario || "").toLowerCase();

  if (
    texto.includes("estres") ||
    texto.includes("estrés") ||
    texto.includes("ansiedad") ||
    texto.includes("agobi")
  ) {
    return {
      categoria: "BIENESTAR_EMOCIONAL",
      mensajeIA:
        "Noté que estás con estrés alto. Te recomiendo bajar la carga del momento y partir con una pausa breve antes de seguir.",
      accionSugerida: {
        tipo: "Pausa de calma",
        titulo: "Respira y baja la intensidad",
        descripcion:
          "Haz 1 minuto de respiración lenta. Luego elige una sola tarea pequeña para avanzar sin sobrecargarte.",
        hora: "Ahora",
        duracionMinutos: 10
      }
    };
  }

  if (
    texto.includes("dorm") ||
    texto.includes("sueño") ||
    texto.includes("cansad") ||
    texto.includes("agotad")
  ) {
    return {
      categoria: "DESCANSO",
      mensajeIA:
        "Veo que tu descanso no está bien. Hoy conviene avanzar con menos presión y priorizar una actividad breve.",
      accionSugerida: {
        tipo: "Bajar carga",
        titulo: "Haz una tarea corta",
        descripcion:
          "Elige una tarea simple de 15 minutos y evita exigirte demasiado si dormiste mal.",
        hora: "Ahora",
        duracionMinutos: 15
      }
    };
  }

  if (
    texto.includes("estudi") ||
    texto.includes("tarea") ||
    texto.includes("prueba") ||
    texto.includes("solemne")
  ) {
    return {
      categoria: "ESTUDIO",
      mensajeIA:
        "Para estudiar sin bloquearte, te recomiendo partir con un bloque corto y una meta concreta.",
      accionSugerida: {
        tipo: "Bloque de estudio",
        titulo: "Estudia 25 minutos",
        descripcion:
          "Elige una sola materia o ejercicio. Trabaja 25 minutos y luego descansa 5.",
        hora: "Ahora",
        duracionMinutos: 25
      }
    };
  }

  if (
    texto.includes("instagram") ||
    texto.includes("tiktok") ||
    texto.includes("celular") ||
    texto.includes("apps")
  ) {
    return {
      categoria: "DISTRACCION_DIGITAL",
      mensajeIA:
        "Parece que el celular puede estar afectando tu foco. Te recomiendo hacer una pausa digital breve.",
      accionSugerida: {
        tipo: "Pausa digital",
        titulo: "Aleja el celular",
        descripcion:
          "Deja el celular fuera de alcance por 25 minutos y vuelve a una actividad concreta.",
        hora: "Ahora",
        duracionMinutos: 25
      }
    };
  }

  return {
    categoria: "APOYO_GENERAL",
    mensajeIA:
      "Te entiendo. Para ayudarte mejor, partamos con algo simple y concreto para este momento.",
    accionSugerida: {
      tipo: "Organización breve",
      titulo: "Elige una acción pequeña",
      descripcion:
        "Piensa en una sola cosa que puedas hacer ahora en menos de 15 minutos. Solo empieza por eso.",
      hora: "Ahora",
      duracionMinutos: 15
    }
  };
}

/* =========================
   GENERAR RECOMENDACIÓN DESDE CHAT
========================= */
function obtenerTipoAccionSeguroChatVitality(tipoPreferido) {
  const enumValues =
    RecomendacionIA.schema.path("accionSugerida.tipo")?.enumValues || [];

  if (!enumValues.length) {
    return tipoPreferido;
  }

  const exacto = enumValues.find(
    (valor) => String(valor).toLowerCase() === String(tipoPreferido).toLowerCase()
  );

  if (exacto) {
    return exacto;
  }

  const candidatos = [
    "Pausa digital",
    "Bajar carga",
    "Bajar carga del día",
    "Bloque corto",
    "Bloque de estudio",
    "Organización breve",
    "Pausa breve",
    "Descanso",
    "Recomendación"
  ];

  const encontrado = candidatos.find((valor) => enumValues.includes(valor));

  return encontrado || enumValues[0];
}

function crearRecomendacionDesdeTextoChatVitality(mensajeUsuario) {
  const texto = String(mensajeUsuario || "").toLowerCase();

  if (
    texto.includes("estres") ||
    texto.includes("estrés") ||
    texto.includes("ansiedad") ||
    texto.includes("agobi")
  ) {
    return {
      categoria: "BIENESTAR_EMOCIONAL",
      mensajeIA:
        "Noté que estás con mucho estrés. Te recomiendo bajar la intensidad antes de seguir.",
      accionSugerida: {
        tipo: "Pausa digital",
        titulo: "Respira y baja la intensidad",
        descripcion:
          "Haz 1 minuto de respiración lenta. Luego elige una sola tarea pequeña para avanzar sin sobrecargarte.",
        hora: "Ahora",
        duracionMinutos: 10
      }
    };
  }

  if (
    texto.includes("dorm") ||
    texto.includes("sueño") ||
    texto.includes("cansad") ||
    texto.includes("agotad")
  ) {
    return {
      categoria: "DESCANSO",
      mensajeIA:
        "Veo que tu descanso no está bien. Hoy conviene avanzar con menos presión y priorizar una actividad breve.",
      accionSugerida: {
        tipo: "Bajar carga del día",
        titulo: "Haz una tarea corta",
        descripcion:
          "Elige una tarea simple de 15 minutos y evita exigirte demasiado si dormiste mal.",
        hora: "Ahora",
        duracionMinutos: 15
      }
    };
  }

  if (
    texto.includes("estudi") ||
    texto.includes("tarea") ||
    texto.includes("prueba") ||
    texto.includes("solemne")
  ) {
    return {
      categoria: "ESTUDIO",
      mensajeIA:
        "Para estudiar sin bloquearte, te recomiendo partir con un bloque corto y una meta concreta.",
      accionSugerida: {
        tipo: "Bloque corto",
        titulo: "Estudia 25 minutos",
        descripcion:
          "Elige una sola materia o ejercicio. Trabaja 25 minutos y luego descansa 5.",
        hora: "Ahora",
        duracionMinutos: 25
      }
    };
  }

  if (
    texto.includes("instagram") ||
    texto.includes("tiktok") ||
    texto.includes("celular") ||
    texto.includes("apps")
  ) {
    return {
      categoria: "DISTRACCION_DIGITAL",
      mensajeIA:
        "Parece que el celular puede estar afectando tu foco. Te recomiendo hacer una pausa digital breve.",
      accionSugerida: {
        tipo: "Pausa digital",
        titulo: "Aleja el celular",
        descripcion:
          "Deja el celular fuera de alcance por 25 minutos y vuelve a una actividad concreta.",
        hora: "Ahora",
        duracionMinutos: 25
      }
    };
  }

  return {
    categoria: "APOYO_GENERAL",
    mensajeIA:
      "Te entiendo. Para ayudarte mejor, partamos con algo simple y concreto para este momento.",
    accionSugerida: {
      tipo: "Organización breve",
      titulo: "Elige una acción pequeña",
      descripcion:
        "Piensa en una sola cosa que puedas hacer ahora en menos de 15 minutos. Solo empieza por eso.",
      hora: "Ahora",
      duracionMinutos: 15
    }
  };
}

router.post("/generar-chat", async (req, res) => {
  try {
    const { usuarioId, mensajeUsuario } = req.body;

    if (!usuarioId || !mensajeUsuario) {
      return res.status(400).json({
        mensaje: "Faltan datos para generar recomendación desde chat."
      });
    }

    if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
      return res.status(400).json({
        mensaje: "ID de usuario inválido."
      });
    }

    const recomendacionBase = crearRecomendacionDesdeTextoChatVitality(mensajeUsuario);

    const accionSugeridaSegura = {
      ...recomendacionBase.accionSugerida,
      tipo: obtenerTipoAccionSeguroChatVitality(
        recomendacionBase.accionSugerida.tipo
      )
    };

    const recomendacion = await RecomendacionIA.create({
      usuario: usuarioId,
      usuarioId,
      mensajeUsuario,
      categoria: recomendacionBase.categoria,
      mensajeIA: recomendacionBase.mensajeIA,
      accionSugerida: accionSugeridaSegura,
      estado: "pendiente",
      origen: "chat"
    });

    return res.status(201).json({
      mensaje: "Recomendación generada desde chat.",
      mensajeIA: recomendacion.mensajeIA,
      recomendacion
    });
  } catch (error) {
    console.error("Error al generar recomendación desde chat:", error);

    return res.status(500).json({
      mensaje: "Error al generar recomendación desde chat.",
      error: error.message
    });
  }
});/* =========================
   CREAR RECOMENDACIÓN IA
========================= */
router.post("/", async (req, res) => {
  try {
    const {
      usuarioId,
      mensajeUsuario,
      mensajeIA,
      fase,
      categoriaBarrera,
      nivelPrioridad,
      accionSugerida,
      requiereConfirmacion,
      contextoUsado
    } = req.body;

    const usuarioIdLimpio = limpiarId(usuarioId);

    if (!usuarioIdLimpio || !mensajeUsuario || !mensajeIA) {
      return res.status(400).json({
        mensaje: "Faltan datos para guardar la recomendación."
      });
    }

    if (!idValido(usuarioIdLimpio)) {
      return res.status(400).json({
        mensaje: "ID de usuario no válido.",
        idRecibido: usuarioId,
        idLimpio: usuarioIdLimpio
      });
    }

    const recomendacion = await RecomendacionIA.create({
      usuario: new mongoose.Types.ObjectId(usuarioIdLimpio),
      mensajeUsuario,
      mensajeIA,
      fase: fase || "general",
      categoriaBarrera: categoriaBarrera || "SIN_BARRERA_CLARA",
      nivelPrioridad: nivelPrioridad || "medio",
      accionSugerida: accionSugerida || {
        tipo: "solo_recomendacion"
      },
      requiereConfirmacion:
        typeof requiereConfirmacion === "boolean"
          ? requiereConfirmacion
          : true,
      estado: "pendiente",
      contextoUsado: contextoUsado || {}
    });

    res.status(201).json({
      mensaje: "Recomendación IA guardada correctamente.",
      recomendacion
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al guardar recomendación IA.",
      error: error.message
    });
  }
});

/* =========================
   OBTENER RECOMENDACIONES DE USUARIO
========================= */
router.get("/:usuarioId", async (req, res) => {
  try {
    const usuarioIdLimpio = limpiarId(req.params.usuarioId);

    if (!idValido(usuarioIdLimpio)) {
      return res.status(400).json({
        mensaje: "ID de usuario no válido.",
        idRecibido: req.params.usuarioId,
        idLimpio: usuarioIdLimpio
      });
    }

    const recomendaciones = await RecomendacionIA.find({
      usuario: new mongoose.Types.ObjectId(usuarioIdLimpio)
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(recomendaciones);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener recomendaciones IA.",
      error: error.message
    });
  }
});

/* =========================
   RECHAZAR RECOMENDACIÓN
========================= */
router.patch("/:recomendacionId/rechazar", async (req, res) => {
  try {
    const recomendacionIdLimpio = String(req.params.recomendacionId || "").trim();

    if (!idValido(recomendacionIdLimpio)) {
      return res.status(400).json({
        mensaje: "ID de recomendación no válido."
      });
    }

    const recomendacion = await RecomendacionIA.findByIdAndUpdate(
      recomendacionIdLimpio,
      {
        estado: "rechazada"
      },
      {
        returnDocument: 'after'
      }
    );

    if (!recomendacion) {
      return res.status(404).json({
        mensaje: "No se encontró la recomendación."
      });
    }

    res.json({
      mensaje: "Recomendación rechazada.",
      recomendacion
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al rechazar recomendación IA.",
      error: error.message
    });
  }
});

/* =========================
   ACEPTAR Y APLICAR RECOMENDACIÓN
========================= */
router.patch("/:recomendacionId/aceptar", async (req, res) => {
  try {
    const recomendacionIdLimpio = String(req.params.recomendacionId || "").trim();

    if (!idValido(recomendacionIdLimpio)) {
      return res.status(400).json({
        mensaje: "ID de recomendación no válido."
      });
    }

    const recomendacion = await RecomendacionIA.findById(recomendacionIdLimpio);

    if (!recomendacion) {
      return res.status(404).json({
        mensaje: "No se encontró la recomendación."
      });
    }

    if (recomendacion.estado === "aplicada") {
      return res.status(400).json({
        mensaje: "Esta recomendación ya fue aplicada."
      });
    }

    const accion = recomendacion.accionSugerida || {};
    let resultadoAplicado = null;

    if (accion.tipo === "crear_objetivo") {
      resultadoAplicado = await Objetivo.create({
        usuario: recomendacion.usuario,
        titulo: accion.titulo || "Objetivo sugerido por Vitality",
        descripcion: accion.descripcion || recomendacion.mensajeIA,
        fecha: accion.fecha || new Date().toISOString().slice(0, 10),
        completado: false
      });
    }

    if (accion.tipo === "crear_actividad") {
      const horaInicio = accion.hora || "09:00";
      const horaFin = sumarMinutosAHora(
        horaInicio,
        accion.duracionMinutos || 30
      );

      resultadoAplicado = await Actividad.create({
        usuario: recomendacion.usuario,
        tipoActividad: "especial",
        dia: "",
        fecha: accion.fecha || new Date().toISOString().slice(0, 10),
        tipoEspecial: "Recomendación IA",
        hora: horaInicio,
        horaFin: horaFin || "09:30",
        actividad: accion.titulo || "Actividad sugerida por Vitality",
        completada: false
      });
    }

    recomendacion.estado =
      accion.tipo === "solo_recomendacion" ||
      accion.tipo === "sin_accion" ||
      accion.tipo === "pausa_digital" ||
      accion.tipo === "crear_alerta"
        ? "aceptada"
        : "aplicada";

    await recomendacion.save();

    res.json({
      mensaje: "Recomendación aceptada correctamente.",
      recomendacion,
      resultadoAplicado
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al aceptar recomendación IA.",
      error: error.message
    });
  }
});
/* =========================
   ELIMINAR RECOMENDACIÓN IA
========================= */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const recomendacion = await RecomendacionIA.findByIdAndDelete(id);

    if (!recomendacion) {
      return res.status(404).json({
        mensaje: "Recomendación IA no encontrada."
      });
    }

    return res.json({
      mensaje: "Recomendación IA eliminada correctamente.",
      recomendacion
    });
  } catch (error) {
    console.error("Error al eliminar recomendación IA:", error);

    return res.status(500).json({
      mensaje: "Error al eliminar recomendación IA.",
      error: error.message
    });
  }
});
module.exports = router;