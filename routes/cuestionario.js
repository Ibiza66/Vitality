const express  = require("express");
const mongoose = require("mongoose");

const Onboarding = require("../models/Onboarding");
const Actividad  = require("../models/Actividad");

const router = express.Router();

/* ─────────────────────────────────────────────────────
   Inicializar OpenAI — mismo patrón que el resto del proyecto
───────────────────────────────────────────────────── */
const Anthropic = require("@anthropic-ai/sdk");
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/* ─────────────────────────────────────────────────────
   FUNCIONES AUXILIARES
───────────────────────────────────────────────────── */
function limpiarId(id) {
  return String(id || "").replace(/[^a-fA-F0-9]/g, "").trim();
}

function idValido(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/* Convierte las respuestas del cuestionario en texto legible para el prompt */
function formatearRespuestasParaPrompt(respuestas) {
  return respuestas.map((r, i) => {
    let bloque = `[Pregunta ${i + 1} — ${r.fase.toUpperCase()}]\n`;
    bloque += `P: ${r.pregunta}\n`;
    bloque += `R: ${r.respuesta || "(sin respuesta)"}`;
    if (r.followupPregunta && r.followupRespuesta) {
      bloque += `\nFollow-up: ${r.followupPregunta}\nR: ${r.followupRespuesta}`;
    }
    return bloque;
  }).join("\n\n");
}

/* Fallback si no hay OpenAI: genera una ficha clínica local básica */
function generarFichaClinicaLocal(respuestas) {
  const identidad = respuestas.find(r => r.numeroPregunta === 1);
  const meta      = respuestas.find(r => r.numeroPregunta === 6);
  const habito    = respuestas.find(r => r.numeroPregunta === 13);

  return [
    "Tu perfil de identidad ha sido creado a partir de tus respuestas.",
    "",
    identidad ? `Visión de sí mismo: ${identidad.respuesta}` : "",
    meta      ? `Meta principal: ${meta.respuesta}`           : "",
    habito    ? `Hábito prioritario: ${habito.respuesta}`     : "",
    "",
    "Tu horario ha sido creado con actividades base. Cuando la IA esté disponible,",
    "se personalizará con más detalle."
  ].filter(Boolean).join("\n");
}

/* Genera actividades base si no hay OpenAI */
function generarActividadesLocales(respuestas, usuarioId, hoy) {
  const productivo = respuestas.find(r => r.numeroPregunta === 12);
  const hora = productivo?.respuesta === "Mañana" ? "09:00" :
               productivo?.respuesta === "Tarde"   ? "15:00" : "20:00";

  return [
    {
      usuario:     usuarioId,
      titulo:      "Bloque de enfoque personal",
      descripcion: "Tiempo reservado para tu meta principal",
      fecha:       hoy,
      hora,
      duracion:    45,
      tipo:        "fija",
      completada:  false,
      origen:      "cuestionario_ia"
    },
    {
      usuario:     usuarioId,
      titulo:      "Revisión del día",
      descripcion: "Reflexiona 10 minutos sobre lo que avanzaste",
      fecha:       hoy,
      hora:        "21:00",
      duracion:    10,
      tipo:        "fija",
      completada:  false,
      origen:      "cuestionario_ia"
    }
  ];
}

/* Genera actividades base cuando no hay OpenAI disponible */
function generarActividadesIALocales(respuestas) {
  const productivo = respuestas.find(r => r.numeroPregunta === 12);
  const hora = productivo?.respuesta?.includes("Mañana") ? "09:00" :
               productivo?.respuesta?.includes("Tarde")  ? "15:00" : "20:00";

  return [
    {
      titulo:          "Bloque de enfoque personal",
      descripcion:     "Tiempo reservado para tu meta principal",
      hora,
      duracionMinutos: 45,
      diasSemana:      ["lunes", "miércoles", "viernes"]
    },
    {
      titulo:          "Revisión del día",
      descripcion:     "Reflexiona 10 minutos sobre lo que avanzaste",
      hora:            "21:00",
      duracionMinutos: 10,
      diasSemana:      ["lunes", "martes", "miércoles", "jueves", "viernes"]
    },
    {
      titulo:          "Hábito de bienestar",
      descripcion:     "Actividad de cuidado personal diaria",
      hora:            "08:00",
      duracionMinutos: 20,
      diasSemana:      ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]
    }
  ];
}



/* ─────────────────────────────────────────────────────
   POST /api/cuestionario/procesar
   
   Body esperado:
   {
     usuarioId: "...",
     respuestas: [
       {
         fase: "identidad",
         numeroPregunta: 1,
         pregunta: "...",
         respuesta: "...",
         tipoInput: "texto",
         followupPregunta: "...",  (opcional)
         followupRespuesta: "..."  (opcional)
       },
       ... (15 objetos)
     ]
   }
───────────────────────────────────────────────────── */
router.post("/procesar", async (req, res) => {
  try {
    const { usuarioId, respuestas } = req.body;

    /* ── Validaciones básicas ── */
    const idLimpio = limpiarId(usuarioId);

    if (!idLimpio || !idValido(idLimpio)) {
      return res.status(400).json({ mensaje: "ID de usuario no válido." });
    }

    if (!Array.isArray(respuestas) || respuestas.length === 0) {
      return res.status(400).json({ mensaje: "Debes enviar las respuestas del cuestionario." });
    }

    const usuarioObjId = new mongoose.Types.ObjectId(idLimpio);
    const hoy = new Date().toISOString().slice(0, 10);

    let fichaClinica  = "";
    let actividadesIA = [];

    /* ── RAMA IA REAL ── */
    if (client) {
      try{
        const textoRespuestas = formatearRespuestasParaPrompt(respuestas);

        const promptSistema = `Eres el motor de análisis de Vitality, una app de bienestar para estudiantes universitarios.
        Tu trabajo es analizar las respuestas de un cuestionario de autoconocimiento basado en el marco I→G→A (Identidad → Goals/Objetivos → Acciones).

        Responde SOLO en JSON válido, sin texto adicional, sin bloques de código, sin markdown.
        El JSON debe tener exactamente esta estructura:
        {
          "fichaClinica": "Texto de 150-250 palabras describiendo la identidad, metas y perfil del usuario. Tono empático, en segunda persona (tú).",
          "actividades": [
            {
              "titulo": "Nombre corto de la actividad (máx 40 caracteres)",
              "descripcion": "Para qué sirve esta actividad en relación a sus metas",
              "hora": "HH:MM en formato 24h",
              "duracionMinutos": número entre 15 y 120,
              "diasSemana": ["lunes", "miércoles", "viernes"] (uno a tres días)
            }
          ]
        }

        Genera entre 4 y 6 actividades semanales. Cada actividad debe:
        - Conectar directamente con la identidad o metas del usuario
        - Tener un horario realista según cuándo es más productivo
        - Ser específica y accionable, no genérica`;



        //const promptUsuario = `RESPUESTAS DEL CUESTIONARIO:\n\n${textoRespuestas}`;

        const respuestaIA = await client.messages.create({
          model:       process.env.CLAUDE_MODEL || "claude-sonnet-4-6",
          max_tokens:  1200,
          system:      promptSistema,
          messages: [
            { role: "user", content: `RESPUESTAS DEL CUESTIONARIO:\n\n${textoRespuestas}` }
          ]
        });

        const textoIA = respuestaIA.content[0]?.text || "";      
        /* Parsear JSON — OpenAI a veces agrega backticks, los limpiamos */
        const textoLimpio = textoIA.replace(/```json/gi,"").replace(/```/g,"").trim();


        let parsedIA = null;
        try { parsedIA = JSON.parse(textoLimpio); } catch (_) {}
        if (parsedIA?.fichaClinica) {
          fichaClinica  = parsedIA.fichaClinica;
          actividadesIA = Array.isArray(parsedIA.actividades) ? parsedIA.actividades : generarActividadesIALocales(respuestas);
        }
        else {
            fichaClinica  = generarFichaClinicaLocal(respuestas);
            actividadesIA = generarActividadesIALocales(respuestas);
        }
      }catch (iaError) {
        /* IA falló → usamos fallback local para no bloquear el guardado */
        console.error("[cuestionario] IA falló, usando fallback local:", iaError.message);
        fichaClinica  = generarFichaClinicaLocal(respuestas);
        actividadesIA = generarActividadesIALocales(respuestas);
      }
      
    } else {
      /* ── RAMA SIN OPENAI ── */
      fichaClinica  = generarFichaClinicaLocal(respuestas);
      actividadesIA = generarActividadesIALocales(respuestas);
    }

    /* ── Guardar Onboarding en MongoDB ── */
    const onboarding = await Onboarding.findOneAndUpdate(
      { usuario: usuarioObjId },
      {
        usuario:                usuarioObjId,
        respuestas:             respuestas,
        fichaClinica:           fichaClinica,
        identidad:              fichaClinica.slice(0, 490), // resumen corto
        cuestionarioCompletado: true,
        horarioGenerado:        actividadesIA.length > 0,
        completado:             true
      },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );

    /* ── Crear Actividades en MongoDB desde la respuesta de IA ── */
    const actividadesCreadas = [];

    for (const act of actividadesIA) {
      const dias = Array.isArray(act.diasSemana) ? act.diasSemana : ["lunes"];

      for (const dia of dias) {
        /* Calcular horaFin sumando la duración a la hora de inicio */
        const horaInicio = String(act.hora || "09:00");
        const [hh, mm]   = horaInicio.split(":").map(Number);
        const minTotales = hh * 60 + mm + (Number(act.duracionMinutos) || 30);
        const horaFinStr = String(Math.floor(minTotales / 60) % 24).padStart(2, "0")
                           + ":" + String(minTotales % 60).padStart(2, "0");

        const actividad = await Actividad.create({
          usuario:       usuarioObjId,
          actividad:     String(act.titulo    || "Actividad").slice(0, 80),
          descripcion:   String(act.descripcion || "").slice(0, 300),
          fecha:         hoy,
          dia:           dia,
          hora:          horaInicio,
          horaFin:       horaFinStr,
          duracion:      Number(act.duracionMinutos) || 30,
          tipoActividad: "fija",
          completada:    false,
          origen:        "cuestionario_ia"
        });
        actividadesCreadas.push(actividad);
      }
    }

    /* ── Respuesta al frontend ── */
    return res.status(201).json({
      mensaje:           "Cuestionario procesado correctamente.",
      fichaClinica,
      actividadesCreadas: actividadesCreadas.length,
      onboardingId:      onboarding._id,
      modoIA:            client ? "anthropic" : "local"
    });

  } catch (error) {
    console.error("[cuestionario] Error al procesar:", error);
    return res.status(500).json({
      mensaje: "Error al procesar el cuestionario.",
      error:   error.message
    });
  }
});

/* ─────────────────────────────────────────────────────
   POST /api/cuestionario/followup
   
   Genera una pregunta de profundización basada en una respuesta.
   Llamada desde el frontend después de cada respuesta relevante.
   
   Body: { usuarioId, pregunta, respuesta, fase }
───────────────────────────────────────────────────── */
router.post("/followup", async (req, res) => {
  try {
    const { pregunta, respuesta, fase } = req.body;

    if (!pregunta || !respuesta) {
      return res.status(400).json({ mensaje: "Faltan datos para el follow-up." });
    }

    /* Si la respuesta es muy corta, no vale la pena hacer follow-up */
    if (String(respuesta).trim().length < 20) {
      return res.json({ followup: null });
    }

    if (!client) {
      return res.json({ followup: null });
    }

    const prompt = `Eres Vitality. El usuario respondió lo siguiente en la fase de "${fase}" del cuestionario:

Pregunta: ${pregunta}
Respuesta: ${respuesta}

Genera UNA sola pregunta de profundización breve (máx 15 palabras) que ayude a clarificar o enriquecer esta respuesta.
Responde SOLO con la pregunta, sin explicaciones adicionales, sin comillas.`;

    const respuestaIA = await client.messages.create({
      model:       process.env.CLAUDE_MODEL || "claude-sonnet-4-6",
      max_tokens:  60,
      messages: [{ role: "user", content: prompt }]
    });

    const followup = respuestaIA.content[0]?.text?.trim() || null;

    return res.json({ followup });

  } catch (error) {
    console.error("[cuestionario/followup] Error:", error);
    return res.json({ followup: null }); // Silencioso: el follow-up es opcional
  }
});

/* ─────────────────────────────────────────────────────
   GET /api/cuestionario/:usuarioId
   
   Lee la ficha clínica y las actividades generadas para
   mostrarlas en horario-preview.html
───────────────────────────────────────────────────── */
router.get("/:usuarioId", async (req, res) => {
  try {
    const idLimpio = limpiarId(req.params.usuarioId);

    if (!idValido(idLimpio)) {
      return res.status(400).json({ mensaje: "ID de usuario no válido." });
    }

    const onboarding = await Onboarding.findOne({
      usuario: new mongoose.Types.ObjectId(idLimpio)
    });

    if (!onboarding || !onboarding.cuestionarioCompletado) {
      return res.status(404).json({ mensaje: "Cuestionario no completado aún." });
    }

    /* También cargamos las actividades generadas por IA */
    const hoy = new Date().toISOString().slice(0, 10);
    const actividades = await Actividad.find({
      usuario: new mongoose.Types.ObjectId(idLimpio),
      origen:  "cuestionario_ia"
    }).sort({ hora: 1 });

    return res.json({
      fichaClinica: onboarding.fichaClinica,
      identidad:    onboarding.identidad,
      actividades,
      completadoEn: onboarding.updatedAt
    });

  } catch (error) {
    console.error("[cuestionario] Error al obtener ficha:", error);
    return res.status(500).json({
      mensaje: "Error al obtener el cuestionario.",
      error:   error.message
    });
  }
});

module.exports = router;
