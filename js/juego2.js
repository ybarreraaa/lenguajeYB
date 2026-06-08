let puntajeTotal = parseInt(localStorage.getItem("puntaje")) || 0;
let puntajeJuego = 0;
let respuestas = 0;

// Inicializar cabecera con el puntaje acumulado
document.getElementById("puntaje").textContent = puntajeTotal;

function leerPregunta(texto) {
    speechSynthesis.cancel();
    const voz = new SpeechSynthesisUtterance(texto);
    voz.lang = "es-ES";
    voz.rate = 0.95;
    speechSynthesis.speak(voz);
}

function responder(boton, correcta) {
    const parentCard = boton.closest(".pregunta-card");
    const botones = parentCard.querySelectorAll(".btn-verdadero, .btn-falso");
    
    // Deshabilitar ambos botones para que no responda múltiples veces
    botones.forEach(btn => {
        btn.disabled = true;
    });

    respuestas++;

    if (correcta) {
        puntajeJuego += 10;
        boton.classList.add("correct-selected");
        boton.innerHTML = "✅ ¡Correcto!";
        reproducirAudio("sonidos/bueno.mp3");
    } else {
        boton.classList.add("incorrect-selected");
        boton.innerHTML = "❌ ¡Incorrecto!";
        reproducirAudio("sonidos/error.mp3");
    }

    // Actualizar puntaje visual
    document.getElementById("puntaje").textContent = puntajeTotal + puntajeJuego;
}

function reproducirAudio(ruta) {
    const audio = new Audio(ruta);
    audio.play().catch(e => console.log("Audio play blocked by browser policies"));
}

function finalizar() {
    if (respuestas < 3) {
        const resultado = document.getElementById("resultado");
        resultado.className = "mensaje error";
        resultado.innerHTML = "⚠️ Debes responder todas las preguntas antes de terminar.";
        hablar("Debes responder todas las preguntas.");
        return;
    }

    // Guardar nuevo puntaje total en localStorage
    const nuevoPuntajeTotal = puntajeTotal + puntajeJuego;
    localStorage.setItem("puntaje", nuevoPuntajeTotal.toString());

    const resultado = document.getElementById("resultado");
    resultado.className = "mensaje success";
    resultado.innerHTML = `🎉 ¡Juego Completado! Sumaste ${puntajeJuego} puntos.`;

    let mensajeVoz = `¡Excelente! Obtuviste ${puntajeJuego} puntos en este juego.`;
    hablar(mensajeVoz);

    setTimeout(() => {
        window.location.href = "juego3.html";
    }, 2500);
}

function hablar(texto) {
    speechSynthesis.cancel();
    const voz = new SpeechSynthesisUtterance(texto);
    voz.lang = "es-ES";
    voz.rate = 1.0;
    speechSynthesis.speak(voz);
}
