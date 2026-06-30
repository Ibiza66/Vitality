const mongoose = require("mongoose");

/* ──────────────────────────────────────────────
   Subesquema: una respuesta del cuestionario
   Guarda la pregunta, la respuesta del usuario,
   y si hubo follow-up de IA, también lo guarda.
────────────────────────────────────────────── */
const respuestaSchema = new mongoose.Schema(
  {
    fase:             { type: String, required: true },   // "identidad" | "objetivos" | "acciones"
    numeroPregunta:   { type: Number, required: true },   // 1 a 15
    pregunta:         { type: String, required: true },   // texto de la pregunta
    respuesta:        { type: String, default: "" },      // lo que escribió el usuario
    tipoInput:        { type: String, default: "texto" }, // "texto" | "opciones" | "slider"
    followupPregunta: { type: String, default: "" },      // pregunta de profundización de la IA
    followupRespuesta:{ type: String, default: "" }       // respuesta del usuario al follow-up
  },
  { _id: false } // No genera _id para cada respuesta (ahorra espacio)
);

const onboardingSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
      unique: true
    },

    /* ── Campos originales (se mantienen para compatibilidad) ── */
    objetivos: { type: [String], default: [] },
    estres:    { type: [String], default: [] },

    /* ── Nuevo: respuestas completas del cuestionario ── */
    respuestas: {
      type: [respuestaSchema],
      default: []
    },

    /* ── Nuevo: ficha clínica generada por IA ──
       Sin maxlength: una ficha real puede tener 2000-4000 caracteres */
    fichaClinica: {
      type: String,
      default: ""
    },

    /* ── Identidad corta (resumen de una línea, sí tiene límite) ── */
    identidad: {
      type: String,
      default: "",
      maxlength: 500  // Ampliado de 240 a 500
    },

    /* ── Estado del cuestionario ── */
    cuestionarioCompletado: {
      type: Boolean,
      default: false
    },

    horarioGenerado: {
      type: Boolean,
      default: false
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
