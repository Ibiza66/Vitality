const express = require("express");
const mongoose = require("mongoose");
const Habito = require("../models/Habito");

const router = express.Router();

// Auxiliares de validación
function limpiarUsuarioId(usuarioId) {
  if (!usuarioId) return null;
  return String(usuarioId).replace(/[^a-fA-F0-9]/g, "").trim();
}

function validarUsuarioId(usuarioId) {
  return mongoose.Types.ObjectId.isValid(usuarioId);
}

// Algoritmo de cálculo de rachas consecutivas
function calcularRachas(fechas) {
  if (!fechas || fechas.length === 0) return { racha: 0, maxRacha: 0 };

  // Filtrar duplicados y ordenar fechas de forma descendente (más recientes primero)
  const fechasUnicas = [...new Set(fechas)].sort((a, b) => b.localeCompare(a));
  
  const fechasDate = fechasUnicas.map(f => new Date(f + "T12:00:00"));

  // Helper para verificar si dos fechas son consecutivas (distancia exacta de 1 día)
  function sonConsecutivas(d1, d2) {
    const diffTime = Math.abs(d1 - d2);
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  }

  // Comprobar si la racha actual está activa (última fecha completada es hoy o ayer)
  const hoyString = new Date().toISOString().slice(0, 10);
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  const ayerString = ayer.toISOString().slice(0, 10);

  let racha = 0;
  const tieneHoy = fechasUnicas.includes(hoyString);
  const tieneAyer = fechasUnicas.includes(ayerString);

  if (tieneHoy || tieneAyer) {
    racha = 1;
    for (let i = 0; i < fechasDate.length - 1; i++) {
      if (sonConsecutivas(fechasDate[i], fechasDate[i + 1])) {
        racha++;
      } else {
        break;
      }
    }
  }

  // Calcular la racha máxima histórica
  let maxRacha = 0;
  let rachaTemporal = fechasDate.length > 0 ? 1 : 0;

  for (let i = 0; i < fechasDate.length - 1; i++) {
    if (sonConsecutivas(fechasDate[i], fechasDate[i + 1])) {
      rachaTemporal++;
    } else {
      if (rachaTemporal > maxRacha) maxRacha = rachaTemporal;
      rachaTemporal = 1;
    }
  }
  if (rachaTemporal > maxRacha) maxRacha = rachaTemporal;

  return { racha, maxRacha };
}

/* =========================
   OBTENER HÁBITOS POR USUARIO
   ========================= */
router.get("/usuario/:usuarioId", async (req, res) => {
  try {
    const usuarioIdLimpio = limpiarUsuarioId(req.params.usuarioId);

    if (!validarUsuarioId(usuarioIdLimpio)) {
      return res.status(400).json({ mensaje: "ID de usuario no válido." });
    }

    const habitos = await Habito.find({
      usuario: new mongoose.Types.ObjectId(usuarioIdLimpio)
    }).sort({ createdAt: -1 });

    res.json(habitos);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener hábitos.", error: error.message });
  }
});

/* =========================
   CREAR UN HÁBITO
   ========================= */
router.post("/", async (req, res) => {
  try {
    const { usuarioId, nombre, categoria } = req.body;
    const usuarioIdLimpio = limpiarUsuarioId(usuarioId);

    if (!usuarioIdLimpio || !nombre || !categoria) {
      return res.status(400).json({ mensaje: "Faltan campos obligatorios." });
    }

    if (!validarUsuarioId(usuarioIdLimpio)) {
      return res.status(400).json({ mensaje: "ID de usuario no válido." });
    }

    const nuevoHabito = await Habito.create({
      usuario: new mongoose.Types.ObjectId(usuarioIdLimpio),
      nombre,
      categoria,
      completadoFechas: [],
      racha: 0,
      maxRacha: 0
    });

    res.status(201).json({
      mensaje: "Hábito creado correctamente.",
      habito: nuevoHabito
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear hábito.", error: error.message });
  }
});

/* =========================
   TOGGLE HÁBITO (MARCAR / DESMARCAR FECHA)
   ========================= */
router.put("/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha } = req.body; // Formato "YYYY-MM-DD"

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ mensaje: "ID de hábito no válido." });
    }

    if (!fecha) {
      return res.status(400).json({ mensaje: "Falta la fecha de marcado." });
    }

    const habito = await Habito.findById(id);
    if (!habito) {
      return res.status(404).json({ mensaje: "Hábito no encontrado." });
    }

    // Si ya está marcada la fecha, la quitamos. Si no, la añadimos.
    const indice = habito.completadoFechas.indexOf(fecha);
    if (indice > -1) {
      habito.completadoFechas.splice(indice, 1);
    } else {
      habito.completadoFechas.push(fecha);
    }

    // Recalcular rachas
    const { racha, maxRacha } = calcularRachas(habito.completadoFechas);
    habito.racha = racha;
    habito.maxRacha = Math.max(habito.maxRacha, maxRacha);

    await habito.save();

    res.json({
      mensaje: "Hábito actualizado correctamente.",
      habito
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar hábito.", error: error.message });
  }
});

/* =========================
   ELIMINAR HÁBITO
   ========================= */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ mensaje: "ID de hábito no válido." });
    }

    const habitoEliminado = await Habito.findByIdAndDelete(id);

    if (!habitoEliminado) {
      return res.status(404).json({ mensaje: "No se encontró el hábito." });
    }

    res.json({
      mensaje: "Hábito eliminado correctamente.",
      habito: habitoEliminado
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar el hábito.", error: error.message });
  }
});

module.exports = router;
