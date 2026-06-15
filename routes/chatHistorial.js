const express = require("express");
const router = express.Router();

const ChatMensaje = require("../models/ChatMensaje");

/* =========================
   GUARDAR MENSAJE DEL CHAT
========================= */
router.post("/", async (req, res) => {
  try {
    const { usuarioId, sender, texto, recomendacionId, recomendacion } = req.body;

    if (!usuarioId || !sender || !texto) {
      return res.status(400).json({
        mensaje: "Faltan datos para guardar el mensaje."
      });
    }

    if (!["user", "bot"].includes(sender)) {
      return res.status(400).json({
        mensaje: "Tipo de emisor inválido."
      });
    }

    const mensajeChat = await ChatMensaje.create({
      usuario: usuarioId,
      sender,
      texto,
      recomendacionId: recomendacionId || null,
      recomendacion: recomendacion || null
    });

    return res.status(201).json({
      mensaje: "Mensaje guardado correctamente.",
      chatMensaje: mensajeChat
    });
  } catch (error) {
    console.error("Error al guardar mensaje del chat:", error);

    return res.status(500).json({
      mensaje: "Error al guardar mensaje del chat.",
      error: error.message
    });
  }
});

/* =========================
   OBTENER HISTORIAL DEL CHAT
========================= */
router.get("/:usuarioId", async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const mensajes = await ChatMensaje.find({
      usuario: usuarioId
    })
      .sort({ createdAt: 1 })
      .limit(80);

    return res.json(mensajes);
  } catch (error) {
    console.error("Error al obtener historial del chat:", error);

    return res.status(500).json({
      mensaje: "Error al obtener historial del chat.",
      error: error.message
    });
  }
});

/* =========================
   BORRAR HISTORIAL DEL CHAT
========================= */
router.delete("/:usuarioId", async (req, res) => {
  try {
    const { usuarioId } = req.params;

    await ChatMensaje.deleteMany({
      usuario: usuarioId
    });

    return res.json({
      mensaje: "Historial del chat eliminado correctamente."
    });
  } catch (error) {
    console.error("Error al borrar historial del chat:", error);

    return res.status(500).json({
      mensaje: "Error al borrar historial del chat.",
      error: error.message
    });
  }
});

module.exports = router;