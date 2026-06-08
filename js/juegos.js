let puntajeTotal = parseInt(localStorage.getItem("puntaje")) || 0;
let puntajeJuego = 0;
let aciertos = 0;

// Inicializar cabecera con el puntaje acumulado
if (document.getElementById("puntaje")) {
    document.getElementById("puntaje").textContent = puntajeTotal;
}

// ==========================================================================
// DRAG AND DROP COMÚN (Juegos 4 y 5)
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
        // Acierto: fijar texto, cambiar color de la zona a verde
        // Si la zona tiene texto explicativo previo, lo conservamos o reemplazamos según el juego
        const subtitulo = zona.querySelector("span");
        if (subtitulo) {
            // Juego 5: pregunta arriba, respuesta abajo
            zona.innerHTML = `<span style="font-size: 15px; display: block; margin-bottom: 5px; color: #065f46;">${subtitulo.innerText}</span><strong>${elemento.innerText}</strong>`;
        } else {
            // Juego 4: reemplazo de texto completo
            zona.innerHTML = `<strong>${elemento.innerText}</strong>`;
        }
        
        zona.classList.add("correcta");
        elemento.style.display = "none";
        elemento.setAttribute("aria-grabbed", "false");

        puntajeJuego += 10;
        aciertos++;

        // Actualizar visualmente la cabecera
        if (document.getElementById("puntaje")) {
            document.getElementById("puntaje").textContent = puntajeTotal + puntajeJuego;
        }

        const mensaje = document.getElementById("mensaje");
        if (mensaje) {
            mensaje.className = "mensaje success";
            mensaje.innerHTML = "✅ ¡Correcto! Has elegido la respuesta indicada.";
        }

        reproducirAudio("sonidos/bueno.mp3");
    } else {
        // Error
        const mensaje = document.getElementById("mensaje");
        if (mensaje) {
            mensaje.className = "mensaje error";
            mensaje.innerHTML = "❌ ¡Inténtalo de nuevo! Esta no es la opción correcta.";
        }

        elemento.setAttribute("aria-grabbed", "false");
        reproducirAudio("sonidos/error.mp3");

        // Vibración visual de error en la zona
        zona.style.background = "#ffccd5";
        setTimeout(() => {
            zona.style.background = "#f8fafc";
        }, 1000);
    }
}

function reproducirAudio(ruta) {
    const audio = new Audio(ruta);
    audio.play().catch(e => console.log("Audio play blocked by browser"));
}

// ==========================================================================
// VALIDACIÓN
// ==========================================================================
function validarJuego(paginaDestino, totalRequerido) {
    if (aciertos === totalRequerido) {
        // Guardar nuevo puntaje total en localStorage
        const nuevoPuntajeTotal = puntajeTotal + puntajeJuego;
        localStorage.setItem("puntaje", nuevoPuntajeTotal.toString());

        const mensaje = document.getElementById("mensaje");
        if (mensaje) {
            mensaje.className = "mensaje success";
            mensaje.innerHTML = "🎉 ¡Perfecto! Has resuelto este desafío.";
        }

        hablar("¡Excelente! Completaste el juego con éxito.");

        setTimeout(() => {
            window.location.href = paginaDestino;
        }, 2200);
    } else {
        const mensaje = document.getElementById("mensaje");
        if (mensaje) {
            mensaje.className = "mensaje error";
            mensaje.innerHTML = "⚠️ Debes completar todas las casillas antes de finalizar.";
        }
        
        hablar("Debes completar todas las respuestas.");
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
