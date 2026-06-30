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
      default: "" 
    },
    actividad: {
      type: String,
      required: true
    },
    completada: {
      type: Boolean,
      default: false
    },
    /* ── Campos nuevos para actividades generadas por IA ──
       Son opcionales, así que el código existente no se rompe */
       
    descripcion: {
      type: String,
      default: ""
    },
    
    duracion: {
      type: Number, // En minutos
      default: 30
    },
    origen: {
      type: String,
      default: ""
    },

  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Actividad", actividadSchema);
