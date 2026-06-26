const express = require("express");
const router = express.Router();

const Onboarding = require("../models/Onboarding");

/* =========================
   GUARDAR / ACTUALIZAR ONBOARDING
========================= */
router.post("/", async (req, res) => {
  try {
    const { usuarioId, objetivos, identidad, estres, completado } = req.body;

    if (!usuarioId) {
      return res.status(400).json({
        mensaje: "Falta el ID del usuario."
      });
    }

    const onboarding = await Onboarding.findOneAndUpdate(
      { usuario: usuarioId },
      {
        usuario: usuarioId,
        objetivos: Array.isArray(objetivos) ? objetivos : [],
        identidad: identidad || "",
        estres: Array.isArray(estres) ? estres : [],
        completado: Boolean(completado)
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    return res.json({
      mensaje: "Onboarding guardado correctamente.",
      onboarding
    });
  } catch (error) {
    console.error("Error al guardar onboarding:", error);

    return res.status(500).json({
      mensaje: "Error al guardar onboarding.",
      error: error.message
    });
  }
});

/* =========================
   OBTENER ONBOARDING POR USUARIO
========================= */
router.get("/:usuarioId", async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const onboarding = await Onboarding.findOne({
      usuario: usuarioId
    });

    if (!onboarding) {
      return res.status(404).json({
        mensaje: "Onboarding no encontrado."
      });
    }

    return res.json(onboarding);
  } catch (error) {
    console.error("Error al obtener onboarding:", error);

    return res.status(500).json({
      mensaje: "Error al obtener onboarding.",
      error: error.message
    });
  }
});

module.exports = router;