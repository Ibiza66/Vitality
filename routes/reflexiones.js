const express = require("express");
const mongoose = require("mongoose");
const Reflexion = require("../models/Reflexion");

const router = express.Router();

// Auxiliares de validación
function limpiarUsuarioId(usuarioId) {
  if (!usuarioId) return null;
  return String(usuarioId).replace(/[^a-fA-F0-9]/g, "").trim();
}

function validarUsuarioId(usuarioId) {
  return mongoose.Types.ObjectId.isValid(usuarioId);
}

/* =========================
   CREAR REFLEXIÓN
   ========================= */
router.post("/", async (req, res) => {
  try {
    const { usuarioId, tipo, pregunta, texto, animo } = req.body;
    const usuarioIdLimpio = limpiarUsuarioId(usuarioId);

    if (!usuarioIdLimpio || !tipo || !pregunta || !texto || !animo) {
      return res.status(400).json({ mensaje: "Faltan datos obligatorios." });
    }

    if (!validarUsuarioId(usuarioIdLimpio)) {
      return res.status(400).json({ mensaje: "ID de usuario no válido." });
    }

    const nuevaReflexion = await Reflexion.create({
      usuario: new mongoose.Types.ObjectId(usuarioIdLimpio),
      tipo,
      pregunta,
      texto,
      animo
    });

    res.status(201).json({
      mensaje: "Reflexión guardada correctamente.",
      reflexion: nuevaReflexion
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al guardar la reflexión.", error: error.message });
  }
});

/* =========================
   OBTENER REFLEXIONES POR USUARIO
   ========================= */
router.get("/usuario/:usuarioId", async (req, res) => {
  try {
    const usuarioIdLimpio = limpiarUsuarioId(req.params.usuarioId);

    if (!validarUsuarioId(usuarioIdLimpio)) {
      return res.status(400).json({ mensaje: "ID de usuario no válido." });
    }

    const reflexiones = await Reflexion.find({
      usuario: new mongoose.Types.ObjectId(usuarioIdLimpio)
    }).sort({ createdAt: -1 });

    res.json(reflexiones);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener las reflexiones.", error: error.message });
  }
});

/* =========================
   ELIMINAR REFLEXIÓN
   ========================= */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ mensaje: "ID de reflexión no válido." });
    }

    const reflexionEliminada = await Reflexion.findByIdAndDelete(id);

    if (!reflexionEliminada) {
      return res.status(404).json({ mensaje: "No se encontró la reflexión." });
    }

    res.json({
      mensaje: "Reflexión eliminada correctamente.",
      reflexion: reflexionEliminada
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar la reflexión.", error: error.message });
  }
});

module.exports = router;
