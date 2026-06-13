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
    const { usuarioId, estadoAnimo, nivelEstres, sueno, energia, estresVal, suenoVal, energiaVal } = req.body;

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
      energia,
      estresVal: Number(estresVal !== undefined ? estresVal : 5),
      suenoVal: Number(suenoVal !== undefined ? suenoVal : 5),
      energiaVal: Number(energiaVal !== undefined ? energiaVal : 5)
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
/* =========================
   ELIMINAR CHECK-IN
========================= */
router.delete("/:checkinId", async (req, res) => {
  try {
    const checkinId = String(req.params.checkinId || "")
      .replace(/[^a-fA-F0-9]/g, "")
      .trim();

    if (!mongoose.Types.ObjectId.isValid(checkinId)) {
      return res.status(400).json({
        mensaje: "ID de check-in no válido.",
        idRecibido: req.params.checkinId,
        idLimpio: checkinId
      });
    }

    const checkinEliminado = await Checkin.findByIdAndDelete(checkinId);

    if (!checkinEliminado) {
      return res.status(404).json({
        mensaje: "No se encontró el check-in."
      });
    }

    res.json({
      mensaje: "Check-in eliminado correctamente.",
      checkin: checkinEliminado
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar check-in.",
      error: error.message
    });
  }
});
/* =========================
   HISTORIAL DE CHECK-INS POR USUARIO
========================= */
router.get("/historial/:usuarioId", async (req, res) => {
  try {
    const { usuarioId } = req.params;

    if (!usuarioId) {
      return res.status(400).json({
        mensaje: "Falta el ID del usuario."
      });
    }

    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - 7);
    fechaInicio.setHours(0, 0, 0, 0);

    const checkins = await Checkin.find({
      usuario: usuarioId,
      createdAt: {
        $gte: fechaInicio
      }
    }).sort({
      createdAt: -1
    });

    return res.json(checkins);
  } catch (error) {
    console.error("Error al obtener historial de check-ins:", error);

    return res.status(500).json({
      mensaje: "Error al obtener historial de check-ins.",
      error: error.message
    });
  }
});
module.exports = router;