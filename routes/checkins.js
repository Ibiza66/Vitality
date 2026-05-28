const express = require("express");
const mongoose = require("mongoose");
const Checkin = require("../models/Checkin");

const router = express.Router();

/* =========================
   FUNCIÓN PARA LIMPIAR Y VALIDAR ID
========================= */
function limpiarUsuarioId(usuarioId) {
  if (!usuarioId) return null;

  return String(usuarioId)
    .replace(/[^a-fA-F0-9]/g, "")
    .trim();
}

function validarUsuarioId(usuarioId) {
  return mongoose.Types.ObjectId.isValid(usuarioId);
}

/* =========================
   CREAR CHECK-IN
========================= */
router.post("/", async (req, res) => {
  try {
    const { usuarioId, estadoAnimo, nivelEstres, sueno, energia } = req.body;

    const usuarioIdLimpio = limpiarUsuarioId(usuarioId);

    if (!usuarioIdLimpio || !estadoAnimo || !nivelEstres || !sueno || !energia) {
      return res.status(400).json({
        mensaje: "Faltan datos del check-in."
      });
    }

    if (!validarUsuarioId(usuarioIdLimpio)) {
      return res.status(400).json({
        mensaje: "ID de usuario no válido.",
        idRecibido: usuarioId,
        idLimpio: usuarioIdLimpio
      });
    }

    const checkin = await Checkin.create({
      usuario: new mongoose.Types.ObjectId(usuarioIdLimpio),
      estadoAnimo,
      nivelEstres,
      sueno,
      energia
    });

    res.status(201).json({
      mensaje: "Check-in guardado correctamente.",
      checkin
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al guardar check-in.",
      error: error.message
    });
  }
});

/* =========================
   OBTENER ÚLTIMO CHECK-IN
========================= */
router.get("/ultimo/:usuarioId", async (req, res) => {
  try {
    const usuarioIdLimpio = limpiarUsuarioId(req.params.usuarioId);

    if (!validarUsuarioId(usuarioIdLimpio)) {
      return res.status(400).json({
        mensaje: "ID de usuario no válido.",
        idRecibido: req.params.usuarioId,
        idLimpio: usuarioIdLimpio
      });
    }

    const checkin = await Checkin.findOne({
      usuario: new mongoose.Types.ObjectId(usuarioIdLimpio)
    }).sort({ createdAt: -1 });

    if (!checkin) {
      return res.status(404).json({
        mensaje: "No hay check-in registrado."
      });
    }

    res.json(checkin);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener check-in.",
      error: error.message
    });
  }
});

/* =========================
   OBTENER HISTORIAL DE CHECK-INS
========================= */
router.get("/historial/:usuarioId", async (req, res) => {
  try {
    const usuarioIdLimpio = limpiarUsuarioId(req.params.usuarioId);

    if (!validarUsuarioId(usuarioIdLimpio)) {
      return res.status(400).json({
        mensaje: "ID de usuario no válido.",
        idRecibido: req.params.usuarioId,
        idLimpio: usuarioIdLimpio
      });
    }

    const checkins = await Checkin.find({
      usuario: new mongoose.Types.ObjectId(usuarioIdLimpio)
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(checkins);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener historial de check-ins.",
      error: error.message
    });
  }
});

module.exports = router;