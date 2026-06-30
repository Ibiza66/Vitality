
// Para index.html y registro.html

//  Lógica de login, creación de cuenta, alternar visibilidad de contraseñas


// js/views/auth.js
import { apiService } from '../services/apiService.js';
import { storage } from '../core/utils.js';

document.addEventListener("DOMContentLoaded", () => {
  // === 1. CONTROL DE FORMULARIO DE LOGIN (index.html) ===
  const loginForm = document.getElementById("welcomeLoginCard");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Buscamos dinámicamente el input de email dentro del contenedor de login
      const correoInput = loginForm.querySelector('input[type="email"]') || document.getElementById("correoLogin");
      const passwordInput = document.getElementById("passwordLogin");

      if (!correoInput || !passwordInput) return;

      const correo = correoInput.value.trim();
      const password = passwordInput.value;

      try {
        const respuesta = await apiService.login(correo, password);
        
        if (respuesta && respuesta.usuario) {
          // Guardamos los datos estandarizados en localStorage usando utils.js
          storage.setUsuario(respuesta.usuario);
          // Redirección al Home
          window.location.href = "horario.html";
        }
      } catch (error) {
        alert(error.message || "Error al iniciar sesión. Verifica tus credenciales.");
      }
    });
  }

  // === 2. CONTROL DE FORMULARIO DE REGISTRO (registro.html) ===
  const registroForm = document.getElementById("registroForm");
  if (registroForm) {
    registroForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nombre = document.getElementById("nombre")?.value.trim();
      const correo = document.getElementById("correo")?.value.trim();
      // Buscamos por ID o por tipo en caso de variaciones menores en el HTML
      const passwordInput = document.getElementById("password") || registroForm.querySelector('input[type="password"]');
      const password = passwordInput?.value;
      const ocupacion = document.getElementById("ocupacion")?.value;
      const ocupacionDetalle = document.getElementById("ocupacionDetalle")?.value.trim();

      if (!nombre || !correo || !password) {
        alert("Por favor, completa los campos obligatorios.");
        return;
      }

      const datosRegistro = {
        nombre,
        correo,
        password,
        ocupacion,
        ocupacionDetalle: (ocupacion === "Otra" || ocupacion === "Trabajador") ? ocupacionDetalle : ""
      };

      try {
        const respuesta = await apiService.registro(datosRegistro);
        
        if (respuesta && respuesta.usuario) {
          storage.setUsuario(respuesta.usuario);
          // Al ser una cuenta nueva, lo enviamos directo al Onboarding/Guía de identidad
          window.location.href = "onboarding.html";
        }
      } catch (error) {
        alert(error.message || "No se pudo crear la cuenta. Intenta con otro correo.");
      }
    });
  }
});

// === 3. ACCIONES GLOBALES EXPORTADAS AL WINDOW (Compatibilidad HTML) ===

/**
 * Permite probar las vistas de la aplicación localmente sin interactuar con la Base de Datos.
 * Setea un perfil ficticio bajo la propiedad uniforme del sistema.
 */


//linea 8375
export function probarComoInvitado() {
  const usuarioInvitado = {
    _id: "invitado_vitality_pro",
    nombre: "Estudiante Invitado",
    correo: "invitado@vitality.cl",
    ocupacion: "Estudiante universitario",
    isGuest: true
  };
  
  storage.setUsuario(usuarioInvitado);
  window.location.href = "horario.html";
}

/**
 * Controla dinámicamente la visibilidad del campo "Detalle" en el formulario de registro.
 */
export function actualizarCampoDetalleOcupacion() {
  const ocupacionSelect = document.getElementById("ocupacion");
  const detalleGroup = document.getElementById("ocupacionDetalleGroup");
  const detalleLabel = document.getElementById("ocupacionDetalleLabel");

  if (!ocupacionSelect || !detalleGroup) return;

  const valor = ocupacionSelect.value;
  if (valor === "Otra" || valor === "Trabajador") {
    detalleGroup.style.display = "block";
    if (detalleLabel) {
      detalleLabel.textContent = valor === "Trabajador" ? "¿En qué trabajas?" : "Detalle de tu ocupación";
    }
  } else {
    detalleGroup.style.display = "none";
  }
}

// Inyección explícita en el entorno global de la ventana del navegador
window.probarComoInvitado = probarComoInvitado;
window.actualizarCampoDetalleOcupacion = actualizarCampoDetalleOcupacion;


