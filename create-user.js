const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Usuario = require("./models/Usuario");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/vitality";

async function run() {
  try {
    console.log("Conectando a MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Conectado con éxito.");

    const correoTest = "test@vitality.com";
    const passwordTest = "123456";

    let usuario = await Usuario.findOne({ correo: correoTest });

    if (usuario) {
      console.log(`\n[!] El usuario '${correoTest}' ya existe en la base de datos.`);
    } else {
      console.log(`\nCreando usuario de prueba '${correoTest}'...`);
      const passwordHash = await bcrypt.hash(passwordTest, 10);
      
      usuario = await Usuario.create({
        nombre: "Martín",
        correo: correoTest,
        passwordHash: passwordHash,
        edad: 21,
        categoria: "Adulto",
        ocupacion: "Estudiante universitario",
        actividadesFavoritas: "Programar, Deporte"
      });
      console.log("Usuario creado con éxito.");
    }

    console.log("\n==================================================");
    console.log("CREDENCIALES DE INICIO DE SESIÓN:");
    console.log(`- Correo:    ${correoTest}`);
    console.log(`- Contraseña: ${passwordTest}`);
    console.log("==================================================\n");

  } catch (error) {
    console.error("Error al ejecutar el script:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Conexión a MongoDB cerrada.");
  }
}

run();
