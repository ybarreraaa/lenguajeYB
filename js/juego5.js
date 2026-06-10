let puntajeTotal = parseInt(localStorage.getItem("puntaje")) || 0;
let puntajeJuego = 0;
let vidas = 5;

// Lista de palabras posibles del cuento
const palabrasCuento = ["CANASTA", "ABUELITA", "LEÑADOR", "BOSQUE", "LOBO"];
let palabraSecreta = "";
let letrasAdivinadas = [];

// Inicializar cabecera con el puntaje acumulado
document.getElementById("puntaje").textContent = puntajeTotal;

function seleccionarPalabra() {
    const indice = Math.floor(Math.random() * palabrasCuento.length);
    palabraSecreta = palabrasCuento[indice];
    letrasAdivinadas = Array(palabraSecreta.length).fill("_");
}

function renderizarPalabra() {
    const contenedor = document.getElementById("palabra-secreta");
    contenedor.innerHTML = "";
    letrasAdivinadas.forEach(letra => {
        const elementoLetra = document.createElement("div");
        elementoLetra.classList.add("letra-espacio");
        elementoLetra.textContent = letra === "_" ? "" : letra;
        contenedor.appendChild(elementoLetra);
    });
}

function renderizarTeclado() {
    const teclado = document.getElementById("teclado");
    teclado.innerHTML = "";
    
    // Abecedario en español con Ñ
    const letras = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
    
    letras.forEach(letra => {
        const boton = document.createElement("button");
        boton.classList.add("tecla");
        boton.textContent = letra;
        boton.addEventListener("click", () => presionarLetra(boton, letra));
        teclado.appendChild(boton);
    });
}

function actualizarVidas() {
    const contenedorVidas = document.getElementById("vidas");
    contenedorVidas.innerHTML = "❤️".repeat(vidas) + "🖤".repeat(5 - vidas);
}

function presionarLetra(boton, letra) {
    boton.disabled = true;
    
    if (palabraSecreta.includes(letra)) {
        boton.classList.add("acierto");
        
        // Revelar letras en la palabra
        for (let i = 0; i < palabraSecreta.length; i++) {
            if (palabraSecreta[i] === letra) {
                letrasAdivinadas[i] = letra;
            }
        }
        
        renderizarPalabra();
        reproducirAudio("correcto");
        
        // Verificar victoria
        if (!letrasAdivinadas.includes("_")) {
            victoria();
        }
    } else {
        boton.classList.add("fallo");
        vidas--;
        actualizarVidas();
        reproducirAudio("error");
        
        // Verificar derrota
        if (vidas === 0) {
            derrota();
        }
    }
}

function victoria() {
    // Deshabilitar todos los botones del teclado
    const teclas = document.querySelectorAll(".tecla");
    teclas.forEach(t => t.disabled = true);
    
    puntajeJuego = 30; // 30 puntos por completar el desafío final
    
    // Actualizar puntaje visual
    document.getElementById("puntaje").textContent = puntajeTotal + puntajeJuego;
    
    const mensaje = document.getElementById("mensaje");
    mensaje.className = "mensaje success";
    mensaje.innerHTML = "🎉 ¡Felicidades! Adivinaste la palabra. ¡Has salvado el día!";
    
    hablar("¡Felicidades! Adivinaste la palabra correctamente. ¡Eres genial!");

    document.getElementById("btn-finalizar").style.display = "inline-flex";
}

function derrota() {
    // Deshabilitar todos los botones del teclado
    const teclas = document.querySelectorAll(".tecla");
    teclas.forEach(t => t.disabled = true);
    
    // Revelar la palabra correcta
    letrasAdivinadas = palabraSecreta.split("");
    renderizarPalabra();
    
    const mensaje = document.getElementById("mensaje");
    mensaje.className = "mensaje error";
    mensaje.innerHTML = `😢 ¡Te has quedado sin vidas! La palabra era: ${palabraSecreta}. Reintenta para conseguir los puntos.`;
    
    hablar("Oh no, te has quedado sin vidas. ¡No te preocupes! Vuelve a intentarlo.");
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

function validarJuego(paginaDestino, totalRequerido) {
    // Guardar en localStorage
    const nuevoPuntajeTotal = puntajeTotal + puntajeJuego;
    localStorage.setItem("puntaje", nuevoPuntajeTotal.toString());
    
    setTimeout(() => {
        window.location.href = paginaDestino;
    }, 300);
}

function reiniciar() {
    vidas = 5;
    puntajeJuego = 0;
    document.getElementById("puntaje").textContent = puntajeTotal;
    document.getElementById("mensaje").innerHTML = "";
    document.getElementById("btn-finalizar").style.display = "none";
    
    actualizarVidas();
    seleccionarPalabra();
    renderizarPalabra();
    renderizarTeclado();
}

function hablar(texto) {
    speechSynthesis.cancel();
    const voz = new SpeechSynthesisUtterance(texto);
    voz.lang = "es-ES";
    voz.rate = 1.0;
    speechSynthesis.speak(voz);
}

// Iniciar juego al cargar
seleccionarPalabra();
renderizarPalabra();
renderizarTeclado();
actualizarVidas();
