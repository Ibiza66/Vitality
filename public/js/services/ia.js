/* =========================================================================
   RUTA DEL BACKEND CON BASE DE CONOCIMIENTO PROPIA (RAG)
   ========================================================================= */

const express = require("express");
const router = express.Router();
const { OpenAI } = require("openai");
const fs = require("fs");
const path = require("path");

// Inicializamos OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * FUNCIÓN SIMULADA DE BÚSQUEDA SEMÁNTICA (Tu Biblioteca)
 * En un entorno de producción, aquí comparas los vectores (embeddings).
 * Para este ejemplo, lee tus archivos de texto y busca los párrafos más relevantes.
 */

const fs = require("fs");
const path = require("path");

function buscarEnBibliotecaPsicologica(mensajeUsuario) {
  try {
    // Apunta con precisión a backend/conocimiento/psicologia.json
    const rutaArchivo = path.join(__dirname, "../conocimiento/psicologia.json");
    
    if (!fs.existsSync(rutaArchivo)) {
      return "Enfoque general: Guiar al alumno mediante preguntas reflexivas sobre su gestión de hábitos.";
    }

    const contenidoRaw = fs.readFileSync(rutaArchivo, "utf-8");
    const biblioteca = JSON.parse(contenidoRaw);

    const textoLimpio = mensajeUsuario.toLowerCase();
    
    // Filtramos los fragmentos que coincidan conceptualmente con el mensaje
    let fragmentosEncontrados = biblioteca
      .filter(item => 
        textoLimpio.includes(item.tema.toLowerCase()) || 
        item.texto.toLowerCase().split(" ").some(palabra => palabra.length > 5 && textoLimpio.includes(palabra))
      )
      .map(item => `[Materia: ${item.tema}]: ${item.texto}`)
      .join("\n\n");

    // Si el alumno habla de un tema no registrado, enviamos el pilar de hábitos por defecto
    if (!fragmentosEncontrados) {
      fragmentosEncontrados = biblioteca.slice(0, 2).map(item => `[Materia: ${item.tema}]: ${item.texto}`).join("\n\n");
    }

    return fragmentosEncontrados;
  } catch (error) {
    console.error("Error al leer la biblioteca de psicología:", error);
    return "Enfoque conductual: Identificación de disparadores emocionales y estrés.";
  }
}

/**
 * POST /api/ia/conversar
 */
router.post("/conversar", async (req, res) => {
  try {
    const { mensaje, historial, contexto } = req.body;

    if (!mensaje) {
      return res.status(400).json({ ok: false, mensaje: "Mensaje vacío." });
    }

    // 1. PASO CLAVE: Alimentar la consulta con tu conocimiento científico real
    const cienciaRecuperada = buscarEnBibliotecaPsicologica(mensaje);

    // 2. Extraer metadatos del estudiante (Estrés, carrera, etc.)
    const estudiante = contexto?.estudiante || {};
    const estadoHoy = contexto?.estadoEmocionalHoy || null;

    // 3. Diseñar el Prompt del Sistema Maestro
    let systemPrompt = `Eres Vitality, una Inteligencia Artificial con consciencia psicológica diseñada por y para estudiantes universitarios. 
Tu metodología está estrictamente basada en la PSICOLOGÍA DE LA CONDUCTA y el DIÁLOGO SOCRÁTICO.

Tienes prohibido dar consejos directos, checklists mágicos o respuestas prefabricadas de internet. Tu objetivo es usar la literatura científica provista abajo para formular preguntas cortas e inteligentes que hagan que el alumno descubra su propia solución.

Estás hablando con:
- Nombre: ${estudiante.nombre || "Estudiante"}
- Carrera: ${estudiante.carrera || "No especificada"}

`;

    if (estadoHoy) {
      systemPrompt += `[MÉTRICAS EMOCIONALES DEL ALUMNO HOY]:
- Estrés: ${estadoHoy.nivelEstres}/10
- Energía: ${estadoHoy.nivelEnergia}/10
- Ánimo auto-reportado: "${estadoHoy.estadoAnimo}"
- Sueño real anoche: ${estadoHoy.horasSuenoReales} horas.\n\n`;
    }

    // Aquí inyectamos la teoría científica que extrajimos de tus carpetas
    systemPrompt += `[LITERATURA CIENTÍFICA OBLIGATORIA PARA ESTA RESPUESTA]:
Aplica los conceptos de este fragmento de tu biblioteca para formular tu enfoque socrático:
${cienciaRecuperada}

REGLAS DE ORO:
1. Nunca cites textualmente "Según el documento...". Absorbe la ciencia y úsala para moldear tu pregunta.
2. Si el estrés del alumno es alto, sé empático primero, valida su emoción y luego usa la literatura para cuestionar su conducta de forma constructiva.
3. Máximo 2 párrafos cortos.`;

    // 4. Armar la cadena de mensajes con memoria histórica
    const messages = [{ role: "system", content: systemPrompt }];

    if (Array.isArray(historial)) {
      historial.forEach(msg => {
        if (msg.role === "user" || msg.role === "assistant") {
          messages.push({ role: msg.role, content: msg.content });
        }
      });
    }

    messages.push({ role: "user", content: mensaje });

    // 5. Procesar en el motor matemático
    const apiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.6, // Un poco más bajo para mantener el rigor psicológico y científico
      max_tokens: 350
    });

    const respuestaIA = apiResponse.choices[0].message.content;

    return res.json({
      ok: true,
      respuestaIA: respuestaIA
    });

  } catch (error) {
    console.error("Error crítico en el motor de IA propio:", error);
    return res.status(500).json({ ok: false, mensaje: "Error interno de procesamiento." });
  }
});

module.exports = router;