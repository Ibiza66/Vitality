const express = require("express");
const bcrypt = require("bcryptjs");
const Usuario = require("../models/Usuario");

const router = express.Router();

/* =========================
   CALCULAR CATEGORÍA POR EDAD
========================= */
function calcularCategoriaPorEdad(edad) {
  const edadNumero = Number(edad);

  if (edadNumero <= 12) {
    return "Niño";
  }

  if (edadNumero <= 17) {
    return "Adolescente";
  }

  return "Adulto";
}

/* =========================
   REGISTRO DE USUARIO
========================= */
router.post("/registro", async (req, res) => {
  try {
    const {
      nombre,
      correo,
      password,
      edad,
      ocupacion,
      actividadesFavoritas
    } = req.body;

    if (!nombre || !correo || !password || !edad || !ocupacion) {
      return res.status(400).json({
        mensaje: "Faltan datos obligatorios."
      });
    }

    const edadNumero = Number(edad);

    if (Number.isNaN(edadNumero) || edadNumero < 1 || edadNumero > 120) {
      return res.status(400).json({
        mensaje: "La edad ingresada no es válida."
      });
    }

    const ocupacionesValidas = [
      "Trabajador",
      "Estudiante universitario",
      "Estudiante escolar",
      "Otra"
    ];

    if (!ocupacionesValidas.includes(ocupacion)) {
      return res.status(400).json({
        mensaje: "La ocupación ingresada no es válida."
      });
    }

    const usuarioExiste = await Usuario.findOne({
      correo: correo.toLowerCase()
    });

    if (usuarioExiste) {
      return res.status(409).json({
        mensaje: "Ya existe un usuario con ese correo."
      });
    }

    const categoria = calcularCategoriaPorEdad(edadNumero);
    const passwordHash = await bcrypt.hash(password, 10);

    const usuario = await Usuario.create({
      nombre,
      correo,
      passwordHash,
      edad: edadNumero,
      categoria,
      ocupacion,
      actividadesFavoritas: actividadesFavoritas || ""
    });

    return res.status(201).json({
      mensaje: "Usuario registrado correctamente.",
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        edad: usuario.edad,
        categoria: usuario.categoria,
        ocupacion: usuario.ocupacion,
        actividadesFavoritas: usuario.actividadesFavoritas
      }
    });
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al registrar usuario.",
      error: error.message
    });
  }
});

/* =========================
   LOGIN DE USUARIO
========================= */
router.post("/login", async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({
        mensaje: "Correo y contraseña son obligatorios."
      });
    }

    const usuario = await Usuario.findOne({
      correo: correo.toLowerCase()
    });

    if (!usuario) {
      return res.status(401).json({
        mensaje: "Correo o contraseña incorrectos."
      });
    }

    const passwordValida = await bcrypt.compare(password, usuario.passwordHash);

    if (!passwordValida) {
      return res.status(401).json({
        mensaje: "Correo o contraseña incorrectos."
      });
    }

    return res.json({
      mensaje: "Inicio de sesión exitoso.",
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        edad: usuario.edad || null,
        categoria: usuario.categoria || "Sin categoría",
        ocupacion: usuario.ocupacion || "Sin ocupación",
        actividadesFavoritas: usuario.actividadesFavoritas || ""
      }
    });
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al iniciar sesión.",
      error: error.message
    });
  }
});

module.exports = router;