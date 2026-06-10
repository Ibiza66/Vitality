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
    const recomendacionIdLimpio = limpiarId(req.params.recomendacionId);

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
        new: true
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
    const recomendacionIdLimpio = limpiarId(req.params.recomendacionId);

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

module.exports = router;