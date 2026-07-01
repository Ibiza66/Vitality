// ===============================
// Cargar tema guardado
// ===============================

const temaGuardado = localStorage.getItem("temaColor") || "green";

document.body.setAttribute("data-theme", temaGuardado);

// ===============================
// Cambiar tema
// ===============================

function cambiarColorVitality(color){

    document.body.setAttribute("data-theme", color);

    localStorage.setItem("temaColor", color);

}

window.cambiarColorVitality = cambiarColorVitality;