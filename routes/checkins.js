const express  = require("express");
const mongoose = require("mongoose");
const Checkin  = require("../models/Checkin");

const router = express.Router();

/* ─── Utilidades ─── */
function limpiarUsuarioId(usuarioId) {
  if (!usuarioId) return null;
  return String(usuarioId).replace(/[^a-fA-F0-9]/g, "").trim();
}
function validarUsuarioId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/* ─── CREAR CHECK-IN ─── */
router.post("/", async (req, res) => {
  try {
    const { usuarioId, estadoAnimo, nivelEstres, sueno, energia, estresVal, suenoVal, energiaVal } = req.body;
    const idLimpio = limpiarUsuarioId(usuarioId);

    if (!idLimpio || !estadoAnimo || !nivelEstres || !sueno || !energia) {
      return res.status(400).json({ mensaje: "Faltan datos del check-in." });
    }
    if (!validarUsuarioId(idLimpio)) {
      return res.status(400).json({ mensaje: "ID de usuario no válido.", idRecibido: usuarioId });
    }

    const checkin = await Checkin.create({
      usuario:   new mongoose.Types.ObjectId(idLimpio),
      estadoAnimo, nivelEstres, sueno, energia,
      estresVal:  Number(estresVal  ?? 5),
      suenoVal:   Number(suenoVal   ?? 5),
      energiaVal: Number(energiaVal ?? 5)
    });

    res.status(201).json({ mensaje: "Check-in guardado correctamente.", checkin });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al guardar check-in.", error: error.message });
  }
});

/* ─── OBTENER ÚLTIMO CHECK-IN ─── */
router.get("/ultimo/:usuarioId", async (req, res) => {
  try {
    const idLimpio = limpiarUsuarioId(req.params.usuarioId);
    if (!validarUsuarioId(idLimpio)) {
      return res.status(400).json({ mensaje: "ID de usuario no válido." });
    }

    const checkin = await Checkin.findOne({
      usuario: new mongoose.Types.ObjectId(idLimpio)
    }).sort({ createdAt: -1 });

    if (!checkin) return res.status(404).json({ mensaje: "No hay check-in registrado." });
    res.json(checkin);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener check-in.", error: error.message });
  }
});

/* ─── HISTORIAL DE CHECK-INS ───────────────────────────────────────────────
   Versión unificada: sanitiza el ID (versión original) Y aplica filtro
   de 7 días (versión duplicada). Retorna hasta 30 check-ins recientes.
   Query param opcional: ?dias=N para cambiar la ventana de tiempo.
─────────────────────────────────────────────────────────────────────────── */
router.get("/historial/:usuarioId", async (req, res) => {
  try {
    const idLimpio = limpiarUsuarioId(req.params.usuarioId);

    if (!validarUsuarioId(idLimpio)) {
      return res.status(400).json({ mensaje: "ID de usuario no válido.", idRecibido: req.params.usuarioId });
    }

    const dias = Math.min(Number(req.query.dias) || 7, 90); // default 7 días, max 90
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - dias);
    fechaInicio.setHours(0, 0, 0, 0);

    const checkins = await Checkin.find({
      usuario:   new mongoose.Types.ObjectId(idLimpio),
      createdAt: { $gte: fechaInicio }
    })
      .sort({ createdAt: -1 })
      .limit(30);

    res.json(checkins);
  } catch (error) {
    console.error("Error al obtener historial de check-ins:", error);
    res.status(500).json({ mensaje: "Error al obtener historial de check-ins.", error: error.message });
  }
});

/* ─── ELIMINAR CHECK-IN ─── */
router.delete("/:checkinId", async (req, res) => {
  try {
    const checkinId = String(req.params.checkinId || "").replace(/[^a-fA-F0-9]/g, "").trim();

    if (!mongoose.Types.ObjectId.isValid(checkinId)) {
      return res.status(400).json({ mensaje: "ID de check-in no válido." });
    }

    const eliminado = await Checkin.findByIdAndDelete(checkinId);
    if (!eliminado) return res.status(404).json({ mensaje: "No se encontró el check-in." });

    res.json({ mensaje: "Check-in eliminado correctamente.", checkin: eliminado });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar check-in.", error: error.message });
  }
});

module.exports = router;
