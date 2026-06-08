/* Variable global */
let avatarSeleccionado = "";

/* 🔊 Función para hablar */
function hablar(texto) {
    const mensaje = new SpeechSynthesisUtterance(texto);
    mensaje.lang = "es-ES";
    mensaje.rate = 0.9;
    mensaje.pitch = 1.1;

    speechSynthesis.cancel();
    speechSynthesis.speak(mensaje);
}

/* 🎯 Selección de avatar */
function seleccionarAvatar(img) {
    const avatars = document.querySelectorAll(".avatars img");
    avatars.forEach(i => {
        i.classList.remove("selected");
        i.setAttribute("aria-checked", "false");
    });

    img.classList.add("selected");
    img.setAttribute("aria-checked", "true");

    avatarSeleccionado = img.src;
    hablar("¡Avatar seleccionado!");
}

/* ✅ Validación */
function validar() {
    let nombre = document.getElementById("nombre").value.trim();

    if (nombre === "") {
        hablar("Por favor, escribe tu nombre.");
        return;
    }

    if (avatarSeleccionado === "") {
        hablar("Elige un avatar divertido para tu perfil.");
        return;
    }

    localStorage.setItem("nombre", nombre);
    localStorage.setItem("avatar", avatarSeleccionado);
    
    // Inicializar puntaje acumulativo al entrar
    localStorage.setItem("puntaje", "0");

    hablar("¡Bienvenido " + nombre + "! Que te diviertas.");

    setTimeout(() => {
        window.location.href = "inicio.html";
    }, 2000);
}

/* ⌨️ ENTER */
document.getElementById("nombre").addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        validar();
    }
});
