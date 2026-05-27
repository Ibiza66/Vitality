const express = require("express");
const Checkin = require("../models/Checkin");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { usuarioId, estadoAnimo, nivelEstres, sueno, energia } = req.body;

    if (!usuarioId || !estadoAnimo || !nivelEstres || !sueno || !energia) {
      return res.status(400).json({
        mensaje: "Faltan datos del check-in."
      });
    }

    const checkin = await Checkin.create({
      usuario: usuarioId,
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

router.get("/ultimo/:usuarioId", async (req, res) => {
  try {
    const checkin = await Checkin.findOne({
      usuario: req.params.usuarioId
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

module.exports = router;
