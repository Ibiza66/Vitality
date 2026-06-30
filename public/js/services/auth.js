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
export async function registrarUsuarioVitality(event) {
  event.preventDefault();

  const nombre             = document.getElementById("nombre")?.value.trim();
  const correo             = document.getElementById("correo")?.value.trim().toLowerCase();
  const password           = document.getElementById("password")?.value.trim();
  const edad               = document.getElementById("edad")?.value.trim();
  const ocupacion          = document.getElementById("ocupacion")?.value.trim();
  const actividadesFavoritas = document.getElementById("actividadesFavoritas")?.value.trim();

  if (!nombre || !correo || !password || !edad || !ocupacion) {
    mostrarToastVitality("Por favor completa todos los campos obligatorios.");
    return;
  }

  try {
    const respuesta = await fetch(`${API_URL}/api/usuarios/registro`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        nombre, correo, password,
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
    setTimeout(() => { window.location.href = "index.html"; }, 1500);

  } catch (error) {
    console.error("[auth] Error en registro:", error);
    mostrarToastVitality("No se pudo conectar con el servidor.");
  }
}

/* ─────────────────────────────────────────
   LOGIN
   Formulario en: index.html
   IDs: correoLogin, passwordLogin
   
   LÓGICA POST-LOGIN (según flujo de pantallas Vitality):
   - Usuario nuevo (sin cuestionario) → cuestionario.html
   - Usuario existente (con cuestionario) → horario.html
───────────────────────────────────────────*/
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
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ correo, password })
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      mostrarToastVitality(data.mensaje || "Correo o contraseña incorrectos.");
      return;
    }

    limpiarDatosLocalesUsuario();
    guardarJSON("usuarioVitality", data.usuario);
    mostrarToastVitality(`¡Bienvenido, ${data.usuario.nombre}!`);

    /* ── Decidir a dónde redirigir según el estado del cuestionario ──
       Consultamos /api/cuestionario/:id para saber si ya lo completó.
       Si el endpoint devuelve 404, el cuestionario no está completado. */
    const usuarioId = data.usuario._id || data.usuario.id;

    try {
      const checkOnboarding = await fetch(`${API_URL}/api/cuestionario/${usuarioId}`);

      if (checkOnboarding.ok) {
        /* Ya completó el cuestionario → ir al horario */
        window.location.href = "horario.html";
      } else {
        /* Primer uso o cuestionario incompleto → ir al cuestionario */
        window.location.href = "cuestionario.html";
      }
    } catch {
      /* Si el servidor no responde al check, asumimos que va al horario */
      window.location.href = "horario.html";
    }

  } catch (error) {
    console.error("[auth] Error en login:", error);
    mostrarToastVitality("Error de red. No se pudo conectar al servidor.");
  }
}
