const mongoose = require("mongoose");

const actividadSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true
    },
    tipoActividad: {
      type: String,
      required: true,
      enum: ["fija", "especial"]
    },
    dia: {
      type: String,
      default: ""
    },
    fecha: {
      type: String,
      default: ""
    },
    tipoEspecial: {
      type: String,
      default: ""
    },
    hora: {
      type: String,
      required: true
    },
    horaFin: {
      type: String,
      required: true
    },
    actividad: {
      type: String,
      required: true
    },
    completada: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Actividad", actividadSchema);
