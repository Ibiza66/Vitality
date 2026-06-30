
// Para onboarding.html: Control del cuestionario de identidad paso a paso (onboardingStep1, onboardingStep2, etc.) y almacenamiento de las métricas iniciales de estrés y objetivos.



//linea 5272

/* =========================
   ONBOARDING INICIAL DE USUARIO
========================= */
let pasoOnboardingVitality = 1;

function obtenerDatosOnboardingVitality() {
  return leerJSON("onboardingVitality", {
    objetivos: [],
    identidad: "",
    estres: [],
    completado: false
  });
}

function guardarDatosOnboardingVitality(datos) {
  guardarJSON("onboardingVitality", datos);
}

function inicializarOnboardingVitality() {
  const pagina = obtenerPaginaActual();

  if (pagina !== "onboarding.html") {
    return;
  }

  const usuario = obtenerUsuario();

  if (!usuario || !usuario.id) {
    window.location.href = "index.html";
    return;
  }

  const datos = obtenerDatosOnboardingVitality();

  if (datos.completado) {
    window.location.href = "checkin.html";
    return;
  }

  document.querySelectorAll(".onboarding-option").forEach((boton) => {
    boton.addEventListener("click", () => {
      alternarOpcionOnboardingVitality(boton);
    });
  });

  const identidadInput = document.getElementById("identidadVitalityInput");

  if (identidadInput) {
    identidadInput.addEventListener("input", actualizarContadorIdentidadVitality);
  }

  mostrarPasoOnboardingVitality(1);
}

function alternarOpcionOnboardingVitality(boton) {
  boton.classList.toggle("seleccionada");
}

function obtenerSeleccionadosOnboardingVitality(grupo) {
  return Array.from(
    document.querySelectorAll(`.onboarding-option[data-grupo="${grupo}"].seleccionada`)
  ).map((item) => item.dataset.valor);
}

function guardarPasoActualOnboardingVitality() {
  const datos = obtenerDatosOnboardingVitality();

  if (pasoOnboardingVitality === 1) {
    datos.objetivos = obtenerSeleccionadosOnboardingVitality("objetivos");
  }

  if (pasoOnboardingVitality === 2) {
    const identidadInput = document.getElementById("identidadVitalityInput");
    datos.identidad = identidadInput ? identidadInput.value.trim() : "";
  }

  if (pasoOnboardingVitality === 3) {
    datos.estres = obtenerSeleccionadosOnboardingVitality("estres");
  }

  guardarDatosOnboardingVitality(datos);
}

function mostrarPasoOnboardingVitality(paso) {
  pasoOnboardingVitality = paso;

  document.querySelectorAll(".onboarding-step").forEach((seccion) => {
    seccion.classList.remove("activa");
  });

  const stepText = document.getElementById("onboardingStepText");
  const backBtn = document.getElementById("onboardingBackBtn");
  const nextBtn = document.getElementById("onboardingNextBtn");
  const skipBtn = document.getElementById("onboardingSkipBtn");

  document.querySelectorAll(".onboarding-dot").forEach((dot) => {
    dot.classList.remove("activa");
  });

  if (paso <= 3) {
    const seccion = document.getElementById(`onboardingStep${paso}`);
    const dot = document.getElementById(`onboardingDot${paso}`);

    if (seccion) seccion.classList.add("activa");
    if (dot) dot.classList.add("activa");

    if (stepText) stepText.textContent = `${paso} / 3`;
    if (backBtn) backBtn.style.display = paso === 1 ? "none" : "block";
    if (nextBtn) nextBtn.textContent = paso === 3 ? "Continuar" : "Siguiente";
    if (skipBtn) skipBtn.style.display = paso === 2 ? "block" : "none";
    return;
  }

  const final = document.getElementById("onboardingFinal");
  const datos = obtenerDatosOnboardingVitality();
  const resumen = document.getElementById("onboardingIdentidadResumen");

  if (final) final.classList.add("activa");
  if (stepText) stepText.textContent = "";
  if (backBtn) backBtn.style.display = "none";
  if (skipBtn) skipBtn.style.display = "none";

  if (nextBtn) {
    nextBtn.textContent = "Ver mi día →";
  }

  if (resumen) {
    resumen.textContent = datos.identidad
      ? `“${datos.identidad}”`
      : "“Tu identidad”";
  }
}

function avanzarOnboarding() {
  guardarPasoActualOnboardingVitality();

  if (pasoOnboardingVitality < 3) {
    mostrarPasoOnboardingVitality(pasoOnboardingVitality + 1);
    return;
  }

  if (pasoOnboardingVitality === 3) {
    mostrarPasoOnboardingVitality(4);
    return;
  }

  finalizarOnboardingVitality();
}

function retrocederOnboarding() {
  if (pasoOnboardingVitality > 1) {
    mostrarPasoOnboardingVitality(pasoOnboardingVitality - 1);
  }
}

function saltarPreguntaOnboarding() {
  const identidadInput = document.getElementById("identidadVitalityInput");

  if (identidadInput) {
    identidadInput.value = "";
  }

  actualizarContadorIdentidadVitality();
  avanzarOnboarding();
}

function actualizarContadorIdentidadVitality() {
  const identidadInput = document.getElementById("identidadVitalityInput");
  const contador = document.getElementById("contadorIdentidadVitality");

  if (!identidadInput || !contador) {
    return;
  }

  contador.textContent = `${identidadInput.value.length} / 240`;
}

async function finalizarOnboardingVitality() {
  const datos = obtenerDatosOnboardingVitality();

  datos.completado = true;
  datos.fecha = new Date().toISOString();

  guardarDatosOnboardingVitality(datos);

  const resultado = await guardarOnboardingBackendVitality(datos);

  if (resultado.ok) {
    mostrarToastVitality("Perfil inicial guardado correctamente.");
  } else {
    mostrarToastVitality(resultado.mensaje);
  }

  window.location.href = "checkin.html";
}



// Linea 5540

/* =========================
   ONBOARDING EN BACKEND
========================= */
async function guardarOnboardingBackendVitality(datos) {
  const usuarioId = obtenerUsuarioIdVitality();

  if (!usuarioId) {
    return {
      ok: false,
      mensaje: "No se encontró el usuario para guardar el onboarding."
    };
  }

  try {
    const respuesta = await fetch(`${API_URL}/api/onboarding`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        usuarioId,
        objetivos: datos.objetivos || [],
        identidad: datos.identidad || "",
        estres: datos.estres || [],
        completado: true
      })
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      return {
        ok: false,
        mensaje: data.mensaje || "No se pudo guardar el onboarding."
      };
    }

    return {
      ok: true,
      onboarding: data.onboarding
    };
  } catch (error) {
    console.error("Error al guardar onboarding en backend:", error);

    return {
      ok: false,
      mensaje: "No se pudo conectar con el servidor para guardar el onboarding."
    };
  }
}

async function obtenerOnboardingBackendVitality() {
  const usuarioId = obtenerUsuarioIdVitality();

  if (!usuarioId) {
    return obtenerDatosOnboardingVitality();
  }

  try {
    const respuesta = await fetch(`${API_URL}/api/onboarding/${usuarioId}`);

    if (respuesta.status === 404) {
      return obtenerDatosOnboardingVitality();
    }

    const data = await respuesta.json();

    if (!respuesta.ok) {
      return obtenerDatosOnboardingVitality();
    }

    const onboarding = {
      objetivos: data.objetivos || [],
      identidad: data.identidad || "",
      estres: data.estres || [],
      completado: data.completado || false
    };

    guardarDatosOnboardingVitality(onboarding);

    return onboarding;
  } catch (error) {
    console.error("Error al obtener onboarding desde backend:", error);
    return obtenerDatosOnboardingVitality();
  }
}



window.addEventListener("DOMContentLoaded", inicializarOnboardingVitality);
