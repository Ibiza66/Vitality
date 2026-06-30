const express = require("express");
const Actividad = require("../models/Actividad");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      usuarioId,
      tipoActividad,
      dia,
      fecha,
      tipoEspecial,
      hora,
      horaFin,
      actividad
    } = req.body;

    if (!usuarioId || !tipoActividad || !hora || !horaFin || !actividad) {
      return res.status(400).json({
        mensaje: "Faltan datos de la actividad."
      });
    }

    const nuevaActividad = await Actividad.create({
      usuario: usuarioId,
      tipoActividad,
      dia: dia || "",
      fecha: fecha || "",
      tipoEspecial: tipoEspecial || "",
      hora,
      horaFin,
      actividad,
      completada: false
    });

    res.status(201).json({
      mensaje: "Actividad guardada correctamente.",
      actividad: nuevaActividad
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al guardar actividad.",
      error: error.message
    });
  }
});

router.get("/:usuarioId", async (req, res) => {
  try {
    const actividades = await Actividad.find({
      usuario: req.params.usuarioId
    }).sort({ hora: 1 });

    res.json(actividades);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener actividades.",
      error: error.message
    });
  }
});

router.put("/:actividadId", async (req, res) => {
  try {
    const actividadActualizada = await Actividad.findByIdAndUpdate(
      req.params.actividadId,
      req.body,
      { returnDocument: 'after' }
    );

    if (!actividadActualizada) {
      return res.status(404).json({
        mensaje: "Actividad no encontrada."
      });
    }

    res.json({
      mensaje: "Actividad actualizada correctamente.",
      actividad: actividadActualizada
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar actividad.",
      error: error.message
    });
  }
});

router.patch("/:actividadId/completar", async (req, res) => {
  try {
    const actividad = await Actividad.findById(req.params.actividadId);

    if (!actividad) {
      return res.status(404).json({
        mensaje: "Actividad no encontrada."
      });
    }

    actividad.completada = !actividad.completada;
    await actividad.save();

    res.json({
      mensaje: "Estado de actividad actualizado.",
      actividad
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al cambiar estado de actividad.",
      error: error.message
    });
  }
});

router.delete("/:actividadId", async (req, res) => {
  try {
    const actividadEliminada = await Actividad.findByIdAndDelete(
      req.params.actividadId
    );

    if (!actividadEliminada) {
      return res.status(404).json({
        mensaje: "Actividad no encontrada."
      });
    }

    res.json({
      mensaje: "Actividad eliminada correctamente."
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar actividad.",
      error: error.message
    });
  }
});

module.exports = router;
