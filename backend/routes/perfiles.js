const express = require("express");
const Perfil = require("../models/Perfil");

const router = express.Router();

router.get("/:usuarioId", async (req, res) => {
  try {
    const perfil = await Perfil.findOne({
      usuario: req.params.usuarioId
    });

    if (!perfil) {
      return res.status(404).json({
        mensaje: "Perfil no encontrado."
      });
    }

    res.json(perfil);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener perfil.",
      error: error.message
    });
  }
});

router.put("/:usuarioId", async (req, res) => {
  try {
    const { categoria, actividades } = req.body;

    if (!categoria || !actividades) {
      return res.status(400).json({
        mensaje: "Categoría y actividades son obligatorias."
      });
    }

    const perfil = await Perfil.findOneAndUpdate(
      { usuario: req.params.usuarioId },
      {
        usuario: req.params.usuarioId,
        categoria,
        actividades
      },
      {
        new: true,
        upsert: true
      }
    );

    res.json({
      mensaje: "Perfil guardado correctamente.",
      perfil
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al guardar perfil.",
      error: error.message
    });
  }
});

module.exports = router;
