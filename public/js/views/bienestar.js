// Para bienestar.html o la sección psicológica

// Manejo del diario/bitácora de reflexiones y el control del temporizador de la técnica de respiración 5-4-3-2-1 (calmaStartBtn).


// Linea 8582

/* ==========================================================================
   ESPACIO DE CALMA: RESPIRACIÓN, POMODORO Y SÍNTESIS DE AUDIO (WEB AUDIO API)
   ========================================================================== */

let audioCtx = null;
let soundNodes = {
  lluvia: null,
  mar: null,
  viento: null
};

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function createNoiseBuffer(ctx, duration = 2) {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function startRain(ctx) {
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = createNoiseBuffer(ctx, 3);
  noiseSource.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 1000;

  const gain = ctx.createGain();
  gain.gain.value = 0.35;

  noiseSource.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noiseSource.start();
  return { source: noiseSource, gain: gain };
}

function startOcean(ctx) {
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = createNoiseBuffer(ctx, 4);
  noiseSource.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 400;

  const gain = ctx.createGain();
  gain.gain.value = 0.05;

  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.15; // Onda lenta de ~6 segundos

  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.15;

  lfo.connect(lfoGain);
  lfoGain.connect(gain.gain);

  noiseSource.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  lfo.start();
  noiseSource.start();

  return { source: noiseSource, lfo: lfo, gain: gain };
}

function startWind(ctx) {
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = createNoiseBuffer(ctx, 3);
  noiseSource.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 5.0;
  filter.frequency.value = 300;

  const gain = ctx.createGain();
  gain.gain.value = 0.15;

  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.08;

  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 250;

  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);

  noiseSource.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  lfo.start();
  noiseSource.start();

  return { source: noiseSource, lfo: lfo, gain: gain };
}

function playPomodoroChime() {
  try {
    const ctx = getAudioContext();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // Do5
    osc1.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.3); // Sol5

    osc2.type = "sine";
    osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // Mi5
    osc2.frequency.exponentialRampToValueAtTime(987.77, ctx.currentTime + 0.3); // Si5

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 1.2);
    osc2.stop(ctx.currentTime + 1.2);
  } catch (error) {
    console.error("Error reproduciendo chime:", error);
  }
}

function toggleSonidoAmbiente(tipo, elemento) {
  try {
    const ctx = getAudioContext();

    if (elemento.classList.contains("active")) {
      elemento.classList.remove("active");
      const node = soundNodes[tipo];
      if (node) {
        if (node.source) {
          try { node.source.stop(); } catch(e){}
        }
        if (node.lfo) {
          try { node.lfo.stop(); } catch(e){}
        }
        soundNodes[tipo] = null;
      }
      mostrarToastVitality(`Sonido de ${tipo} desactivado.`);
    } else {
      elemento.classList.add("active");
      if (tipo === "lluvia") {
        soundNodes.lluvia = startRain(ctx);
      } else if (tipo === "mar") {
        soundNodes.mar = startOcean(ctx);
      } else if (tipo === "viento") {
        soundNodes.viento = startWind(ctx);
      }
      mostrarToastVitality(`Sonido de ${tipo} activado.`);
    }
  } catch (error) {
    console.error("Error al reproducir sonido ambiental:", error);
    mostrarToastVitality("No se pudo iniciar el audio en este dispositivo.");
  }
}

// RESPIRACIÓN GUIADA
let respiradorInterval = null;
let respiradorPausa = true;
let respiradorSegundos = 4;
let respiradorFaseIndice = 0;
let respiradorFases = [];

const TECNICAS_RESPIRACION = {
  box: [
    { texto: "Inhalar", segundos: 4, escala: 1.4 },
    { texto: "Mantener", segundos: 4, escala: 1.4 },
    { texto: "Exhalar", segundos: 4, escala: 1.0 },
    { texto: "Mantener", segundos: 4, escala: 1.0 }
  ],
  relax: [
    { texto: "Inhalar", segundos: 4, escala: 1.4 },
    { texto: "Mantener", segundos: 7, escala: 1.4 },
    { texto: "Exhalar", segundos: 8, escala: 1.0 }
  ],
  coherente: [
    { texto: "Inhalar", segundos: 5, escala: 1.4 },
    { texto: "Exhalar", segundos: 5, escala: 1.0 }
  ]
};

function cambiarTecnicaRespiratoria() {
  const selector = document.getElementById("calmaTecnicaSelector");
  if (!selector) return;
  const tecnica = selector.value;
  respiradorFases = TECNICAS_RESPIRACION[tecnica] || TECNICAS_RESPIRACION.box;
  respiradorFaseIndice = 0;
  respiradorSegundos = respiradorFases[0].segundos;
  
  actualizarUIRespirador();
}

function actualizarUIRespirador() {
  const accionTexto = document.getElementById("calmaAccionTexto");
  const segundosTexto = document.getElementById("calmaSegundosTexto");
  const circulo = document.getElementById("calmaCirculo");

  if (!accionTexto || !segundosTexto || !circulo) return;

  const faseActual = respiradorFases[respiradorFaseIndice];
  accionTexto.textContent = faseActual.texto;
  segundosTexto.textContent = `${respiradorSegundos}s`;

  circulo.style.transition = `transform ${faseActual.segundos}s linear`;
  circulo.style.transform = `scale(${faseActual.escala})`;
}

function toggleRespirador() {
  const btn = document.getElementById("calmaStartBtn");
  if (!btn) return;

  if (respiradorPausa) {
    respiradorPausa = false;
    btn.textContent = "Pausar";
    btn.classList.remove("active");
    
    if (respiradorFases.length === 0) {
      cambiarTecnicaRespiratoria();
    }

    actualizarUIRespirador();

    respiradorInterval = setInterval(() => {
      respiradorSegundos--;
      if (respiradorSegundos <= 0) {
        respiradorFaseIndice = (respiradorFaseIndice + 1) % respiradorFases.length;
        const nuevaFase = respiradorFases[respiradorFaseIndice];
        respiradorSegundos = nuevaFase.segundos;
        actualizarUIRespirador();
      } else {
        const segundosTexto = document.getElementById("calmaSegundosTexto");
        if (segundosTexto) segundosTexto.textContent = `${respiradorSegundos}s`;
      }
    }, 1000);
  } else {
    respiradorPausa = true;
    btn.textContent = "Iniciar";
    btn.classList.add("active");
    clearInterval(respiradorInterval);
  }
}

// Temporizador Pomodoro
let pomodoroInterval = null;
let pomodoroMinutos = 25;
let pomodoroSegundos = 0;
let pomodoroEnPausa = true;
let pomodoroFaseActual = "trabajo";

function togglePomodoro() {
  const btn = document.getElementById("pomodoroStartBtn");
  if (!btn) return;

  if (pomodoroEnPausa) {
    pomodoroEnPausa = false;
    btn.textContent = "Pausar";
    btn.classList.remove("active");

    pomodoroInterval = setInterval(() => {
      if (pomodoroSegundos === 0) {
        if (pomodoroMinutos === 0) {
          playPomodoroChime();
          if (pomodoroFaseActual === "trabajo") {
            pomodoroFaseActual = "descanso";
            pomodoroMinutos = 5;
            mostrarToastVitality("¡Sesión completada! Descansa 5 minutos.");
          } else {
            pomodoroFaseActual = "trabajo";
            pomodoroMinutos = 25;
            mostrarToastVitality("¡Hora de enfocarse! Sesión de 25 minutos.");
          }
          pomodoroSegundos = 0;
          actualizarUIPomodoro();
        } else {
          pomodoroMinutos--;
          pomodoroSegundos = 59;
        }
      } else {
        pomodoroSegundos--;
      }
      actualizarUIPomodoro();
    }, 1000);
  } else {
    pomodoroEnPausa = true;
    btn.textContent = "Iniciar";
    btn.classList.add("active");
    clearInterval(pomodoroInterval);
  }
}

function resetearPomodoro() {
  clearInterval(pomodoroInterval);
  pomodoroEnPausa = true;
  pomodoroFaseActual = "trabajo";
  pomodoroMinutos = 25;
  pomodoroSegundos = 0;
  
  const btn = document.getElementById("pomodoroStartBtn");
  if (btn) {
    btn.textContent = "Iniciar";
    btn.classList.add("active");
  }

  actualizarUIPomodoro();
}

function actualizarUIPomodoro() {
  const faseTexto = document.getElementById("pomodoroFase");
  const tiempoTexto = document.getElementById("pomodoroTiempo");

  if (faseTexto) {
    faseTexto.textContent = pomodoroFaseActual === "trabajo" ? "Sesión de Enfoque" : "Descanso";
  }

  if (tiempoTexto) {
    const minStr = String(pomodoroMinutos).padStart(2, "0");
    const segStr = String(pomodoroSegundos).padStart(2, "0");
    tiempoTexto.textContent = `${minStr}:${segStr}`;
  }
}


// Linea 8931

/* ==========================================================================
   ESPACIO DE BIENESTAR: AUXILIO Y PANIC OVERLAY (GROUNDING SENSORIAL 5-4-3-2-1)
   ========================================================================== */

let panicPaso = 5;

function activarModoPanico() {
  const overlay = document.getElementById("panicOverlay");
  if (!overlay) return;

  panicPaso = 5;
  overlay.style.display = "flex";
  actualizarUIPanico();
}

function desactivarModoPanico() {
  const overlay = document.getElementById("panicOverlay");
  if (overlay) {
    overlay.style.display = "none";
  }
}

function avanzarPasoPanico() {
  if (panicPaso > 1) {
    panicPaso--;
    actualizarUIPanico();
  } else if (panicPaso === 1) {
    panicPaso = 0;
    actualizarUIPanico();
  } else {
    desactivarModoPanico();
  }
}

function actualizarUIPanico() {
  const instruccion = document.getElementById("panicInstruccion");
  const btn = document.querySelector("#panicOverlay .calma-controls-row button");

  if (!instruccion || !btn) return;

  const pasos = {
    5: "5. Nombra 5 cosas que puedas VER a tu alrededor en esta habitación.",
    4: "4. Nombra 4 cosas que puedas TOCAR en tu entorno directo (ej: tu ropa, el suelo).",
    3: "3. Nombra 3 sonidos que puedas ESCUCHAR en este momento (lejanos o cercanos).",
    2: "2. Nombra 2 cosas que puedas OLER a tu porción de aire (ej: comida, perfume, madera).",
    1: "1. Nombra 1 cosa positiva o agradable que puedas SABOREAR o sentir agradecimiento.",
    0: "¡Bien hecho! Tu ritmo cardíaco está volviendo a la normalidad. Estás a salvo. 💚"
  };

  instruccion.textContent = pasos[panicPaso];
  btn.textContent = panicPaso === 0 ? "Finalizar" : "Siguiente";
}

function toggleAccordionLeccion(elemento) {
  const isActive = elemento.classList.contains("active");
  const allLessons = document.querySelectorAll(".lesson-item");
  allLessons.forEach(l => l.classList.remove("active"));

  if (!isActive) {
    elemento.classList.add("active");
  }
}

