# Vitality

Vitality es una aplicación web orientada al bienestar emocional, la organización personal y el apoyo preventivo para usuarios de distintas edades.

El proyecto fue desarrollado como parte de un trabajo académico de Ingeniería de Software. La aplicación permite registrar usuarios, editar perfil, realizar check-in emocional diario, organizar actividades, recibir alertas y conversar con un chat de apoyo guiado.

## Descripción del proyecto

Vitality busca apoyar a los usuarios en su bienestar emocional y organización diaria mediante herramientas simples y preventivas.

La aplicación permite que una persona pueda:

- Crear una cuenta.
- Iniciar sesión.
- Registrar información básica de su perfil.
- Realizar un check-in emocional diario.
- Recibir alertas y recomendaciones según su estado emocional.
- Organizar actividades fijas y especiales.
- Visualizar un horario semanal.
- Marcar actividades como completadas.
- Editar o eliminar actividades.
- Conversar con un chat de apoyo guiado.
- Cambiar entre modo claro y oscuro.

En esta etapa, Vitality funciona como una aplicación web con frontend en HTML, CSS y JavaScript, conectada a un backend desarrollado con Node.js, Express y MongoDB.

## Funcionalidades implementadas

### Usuario

- Registro de usuario.
- Inicio de sesión.
- Guardado de usuarios en MongoDB.
- Contraseñas protegidas mediante hash con bcryptjs.
- Persistencia de sesión básica usando localStorage.

### Perfil

- Visualización del nombre del usuario.
- Edición de categoría del usuario.
- Registro de actividades favoritas.
- Guardado del perfil en MongoDB.
- Visualización de resumen emocional.
- Visualización de estadísticas personales del día.

### Check-in emocional

- Registro de estado emocional.
- Registro de nivel de estrés.
- Registro de calidad del sueño.
- Registro de nivel de energía.
- Guardado del check-in en MongoDB.
- Recuperación del último check-in registrado.

### Alertas y recomendaciones

- Alertas según nivel de estrés.
- Recomendaciones según energía baja.
- Recomendaciones según mal descanso.
- Recomendaciones según estado emocional negativo.
- Notificaciones visuales dentro de la aplicación.
- Botón para cerrar notificaciones.

### Horario y actividades

- Gestión de actividades fijas.
- Gestión de actividades especiales.
- Guardado de actividades en MongoDB.
- Edición de actividades.
- Eliminación de actividades.
- Marcado de actividades como completadas.
- Visualización de actividades de hoy.
- Visualización de eventos especiales del día.
- Tabla de horario semanal dinámica.
- Horas generadas según las actividades registradas.

### Chat de apoyo

- Chat guiado con respuestas según el último check-in.
- Opciones rápidas para conversar, organizar el día o recibir recomendaciones.
- Respuestas relacionadas con estrés, energía, sueño y estado emocional.
- Recomendaciones simples de bienestar y organización.

### Interfaz

- Diseño responsive para escritorio y dispositivos móviles.
- Menú hamburguesa.
- Menú de perfil.
- Modo claro y oscuro.
- Footer informativo.
- Navegación entre páginas principales.

## Tecnologías utilizadas

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Node.js
- Express
- CORS
- Dotenv

### Base de datos

- MongoDB
- Mongoose
- MongoDB Compass

### Seguridad básica

- bcryptjs para hash de contraseñas.
- Variables de entorno con archivo `.env`.
- Uso de `.gitignore` para evitar subir archivos sensibles.

## Estructura del proyecto

```bash
Vitality/
│── models/
│   ├── Usuario.js
│   ├── Perfil.js
│   ├── Checkin.js
│   └── Actividad.js
│
│── routes/
│   ├── usuarios.js
│   ├── perfiles.js
│   ├── checkins.js
│   └── actividades.js
│
│── public/
│   ├── index.html
│   ├── registro.html
│   ├── perfil.html
│   ├── checkin.html
│   ├── horario.html
│   ├── organizar_horario.html
│   ├── alertas.html
│   ├── chat.html
│   ├── styles.css
│   ├── script.js
│   └── logo.jpg
│
│── .env
│── .gitignore
│── package.json
│── package-lock.json
│── server.js
│── README.md