const mongoose = require("mongoose");

const perfilSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
      unique: true
    },
    categoria: {
      type: String,
      required: true,
      enum: ["Niño", "Adolescente", "Adulto"]
    },
    actividades: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Perfil", perfilSchema);
