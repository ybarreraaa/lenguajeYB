let puntajeTotal = parseInt(localStorage.getItem("puntaje")) || 0;
let puntajeJuego = 0;
let aciertos = 0;
const totalParejas = 4;

let primeraCarta = null;
let segundaCarta = null;
let bloqueado = false;

// Inicializar cabecera con el puntaje acumulado
document.getElementById("puntaje").textContent = puntajeTotal;

// Arreglo con 4 parejas de personajes
const cartasPersonajes = [
    { id: 1, emoji: "👧", nombre: "Caperucita" },
    { id: 2, emoji: "👧", nombre: "Caperucita" },
    { id: 3, emoji: "🐺", nombre: "El Lobo" },
    { id: 4, emoji: "🐺", nombre: "El Lobo" },
    { id: 5, emoji: "👵", nombre: "La Abuelita" },
    { id: 6, emoji: "👵", nombre: "La Abuelita" },
    { id: 7, emoji: "🪓", nombre: "El Leñador" },
    { id: 8, emoji: "🪓", nombre: "El Leñador" }
];

// Mezclar las cartas usando el algoritmo de Fisher-Yates
function mezclar(arreglo) {
    for (let i = arreglo.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arreglo[i], arreglo[j]] = [arreglo[j], arreglo[i]];
    }
    return arreglo;
}

// Crear las cartas en el HTML
function inicializarTablero() {
    const tablero = document.getElementById("tablero");
    tablero.innerHTML = "";
    
    const cartasMezcladas = mezclar([...cartasPersonajes]);
    
    cartasMezcladas.forEach((personaje, index) => {
        const elementoCarta = document.createElement("div");
        elementoCarta.classList.add("carta-memoria");
        elementoCarta.dataset.emoji = personaje.emoji;
        elementoCarta.dataset.index = index;
        
        elementoCarta.innerHTML = `
            <div class="cara-carta carta-dorso"></div>
            <div class="cara-carta carta-frente">${personaje.emoji}</div>
        `;
        
        elementoCarta.addEventListener("click", voltearCarta);
        tablero.appendChild(elementoCarta);
    });
}

function voltearCarta() {
    if (bloqueado) return;
    if (this === primeraCarta) return;
    if (this.classList.contains("volteada") || this.classList.contains("emparejada")) return;

    this.classList.add("volteada");

    if (!primeraCarta) {
        primeraCarta = this;
        return;
    }

    segundaCarta = this;
    verificarPareja();
}

function verificarPareja() {
    const esIgual = primeraCarta.dataset.emoji === segundaCarta.dataset.emoji;

    if (esIgual) {
        deshabilitarCartas();
    } else {
        desvoltearCartas();
    }
}

function deshabilitarCartas() {
    primeraCarta.classList.add("emparejada");
    segundaCarta.classList.add("emparejada");

    puntajeJuego += 10;
    aciertos++;
    
    // Actualizar visualmente la cabecera
    document.getElementById("puntaje").textContent = puntajeTotal + puntajeJuego;

    const mensaje = document.getElementById("mensaje");
    mensaje.className = "mensaje success";
    mensaje.innerHTML = "✅ ¡Encontraste una pareja!";
    
    reproducirAudio("correcto");

    resetearSeleccion();

    // Comprobar si se completaron todas las parejas
    if (aciertos === totalParejas) {
        setTimeout(() => {
            document.getElementById("btn-finalizar").style.display = "inline-flex";
            mensaje.className = "mensaje success";
            mensaje.innerHTML = "🎉 ¡Fabuloso! Encontraste todas las parejas. Presiona Finalizar.";
            hablar("¡Increíble! Encontraste todas las parejas. Haz clic en Finalizar.");
        }, 800);
    }
}

function desvoltearCartas() {
    bloqueado = true;
    
    const mensaje = document.getElementById("mensaje");
    mensaje.className = "mensaje error";
    mensaje.innerHTML = "❌ No son iguales, ¡inténtalo de nuevo!";
    
    reproducirAudio("error");

    setTimeout(() => {
        primeraCarta.classList.remove("volteada");
        segundaCarta.classList.remove("volteada");
        resetearSeleccion();
    }, 1200);
}

function resetearSeleccion() {
    [primeraCarta, segundaCarta] = [null, null];
    bloqueado = false;
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

function validarJuego() {
    if (aciertos === totalParejas) {
        // Guardar en localStorage
        const nuevoPuntajeTotal = puntajeTotal + puntajeJuego;
        localStorage.setItem("puntaje", nuevoPuntajeTotal.toString());

        setTimeout(() => {
            window.location.href = "juego5.html";
        }, 300);
    }
}

function reiniciar() {
    aciertos = 0;
    puntajeJuego = 0;
    document.getElementById("puntaje").textContent = puntajeTotal;
    document.getElementById("mensaje").innerHTML = "";
    document.getElementById("btn-finalizar").style.display = "none";
    resetearSeleccion();
    inicializarTablero();
}

function hablar(texto) {
    speechSynthesis.cancel();
    const voz = new SpeechSynthesisUtterance(texto);
    voz.lang = "es-ES";
    voz.rate = 1.0;
    speechSynthesis.speak(voz);
}

// Iniciar tablero al cargar
inicializarTablero();
