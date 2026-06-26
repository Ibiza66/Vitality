const mongoose = require("mongoose");

const checkinSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true
    },
    estadoAnimo: {
      type: String,
      required: true
    },
    nivelEstres: {
      type: String,
      required: true
    },
    sueno: {
      type: String,
      required: true
    },
    energia: {
      type: String,
      required: true
    },
    estresVal: {
      type: Number,
      default: 5
    },
    suenoVal: {
      type: Number,
      default: 5
    },
    energiaVal: {
      type: Number,
      default: 5
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

module.exports = mongoose.model("Checkin", checkinSchema);
