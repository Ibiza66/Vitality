const mongoose = require("mongoose");

const objetivoSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true
    },

    titulo: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    descripcion: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300
    },

    fecha: {
      type: String,
      required: true,
      trim: true,
      match: /^\d{4}-\d{2}-\d{2}$/
    },

    completado: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Objetivo", objetivoSchema);