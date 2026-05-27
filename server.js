const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const usuariosRoutes = require("./routes/usuarios");
const perfilesRoutes = require("./routes/perfiles");
const checkinsRoutes = require("./routes/checkins");
const actividadesRoutes = require("./routes/actividades");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/usuarios", usuariosRoutes);
app.use("/api/perfiles", perfilesRoutes);
app.use("/api/checkins", checkinsRoutes);
app.use("/api/actividades", actividadesRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/estado", (req, res) => {
  res.json({
    mensaje: "Backend de Vitality funcionando correctamente"
  });
});

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Conectado a MongoDB");

    app.listen(PORT, () => {
      console.log("Servidor Vitality funcionando en http://localhost:" + PORT);
    });
  })
  .catch((error) => {
    console.error("Error al conectar con MongoDB:", error.message);
  });
