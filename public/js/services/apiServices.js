// js/services/apiService.js

// Cliente HTTP exclusivo para interactuar con los endpoints de server.js.

// Contenido: Funciones asíncronas puras (fetch) para registrar usuarios, guardar check-ins, alertar al backend o consultar el historial de uso de aplicaciones. Ninguna función de este archivo interactúa con el DOM.

import { API_URL } from '../core/config.js';
import { storage } from '../core/utils.js';

/**
 * Helper interno para encapsular la lógica fetch repetitiva y capturar excepciones del backend.
 */
async function realizarPeticion(endpoint, opciones = {}) {
  const url = `${API_URL}${endpoint}`;
  
  opciones.headers = {
    "Content-Type": "application/json",
    ...opciones.headers
  };

  try {
    const respuesta = await fetch(url, opciones);
    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || `Error de red código: ${respuesta.status}`);
    }
    return resultado;
  } catch (error) {
    console.error(`[Error de API en ${endpoint}]:`, error.message);
    throw error; // Re-lanzamos el error para que la interfaz/vista lo maneje o muestre alertas
  }
}

/**
 * Cliente HTTP unificado para interactuar con las rutas mapeadas en server.js
 */
export const apiService = {
  
  // --- AUTENTICACIÓN (/api/usuarios) ---
  async login(correo, password) {
    return realizarPeticion("/usuarios/login", {
      method: "POST",
      body: JSON.stringify({ correo, password })
    });
  },

  async registro(datosRegistro) {
    return realizarPeticion("/usuarios/registro", {
      method: "POST",
      body: JSON.stringify(datosRegistro)
    });
  },

  // --- CUESTIONARIO Y ONBOARDING (/api/onboarding) ---
  async guardarOnboarding(respuestas) {
    const usuarioId = storage.obtenerIdUsuario();
    return realizarPeticion("/onboarding", {
      method: "POST",
      body: JSON.stringify({ usuarioId, respuestas })
    });
  },

  // --- REGISTROS DE ÁNIMO (/api/checkins) ---
  async guardarCheckin(datosCheckin) {
    const usuarioId = storage.obtenerIdUsuario();
    return realizarPeticion("/checkins", {
      method: "POST",
      body: JSON.stringify({ usuarioId, ...datosCheckin })
    });
  },

  async obtenerHistorialCheckins() {
    const usuarioId = storage.obtenerIdUsuario();
    return realizarPeticion(`/checkins/usuario/${usuarioId}`);
  },

  // --- CRONOGRAMAS Y AGENDAS (/api/actividades) ---
  async obtenerActividadesHoy() {
    const usuarioId = storage.obtenerIdUsuario();
    return realizarPeticion(`/actividades/hoy/${usuarioId}`);
  },

  async agregarActividadFija(actividad) {
    const usuarioId = storage.obtenerIdUsuario();
    return realizarPeticion("/actividades", {
      method: "POST",
      body: JSON.stringify({ usuarioId, ...actividad })
    });
  },

  // --- LÍMITES DIGITALES (/api/uso-apps) ---
  async guardarLimiteApp(datosApp) {
    const usuarioId = storage.obtenerIdUsuario();
    return realizarPeticion("/uso-apps", {
      method: "POST",
      body: JSON.stringify({ usuarioId, ...datosApp })
    });
  },

  async obtenerAppsMonitoreadas() {
    const usuarioId = storage.obtenerIdUsuario();
    return realizarPeticion(`/uso-apps/usuario/${usuarioId}`);
  },

  // --- RECOMENDACIONES IA (/api/recomendaciones-ia) ---
  async obtenerUltimaRecomendacionIA() {
    const usuarioId = storage.obtenerIdUsuario();
    return realizarPeticion(`/recomendaciones-ia/ultimo/${usuarioId}`);
  },


// --- CHAT DE APOYO CON IA (/api/ia y /api/chat-historial) ---
  async enviarMensajeChat(mensaje) {
    const usuarioId = storage.obtenerIdUsuario();
    return realizarPeticion("/ia/chat", {
      method: "POST",
      body: JSON.stringify({ usuarioId, mensaje })
    });
  },

  async obtenerHistorialChat() {
    const usuarioId = storage.obtenerIdUsuario();
    return realizarPeticion(`/chat-historial/usuario/${usuarioId}`);
  },

  // --- BITÁCORA Y REFLEXIONES (/api/reflexiones) ---
  async guardarReflexion(textoReflexion) {
    const usuarioId = storage.obtenerIdUsuario();
    return realizarPeticion("/reflexiones", {
      method: "POST",
      body: JSON.stringify({ usuarioId, texto: textoReflexion })
    });
  },


};