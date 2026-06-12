const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const usuariosRoutes = require("./routes/usuarios");
const onboardingRoutes = require("./routes/onboarding");
const perfilesRoutes = require("./routes/perfiles");
const checkinsRoutes = require("./routes/checkins");
const actividadesRoutes = require("./routes/actividades");
const objetivosRoutes = require("./routes/objetivos");
const iaRoutes = require("./routes/ia");
const usoAppsRoutes = require("./routes/usoApps");
const recomendacionesIARoutes = require("./routes/recomendacionesIA");
const chatHistorialRoutes = require("./routes/chatHistorial");
const configuracionRoutes = require("./routes/configuracion");


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/usuarios", usuariosRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/perfiles", perfilesRoutes);
app.use("/api/checkins", checkinsRoutes);
app.use("/api/actividades", actividadesRoutes);
app.use("/api/objetivos", objetivosRoutes);
app.use("/api/ia", iaRoutes);
app.use("/api/uso-apps", usoAppsRoutes);
app.use("/api/recomendaciones-ia", recomendacionesIARoutes);
app.use("/api/chat-historial", chatHistorialRoutes);
app.use("/api/configuracion", configuracionRoutes);

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

    app.listen(PORT, "0.0.0.0", () => {
  console.log("Servidor Vitality funcionando en http://localhost:" + PORT);
  console.log("Servidor accesible desde la red en el puerto " + PORT);
});
  })
  .catch((error) => {
    console.error("Error al conectar con MongoDB:", error.message);
  });
