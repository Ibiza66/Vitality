const express = require("express");
const bcrypt = require("bcryptjs");
const Usuario = require("../models/Usuario");

const router = express.Router();

router.post("/registro", async (req, res) => {
  try {
    const { nombre, correo, password } = req.body;

    if (!nombre || !correo || !password) {
      return res.status(400).json({
        mensaje: "Faltan datos obligatorios."
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

    const passwordHash = await bcrypt.hash(password, 10);

    const usuario = await Usuario.create({
      nombre,
      correo,
      passwordHash
    });

    res.status(201).json({
      mensaje: "Usuario registrado correctamente.",
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo
      }
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al registrar usuario.",
      error: error.message
    });
  }
});

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

    res.json({
      mensaje: "Inicio de sesión exitoso.",
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo
      }
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al iniciar sesión.",
      error: error.message
    });
  }
});

module.exports = router;
