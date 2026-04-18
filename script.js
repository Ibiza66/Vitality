function toggleMenu() {
  const menu = document.getElementById("menu");
  const profileMenu = document.getElementById("profileMenu");

  if (!menu) return;

  if (profileMenu) {
    profileMenu.style.display = "none";
  }

  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

function toggleProfileMenu() {
  const profileMenu = document.getElementById("profileMenu");
  const menu = document.getElementById("menu");

  if (!profileMenu) return;

  if (menu) {
    menu.style.display = "none";
  }

  profileMenu.style.display =
    profileMenu.style.display === "block" ? "none" : "block";
}

window.addEventListener("click", function (e) {
  const menu = document.getElementById("menu");
  const profileMenu = document.getElementById("profileMenu");
  const menuBtn = document.querySelector(".menu-btn");
  const profileBtn = document.querySelector(".profile-btn");

  if (
    menu &&
    menuBtn &&
    !menuBtn.contains(e.target) &&
    !menu.contains(e.target)
  ) {
    menu.style.display = "none";
  }

  if (
    profileMenu &&
    profileBtn &&
    !profileBtn.contains(e.target) &&
    !profileMenu.contains(e.target)
  ) {
    profileMenu.style.display = "none";
  }
});

/* MODO OSCURO / CLARO */
function toggleTheme() {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  }
});
/* CHAT DE APOYO */
let chatStep = 0;

const chatQuestions = [
  "Gracias por contármelo. ¿Dirías que hoy te sientes con mucho estrés, poco estrés o algo intermedio?",
  "Entiendo. ¿Te ha pasado solo hoy o llevas varios días sintiéndote así?",
  "Gracias por responder. ¿Te gustaría que te sugiera una actividad para sentirte mejor?"
];

function sendMessage(event) {
  event.preventDefault();

  const input = document.getElementById("userInput");
  const chatBox = document.getElementById("chatBox");

  if (!input || !chatBox) return;

  const text = input.value.trim();
  if (text === "") return;

  addMessage(text, "user");
  input.value = "";

  setTimeout(() => {
    let response = "";

    if (chatStep < chatQuestions.length) {
      response = chatQuestions[chatStep];
      chatStep++;
    } else {
      response = generateSupportResponse(text);
    }

    addMessage(response, "bot");
  }, 600);
}

function addMessage(text, sender) {
  const chatBox = document.getElementById("chatBox");
  if (!chatBox) return;

  const message = document.createElement("div");
  message.classList.add("message", sender);

  const paragraph = document.createElement("p");
  paragraph.textContent = text;

  message.appendChild(paragraph);
  chatBox.appendChild(message);

  chatBox.scrollTop = chatBox.scrollHeight;
}

function generateSupportResponse(text) {
  const msg = text.toLowerCase();

  if (msg.includes("sí") || msg.includes("si")) {
    return "Podrías intentar una pausa breve, escuchar música relajante, salir a caminar o conversar con alguien de confianza 💚";
  }

  if (msg.includes("estrés") || msg.includes("estres") || msg.includes("ansiedad")) {
    return "Lamento que te sientas así. Te recomiendo respirar profundo unos minutos, bajar el ritmo por un momento y revisar una actividad tranquila que te guste.";
  }

  if (msg.includes("triste") || msg.includes("mal") || msg.includes("cansado")) {
    return "Gracias por decírmelo. A veces ayuda mucho descansar, hacer algo que disfrutes o hablar con alguien cercano.";
  }

  if (msg.includes("bien") || msg.includes("mejor")) {
    return "Me alegra leer eso. Mantener una rutina equilibrada y darte pausas también ayuda a seguir sintiéndote bien.";
  }

  return "Gracias por compartirlo conmigo. Si quieres, puedo seguir acompañándote o sugerirte alguna actividad para despejarte.";
}