const express = require("express");
const mongoose = require("mongoose");
const Objetivo = require("../models/Objetivo");

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

function fechaValida(fecha) {
  if (!fecha) return false;

  const patronFecha = /^\d{4}-\d{2}-\d{2}$/;
  return patronFecha.test(fecha);
}

/* =========================
   CREAR OBJETIVO
========================= */
router.post("/", async (req, res) => {
  try {
    const { usuarioId, titulo, descripcion, fecha } = req.body;

    const usuarioIdLimpio = limpiarId(usuarioId);
    const tituloLimpio = String(titulo || "").trim();
    const descripcionLimpia = String(descripcion || "").trim();
    const fechaLimpia = String(fecha || "").trim();

    if (!usuarioIdLimpio || !tituloLimpio || !fechaLimpia) {
      return res.status(400).json({
        mensaje: "Faltan datos del objetivo."
      });
    }

    if (!idValido(usuarioIdLimpio)) {
      return res.status(400).json({
        mensaje: "ID de usuario no válido.",
        idRecibido: usuarioId,
        idLimpio: usuarioIdLimpio
      });
    }

    if (!fechaValida(fechaLimpia)) {
      return res.status(400).json({
        mensaje: "La fecha del objetivo no es válida. Usa el formato YYYY-MM-DD."
      });
    }

    const objetivo = await Objetivo.create({
      usuario: new mongoose.Types.ObjectId(usuarioIdLimpio),
      titulo: tituloLimpio,
      descripcion: descripcionLimpia,
      fecha: fechaLimpia,
      completado: false
    });

    return res.status(201).json({
      mensaje: "Objetivo guardado correctamente.",
      objetivo
    });
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al guardar objetivo.",
      error: error.message
    });
  }
});

/* =========================
   OBTENER OBJETIVOS DE UN USUARIO
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

    const objetivos = await Objetivo.find({
      usuario: new mongoose.Types.ObjectId(usuarioIdLimpio)
    }).sort({
      fecha: -1,
      createdAt: -1
    });

    return res.json(objetivos);
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al obtener objetivos.",
      error: error.message
    });
  }
});

/* =========================
   MARCAR / DESMARCAR OBJETIVO
========================= */
router.patch("/:objetivoId/completar", async (req, res) => {
  try {
    const objetivoIdLimpio = limpiarId(req.params.objetivoId);

    if (!idValido(objetivoIdLimpio)) {
      return res.status(400).json({
        mensaje: "ID de objetivo no válido.",
        idRecibido: req.params.objetivoId,
        idLimpio: objetivoIdLimpio
      });
    }

    const objetivo = await Objetivo.findById(objetivoIdLimpio);

    if (!objetivo) {
      return res.status(404).json({
        mensaje: "No se encontró el objetivo."
      });
    }

    objetivo.completado = !objetivo.completado;
    await objetivo.save();

    return res.json({
      mensaje: "Estado del objetivo actualizado correctamente.",
      objetivo
    });
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al actualizar objetivo.",
      error: error.message
    });
  }
});

/* =========================
   ELIMINAR OBJETIVO
========================= */
router.delete("/:objetivoId", async (req, res) => {
  try {
    const objetivoIdLimpio = limpiarId(req.params.objetivoId);

    if (!idValido(objetivoIdLimpio)) {
      return res.status(400).json({
        mensaje: "ID de objetivo no válido.",
        idRecibido: req.params.objetivoId,
        idLimpio: objetivoIdLimpio
      });
    }

    const objetivoEliminado = await Objetivo.findByIdAndDelete(objetivoIdLimpio);

    if (!objetivoEliminado) {
      return res.status(404).json({
        mensaje: "No se encontró el objetivo."
      });
    }

    return res.json({
      mensaje: "Objetivo eliminado correctamente.",
      objetivo: objetivoEliminado
    });
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al eliminar objetivo.",
      error: error.message
    });
  }
});

module.exports = router;