const express = require("express");
const mongoose = require("mongoose");
const UsoApp = require("../models/UsoApp");

const router = express.Router();

function limpiarId(id) {
  if (!id) return null;

  return String(id)
    .replace(/[^a-fA-F0-9]/g, "")
    .trim();
}

function idValido(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/* =========================
   CREAR / REGISTRAR USO DE APP
========================= */
router.post("/", async (req, res) => {
  try {
    const {
      usuarioId,
      nombreApp,
      packageName,
      limiteMinutos,
      minutosUsados
    } = req.body;

    const usuarioIdLimpio = limpiarId(usuarioId);

    if (!usuarioIdLimpio || !nombreApp || !limiteMinutos) {
      return res.status(400).json({
        mensaje: "Faltan datos para registrar el uso de app."
      });
    }

    if (!idValido(usuarioIdLimpio)) {
      return res.status(400).json({
        mensaje: "ID de usuario no válido.",
        idRecibido: usuarioId,
        idLimpio: usuarioIdLimpio
      });
    }

    const limite = Number(limiteMinutos);
    const usados = Number(minutosUsados || 0);

    if (Number.isNaN(limite) || limite <= 0) {
      return res.status(400).json({
        mensaje: "El límite debe ser mayor a 0 minutos."
      });
    }

    if (Number.isNaN(usados) || usados < 0) {
      return res.status(400).json({
        mensaje: "Los minutos usados no pueden ser negativos."
      });
    }

    const usoApp = await UsoApp.create({
      usuario: new mongoose.Types.ObjectId(usuarioIdLimpio),
      nombreApp,
      packageName: packageName || "",
      limiteMinutos: limite,
      minutosUsados: usados
    });

    res.status(201).json({
      mensaje: "Uso de app registrado correctamente.",
      usoApp
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al registrar uso de app.",
      error: error.message
    });
  }
});

/* =========================
   OBTENER APPS MONITOREADAS
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

    const usos = await UsoApp.find({
      usuario: new mongoose.Types.ObjectId(usuarioIdLimpio)
    }).sort({ updatedAt: -1 });

    res.json(usos);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener uso de apps.",
      error: error.message
    });
  }
});

/* =========================
   ACTUALIZAR USO DE APP
========================= */
router.put("/:usoAppId", async (req, res) => {
  try {
    const usoAppIdLimpio = limpiarId(req.params.usoAppId);

    if (!idValido(usoAppIdLimpio)) {
      return res.status(400).json({
        mensaje: "ID de uso de app no válido.",
        idRecibido: req.params.usoAppId,
        idLimpio: usoAppIdLimpio
      });
    }

    const {
      nombreApp,
      packageName,
      limiteMinutos,
      minutosUsados
    } = req.body;

    const limite = Number(limiteMinutos);
    const usados = Number(minutosUsados || 0);

    if (!nombreApp || Number.isNaN(limite) || limite <= 0) {
      return res.status(400).json({
        mensaje: "Datos inválidos para actualizar uso de app."
      });
    }

    if (Number.isNaN(usados) || usados < 0) {
      return res.status(400).json({
        mensaje: "Los minutos usados no pueden ser negativos."
      });
    }

    const usoApp = await UsoApp.findByIdAndUpdate(
      usoAppIdLimpio,
      {
        nombreApp,
        packageName: packageName || "",
        limiteMinutos: limite,
        minutosUsados: usados
      },
      { returnDocument: 'after' }
    );

    if (!usoApp) {
      return res.status(404).json({
        mensaje: "No se encontró el registro de uso de app."
      });
    }

    res.json({
      mensaje: "Uso de app actualizado correctamente.",
      usoApp
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar uso de app.",
      error: error.message
    });
  }
});

/* =========================
   ELIMINAR APP MONITOREADA
========================= */
router.delete("/:usoAppId", async (req, res) => {
  try {
    const usoAppIdLimpio = limpiarId(req.params.usoAppId);

    if (!idValido(usoAppIdLimpio)) {
      return res.status(400).json({
        mensaje: "ID de uso de app no válido.",
        idRecibido: req.params.usoAppId,
        idLimpio: usoAppIdLimpio
      });
    }

    const usoEliminado = await UsoApp.findByIdAndDelete(usoAppIdLimpio);

    if (!usoEliminado) {
      return res.status(404).json({
        mensaje: "No se encontró el registro de uso de app."
      });
    }

    res.json({
      mensaje: "App eliminada del monitoreo correctamente.",
      usoApp: usoEliminado
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar uso de app.",
      error: error.message
    });
  }
});

module.exports = router;
