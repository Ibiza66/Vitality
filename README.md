# Vitality

Vitality es una aplicación web orientada al bienestar emocional, la organización personal y el apoyo preventivo para usuarios de distintas edades.  
El proyecto fue desarrollado como parte de un trabajo académico de Ingeniería de Software.

## Descripción del proyecto

La aplicación permite a una persona registrar información básica de su perfil, realizar un check-in emocional diario, visualizar recomendaciones personalizadas, organizar su horario y conversar con un chat de apoyo guiado.

En esta etapa, Vitality funciona como un prototipo funcional en el navegador, utilizando `localStorage` para simular la persistencia de datos del usuario sin necesidad de un backend o base de datos real.

## Funcionalidades implementadas

- Registro de usuario
- Inicio de sesión local
- Edición de perfil
- Guardado de categoría y actividades favoritas
- Check-in emocional diario
- Guardado de estado emocional, nivel de estrés, sueño y energía
- Alertas personalizadas según el check-in
- Gráfico de perfil según el último check-in
- Chat de apoyo guiado
- Horario semanal visual
- Gestión de actividades fijas
- Gestión de actividades especiales
- Modo claro / oscuro
- Diseño responsive para escritorio y dispositivos móviles

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript
- LocalStorage

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