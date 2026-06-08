let puntajeTotal = parseInt(localStorage.getItem("puntaje")) || 0;
let puntajeJuego = 0;
let aciertos = 0;

// Inicializar cabecera con el puntaje acumulado
document.getElementById("puntaje").textContent = puntajeTotal;

// ==========================================================================
// EVENTOS DRAG AND DROP
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

    // Evitar soltar si la zona ya está correcta
    if (zona.classList.contains("correcta")) {
        return;
    }

    const id = event.dataTransfer.getData("text");
    const elemento = document.getElementById(id);
    
    if (!elemento) return;

    const respuesta = elemento.dataset.valor;
    const correcta = zona.dataset.respuesta;

    // VALIDACIÓN DE ACIERTO
    if (respuesta === correcta) {
        // Mover el emoji y deshabilitar el elemento arrastrado
        zona.innerHTML = `<strong>${zona.innerText}</strong> <span style="font-size: 24px;">${elemento.innerText.split(' ')[0]}</span>`;
        zona.classList.add("correcta");
        
        elemento.style.display = "none";
        elemento.setAttribute("aria-grabbed", "false");

        // Actualizar puntajes
        puntajeJuego += 10;
        aciertos++;
        document.getElementById("puntaje").textContent = puntajeTotal + puntajeJuego;

        // Feedback
        const mensaje = document.getElementById("mensaje");
        mensaje.className = "mensaje success";
        mensaje.innerHTML = "✅ ¡Excelente! Personaje correcto.";

        reproducirAudio("sonidos/bueno.mp3");
    } else {
        // Feedback incorrecto
        const mensaje = document.getElementById("mensaje");
        mensaje.className = "mensaje error";
        mensaje.innerHTML = "❌ ¡Inténtalo de nuevo! Ese no es su nombre.";
        
        elemento.setAttribute("aria-grabbed", "false");
        reproducirAudio("sonidos/error.mp3");
    }
}

// Helper para reproducción de audio
function reproducirAudio(ruta) {
    const audio = new Audio(ruta);
    audio.play().catch(e => console.log("Audio play blocked by browser policies"));
}

// ==========================================================================
// VALIDACIÓN DEL JUEGO
// ==========================================================================
function validarJuego(pagina) {
    if (aciertos === 3) {
        // Guardar puntaje en localStorage
        const nuevoPuntajeTotal = puntajeTotal + puntajeJuego;
        localStorage.setItem("puntaje", nuevoPuntajeTotal.toString());

        const mensaje = document.getElementById("mensaje");
        mensaje.className = "mensaje success";
        mensaje.innerHTML = "🎉 ¡Muy bien! Has completado el Juego 1.";

        hablar("¡Muy bien! Completaste el Juego 1 de personajes.");

        setTimeout(() => {
            window.location.href = pagina;
        }, 2200);
    } else {
        const mensaje = document.getElementById("mensaje");
        mensaje.className = "mensaje error";
        mensaje.innerHTML = "⚠️ Debes relacionar a los 3 personajes antes de continuar.";
        
        hablar("Debes relacionar todos los personajes.");
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
