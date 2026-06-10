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

function responder(boton, correcta, numeroPregunta) {
    const parentCard = document.getElementById(`card-${numeroPregunta}`);
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
        reproducirAudio("correcto");
    } else {
        boton.classList.add("incorrect-selected");
        boton.innerHTML = "❌ ¡Incorrecto!";
        reproducirAudio("error");
    }

    // Actualizar puntaje visual
    document.getElementById("puntaje").textContent = puntajeTotal + puntajeJuego;

    // Retardo pequeño antes de pasar a la siguiente pregunta o mostrar el botón final
    setTimeout(() => {
        if (numeroPregunta < 3) {
            // Animación de salida de la tarjeta actual
            parentCard.classList.add("hidden");
            // Mostrar la siguiente tarjeta
            const nextCard = document.getElementById(`card-${numeroPregunta + 1}`);
            if (nextCard) {
                nextCard.classList.remove("hidden");
            }
        } else {
            // Mostrar botón finalizar al completar todas las preguntas
            document.getElementById("btn-finalizar").style.display = "inline-flex";
            
            const resultado = document.getElementById("resultado");
            resultado.className = "mensaje success";
            resultado.innerHTML = "🎉 ¡Has respondido todo! Presiona Finalizar.";
            hablar("¡Has completado las preguntas! Presiona Finalizar para guardar tu puntuación.");
        }
    }, 1200);
}

// Sonidos sintetizados usando Web Audio API (con desbloqueo de contexto)
let audioCtx = null;
function reproducirAudio(tipo) {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }
        if (tipo === "correcto") {
            const notas = [523.25, 659.25, 783.99, 1046.50];
            notas.forEach((freq, index) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime + index * 0.08);
                
                gain.gain.setValueAtTime(0.15, audioCtx.currentTime + index * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + index * 0.08 + 0.3);
                
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                
                osc.start(audioCtx.currentTime + index * 0.08);
                osc.stop(audioCtx.currentTime + index * 0.08 + 0.35);
            });
        } else {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(220, audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(110, audioCtx.currentTime + 0.25);
            
            gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.3);
        }
    } catch (e) {
        console.log("Audio synthesis blocked or not supported:", e);
    }
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
    }, 2200);
}

function hablar(texto) {
    speechSynthesis.cancel();
    const voz = new SpeechSynthesisUtterance(texto);
    voz.lang = "es-ES";
    voz.rate = 1.0;
    speechSynthesis.speak(voz);
}
