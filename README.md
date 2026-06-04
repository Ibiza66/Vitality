# Vitality

Vitality es una aplicación orientada al bienestar emocional, la organización personal y el apoyo preventivo. Permite a los usuarios registrar su estado diario, organizar actividades, recibir recomendaciones, conversar con un chat de apoyo y monitorear el uso de aplicaciones móviles.

El proyecto fue desarrollado como parte de un trabajo académico de Ingeniería de Software. Actualmente funciona como aplicación web y también como APK Android mediante Capacitor.

## Descripción del proyecto

Vitality busca apoyar a los usuarios en su bienestar emocional y organización diaria mediante herramientas simples, preventivas y fáciles de usar.

La aplicación permite que una persona pueda:

* Crear una cuenta.
* Iniciar sesión.
* Mantener sesión iniciada aunque cierre la app.
* Registrar edad, ocupación y actividades favoritas.
* Calcular automáticamente la categoría del usuario según su edad.
* Visualizar iniciales del usuario en el perfil y navbar.
* Realizar un check-in emocional diario.
* Recibir alertas y recomendaciones según su estado emocional.
* Organizar actividades fijas y especiales.
* Visualizar actividades del día.
* Visualizar un horario semanal.
* Marcar actividades como completadas.
* Editar o eliminar actividades.
* Enviar actividades al calendario del celular.
* Conversar con un chat de apoyo.
* Recibir respuestas mediante IA o respuesta local de respaldo.
* Recibir notificaciones nativas del celular.
* Monitorear el uso real de aplicaciones en Android.
* Recibir alerta si una app supera el límite diario configurado.
* Cambiar entre modo claro y oscuro.

## Funcionalidades implementadas

### Usuario

* Registro de usuario.
* Inicio de sesión.
* Persistencia de sesión usando `localStorage`.
* Redirección automática al horario si el usuario ya inició sesión.
* Cierre de sesión manual.
* Guardado de usuarios en MongoDB.
* Contraseñas protegidas mediante hash con `bcryptjs`.
* Registro extendido con:

  * Nombre completo.
  * Correo electrónico.
  * Contraseña.
  * Edad.
  * Ocupación.
  * Actividades favoritas.
* Categoría automática según edad:

  * Niño.
  * Adolescente.
  * Adulto.
* Visualización de iniciales del usuario en la interfaz.

### Perfil

* Visualización del nombre del usuario.
* Visualización de iniciales en el avatar del perfil.
* Visualización de categoría del usuario.
* Visualización de actividades favoritas.
* Visualización de edad y ocupación.
* Edición de información de perfil.
* Guardado del perfil en MongoDB.
* Visualización del resumen emocional.
* Visualización del último check-in.
* Visualización del nivel estimado de bienestar.
* Visualización de recomendaciones personalizadas.
* Visualización de próximas actividades.
* Historial de check-ins.
* Estadísticas emocionales.
* Tendencia emocional.
* Racha de check-ins.
* Objetivos personales.

### Check-in emocional

* Registro de estado emocional.
* Registro de nivel de estrés.
* Registro de calidad del sueño.
* Registro de nivel de energía.
* Guardado del check-in en MongoDB.
* Recuperación del último check-in registrado.
* Historial de check-ins.
* Eliminación de check-ins desde el historial.
* Protección de flujo para solicitar check-in diario cuando corresponde.

### Alertas y recomendaciones

* Alertas según nivel de estrés.
* Recomendaciones según energía baja.
* Recomendaciones según mal descanso.
* Recomendaciones según estado emocional negativo.
* Alertas preventivas basadas en actividades pendientes.
* Notificaciones nativas en Android mediante Capacitor.
* Ícono personalizado para notificaciones de Vitality.
* Recomendaciones visualizadas dentro de la pantalla de alertas.
* Envío de alertas como notificación del celular.

### Horario y actividades

* Gestión de actividades fijas.
* Gestión de actividades especiales.
* Guardado de actividades en MongoDB.
* Edición de actividades.
* Eliminación de actividades.
* Marcado de actividades como completadas.
* Visualización de actividades de hoy.
* Visualización de eventos especiales del día.
* Tabla de horario semanal dinámica.
* Horas generadas según las actividades registradas.
* Pantalla mobile para organizar horario.
* Separación entre actividad fija y actividad especial mediante pestañas.
* Integración con calendario del celular para crear eventos.

### Calendario del celular

* Integración con calendario nativo mediante Capacitor.
* Botón para agregar actividad fija al calendario.
* Botón para agregar actividad especial al calendario.
* Solicitud de permisos de calendario en Android.
* Creación de eventos con título, fecha, hora de inicio y hora de término.

### Chat de apoyo

* Chat de apoyo con diseño mobile.
* Opciones rápidas para:

  * Conversar.
  * Organizar el día.
  * Recibir una recomendación.
* Respuestas relacionadas con:

  * Estrés.
  * Energía.
  * Sueño.
  * Estado emocional.
  * Actividades pendientes.
* Integración con IA mediante backend.
* Respuesta local de respaldo si la IA no está disponible.
* Contexto basado en check-in, actividades y objetivos personales.

### Control de uso de apps

* Pantalla de bienestar digital.
* Registro de apps monitoreadas.
* Configuración de límite diario por app.
* Lectura real del uso de aplicaciones en Android.
* Uso de `UsageStatsManager` mediante plugin de Capacitor.
* Permiso especial de Android para acceso a uso de apps.
* Alerta cuando una app supera el límite configurado.
* Notificación nativa del celular cuando se detecta uso excesivo.
* Apps predefinidas:

  * TikTok.
  * Instagram.
  * YouTube.
  * WhatsApp.
* Opción para ingresar manualmente un package de otra app.

### Interfaz

* Diseño mobile tipo app.
* Diseño responsive.
* Pantallas rediseñadas:

  * Login.
  * Registro.
  * Check-in.
  * Horario.
  * Perfil.
  * Chat.
  * Uso de apps.
  * Alertas.
  * Organizar horario.
* Navbar mobile.
* Barra inferior de navegación.
* Menú hamburguesa.
* Menú de perfil.
* Modo claro y oscuro.
* Tarjetas visuales para organizar la información.
* Toasts internos para mensajes de confirmación.
* Reducción de alertas nativas del navegador.

## Tecnologías utilizadas

### Frontend

* HTML5.
* CSS3.
* JavaScript.

### Backend

* Node.js.
* Express.
* CORS.
* Dotenv.
* OpenAI API para el chat inteligente.
* Respuesta local de respaldo para el chat.

### Base de datos

* MongoDB.
* Mongoose.
* MongoDB Compass.

### Aplicación móvil

* Capacitor.
* Android Studio.
* APK Android.
* Plugins de Capacitor:

  * Local Notifications.
  * Calendar.
  * Android Usage Stats Manager.

### Seguridad básica

* `bcryptjs` para hash de contraseñas.
* Variables de entorno con archivo `.env`.
* Uso de `.gitignore` para evitar subir archivos sensibles.
* Validación básica de datos en backend.
* Contraseñas no guardadas en texto plano.

## Estructura del proyecto

```bash
Vitality/
│
├── android/
│   └── app/
│       └── src/
│           └── main/
│               ├── AndroidManifest.xml
│               └── res/
│                   └── drawable/
│                       └── ic_stat_vitality.xml
│
├── assets/
│   └── logo.jpg
│
├── models/
│   ├── Usuario.js
│   ├── Perfil.js
│   ├── Checkin.js
│   ├── Actividad.js
│   ├── Objetivo.js
│   └── UsoApp.js
│
├── routes/
│   ├── usuarios.js
│   ├── perfiles.js
│   ├── checkins.js
│   ├── actividades.js
│   ├── objetivos.js
│   ├── usoApps.js
│   └── ia.js
│
├── public/
│   ├── index.html
│   ├── registro.html
│   ├── perfil.html
│   ├── checkin.html
│   ├── horario.html
│   ├── organizar_horario.html
│   ├── alertas.html
│   ├── chat.html
│   ├── uso_apps.html
│   ├── styles.css
│   ├── script.js
│   ├── nav.js
│   └── logo.jpg
│
├── capacitor.config.json
├── package.json
├── package-lock.json
├── server.js
├── .env
├── .gitignore
└── README.md
```

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/Ibiza66/Vitality.git
cd Vitality
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Crear archivo `.env`

Crear un archivo `.env` en la raíz del proyecto con las variables necesarias:

```env
PORT=3000
MONGODB_URI=tu_uri_de_mongodb
OPENAI_API_KEY=tu_api_key_opcional
OPENAI_MODEL=gpt-5.2
```

La API key de OpenAI es opcional para el funcionamiento básico. Si no está configurada, el chat usa respuestas locales de respaldo.

### 4. Ejecutar el backend

```bash
npm run dev
```

El servidor debería ejecutarse en:

```bash
http://localhost:3000
```

### 5. Verificar backend

```bash
http://localhost:3000/api/estado
```

Debe responder que el backend de Vitality está funcionando correctamente.

## Ejecución como APK Android

### 1. Sincronizar Capacitor

```bash
npx cap sync android
```

### 2. Abrir Android Studio

```bash
npx cap open android
```

### 3. Ejecutar en emulador o celular

Desde Android Studio, seleccionar el dispositivo y presionar Run.

## Configuración de IP para pruebas en celular físico

Si se prueba la APK en un celular físico conectado a la misma red WiFi que el computador, se debe usar la IP local del PC en `public/script.js`.

Para obtener la IP:

```powershell
ipconfig
```

Buscar:

```bash
Adaptador de LAN inalámbrica Wi-Fi
Dirección IPv4
```

Ejemplo:

```javascript
const API_URL = "http://10.41.0.140:3000";
```

Si se usa emulador Android, normalmente se puede usar:

```javascript
const API_URL = "http://10.0.2.2:3000";
```

## Permisos Android utilizados

Vitality utiliza permisos para:

* Acceso a internet.
* Notificaciones.
* Calendario.
* Lectura de uso real de aplicaciones.

Permisos principales configurados en `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.READ_CALENDAR" />
<uses-permission android:name="android.permission.WRITE_CALENDAR" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.PACKAGE_USAGE_STATS" />
<uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />
```

## Uso real de apps en Android

Para que Vitality pueda leer el uso real de aplicaciones, Android exige activar manualmente el permiso de acceso a uso.

Flujo esperado:

1. Abrir Vitality.
2. Entrar a Uso de apps.
3. Presionar Activar permiso de uso de apps.
4. Ir a Ajustes de Android.
5. Buscar Vitality en Acceso a uso.
6. Activar el permiso.
7. Volver a Vitality.
8. Configurar una app y un límite diario.
9. Guardar monitoreo.
10. Si se supera el límite, se envía una notificación.

## Flujo principal de uso

1. Crear cuenta.
2. Iniciar sesión.
3. Completar check-in diario.
4. Revisar horario.
5. Agregar actividades fijas o especiales.
6. Revisar alertas.
7. Conversar con el chat de apoyo.
8. Revisar perfil, historial y estadísticas.
9. Configurar límites de uso de apps.
10. Recibir notificaciones si se supera un límite.

## Integrantes

Proyecto desarrollado por estudiantes de Ingeniería Civil Informática:

* Constanza Alegría.
* Andrés Hormazábal.
* Martín Huiriqueo.
* Diego Estay.

## Estado actual

El proyecto cuenta con:

* Frontend mobile rediseñado.
* Backend con Express.
* Base de datos MongoDB.
* APK Android generada con Capacitor.
* Sistema de usuarios.
* Check-in emocional.
* Perfil avanzado.
* Horario y actividades.
* Alertas.
* Chat de apoyo con IA y fallback local.
* Notificaciones nativas.
* Integración con calendario.
* Monitoreo real de uso de apps en Android.
