/* =========================================================================
   SERVICIO: AUTENTICACIÓN, REGISTRO Y CIERRE DE SESIÓN
   =========================================================================
   Maneja toda la comunicación con /api/usuarios en el backend.
   Los IDs de los inputs deben coincidir exactamente con los del HTML.
   ========================================================================= */

import { API_URL } from '../config.js';
import { mostrarToastVitality, guardarJSON, limpiarDatosLocalesUsuario } from '../utils.js';

/* ─────────────────────────────────────────
   REGISTRO
   Formulario en: registro.html
   IDs: nombre, correo, password, edad, ocupacion, actividadesFavoritas
───────────────────────────────────────────*/

/**
 * Registra un nuevo usuario en MongoDB.
 * Se conecta al formulario con id="registroForm".
 * @param {Event} event - Evento submit del formulario.
 */
export async function registrarUsuarioVitality(event) {
  event.preventDefault();

  // Leer cada campo del formulario por su ID real en registro.html
  const nombre            = document.getElementById("nombre")?.value.trim();
  const correo            = document.getElementById("correo")?.value.trim().toLowerCase();
  const password          = document.getElementById("password")?.value.trim();
  const edad              = document.getElementById("edad")?.value.trim();
  const ocupacion         = document.getElementById("ocupacion")?.value.trim();
  const actividadesFavoritas = document.getElementById("actividadesFavoritas")?.value.trim();

  // Validar campos obligatorios
  if (!nombre || !correo || !password || !edad || !ocupacion) {
    mostrarToastVitality("Por favor completa todos los campos obligatorios.");
    return;
  }

  try {
    const respuesta = await fetch(`${API_URL}/api/usuarios/registro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        correo,
        password,
        edad: Number(edad),
        ocupacion,
        actividadesFavoritas: actividadesFavoritas || ""
      })
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      mostrarToastVitality(data.mensaje || "Error al crear la cuenta.");
      return;
    }

    mostrarToastVitality("¡Cuenta creada! Ya puedes iniciar sesión.");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);

  } catch (error) {
    console.error("[auth] Error en registro:", error);
    mostrarToastVitality("No se pudo conectar con el servidor.");
  }
}

/* ─────────────────────────────────────────
   LOGIN
   Formulario en: index.html
   IDs: correoLogin, passwordLogin
───────────────────────────────────────────*/

/**
 * Inicia sesión con correo y contraseña.
 * Se conecta al formulario con id="loginForm".
 * @param {Event} event - Evento submit del formulario.
 */
export async function iniciarSesionVitality(event) {
  event.preventDefault();

  const correo   = document.getElementById("correoLogin")?.value.trim().toLowerCase();
  const password = document.getElementById("passwordLogin")?.value.trim();

  if (!correo || !password) {
    mostrarToastVitality("Por favor ingresa tu correo y contraseña.");
    return;
  }

  try {
    const respuesta = await fetch(`${API_URL}/api/usuarios/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, password })
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      mostrarToastVitality(data.mensaje || "Correo o contraseña incorrectos.");
      return;
    }

    // Limpiar datos de sesión anterior y guardar la nueva
    limpiarDatosLocalesUsuario();
    guardarJSON("usuarioVitality", data.usuario);

    mostrarToastVitality(`¡Bienvenido, ${data.usuario.nombre}!`);

    window.location.href = "horario.html";

  } catch (error) {
    console.error("[auth] Error en login:", error);
    mostrarToastVitality("Error de red. No se pudo conectar al servidor.");
  }
}