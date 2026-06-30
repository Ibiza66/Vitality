const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true
    },

    correo: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    passwordHash: {
      type: String,
      required: true
    },

    edad: {
      type: Number,
      required: true,
      min: 1,
      max: 120
    },

    categoria: {
      type: String,
      enum: ["Niño", "Adolescente", "Adulto"],
      required: true
    },

    ocupacion: {
      type: String,
      enum: [
        "Trabajador",
        "Estudiante universitario",
        "Estudiante escolar",
        "Otra"
      ],
      required: true
    },

    actividadesFavoritas: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Usuario", usuarioSchema);