const mongoose = require("mongoose");

const recomendacionIASchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true
    },

    mensajeUsuario: {
      type: String,
      required: true,
      trim: true
    },

    mensajeIA: {
      type: String,
      required: true,
      trim: true
    },

    fase: {
      type: String,
      enum: ["identidad", "objetivos", "acciones", "bienestar", "general"],
      default: "general"
    },

    categoriaBarrera: {
      type: String,
      enum: [
        "BARRERA_INTERNA_EMOCIONAL",
        "BARRERA_INTERNA_COGNITIVA",
        "BARRERA_EXTERNA",
        "DISTRACCION_DIGITAL",
        "SIN_BARRERA_CLARA"
      ],
      default: "SIN_BARRERA_CLARA"
    },

    nivelPrioridad: {
      type: String,
      enum: ["bajo", "medio", "alto"],
      default: "medio"
    },

    accionSugerida: {
      tipo: {
        type: String,
        enum: [
          "crear_objetivo",
          "crear_actividad",
          "crear_alerta",
          "pausa_digital",
          "solo_recomendacion",
          "sin_accion"
        ],
        default: "solo_recomendacion"
      },

      titulo: {
        type: String,
        default: "",
        trim: true
      },

      descripcion: {
        type: String,
        default: "",
        trim: true
      },

      fecha: {
        type: String,
        default: ""
      },

      hora: {
        type: String,
        default: ""
      },

      duracionMinutos: {
        type: Number,
        default: 0
      }
    },

    requiereConfirmacion: {
      type: Boolean,
      default: true
    },

    estado: {
      type: String,
      enum: ["pendiente", "aceptada", "rechazada", "aplicada"],
      default: "pendiente"
    },

    contextoUsado: {
      type: Object,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("RecomendacionIA", recomendacionIASchema);
