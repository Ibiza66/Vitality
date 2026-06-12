const express = require("express");
const mongoose = require("mongoose");

const Usuario = require("../models/Usuario");
const Onboarding = require("../models/Onboarding");

const router = express.Router();

function idValido(id) {
  return mongoose.Types.ObjectId.isValid(String(id || "").trim());
}

/* =========================
   ACTUALIZAR NOMBRE USUARIO
========================= */
router.patch("/usuario/:usuarioId", async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { nombre } = req.body;

    if (!idValido(usuarioId)) {
      return res.status(400).json({
        mensaje: "ID de usuario inválido."
      });
    }

    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({
        mensaje: "El nombre no puede estar vacío."
      });
    }

    const usuario = await Usuario.findByIdAndUpdate(
      usuarioId,
      { nombre: String(nombre).trim() },
      { new: true }
    );

    if (!usuario) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado."
      });
    }

    return res.json({
      mensaje: "Nombre actualizado correctamente.",
      usuario
    });
  } catch (error) {
    console.error("Error actualizando usuario:", error);

    return res.status(500).json({
      mensaje: "Error actualizando usuario.",
      error: error.message
    });
  }
});

/* =========================
   ACTUALIZAR IDENTIDAD ONBOARDING
========================= */
router.patch("/onboarding/:usuarioId", async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { identidad } = req.body;

    if (!idValido(usuarioId)) {
      return res.status(400).json({
        mensaje: "ID de usuario inválido."
      });
    }

    if (!identidad || !String(identidad).trim()) {
      return res.status(400).json({
        mensaje: "La identidad no puede estar vacía."
      });
    }

    const onboarding = await Onboarding.findOneAndUpdate(
      { usuario: usuarioId },
      {
        usuario: usuarioId,
        identidad: String(identidad).trim(),
        completado: true
      },
      {
        new: true,
        upsert: true
      }
    );

    return res.json({
      mensaje: "Identidad actualizada correctamente.",
      onboarding
    });
  } catch (error) {
    console.error("Error actualizando identidad:", error);

    return res.status(500).json({
      mensaje: "Error actualizando identidad.",
      error: error.message
    });
  }
});

module.exports = router;