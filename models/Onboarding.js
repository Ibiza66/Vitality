const mongoose = require("mongoose");

const onboardingSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
      unique: true
    },

    objetivos: {
      type: [String],
      default: []
    },

    identidad: {
      type: String,
      default: "",
      maxlength: 240
    },

    estres: {
      type: [String],
      default: []
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

module.exports = mongoose.model("Onboarding", onboardingSchema);