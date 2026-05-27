# Vitality

Vitality es una aplicación web orientada al bienestar emocional, la organización personal y el apoyo preventivo para usuarios de distintas edades.

El proyecto fue desarrollado como parte de un trabajo académico de Ingeniería de Software.

## Descripción del proyecto

Vitality permite que una persona registre información básica de su perfil, realice un check-in emocional diario, visualice recomendaciones personalizadas, organice su horario y converse con un chat de apoyo guiado.

En esta etapa, la aplicación funciona como un prototipo web ejecutado en el navegador. Para simular la persistencia de datos, se utiliza `localStorage`, por lo que la información queda almacenada localmente en el navegador del usuario.

## Objetivo de la aplicación

El objetivo principal de Vitality es entregar una herramienta simple de apoyo preventivo que ayude al usuario a:

- Reconocer su estado emocional diario.
- Organizar sus actividades.
- Recibir recomendaciones básicas según su nivel de estrés, energía, sueño y ánimo.
- Mantener una rutina más equilibrada.
- Contar con un espacio de conversación guiada mediante un chat de apoyo.

## Funcionalidades implementadas

- Registro de usuario.
- Inicio de sesión local.
- Edición de perfil.
- Guardado de categoría y actividades favoritas.
- Check-in emocional diario.
- Registro de estado emocional, nivel de estrés, sueño y energía.
- Alertas personalizadas según el check-in.
- Gráfico/resumen visual del último check-in en el perfil.
- Chat de apoyo guiado.
- Botones dinámicos en el chat según el flujo de conversación.
- Horario semanal visual.
- Gestión de actividades fijas.
- Gestión de actividades especiales.
- Edición de actividades.
- Cancelación de edición de actividades.
- Eliminación de actividades.
- Marcado de actividades como completadas.
- Visualización de actividades del día.
- Eventos especiales del día.
- Modo claro y oscuro.
- Diseño responsive para escritorio y dispositivos móviles.

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript
- localStorage

## Estructura del proyecto

```bash
Vitality/
│── index.html
│── registro.html
│── perfil.html
│── checkin.html
│── horario.html
│── organizar_horario.html
│── alertas.html
│── chat.html
│── styles.css
│── script.js
│── logo.jpg
│── README.md