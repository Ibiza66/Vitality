const mongoose = require("mongoose");

const usoAppSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true
    },

    nombreApp: {
      type: String,
      required: true,
      trim: true
    },

    packageName: {
      type: String,
      default: "",
      trim: true
    },

    limiteMinutos: {
      type: Number,
      required: true,
      min: 1
    },

    minutosUsados: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("UsoApp", usoAppSchema);
