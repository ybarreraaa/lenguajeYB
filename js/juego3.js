let puntajeTotal = parseInt(localStorage.getItem("puntaje")) || 0;
let puntajeJuego = 0;
let aciertos = 0;

// Inicializar cabecera con el puntaje acumulado
document.getElementById("puntaje").textContent = puntajeTotal;

// ==========================================================================
// DRAG AND DROP
// ==========================================================================
function arrastrar(event) {
    event.dataTransfer.setData("text", event.target.id);
    event.target.setAttribute("aria-grabbed", "true");
}

function permitirSoltar(event) {
    event.preventDefault();
    const zona = event.currentTarget;
    if (!zona.classList.contains("correcta")) {
        zona.classList.add("drag-over");
    }
}

function dragLeave(event) {
    event.currentTarget.classList.remove("drag-over");
}

function soltar(event) {
    event.preventDefault();
    const zona = event.currentTarget;
    zona.classList.remove("drag-over");

    if (zona.classList.contains("correcta")) {
        return;
    }

    const id = event.dataTransfer.getData("text");
    const elemento = document.getElementById(id);
    
    if (!elemento) return;

    const respuestaJugador = elemento.dataset.valor;
    const respuestaCorrecta = zona.dataset.respuesta;

    if (respuestaJugador === respuestaCorrecta) {
        // Drop exitoso
        zona.innerHTML = elemento.innerHTML;
        zona.classList.add("correcta");
        
        elemento.style.display = "none";
        elemento.setAttribute("aria-grabbed", "false");

        puntajeJuego += 10;
        aciertos++;
        
        // Actualizar visualmente la cabecera
        document.getElementById("puntaje").textContent = puntajeTotal + puntajeJuego;

        const mensaje = document.getElementById("mensaje");
        mensaje.className = "mensaje success";
        mensaje.innerHTML = "✅ ¡Correcto! Evento ubicado en su orden.";

        reproducirAudio("sonidos/bueno.mp3");
    } else {
        // Drop fallido
        const mensaje = document.getElementById("mensaje");
        mensaje.className = "mensaje error";
        mensaje.innerHTML = "❌ ¡Inténtalo de nuevo! Ese evento no ocurrió en ese momento.";

        elemento.setAttribute("aria-grabbed", "false");
        reproducirAudio("sonidos/error.mp3");

        // Animación de error visual en la zona
        zona.style.background = "#ffccd5";
        setTimeout(() => {
            zona.style.background = "#f8fafc";
        }, 1000);
    }
}

// Helper para reproducción de audio sintetizado usando Web Audio API (con desbloqueo de contexto)
let audioCtx = null;
function reproducirAudio(ruta) {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }
        if (ruta.includes("bueno") || ruta.includes("correcto")) {
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

// ==========================================================================
// VALIDACIÓN
// ==========================================================================
function validarJuego() {
    if (aciertos === 3) {
        // Guardar en localStorage
        const nuevoPuntajeTotal = puntajeTotal + puntajeJuego;
        localStorage.setItem("puntaje", nuevoPuntajeTotal.toString());

        const mensaje = document.getElementById("mensaje");
        mensaje.className = "mensaje success";
        mensaje.innerHTML = "🎉 ¡Excelente! Has ordenado el cuento a la perfección.";

        hablar("¡Muy bien! Ordenaste correctamente la historia.");

        setTimeout(() => {
            window.location.href = "juego4.html";
        }, 2200);
    } else {
        const mensaje = document.getElementById("mensaje");
        mensaje.className = "mensaje error";
        mensaje.innerHTML = "⚠️ Ubica los 3 eventos en su orden correspondiente antes de finalizar.";
        
        hablar("Debes completar el orden del cuento.");
    }
}

function reiniciar() {
    location.reload();
}

function hablar(texto) {
    speechSynthesis.cancel();
    const voz = new SpeechSynthesisUtterance(texto);
    voz.lang = "es-ES";
    voz.rate = 1.0;
    speechSynthesis.speak(voz);
}
