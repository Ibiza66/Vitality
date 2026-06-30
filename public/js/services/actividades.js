const express = require("express");
const Actividad = require("../models/Actividad");

const router = express.Router();

/* ─────────────────────────────────────────
   CREAR ACTIVIDAD
───────────────────────────────────────────*/
router.post("/", async (req, res) => {
  try {
    const {
      usuarioId, tipoActividad, dia, fecha,
      tipoEspecial, hora, horaFin, actividad,
      completada, origen
    } = req.body;

    if (!usuarioId || !tipoActividad || !hora || !horaFin || !actividad) {
      return res.status(400).json({ mensaje: "Faltan datos de la actividad." });
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
      origen, 
      completada: false
    });

    res.status(201).json({
      mensaje: "Actividad guardada correctamente.",
      actividad: nuevaActividad
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al guardar actividad.", error: error.message });
  }
});

/* ─────────────────────────────────────────
   OBTENER ACTIVIDADES DE UN USUARIO
───────────────────────────────────────────*/
router.get("/:usuarioId", async (req, res) => {
  try {
    const actividades = await Actividad.find({
      usuario: req.params.usuarioId
    }).sort({ hora: 1 });

    res.json(actividades);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener actividades.", error: error.message });
  }
});

/* ─────────────────────────────────────────
   ACTUALIZAR ACTIVIDAD
───────────────────────────────────────────*/
router.put("/:actividadId", async (req, res) => {
  try {
    const actividadActualizada = await Actividad.findByIdAndUpdate(
      req.params.actividadId,
      req.body,
      { new: true }
    );

    if (!actividadActualizada) {
      return res.status(404).json({ mensaje: "Actividad no encontrada." });
    }

    res.json({ mensaje: "Actividad actualizada correctamente.", actividad: actividadActualizada });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar actividad.", error: error.message });
  }
});

/* ─────────────────────────────────────────
   COMPLETAR / DESCOMPLETAR ACTIVIDAD
───────────────────────────────────────────*/
router.patch("/:actividadId/completar", async (req, res) => {
  try {
    const actividad = await Actividad.findById(req.params.actividadId);

    if (!actividad) {
      return res.status(404).json({ mensaje: "Actividad no encontrada." });
    }

    actividad.completada = !actividad.completada;
    await actividad.save();

    res.json({ mensaje: "Estado de actividad actualizado.", actividad });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al cambiar estado de actividad.", error: error.message });
  }
});

/* ─────────────────────────────────────────
   ELIMINAR ACTIVIDAD
───────────────────────────────────────────*/
router.delete("/:actividadId", async (req, res) => {
  try {
    const actividadEliminada = await Actividad.findByIdAndDelete(req.params.actividadId);

    if (!actividadEliminada) {
      return res.status(404).json({ mensaje: "Actividad no encontrada." });
    }

    res.json({ mensaje: "Actividad eliminada correctamente." });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar actividad.", error: error.message });
  }
});

/* ─────────────────────────────────────────
   LIMPIAR DUPLICADOS DE UN USUARIO
   DELETE /api/actividades/limpiar/:usuarioId
   → Elimina entradas duplicadas (mismo dia/fecha + hora + actividad)
   → Solo conserva la más reciente de cada grupo
   → USAR UNA SOLA VEZ para limpiar datos de prueba
───────────────────────────────────────────*/
router.delete("/limpiar/:usuarioId", async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const todas = await Actividad.find({ usuario: usuarioId }).sort({ createdAt: -1 });

    const vistas = new Set();
    const paraEliminar = [];

    for (const act of todas) {
      // Clave única: tipo + identificador de día/fecha + hora + nombre
      const clave = `${act.tipoActividad}|${act.dia || act.fecha}|${act.hora}|${act.actividad.toLowerCase().trim()}`;

      if (vistas.has(clave)) {
        paraEliminar.push(act._id);
      } else {
        vistas.add(clave);
      }
    }

    if (paraEliminar.length === 0) {
      return res.json({ mensaje: "No se encontraron duplicados.", eliminadas: 0 });
    }

    await Actividad.deleteMany({ _id: { $in: paraEliminar } });

    res.json({
      mensaje: `Limpieza completada. ${paraEliminar.length} duplicado(s) eliminado(s).`,
      eliminadas: paraEliminar.length
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al limpiar duplicados.", error: error.message });
  }
});

module.exports = router;