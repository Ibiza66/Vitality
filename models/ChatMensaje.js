const mongoose = require("mongoose");

const chatMensajeSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
      index: true
    },

    sender: {
      type: String,
      enum: ["user", "bot"],
      required: true
    },

    texto: {
      type: String,
      required: true,
      trim: true
    },

    recomendacionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecomendacionIA",
      default: null
    },

    recomendacion: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("ChatMensaje", chatMensajeSchema);