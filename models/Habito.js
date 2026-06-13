const mongoose = require("mongoose");

const habitoSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true
    },
    nombre: {
      type: String,
      required: true
    },
    categoria: {
      type: String,
      required: true // "Salud", "Mente", "Rutina", "Deporte"
    },
    completadoFechas: {
      type: [String], // Formato ["2026-06-12", "2026-06-11"]
      default: []
    },
    racha: {
      type: Number,
      default: 0
    },
    maxRacha: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Habito", habitoSchema);
