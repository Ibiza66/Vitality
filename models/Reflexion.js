const mongoose = require("mongoose");

const reflexionSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true
    },
    tipo: {
      type: String,
      required: true // "mañana", "tarde", "gratitud"
    },
    pregunta: {
      type: String,
      required: true
    },
    texto: {
      type: String,
      required: true
    },
    animo: {
      type: String,
      required: true // "Excelente", "Bien", "Normal", "Ansioso", "Agotado"
    },
    fecha: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Reflexion", reflexionSchema);
