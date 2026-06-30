const express = require("express");
const Perfil  = require("../models/Perfil");
const router  = express.Router();

/* ─── OBTENER PERFIL ───────────────────────────────────────────────────────
   Si el perfil no existe (usuario nuevo), retorna un objeto vacío con 200.
   Antes retornaba 404, lo que generaba errores rojos en la consola del
   browser aunque el código los manejara correctamente.
─────────────────────────────────────────────────────────────────────────── */
router.get("/:usuarioId", async (req, res) => {
  try {
    const perfil = await Perfil.findOne({ usuario: req.params.usuarioId });

    if (!perfil) {
      /* Usuario nuevo sin perfil: retornar vacío en lugar de 404 */
      return res.json({ categoria: null, actividades: [], nuevo: true });
    }

    res.json(perfil);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener perfil.", error: error.message });
  }
});

/* ─── GUARDAR / ACTUALIZAR PERFIL ─── */
router.put("/:usuarioId", async (req, res) => {
  try {
    const { categoria, actividades } = req.body;

    if (!categoria || !actividades) {
      return res.status(400).json({ mensaje: "Categoría y actividades son obligatorias." });
    }

    const perfil = await Perfil.findOneAndUpdate(
      { usuario: req.params.usuarioId },
      { usuario: req.params.usuarioId, categoria, actividades },
      { returnDocument: "after", upsert: true }
    );

    res.json({ mensaje: "Perfil guardado correctamente.", perfil });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al guardar perfil.", error: error.message });
  }
});

module.exports = router;
