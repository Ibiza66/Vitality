// js/core/config.js: Centraliza variables globales de entorno.

// Detecta si la aplicación está corriendo de manera nativa (Capacitor)
const IS_CAPACITOR = window.Capacitor && window.Capacitor.Plugins;

// IP local de desarrollo para pruebas en dispositivo móvil (cambiar según tu red)
const DEV_LOCAL_IP = "192.168.1.100"; 

/**
 * URL Base de la API unificada.
 * Si está en celular apunta a la IP local, si está en web usa rutas relativas 
 * aprovechando que server.js sirve la carpeta public de forma estática.
 */
export const API_URL = IS_CAPACITOR 
  ? `http://${DEV_LOCAL_IP}:3000/api` 
  : `${window.location.origin}/api`;